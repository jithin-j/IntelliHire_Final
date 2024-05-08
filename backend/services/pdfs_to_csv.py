import os
import re
import nltk
from nltk.corpus import stopwords
import string
import joblib
import pandas as pd


# Function to clean resume text
def cleanResume(resumeText):
    resumeText = re.sub("http\\S+\\s*", " ", resumeText)  # remove URLs
    resumeText = re.sub("RT|cc", " ", resumeText)  # remove RT and cc
    resumeText = re.sub("#\\S+", "", resumeText)  # remove hashtags
    resumeText = re.sub("@\\S+", " ", resumeText)  # remove mentions
    resumeText = re.sub(
        "\[%s\]" % re.escape("""!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"""), " ", resumeText
    )  # remove punctuations
    resumeText = re.sub(r"\[^\x00-\x7f\]", r" ", resumeText)
    resumeText = re.sub("\\s+", " ", resumeText)  # remove extra whitespace
    resumeText = resumeText.lower()  # convert to lowercase
    return resumeText


# Load the trained model
loaded_model = joblib.load("./models/one_vs_rest_kneighbors_classifier3.pkl")


# Extract text from PDF resume
def extract_text_from_pdf(pdf_file):
    text = ""
    # Code to extract text from PDF and store it in 'text' variable
    # For example using PyPDF2:
    import PyPDF2

    with open(pdf_file, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            # Iterate directly over Page objects
            page_text = page.extract_text()
            text += page.extract_text()

    return text


# Preprocess the resume text
def preprocess_resume(text):
    cleaned_text = cleanResume(text)
    requiredWords = nltk.word_tokenize(cleaned_text)
    oneSetOfStopWords = set(stopwords.words("english") + ["``", "''"])
    totalWords = [
        word
        for word in requiredWords
        if word not in oneSetOfStopWords and word not in string.punctuation
    ]
    return " ".join(totalWords)


# Function to predict category
def predict_category(resume_text):
    word_vectorizer = joblib.load("./vectorizers/vectorizer3.pkl")
    cleaned_resume = preprocess_resume(resume_text)
    resume_features = word_vectorizer.transform([cleaned_resume])
    prediction = loaded_model.predict(resume_features)
    return prediction, cleaned_resume


# Function to process resumes in a directory
def process_resumes(directory_path):
    data = []
    for filename in os.listdir(directory_path):
        if filename.endswith(".pdf"):
            pdf_resume_path = os.path.join(directory_path, filename)
            resume_text = extract_text_from_pdf(pdf_resume_path)
            category, cleanResume = predict_category(resume_text)
            data.append(
                {
                    "PredictedCategory": category,
                    "Resume": cleanResume,
                    "FileLink": pdf_resume_path,
                }
            )

    # Create a CSV file with the predicted categories and resume text
    df = pd.DataFrame(data)
    df.to_csv("predicted_categories.csv", index=False, escapechar="\\")
