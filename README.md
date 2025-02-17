# Railway Management System

A **Node.js + MySQL** project that simulates a simple railway booking system. Users can register, log in, search for trains, and book seats. Admins can add trains and update total seats. The system uses **JWT** for user authentication and an **API key** for admin authorization.

---

## Quick Setup

1. **Clone the repo**:
   ```bash
   git clone https://github.com/Striver20/IRCTC-.git
   cd IRCTC-
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Create a `.env` file** in the project root:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=railway_db
   JWT_SECRET=something_super_secret_and_random
   ADMIN_API_KEY=admin_secret_key
   ```
4. **Create and set up the database** (MySQL):
   ```sql
   CREATE DATABASE irctc;
   ```
   Then run:
   ```bash
   npm run setup-db
   ```
5. **Start the server**:
   ```bash
   npm start
   ```
   The app runs on **http://localhost:3000** by default.

---

## User Endpoints

1. **Register**

   - **Method**: `POST`
   - **URL**: `/api/register`
   - **Body**: `{ "username": "john", "password": "pass123" }`

2. **Login**

   - **Method**: `POST`
   - **URL**: `/api/login`
   - **Body**: `{ "username": "john", "password": "pass123" }`
   - **Returns** a JWT token.

3. **Search Trains**

   - **Method**: `GET`
   - **URL**: `/api/trains?source=Mumbai&destination=Delhi`

4. **Book a Seat**

   - **Method**: `POST`
   - **URL**: `/api/bookings`
   - **Headers**: `Authorization: Bearer <JWT_TOKEN>`
   - **Body**: `{ "train_id": 1 }`

5. **View Your Bookings**
   - **Method**: `GET`
   - **URL**: `/api/bookings`
   - **Headers**: `Authorization: Bearer <JWT_TOKEN>`

---

## Admin Endpoints

> **Requires** `x-api-key: <ADMIN_API_KEY>` in the headers.

1. **Add Train**

   - **Method**: `POST`
   - **URL**: `/api/admin/trains`
   - **Body**:
     ```json
     {
       "name": "Superfast Express",
       "source": "Mumbai",
       "destination": "Delhi",
       "total_seats": 100,
       "departure": "2025-05-01 09:30:00"
     }
     ```

2. **Update Total Seats**
   - **Method**: `PUT`
   - **URL**: `/api/admin/trains/:id/seats`
   - **Body**: `{ "total_seats": 120 }`

---

## Concurrency Handling

When multiple users book seats at the same time, the system uses **MySQL transactions** with **row-level locking** (`SELECT ... FOR UPDATE`) to ensure seat availability remains accurate.

---

## Database Schema

```sql
-- Users
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trains
CREATE TABLE trains (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  source VARCHAR(50) NOT NULL,
  destination VARCHAR(50) NOT NULL,
  total_seats INT NOT NULL,
  available_seats INT NOT NULL,
  departure DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings
CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  train_id INT NOT NULL,
  seat_number VARCHAR(10) NOT NULL,
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (train_id) REFERENCES trains(id)
);
```

---
