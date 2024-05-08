from flask import Flask, request, jsonify, make_response, send_from_directory
from dotenv import load_dotenv
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
import requests
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    get_jwt_identity,
    JWTManager,
    create_access_token,
    jwt_required,
)
from datetime import datetime
import pytz
from werkzeug.utils import secure_filename
from services.pdfs_to_csv import process_resumes

# from services.rank_resumes import rank_resumes_service
import shutil
import pandas as pd
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from sklearn.metrics.pairwise import cosine_similarity
import joblib

load_dotenv()

current_dir = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(
    current_dir, "database.db"
)
db = SQLAlchemy(app)
CORS(app, origins="*")
app.config["JWT_SECRET_KEY"] = "my-secret-key"
jwt = JWTManager(app)

API_TOKEN = os.getenv("HF_API_TOKEN")
API_URL = os.getenv("HF_API_URL")


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    results = db.relationship("Result", backref="user", lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_id(self):
        return self.id


class Result(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    labels = db.Column(db.String(255))
    scores = db.Column(db.String(255))
    sequence = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)


def get_top_labels(response_data, top_n=5):
    labels = response_data["labels"]
    scores = response_data["scores"]

    # Combine labels and scores into tuples and sort by scores in descending order
    label_score_pairs = sorted(zip(labels, scores), key=lambda x: x[1], reverse=True)

    # Extract the top N labels and scores
    top_labels = [pair[0] for pair in label_score_pairs[:top_n]]
    top_scores = [pair[1] for pair in label_score_pairs[:top_n]]

    return {"top_labels": top_labels, "top_scores": top_scores}

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    assigned_to = db.relationship("User", backref="tasks")
    status = db.Column(db.String(20), default="Pending")
    timestamp = db.Column(
        db.DateTime, default=lambda: datetime.now(pytz.timezone("Asia/Kolkata"))
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "user_id": self.user_id,
            "assigned_to": self.assigned_to.username,
            "status": self.status,
            "timestamp": self.timestamp.isoformat(),  # Convert to ISO format for JSON serialization
        }


@app.route("/signup", methods=["POST"])
def signup():
    data = request.json

    if "username" not in data or "password" not in data:
        return jsonify({"error": "Username and password are required"}), 400

    username = data["username"]
    password = data["password"]

    # Check if the username already exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return (
            jsonify({"error": "Username already exists. Choose a different username."}),
            409,
        )

    # Create a new user
    new_user = User(username=username)
    new_user.set_password(password)

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User successfully created"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error creating user: {str(e)}"}), 500


@app.route("/login", methods=["POST"])
def login():
    data = request.json

    if "username" not in data or "password" not in data:
        return jsonify({"error": "Username and password are required"}), 400

    username = data["username"]
    password = data["password"]

    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid username or password"}), 401

    # Generate an access token for the user
    if user.username == "admin":
        access_token = create_access_token(
            identity=username, additional_claims={"role": "admin"}
        )
    else:
        access_token = create_access_token(
            identity=username, additional_claims={"role": "user"}
        )

    return jsonify(access_token=access_token), 200


@app.route("/get_all_users", methods=["GET"])
def get_all_users():
    try:
        users = User.query.all()
        user_list = [{"id": user.id, "username": user.username} for user in users]
        return jsonify({"users": user_list})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/query", methods=["POST"])
def query():
    try:
        data = request.get_json()

        if "inputs" not in data or "parameters" not in data or "username" not in data:
            return jsonify({"error": "Invalid request format"}), 400

        username = data["username"]
        inputs = data["inputs"]
        parameters = data["parameters"]
        # Check if the user exists
        user = User.query.filter_by(username=username).first()

        if not user:
            # Create a new user if it doesn't exist
            user = User(username=username)
            db.session.add(user)

        question_answers = []
        for line in inputs.split("\n"):
            if line.startswith("Question:"):
                question = line.replace("Question:", "").strip()
                answer = ""  # Initialize answer as empty string
                question_answers.append({"question": question, "answer": answer})
            elif line.startswith("Answer:"):
                if (
                    question_answers
                ):  # Check if there's a question to pair the answer with
                    answer = line.replace("Answer:", "").strip()
                    question_answers[-1]["answer"] = answer

        # Combine the question-answer pairs into a single sequence
        sequence = "\n".join(
            [
                "Question: " + qa["question"] + "\nAnswer: " + qa["answer"]
                for qa in question_answers
            ]
        )

        # Delete the old result of the user (if any)
        old_result = Result.query.filter_by(user=user).first()
        if old_result:
            db.session.delete(old_result)

        headers = {"Authorization": "Bearer " + API_TOKEN}
        # Get the top 5 labels and scores
        response = requests.post(
            API_URL,
            headers=headers,
            json={
                "inputs": sequence,
                "parameters": parameters,
            },
        )
        if response.status_code == 200:
            top_results = get_top_labels(response.json())

            # Save the result to the database
            result = Result(
                labels=str(top_results["top_labels"]),
                scores=str(top_results["top_scores"]),
                sequence=inputs,
                user=user,
            )
            db.session.add(result)
            db.session.commit()

            return jsonify({"message": "Result saved to the database"})

        return (
            jsonify({"error": f"Error from Hugging Face API: {response.text}"}),
            response.status_code,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/get_results", methods=["GET"])
def get_results():
    try:
        username = request.args.get("username")

        if username:
            user = User.query.filter_by(username=username).first()

            if user:
                results = Result.query.filter_by(user=user).all()
                result_list = []

                for result in results:
                    result_list.append(
                        {
                            "username": user.username,
                            "labels": result.labels,
                            "scores": result.scores,
                            "sequence": result.sequence,
                        }
                    )

                return jsonify({"results": result_list})
            else:
                return jsonify({"error": "User not found"}), 404
        else:
            return jsonify({"error": "Username parameter is required"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


from flask import jsonify


@app.route("/get_all_results", methods=["GET"])
def get_all_results():
    try:
        users = User.query.all()
        all_results = []

        for user in users:
            results = Result.query.filter_by(user=user).all()
            for result in results:
                all_results.append(
                    {
                        "username": user.username,
                        "labels": result.labels,
                        "scores": result.scores,
                        "sequence": result.sequence,
                    }
                )

        return jsonify({"results": all_results})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/create_task", methods=["POST"])
def assign_task():
    try:
        data = request.json

        # Ensure required fields are present in the request
        if (
            "assigned_to" not in data
            or "title" not in data
            or "description" not in data
        ):
            return (
                jsonify({"error": "Assigned to, title, and description are required"}),
                400,
            )

        assigned_to_username = data["assigned_to"]
        task_title = data["title"]
        task_description = data["description"]

        # Check if the assigned user exists
        assigned_user = User.query.filter_by(username=assigned_to_username).first()

        if not assigned_user:
            return jsonify({"error": "Assigned user not found"}), 404

        # Create a new task and assign it to the user
        new_task = Task(
            title=task_title,
            description=task_description,
            assigned_to=assigned_user,
            status="Pending",  # You can set an initial status here
        )

        db.session.add(new_task)
        db.session.commit()

        return jsonify({"message": "Task assigned successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/get_user_tasks", methods=["POST"])
def get_user_tasks():
    try:
        data = request.get_json()

        if "username" not in data:
            return jsonify({"error": "Username is required in the request body"}), 400

        username = data["username"]
        user = User.query.filter_by(username=username).first()
        if user:
            tasks = Task.query.filter_by(user_id=user.id).all()
            task_list = [task.to_dict() for task in tasks]

            return jsonify({"tasks": task_list})
        else:
            return jsonify({"error": "User not found"}), 404

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500


@app.route("/upload", methods=["POST"])
def upload_files():
    # Disable caching for this endpoint
    response = make_response(process_upload())
    print(response)
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


def preprocess_text(text):
    stemmer = PorterStemmer()
    stop_words = set(stopwords.words("english"))
    # If input is a list of text items
    if isinstance(text, list):
        preprocessed_texts = []
        for item in text:
            tokens = word_tokenize(item.lower())
            filtered_tokens = [
                stemmer.stem(token)
                for token in tokens
                if token not in stop_words and token.isalnum()
            ]
            preprocessed_texts.append(" ".join(filtered_tokens))
        return preprocessed_texts
    # If input is a single text item
    else:
        tokens = word_tokenize(text.lower())
        filtered_tokens = [
            stemmer.stem(token)
            for token in tokens
            if token not in stop_words and token.isalnum()
        ]
        return " ".join(filtered_tokens)


def find_similar_categories(given_category, k=4):
    data = pd.read_csv("./predicted_categories.csv")
    vectorizer = joblib.load("./vectorizers/vectorizer3.pkl")
    categories = data["PredictedCategory"].unique()
    preprocessed_categories = [preprocess_text(category) for category in categories]
    preprocessed_given_category = preprocess_text(given_category)

    categories_vectorized = vectorizer.transform(preprocessed_categories)
    category_vector = vectorizer.transform([preprocessed_given_category])
    category_similarities = cosine_similarity(category_vector, categories_vectorized)
    similar_category_indices = category_similarities.ravel().argsort()[::-1][:k]
    similar_categories = categories[similar_category_indices]
    similar_categories_with_given = [given_category] + list(similar_categories)
    return similar_categories_with_given


def rank_resumes_service(category, keywords, job_description):
    data = pd.read_csv("./predicted_categories.csv")
    vectorizer = joblib.load("./vectorizers/vectorizer3.pkl")

    # Preprocess input text
    preprocessed_keywords = preprocess_text(keywords)
    preprocessed_job_description = preprocess_text(job_description)

    # Find similar categories
    similar_categories = find_similar_categories(category)

    # Filter resumes for the given and similar categories
    category_resumes = data[data["PredictedCategory"].isin(similar_categories)][
        ["Resume", "FileLink", "PredictedCategory"]
    ]
    if category_resumes.empty:
        return "No resumes found for the given category and similar categories."

    # Convert keywords, job description, and resumes into TF-IDF vectors
    keywords_vector = vectorizer.transform(preprocessed_keywords)
    job_description_vector = vectorizer.transform([preprocessed_job_description])
    X_category = vectorizer.transform(category_resumes["Resume"])

    # Calculate cosine similarity between (keywords + job description) and resumes
    combined_vector = (keywords_vector + job_description_vector) / 2
    similarities = cosine_similarity(combined_vector, X_category)

    # Sort resumes based on combined similarity scores
    ranked_indices = similarities.argsort()[0][::-1]
    ranked_resumes = category_resumes.iloc[ranked_indices]
    ranked_similarities = similarities.ravel()[ranked_indices]

    # Prepare the ranked resumes for display
    ranked_results = []
    for resume, file_link, predicted_category, similarity_score in zip(
        ranked_resumes["Resume"],
        ranked_resumes["FileLink"],
        ranked_resumes["PredictedCategory"],
        ranked_similarities,
    ):
        ranked_results.append(
            {
                "resume": resume,
                "file_link": file_link,
                "predicted_category": predicted_category,
                "similarity_score": similarity_score,
            }
        )

    return ranked_results


def process_upload():
    job_category = request.form["jobCategory"]
    keywords = request.form.getlist("keywords")
    job_description = request.form["jobDescription"]

    if not job_category or not keywords or not job_description:
        return jsonify({"error": "Missing required parameters"}), 400

    uploaded_files = request.files.getlist("files")
    if not uploaded_files:
        return jsonify({"error": "No files uploaded"}), 400

    shutil.rmtree("./uploads", ignore_errors=True)
    os.makedirs("uploads", exist_ok=True)

    for file in uploaded_files:
        if file.filename == "":
            return jsonify({"error": "Empty file name"}), 400
        if file and file.filename.endswith(".pdf"):
            filename = secure_filename(file.filename)
            file_path = os.path.join("uploads", filename)
            file.save(file_path)
        else:
            return jsonify({"error": "Uploaded file is not a PDF"}), 400

    process_resumes("uploads")
    ranked_results = rank_resumes_service(job_category, keywords, job_description)
    if isinstance(ranked_results, str):
        return jsonify({"error": ranked_results}), 404
    else:
        return jsonify(ranked_results)


@app.route("/rank_resumes", methods=["POST"])
def rank_resumes():
    data = request.get_json()
    category = data.get("category")
    keywords = data.get("keywords")
    job_description = data.get("job_description")

    if not category or not keywords or not job_description:
        return jsonify({"error": "Missing required parameters"}), 400

    ranked_results = rank_resumes_service(category, keywords, job_description)

    if isinstance(ranked_results, str):
        return jsonify({"error": ranked_results}), 404
    else:
        return jsonify(ranked_results)


@app.route("/update_task_status/<int:task_id>", methods=["POST"])
def update_task_status(task_id):
    # Get the new status from the request data
    new_status = request.json.get("status")

    # Retrieve the task from the database
    task = Task.query.get(task_id)

    if task:
        # Update the task's status
        task.status = new_status
        db.session.commit()

        # Return success message
        return jsonify({"message": "Task status updated successfully"}), 200
    else:
        # Return error message if task is not found
        return jsonify({"error": "Task not found"}), 404


@app.route("/tasks", methods=["GET"])
def get_tasks():
    tasks = Task.query.all()
    task_details = []
    for task in tasks:
        user = User.query.filter_by(id=task.user_id).first()
        if user:
            task_details.append(
                {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "user_id": task.user_id,
                    "assigned_to": user.username,  # Include username from User table
                    "status": task.status,
                    "timestamp": task.timestamp.isoformat(),  # Convert to ISO format for JSON serialization
                }
            )
        else:
            task_details.append(
                {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "user_id": task.user_id,
                    "assigned_to": None,  # No user found
                    "status": task.status,
                    "timestamp": task.timestamp.isoformat(),
                }
            )

    return jsonify(task_details)


@app.route("/update_task/<int:task_id>", methods=["PUT"])
def edit_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.json
    if "title" in data:
        task.title = data["title"]
    if "description" in data:
        task.description = data["description"]
    if "status" in data:
        task.status = data["status"]
    db.session.commit()
    return jsonify({"message": "Task updated successfully"})


@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory("./uploads", filename)


# API endpoint to delete a task
@app.route("/delete_task/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted successfully"})


if __name__ == "__main__":
    app.run(debug=True)
