document.addEventListener("DOMContentLoaded", function () {
    const bookingForm = document.getElementById("bookingForm") || document.querySelector("form");

    if (bookingForm) {
        bookingForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const submitBtn = bookingForm.querySelector("button[type='submit']");
            if (submitBtn) submitBtn.disabled = true;

            // Form Field Data Gathering
            const formData = {
                name: document.getElementById("name")?.value || "",
                phone: document.getElementById("phone")?.value || "",
                experience: document.getElementById("experience")?.value || "PlayStation",
                date: document.getElementById("date")?.value || "",
                time: document.getElementById("time")?.value || "",
                players: document.getElementById("players")?.value || "1",
                duration: document.getElementById("duration")?.value || "1 hour",
                notes: document.getElementById("notes")?.value || ""
            };

            try {
                const response = await fetch("/api/bookings", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
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
