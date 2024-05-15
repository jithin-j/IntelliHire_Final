# IntelliHire

IntelliHire is a web application that consists of a React frontend and a Flask backend.

## Prerequisites

Before running the application, make sure you have the following installed:

- Node.js
- Python
- pip

## Installation

1. Clone the repository:

    ```bash
    git clone <repository_url>
    ```


2. Install dependencies after creating venv:

    ```bash
    cd backend
    python -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    cd ../frontend
    npm install
    ```

## Usage

1. Start the Flask backend:

    ```bash
    cd backend
    source .venv/bin/activate
    python app.py
    ```

    The backend will run on `http://localhost:5000`.

2. Start the React frontend:

    ```bash
    cd frontend
    npm start
    ```

    The frontend will run on `http://localhost:3000`.

3. Open your web browser and navigate to `http://localhost:3000` to access the application.

## License

This project is licensed under the [MIT License](LICENSE).