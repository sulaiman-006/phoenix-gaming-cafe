async function loadAllData() {
        await fetchBookings();
        await fetchStats();
    }

    async function fetchBookings() {
        const tbody = document.getElementById('booking-rows');
        if (!tbody) return; // If on home page where admin table doesn't exist
        
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
        const totalElem = document.getElementById('totalCustomers');
        if (!totalElem) return;

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
                    loadAllData();
                } else {
                    alert("Error deleting booking!");
                }
            } catch (err) {
                console.error(err);
                alert("Failed to delete!");
            }
        }
    }

    // 🕒 AUTOMATIC DURATION CALCULATION BETWEEN START TIME AND END TIME
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    const durationInput = document.getElementById('duration');

    function calculateDuration() {
        const start = startTimeInput.value;
        const end = endTimeInput.value;

        if (start && end) {
            const [startH, startM] = start.split(':').map(Number);
            const [endH, endM] = end.split(':').map(Number);

            const startDate = new Date(0, 0, 0, startH, startM);
            const endDate = new Date(0, 0, 0, endH, endM);

            let diffMs = endDate - startDate;
            if (diffMs <= 0) {
                durationInput.value = "Invalid time range";
                return;
            }

            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins === 30) {
                durationInput.value = "30 minutes";
            } else if (diffMins === 60) {
                durationInput.value = "1 hour";
            } else if (diffMins > 60) {
                const hours = (diffMins / 60).toFixed(1);
                durationInput.value = hours.endsWith('.0') ? parseInt(hours) + " hours" : hours + " hours";
            } else {
                durationInput.value = diffMins + " minutes";
            }
        }
    }

    if (startTimeInput && endTimeInput) {
        startTimeInput.addEventListener('change', calculateDuration);
        endTimeInput.addEventListener('change', calculateDuration);
    }

    // FORM SUBMISSION HANDLING
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                experience: document.getElementById('experience').value,
                date: document.getElementById('date').value,
                time: document.getElementById('startTime').value, // Start time stored as booking time
                players: document.getElementById('players').value,
                duration: document.getElementById('duration').value, // Auto-calculated duration
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
                    bookingForm.reset();
                } else {
                    // 🛑 POPUP ALERT IF SLOT ALREADY BOOKED
                    alert(data.message);
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Something went wrong! Please try again.");
            }
        });
    }

    // Load data automatically when page opens
    loadAllData();

    // 🚀 AUTO REFRESH EVERY 4 SECONDS (For Admin Dashboard)
    setInterval(() => {
        loadAllData();
    }, 4000);
