# Railway Management System

A **Node.js and Express**-based Railway Management System with **MySQL** for real-time seat booking. The system includes **role-based access control (Admin/User)** and **concurrent booking handling** using MySQL transactions.

---

## **Features**

- **User Authentication** (Register/Login with JWT authentication)
- **Admin Access** (Add trains, view bookings, manage database)
- **Real-time seat booking** (Handled with MySQL transactions)
- **Role-based access control**
- **RESTful API with structured folder-based code**

---

## **Tech Stack**

- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Token)
- **Environment Variables:** dotenv

---

## **Installation & Setup**

### **1. Clone the Repository**

```sh
git clone https://github.com/your-repo/railway-management.git
cd railway-management
```

### **2. Install Dependencies**

```sh
npm install
```

### **3. Configure Environment Variables**

Create a `.env` file in the project root and configure the following:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=irctc
JWT_SECRET=your_jwt_secret
ADMIN_API_KEY=mysecretadminkey
```

### **4. Set Up MySQL Database**

1. Open MySQL and create the database:

```sql
CREATE DATABASE irctc;
```

2. Run the SQL schema file (if provided) or create tables manually (see below).

### **5. Start the Server**

```sh
npm start
```

Server runs on: **http://localhost:3000**

---

## **Database Schema**

### **Users Table (`users`)**

Stores user details, including admins and regular users.

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Trains Table (`trains`)**

Stores train details like name, route, and seat availability.

```sql
CREATE TABLE trains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    source VARCHAR(50) NOT NULL,
    destination VARCHAR(50) NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Bookings Table (`bookings`)**

Stores booking details for users.

```sql
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    train_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (train_id) REFERENCES trains(id) ON DELETE CASCADE
);
```

---

## **API Routes**

### **1. Authentication Routes**

| Method | Endpoint        | Description             |
| ------ | --------------- | ----------------------- |
| `POST` | `/api/register` | Register a new user     |
| `POST` | `/api/login`    | Login and get JWT token |

Example Register Request:

```json
{
  "username": "user1",
  "password": "password123"
}
```

### **2. Admin Routes** (Requires `ADMIN_API_KEY` in headers)

| Method | Endpoint              | Description       |
| ------ | --------------------- | ----------------- |
| `POST` | `/api/admin/trains`   | Add a new train   |
| `GET`  | `/api/admin/bookings` | View all bookings |

Example Add Train Request:

```json
{
  "name": "Express 101",
  "source": "New York",
  "destination": "Washington",
  "total_seats": 100
}
```

### **3. Train Routes**

| Method | Endpoint                                             | Description          |
| ------ | ---------------------------------------------------- | -------------------- |
| `GET`  | `/api/trains?source=New York&destination=Washington` | Get available trains |

### **4. Booking Routes** (Requires JWT Token)

| Method | Endpoint            | Description         |
| ------ | ------------------- | ------------------- |
| `POST` | `/api/bookings`     | Book a seat         |
| `GET`  | `/api/bookings/:id` | Get booking details |

Example Booking Request:

```json
{
  "train_id": 1
}
```

---

## **Handling Concurrent Bookings**

When multiple users book the same train simultaneously, **MySQL transactions and row locking (`SELECT FOR UPDATE`)** prevent overbooking.

### **Booking Logic (bookingsController.js)**

```js
const bookSeat = async (req, res) => {
  const { train_id } = req.body;
  const user_id = req.user.id;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Step 1: Check seat availability with row lock
    const [train] = await connection.query(
      `SELECT available_seats FROM trains WHERE id = ? FOR UPDATE`,
      [train_id]
    );

    if (train.length === 0 || train[0].available_seats <= 0) {
      await connection.rollback();
      return res.status(400).json({ message: "No seats available" });
    }

    // Step 2: Reduce seat count by 1
    await connection.query(
      `UPDATE trains SET available_seats = available_seats - 1 WHERE id = ?`,
      [train_id]
    );

    // Step 3: Insert booking record
    const [booking] = await connection.query(
      `INSERT INTO bookings (user_id, train_id) VALUES (?, ?)`,
      [user_id, train_id]
    );

    await connection.commit();
    res.json({ message: "Booking successful", booking_id: booking.insertId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: "Booking failed", error: error.message });
  } finally {
    connection.release();
  }
};
```

---

## **Testing the API**

1. Use **Postman** or **cURL** to test API routes.
2. Ensure `JWT Token` is included in **Authorization Header** for user-specific routes.
3. Use `ADMIN_API_KEY` in headers for admin routes.

---

## **Future Enhancements**

- Implement **payment gateway integration** for ticket booking.
- Add **train schedules & dynamic pricing**.
- Implement **seat selection feature**.
- Deploy to **AWS/GCP** for scalability.

---
