// ================================
// LOCAL MYSQL CONNECTION
// ================================

const db = mysql.createConnection({
    host: "localhost",          // Local machine
    user: "root",               // Unoda local MySQL username (default 'root')
    password: "sulai@",  // Unoda MySQL password (mumbai/root password ah inga podu)
    database: "phoenix_cafe",   // Namma ippo create pannathu
    port: 3306                  // Default MySQL local port
});

db.connect((err) => {
    if (err) {
        console.error("❌ Local MySQL connection failed:");
        console.error(err.message);
        return;
    }

    console.log("✅ Local MySQL connected successfully!");

    // Automatic Table Creation Code (with start_time & end_time)
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS bookings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(50) NOT NULL,
            experience VARCHAR(255) NOT NULL,
            booking_date DATE NOT NULL,
            start_time VARCHAR(50) NOT NULL,
            end_time VARCHAR(50) NOT NULL,
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
            console.log("✅ Bookings table ready in local database!");
        }
    });
});
