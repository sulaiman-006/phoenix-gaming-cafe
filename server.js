const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve your frontend files
app.use(express.static(__dirname));

// ================================
// MYSQL CONNECTION
// ================================

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : null
});
db.connect((err) => {
    if (err) {
        console.error("❌ MySQL connection failed:");
        console.error(err.message);
        return;
    }

    console.log("✅ MySQL connected successfully!");

    // Automatic Table Creation Code
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS bookings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(50) NOT NULL,
            experience VARCHAR(255) NOT NULL,
            booking_date DATE NOT NULL,
            booking_time VARCHAR(50) NOT NULL,
            players VARCHAR(50) NOT NULL,
            duration VARCHAR(50) NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    db.query(createTableQuery, (err, result) => {
    if (err) {
        console.error("❌ Error creating table:", err);
    } else {
        console.log("✅ Bookings table ready!");
        // Reset auto_increment to start fresh if table is empty or reset wanted
        db.query("TRUNCATE TABLE bookings;", (truncErr) => {
            if (truncErr) console.error("❌ Error truncating table:", truncErr);
        });
    }
});

// ================================
// HOME PAGE
// ================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// ================================
// BOOKING API
// ================================

app.post("/api/bookings", (req, res) => {

    const {
        name,
        phone,
        experience,
        date,
        time,
        players,
        duration,
        notes
    } = req.body;

    // Check required fields
    if (
        !name ||
        !phone ||
        !experience ||
        !date ||
        !time ||
        !players ||
        !duration
    ) {
        return res.status(400).json({
            success: false,
            message: "Please fill all required fields."
        });
    }

    const sql = `
        INSERT INTO bookings
        (
            name,
            phone,
            experience,
            booking_date,
            booking_time,
            players,
            duration,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        name,
        phone,
        experience,
        date,
        time,
        players,
        duration,
        notes || ""
    ];

    db.query(sql, values, (err, result) => {

        if (err) {
            console.error("❌ Database error:");
            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Booking could not be saved."
            });
        }

        console.log("✅ New booking saved. ID:", result.insertId);

        res.status(201).json({
            success: true,
            message: "Booking request saved successfully!",
            bookingId: result.insertId
        });
    });
});

// ================================
// GET ALL BOOKINGS
// ================================

app.get("/api/bookings", (req, res) => {

    const sql = `
        SELECT *
        FROM bookings
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Could not get bookings."
            });
        }

        res.json({
            success: true,
            bookings: results
        });
    });
});
// ================================
// DELETE BOOKING API
// ================================

app.delete("/api/bookings/:id", (req, res) => {
    const bookingId = req.params.id;
    const sql = "DELETE FROM bookings WHERE id = ?";

    db.query(sql, [bookingId], (err, result) => {
        if (err) {
            console.error("❌ Delete error:", err);
            return res.status(500).json({ success: false, message: "Failed to delete booking." });
        }

        res.json({ success: true, message: "Booking deleted successfully!" });
    });
});

// ================================
// START SERVER
// ================================

app.listen(PORT, () => {
    console.log("");
    console.log("====================================");
    console.log("🔥 PHOENIX GAME CAFE SERVER");
    console.log("====================================");
    console.log(`🌐 Website: http://localhost:${PORT}`);
    console.log(`📋 Bookings API: http://localhost:${PORT}/api/bookings`);
    console.log("====================================");
});
