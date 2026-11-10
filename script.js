let pendingBookingData = null;

document.addEventListener("DOMContentLoaded", function () {
    const bookingForm = document.getElementById("bookingForm") || document.querySelector("form");

    if (bookingForm) {
        bookingForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            // Automatically read all input/select/textarea values from form
            const formDataObj = new FormData(bookingForm);
            const formData = {};
            formDataObj.forEach((value, key) => {
                formData[key] = value;
            });

            // Fallback mapping if field names differ slightly in HTML
            pendingBookingData = {
                name: formData.name || formData.YOUR_NAME || formData.fullname || "",
                phone: formData.phone || formData.PHONE_NUMBER || formData.mobile || "",
                experience: formData.experience || formData.game_mode || formData.mode || "PlayStation",
                date: formData.date || formData.booking_date || "",
                time: formData.time || formData.booking_time || "",
                players: formData.players || "1",
                duration: formData.duration || "1 hour",
                notes: formData.notes || formData.special_request || ""
            };

            // 👉 Instead of direct submit, show Payment Modal Popup
            const paymentModal = document.getElementById("paymentModal");
            if (paymentModal) {
                paymentModal.style.display = "flex";
            } else {
                // Fallback if modal is missing in HTML
                confirmPaymentAndBooking();
            }
        });
    }
});

// Close Modal Function
function closePaymentModal() {
    const paymentModal = document.getElementById("paymentModal");
    if (paymentModal) {
        paymentModal.style.display = "none";
    }
    pendingBookingData = null;
}

// Confirm Payment & Send Data to Backend
async function confirmPaymentAndBooking() {
    if (!pendingBookingData) {
        alert("No booking data found!");
        return;
    }

    const bookingForm = document.getElementById("bookingForm") || document.querySelector("form");
    const submitBtn = bookingForm ? bookingForm.querySelector("button[type='submit']") : null;
    if (submitBtn) submitBtn.disabled = true;

    try {
        const response = await fetch("/api/bookings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(pendingBookingData)
        });

        const result = await response.json();

        if (result.success) {
            alert("🎉 Payment Verified & Slot Booking Successful! ID: " + (result.bookingId || ""));
            if (bookingForm) bookingForm.reset();
            closePaymentModal();
        } else {
            alert("❌ Error: " + (result.message || "Failed to submit booking."));
        }
    } catch (error) {
        console.error("Booking error:", error);
        alert("❌ Something went wrong. Please try again!");
    } finally {
        if (submitBtn) submitBtn.disabled = false;
        pendingBookingData = null;
    }
}

async function resetDatabase() {
    if (confirm("Are you sure you want to delete all bookings and reset ID to 1?")) {
        try {
            const res = await fetch('/api/reset-id');
            const data = await res.json();
            if (data.success) {
                alert("Database reset successfully!");
                if (typeof fetchBookings === 'function') {
                    fetchBookings();
                }
            } else {
                alert("Failed to reset.");
            }
        } catch (err) {
            console.log(err);
            alert("Error resetting database.");
        }
    }
}let pendingBookingData = null;

document.addEventListener("DOMContentLoaded", function () {
    const bookingForm = document.getElementById("bookingForm") || document.querySelector("form");

    if (bookingForm) {
        bookingForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            // Automatically read all input/select/textarea values from form
            const formDataObj = new FormData(bookingForm);
            const formData = {};
            formDataObj.forEach((value, key) => {
                formData[key] = value;
            });

            // Fallback mapping if field names differ slightly in HTML
            pendingBookingData = {
                name: formData.name || formData.YOUR_NAME || formData.fullname || "",
                phone: formData.phone || formData.PHONE_NUMBER || formData.mobile || "",
                experience: formData.experience || formData.game_mode || formData.mode || "PlayStation",
                date: formData.date || formData.booking_date || "",
                time: formData.time || formData.booking_time || "",
                players: formData.players || "1",
                duration: formData.duration || "1 hour",
                notes: formData.notes || formData.special_request || ""
            };

            // 👉 Instead of direct submit, show Payment Modal Popup
            const paymentModal = document.getElementById("paymentModal");
            if (paymentModal) {
                paymentModal.style.display = "flex";
            } else {
                // Fallback if modal is missing in HTML
                confirmPaymentAndBooking();
            }
        });
    }
});

// Close Modal Function
function closePaymentModal() {
    const paymentModal = document.getElementById("paymentModal");
    if (paymentModal) {
        paymentModal.style.display = "none";
    }
    pendingBookingData = null;
}

// Confirm Payment & Send Data to Backend
async function confirmPaymentAndBooking() {
    if (!pendingBookingData) {
        alert("No booking data found!");
        return;
    }

    const bookingForm = document.getElementById("bookingForm") || document.querySelector("form");
    const submitBtn = bookingForm ? bookingForm.querySelector("button[type='submit']") : null;
    if (submitBtn) submitBtn.disabled = true;

    try {
        const response = await fetch("/api/bookings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(pendingBookingData)
        });

        const result = await response.json();

        if (result.success) {
            alert("🎉 Payment Verified & Slot Booking Successful! ID: " + (result.bookingId || ""));
            if (bookingForm) bookingForm.reset();
            closePaymentModal();
        } else {
            alert("❌ Error: " + (result.message || "Failed to submit booking."));
        }
    } catch (error) {
        console.error("Booking error:", error);
        alert("❌ Something went wrong. Please try again!");
    } finally {
        if (submitBtn) submitBtn.disabled = false;
        pendingBookingData = null;
    }
}

async function resetDatabase() {
    if (confirm("Are you sure you want to delete all bookings and reset ID to 1?")) {
        try {
            const res = await fetch('/api/reset-id');
            const data = await res.json();
            if (data.success) {
                alert("Database reset successfully!");
                if (typeof fetchBookings === 'function') {
                    fetchBookings();
                }
            } else {
                alert("Failed to reset.");
            }
        } catch (err) {
            console.log(err);
            alert("Error resetting database.");
        }
    }
}
