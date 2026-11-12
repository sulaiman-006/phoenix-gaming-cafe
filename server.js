const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

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
        }
    });
});

// ================================
// HOME PAGE
// ================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// ================================
// BOOKING API (WITH GAME MODE & TIME OVERLAP CHECK)
// ================================

app.post("/api/bookings", (req, res) => {
    const { name, phone, experience, date, time, players, duration, notes } = req.body;

    if (!name || !phone || !experience || !date || !time || !players || !duration) {
        return res.status(400).json({ success: false, message: "Please fill all required fields." });
    }

    // Helper to convert time "HH:MM" to total minutes from midnight for overlap checking
    function timeToMins(tStr) {
        if (!tStr || !tStr.includes(':')) return 0;
        const [h, m] = tStr.split(':').map(Number);
        return h * 60 + m;
    }

    // Helper to get duration in minutes
    function getDurationMins(durStr) {
        if (durStr.includes('1 hour')) return 60;
        if (durStr.includes('2 hours')) return 120;
        if (durStr.includes('hour')) {
            const match = durStr.match(/(\d+)/);
            return match ? parseInt(match[1]) * 60 : 60;
        }
        if (durStr.includes('minute')) {
            const match = durStr.match(/(\d+)/);
            return match ? parseInt(match[1]) : 30;
        }
        return 30;
    }

    const newStartMins = timeToMins(time);
    const newDurMins = getDurationMins(duration);
    const newEndMins = newStartMins + newDurMins;

    // Step 1: Fetch all bookings for the same Date and same Game Mode (Experience)
    const checkSql = "SELECT * FROM bookings WHERE booking_date = ? AND experience = ?";
    db.query(checkSql, [date, experience], (checkErr, existingBookings) => {
        if (checkErr) {
            console.error("Slot check error:", checkErr);
            return res.status(500).json({ success: false, message: "Database error during check." });
        }

        // Step 2: Check for time overlaps
        let isClash = false;
        let conflictingUser = "";

        for (let b of existingBookings) {
            const existingStartMins = timeToMins(b.booking_time);
            const existingDurMins = getDurationMins(b.duration);
            const existingEndMins = existingStartMins + existingDurMins;

            // Overlap Condition: (NewStart < ExistingEnd) AND (NewEnd > ExistingStart)
            if (newStartMins < existingEndMins && newEndMins > existingStartMins) {
                isClash = true;
                conflictingUser = b.name;
                break;
            }
        }

        // If a clash is found for this specific game mode, block it!
        if (isClash) {
            return res.status(400).json({
                success: false,
                message: `⚠️ Sorry! The ${experience} station is already booked during this time slot (Clash with existing booking). Please choose another time or game mode!`
            });
        }

        // Step 3: If no clash, proceed to Insert
        const sql = `
            INSERT INTO bookings
            (name, phone, experience, booking_date, booking_time, players, duration, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [name, phone, experience, date, time, players, duration, notes || ""];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("❌ Database error:", err);
                return res.status(500).json({ success: false, message: "Booking could not be saved." });
            }

            res.status(201).json({
                success: true,
                message: `Slot Booking Successful! ID: ${result.insertId}`,
                bookingId: result.insertId
            });
        });
    });
});
// ================================
// ADMIN STATS API (Summary Counts)
// ================================
app.get("/api/admin/stats", (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as total_customers,
            SUM(CASE WHEN experience = 'PlayStation' THEN 1 ELSE 0 END) as ps_count,
            SUM(CASE WHEN experience = 'Steering Racing' THEN 1 ELSE 0 END) as steering_count,
            SUM(CASE WHEN experience = 'VR' THEN 1 ELSE 0 END) as vr_count
        FROM bookings
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Stats error:", err);
            return res.status(500).json({ success: false, message: "Could not fetch stats" });
        }

        res.json({
            success: true,
            stats: results[0]
        });
    });
});

// ================================
// GET ALL BOOKINGS (Sorted ID ASC)
// ================================

app.get("/api/bookings", (req, res) => {
    const sql = `
        SELECT *
        FROM bookings
        ORDER BY id ASC
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

// DELETE BOOKING & AUTOMATICALLY RE-ORDER IDs
app.delete('/api/bookings/:id', (req, res) => {
    const bookingId = req.params.id;

    const deleteSql = 'DELETE FROM bookings WHERE id = ?';
    db.query(deleteSql, [bookingId], (err, result) => {
        if (err) {
            console.error("Delete error:", err);
            return res.status(500).json({ success: false, message: "Failed to delete booking" });
        }

        const reorderSql = `
            SET @count = 0;
            UPDATE bookings SET id = (@count := @count + 1);
            ALTER TABLE bookings AUTO_INCREMENT = 1;
        `;

        db.query(reorderSql, (reorderErr) => {
            if (reorderErr) {
                console.error("Reorder error:", reorderErr);
            }
            res.json({ success: true, message: "Booking deleted and IDs reordered successfully!" });
        });
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
