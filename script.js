<script>
    async function loadAllData() {
        await fetchBookings();
        await fetchStats();
    }

    async function fetchBookings() {
        const tbody = document.getElementById('booking-rows');
        
        try {
            const response = await fetch('/api/bookings');
            const data = await response.json();

            if (data.success && data.bookings.length > 0) {
                tbody.innerHTML = '';
                data.bookings.forEach((b, index) => {
                    const formattedDate = new Date(b.booking_date).toLocaleDateString();
                    const row = `
                        <tr>
                            <td><strong>${index + 1}</strong></td>
                            <td><strong>${b.name}</strong></td>
                            <td>${b.phone}</td>
                            <td>${b.experience}</td>
                            <td>${formattedDate}</td>
                            <td>${b.booking_time}</td>
                            <td>${b.players}</td>
                            <td>${b.duration}</td>
                            <td>${b.notes || '-'}</td>
                            <td>
                                <button class="delete-btn" onclick="deleteBooking(${b.id})">🗑️ Delete</button>
                            </td>
                        </tr>
                    `;
                    tbody.innerHTML += row;
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="10" class="no-data">No bookings found yet.</td></tr>';
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    }

    async function fetchStats() {
        try {
            const response = await fetch('/api/admin/stats');
            const data = await response.json();

            if (data.success && data.stats) {
                document.getElementById('totalCustomers').innerText = data.stats.total_customers || 0;
                document.getElementById('psCount').innerText = data.stats.ps_count || 0;
                document.getElementById('steeringCount').innerText = data.stats.steering_count || 0;
                document.getElementById('vrCount').innerText = data.stats.vr_count || 0;
            }
        } catch (err) {
            console.error("Error loading stats:", err);
        }
    }

    async function deleteBooking(id) {
        if (confirm("Are you sure you want to delete this booking?")) {
            try {
                const response = await fetch('/api/bookings/' + id, { method: 'DELETE' });
                const data = await response.json();
                if (data.success) {
                    loadAllData(); // Refresh immediately after delete
                } else {
                    alert("Error deleting booking!");
                }
            } catch (err) {
                console.error(err);
                alert("Failed to delete!");
            }
        }
    }

document.getElementById('bookingForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        experience: document.getElementById('experience').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        players: document.getElementById('players').value,
        duration: document.getElementById('duration').value,
        notes: document.getElementById('notes').value
    };

    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            alert("🎉 " + data.message);
            // Form clear pannalam or redirect pannalam
            document.getElementById('bookingForm').reset();
        } else {
            // 🛑 POPUP ALERT WHEN SLOT IS ALREADY BOOKED!
            alert(data.message); 
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong! Please try again.");
    }
});
    // Load data automatically when page first opens
    loadAllData();

    // 🚀 AUTO REFRESH EVERY 4 SECONDS (Background polling without manual reload)
    setInterval(() => {
        loadAllData();
    }, 4000);
</script>
