# aes256-profile-vault
# SecureVault - Secure User Profile & Transaction System

## 📌 Project Overview
**SecureVault** is an Identity Management and Financial Transaction Microservice designed to demonstrate secure handling of sensitive user data, fulfilling **Assignment 1** of the evaluation requirements.

**Key Features:**
* [cite_start]**Secure Authentication:** Stateless authentication using JWT (JSON Web Tokens)[cite: 7].
* [cite_start]**Data Encryption:** The Aadhaar/ID Number is stored in the database using **AES-256 encryption** (manual implementation/library) and is only decrypted when sent to the authorized client[cite: 7].
* **Financial Transactions:** A secure "Quick Transfer" feature that ensures atomicity using database transactions.
* **Audit Logging:** An immutable transaction history (Audit Log) for tracking all fund transfers.
* [cite_start]**Responsive Dashboard:** A dynamic frontend featuring distinct visual themes (Shark/Frog) and real-time updates[cite: 7].

## 🚀 Tech Stack
* [cite_start]**Frontend:** React.js, Tailwind CSS, GSAP (Animations), Axios [cite: 13]
* [cite_start]**Backend:** Python (Django/DRF) [cite: 12]
* [cite_start]**Database:** PostgreSQL (configured in `settings.py`) [cite: 12]
* **Security:** AES-256 Encryption, JWT Authentication

---

## 🌍 Deployment
* **Client:** [Vercel Link](https://aes256-profile-vault.vercel.app/)
* **Server:** Render
* **Database:** Render (PostgreSQL)

---

## ⚙️ Setup & Run Instructions

### 1. Prerequisites
Ensure you have the following installed:
* Node.js (v16+)
* Python (v3.9+)
* Git

### 2. Frontend Setup (React with Vite)
```bash
    # Clone the repository
    git clone <your-repo-link>
    cd client

    # Install dependencies
    npm install

    # Start the Development Server
    npm run dev
    The Frontend will typically run at http://localhost:5173/
    
## 3. Backend Setup (Django)Bashcd server

# Create virtual environment
python -m venv venv
# Activate virtual environment
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Database Migrations
python manage.py makemigrations
python manage.py migrate

# Start the Server
python manage.py runserver
The Backend will typically run at http://127.0.0.1:8000/


📡 API Documentation
The full API collection is available for import in Postman.

[Run in Postman](https://.postman.co/workspace/My-Workspace~66145507-479c-49da-836b-e3cec435fdf6/request/32895248-01ef6c15-72f8-4385-b2ba-d6f15e8ed35f?action=share&creator=32895248)

### **Quick Endpoint Reference**

| Method | Endpoint             | Description             | Auth Required |
| :---   | :---                 | :---                    | :---          |
| `POST` | `/api/register/`     | Register a new user     | ❌            |
| `POST` | `/api/login/`        | Login & get tokens      | ❌            |
| `GET`  | `/api/profile/`      | Fetch encrypted profile | ✅            |
| `POST` | `/api/transfer/`     | Transfer funds          | ✅            |
| `GET`  | `/api/transactions/` | View audit log          | ✅            |

## 🗄️ Database Schema

```mermaid
erDiagram
    USER ||--o{ TRANSACTION : "sends"
    USER ||--o{ TRANSACTION : "receives"

    USER {
        int id PK
        string username
        string email
        string password_hash
        string aadhaar_number "AES-256 Encrypted"
        decimal balance
    }

    TRANSACTION {
        int id PK
        int sender_id FK
        int receiver_id FK
        decimal amount
        datetime timestamp
        string status
    }