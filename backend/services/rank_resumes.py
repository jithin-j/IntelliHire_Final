import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib
from collections import OrderedDict
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import PorterStemmer


nltk.download("punkt")
nltk.download("stopwords")

# Load the dataset
data = pd.read_csv("./predicted_categories.csv")
print(data)
# Load the trained model and vectorizer
model = joblib.load("./models/one_vs_rest_kneighbors_classifier3.pkl")
vectorizer = joblib.load("./vectorizers/vectorizer3.pkl")

# Initialize stemmer and stopwords
stemmer = PorterStemmer()
stop_words = set(stopwords.words("english"))


def preprocess_text(text):
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


# Function to find the top k similar categories
def find_similar_categories(given_category, k=3):
    categories = data["PredictedCategory"].unique()
    preprocessed_categories = [preprocess_text(category) for category in categories]
    preprocessed_given_category = preprocess_text(given_category)

    categories_vectorized = vectorizer.transform(preprocessed_categories)
    category_vector = vectorizer.transform([preprocessed_given_category])
    category_similarities = cosine_similarity(category_vector, categories_vectorized)
    similar_category_indices = category_similarities.ravel().argsort()[::-1][1 : k + 1]
    similar_categories = categories[similar_category_indices]
    return similar_categories


def rank_resumes_service(category, keywords, job_description):
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
