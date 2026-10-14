const form = document.getElementById("bookingForm");
const message = document.getElementById("formMessage");
const dateInput = document.getElementById("dateInput");

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

// Current year
const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

// =====================================
// PREVENT PAST DATES
// =====================================

if (dateInput) {

    const today = new Date();

    const localToday = new Date(
        today.getTime() -
        today.getTimezoneOffset() * 60000
    )
    .toISOString()
    .slice(0, 10);

    dateInput.min = localToday;
}

// =====================================
// MOBILE MENU
// =====================================

menuToggle?.addEventListener("click", () => {

    const isOpen = navMenu.classList.toggle("open");

    menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
    );
});

navMenu?.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {

        navMenu.classList.remove("open");

        menuToggle?.setAttribute(
            "aria-expanded",
            "false"
        );
    });

});

// =====================================
// QUICK BOOKING BUTTONS
// =====================================

document.querySelectorAll("[data-experience]").forEach(link => {

    link.addEventListener("click", () => {

        const select =
            document.getElementById("experienceSelect");

        if (select) {
            select.value = link.dataset.experience;
        }

    });

});

// =====================================
// BOOKING FORM
// =====================================

form?.addEventListener("submit", async (event) => {

    event.preventDefault();

    // HTML validation
    if (!form.reportValidity()) {
        return;
    }

    const data = new FormData(form);

    const bookingData = {

        name: data.get("name"),

        phone: data.get("phone"),

        experience: data.get("experience"),

        date: data.get("date"),

        time: data.get("time"),

        players: Number(data.get("players")),

        duration: data.get("duration"),

        notes: data.get("notes") || ""

    };

    const submitButton =
        form.querySelector('button[type="submit"]');

    submitButton.disabled = true;

    submitButton.style.opacity = "0.65";

    message.className = "form-footnote";

    message.textContent =
        "Sending your booking request...";

    try {

        const response = await fetch(
            "/api/bookings",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(bookingData)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Booking failed."
            );
        }

        // SUCCESS

        message.className =
            "form-footnote success";

        message.textContent =
            "✅ Booking request sent successfully! We will contact you soon.";

        form.reset();

        // Reset minimum date
        if (dateInput) {

            const today = new Date();

            const localToday = new Date(
                today.getTime() -
                today.getTimezoneOffset() * 60000
            )
            .toISOString()
            .slice(0, 10);

            dateInput.min = localToday;
        }

    } catch (error) {

        console.error(error);

        message.className =
            "form-footnote error";

        message.textContent =
            "❌ Booking failed. Please try again.";

    } finally {

        submitButton.disabled = false;

        submitButton.style.opacity = "";

    }

});