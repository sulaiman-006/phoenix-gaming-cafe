document.addEventListener("DOMContentLoaded", function () {
    const bookingForm = document.getElementById("bookingForm") || document.querySelector("form");

    if (bookingForm) {
        bookingForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const submitBtn = bookingForm.querySelector("button[type='submit']");
            if (submitBtn) submitBtn.disabled = true;

            // Automatically read all input/select/textarea values from form
            const formDataObj = new FormData(bookingForm);
            const formData = {};
            formDataObj.forEach((value, key) => {
                formData[key] = value;
            });

            // Fallback mapping if field names differ slightly in HTML
            const payload = {
                name: formData.name || formData.YOUR_NAME || formData.fullname || "",
                phone: formData.phone || formData.PHONE_NUMBER || formData.mobile || "",
                experience: formData.experience || formData.game_mode || formData.mode || "PlayStation",
                date: formData.date || formData.booking_date || "",
                time: formData.time || formData.booking_time || "",
                players: formData.players || "1",
                duration: formData.duration || "1 hour",
                notes: formData.notes || formData.special_request || ""
            };

            try {
                const response = await fetch("/api/bookings", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (result.success) {
                    alert("🎉 Slot Booking Successful!");
                    bookingForm.reset();
                } else {
                    alert("❌ Error: " + (result.message || "Failed to submit booking."));
                }
            } catch (error) {
                console.error("Booking error:", error);
                alert("❌ Something went wrong. Please try again!");
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
});
