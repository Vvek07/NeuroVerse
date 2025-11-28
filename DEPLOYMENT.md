# NeuroVerse - Deployment Guide

This guide provides step-by-step instructions for deploying and running the NeuroVerse application. This is intended for researchers, professors, and IT administrators.

## Prerequisites

Ensure the following software is installed on the system:

1.  **Python 3.9+**: [Download Python](https://www.python.org/downloads/)
    *   *Note: Ensure "Add Python to PATH" is checked during installation.*
2.  **Node.js (LTS Version)**: [Download Node.js](https://nodejs.org/)
3.  **MongoDB Community Server**: [Download MongoDB](https://www.mongodb.com/try/download/community)
    *   *Note: Install MongoDB Compass for an easier GUI interface.*

---

## 1. Database Setup

1.  Start the MongoDB server (usually starts automatically after installation).
2.  Open **MongoDB Compass** and connect to `mongodb://localhost:27017`.
3.  No manual database creation is needed; the application will automatically create the `neuroverse` database and collections upon the first run.

---

## 2. Backend Setup (API & Machine Learning)

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  Create a virtual environment (recommended):
    ```bash
    python -m venv venv
    ```

3.  Activate the virtual environment:
    *   **Windows**:
        ```bash
        .\venv\Scripts\activate
        ```
    *   **Mac/Linux**:
        ```bash
        source venv/bin/activate
        ```

4.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

5.  Start the Backend Server:
    ```bash
    python main.py
    ```
    *   The server will start at `http://localhost:8000`.
    *   API Documentation is available at `http://localhost:8000/docs`.

---

## 3. Frontend Setup (User Interface)

1.  Open a new terminal window and navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the Frontend Application:
    ```bash
    npm start
    ```
    *   The application will open in your browser at `http://localhost:3000`.

---

## 4. System Verification

To verify the installation is correct:

1.  **Login**: Use the default admin credentials (if configured) or Sign Up for a new account.
2.  **Dashboard**: Ensure the dashboard loads with statistics.
3.  **Prediction**: Go to "Analyze Drug", enter "Donepezil", and click Analyze. You should see a prediction result.
4.  **Batch Analysis**: Go to "Batch Analysis", upload a sample Excel file, and verify the table populates.

---

## Troubleshooting

### "Module not found" errors
*   Ensure you activated the virtual environment in the backend before running `python main.py`.
*   Run `pip install -r requirements.txt` again.

### "Connection refused" (MongoDB)
*   Ensure MongoDB service is running.
*   Check if the connection string in `backend/.env` matches your local setup (default: `mongodb://localhost:27017`).

### "Frontend not connecting to Backend"
*   Ensure the backend is running on port 8000.
*   Check the browser console (F12) for network errors.

---

**Contact Support**
For additional assistance, please contact the development team.
