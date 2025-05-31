// Global variables to store calendar data
let eventDates = [];
let eventData = [];
let calendarInstance = null;
let isShowingAllEvents = false;
let currentSelectedDate = null;
let bigCalendarInitialized = false;

// Small calendar variables
let smallCalendarDate = new Date();
let smallSelectedDate = null;
let isShowingAllEventsSmall = false;
let smallCalendarInitialized = false;

const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

async function fetchCalendarData() {
    try {
        const response = await fetch(
            "https://portal.ppimalaysia.id/assets/php/API/frontend-calendar.php"
        );
        const data = await response.json();

        if (data.success) {
            eventDates = data.data.event_dates || [];
            eventData = data.data.events || [];
            console.log("Calendar data loaded:", {
                totalEventDates: eventDates.length,
                totalEvents: eventData.length,
            });
        } else {
            console.error("Failed to fetch calendar data:", data);
        }
    } catch (error) {
        console.error("Error fetching calendar data:", error);
        // Fallback to empty arrays if API fails
        eventDates = [];
        eventData = [];
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById("loadingOverlay");
    const mainContent = document.getElementById("mainContent");

    loadingOverlay.classList.add("hidden");

    setTimeout(() => {
        if (mainContent) {
            mainContent.classList.add("visible");
        }
    }, 250);
}

async function showBigCalendar() {
    // Get big-screen-calendar-col class, set the display to block
    const bigScreenCalendar = document.querySelector(".big-screen-calendar");
    bigScreenCalendar.style.display = "block";

    // Wait for calendar data to be loaded before starting the infinite calendar
    await fetchCalendarData();

    // Start the infinite calendar
    calendarInstance = new InfiniteCalendar();

    // Setup All Events button
    setupAllEventsButton();

    // Mark as initialized
    bigCalendarInitialized = true;
}

async function showSmallCalendar() {
    const smallScreenCalendar = document.querySelector(
        ".small-screen-calendar"
    );
    smallScreenCalendar.style.display = "block";

    // Wait for calendar data to be loaded
    await fetchCalendarData();

    // Initialize small calendar
    setupSmallCalendar();
}

function setupSmallCalendar() {
    const today = new Date();
    smallCalendarDate = new Date(today);

    // Set today as initially selected date
    const todayString = formatDateToString(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );
    smallSelectedDate = todayString;

    // Update today button text
    updateTodayButton();

    // Render initial calendar
    renderSmallCalendar();

    // Setup event listeners
    setupSmallCalendarEvents();

    // Setup All Events button
    setupSmallAllEventsButton();

    // Show today's events
    updateSmallEventDisplay(todayString);

    // Mark as initialized
    smallCalendarInitialized = true;
}

function updateTodayButton() {
    const todayBtn = document.getElementById("todayBtn");
    const today = new Date();
    if (todayBtn) {
        todayBtn.textContent = today.getDate();
    }
}

function renderSmallCalendar() {
    const year = smallCalendarDate.getFullYear();
    const month = smallCalendarDate.getMonth();

    // Update header
    const yearElement = document.getElementById("calendarYear");
    const monthElement = document.getElementById("calendarMonth");

    if (yearElement) yearElement.textContent = year;
    if (monthElement) monthElement.textContent = monthNames[month];

    // Generate calendar days
    const daysGrid = document.getElementById("smallDaysGrid");
    if (daysGrid) {
        daysGrid.innerHTML = generateSmallCalendarDays(year, month);
    }
}

function generateSmallCalendarDays(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay(); // 0 = Sunday

    const today = new Date();
    const todayString = formatDateToString(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    let daysHTML = "";

    // Previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startDay - 1; i >= 0; i--) {
        const day = prevMonth.getDate() - i;
        const prevYear = month === 0 ? year - 1 : year;
        const prevMonthIndex = month === 0 ? 11 : month - 1;
        const dateString = formatDateToString(prevYear, prevMonthIndex, day);

        daysHTML += `<div class="small-day other-month" data-date="${dateString}">${day}</div>`;
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateString = formatDateToString(year, month, day);
        const isToday = dateString === todayString;
        const isSelected = dateString === smallSelectedDate;
        const hasEvent = hasEventsOnDate(dateString);

        let classes = "small-day";
        if (isToday) classes += " today";
        if (isSelected && !isToday) classes += " selected";
        if (hasEvent) classes += " has-event";

        daysHTML += `<div class="${classes}" data-date="${dateString}">${day}</div>`;
    }

    // Next month's leading days
    const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
    const remainingCells = totalCells - startDay - daysInMonth;
    for (let day = 1; day <= remainingCells; day++) {
        const nextYear = month === 11 ? year + 1 : year;
        const nextMonthIndex = month === 11 ? 0 : month + 1;
        const dateString = formatDateToString(nextYear, nextMonthIndex, day);

        daysHTML += `<div class="small-day other-month" data-date="${dateString}">${day}</div>`;
    }

    return daysHTML;
}

function setupSmallCalendarEvents() {
    // Today button
    const todayBtn = document.getElementById("todayBtn");
    if (todayBtn) {
        todayBtn.addEventListener("click", goToToday);
    }

    // Navigation buttons
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (prevBtn) {
        prevBtn.addEventListener("click", () => navigateMonth(-1));
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => navigateMonth(1));
    }

    // Day clicks
    const daysGrid = document.getElementById("smallDaysGrid");
    if (daysGrid) {
        daysGrid.addEventListener("click", (e) => {
            if (
                e.target.classList.contains("small-day") &&
                !e.target.classList.contains("other-month")
            ) {
                const clickedDate = e.target.dataset.date;
                selectSmallDate(clickedDate);
            }
        });
    }
}

function navigateMonth(direction) {
    smallCalendarDate.setMonth(smallCalendarDate.getMonth() + direction);
    renderSmallCalendar();
}

function goToToday() {
    const today = new Date();
    smallCalendarDate = new Date(today);

    const todayString = formatDateToString(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    selectSmallDate(todayString);
    renderSmallCalendar();
}

function selectSmallDate(dateString) {
    // If we're showing all events, switch back to single day view
    if (isShowingAllEventsSmall) {
        const button = document.getElementById("smallAllEventsBtn");
        isShowingAllEventsSmall = false;
        button.textContent = "All Events";
    }

    smallSelectedDate = dateString;
    renderSmallCalendar();
    updateSmallEventDisplay(dateString);
}

function updateSmallEventDisplay(selectedDate) {
    const events = getEventsForDate(selectedDate);
    const titleElement = document.getElementById("smallEventsTitle");
    const contentElement = document.getElementById("smallEventsContent");

    // Update the title
    if (titleElement) {
        titleElement.textContent = formatDateForDisplay(selectedDate);
    }

    // Update the content
    if (contentElement) {
        if (events.length === 0) {
            contentElement.innerHTML =
                '<div class="no-events-small">No events scheduled for this date.</div>';
        } else {
            contentElement.innerHTML = events
                .map((event) => {
                    const startTime = formatTime(event.start);
                    const endTime = formatTime(event.end);

                    // Map class names to our CSS classes
                    let eventClass = "other"; // default
                    if (event.class_name.includes("success")) {
                        eventClass = "online-offline";
                    } else if (event.class_name.includes("info")) {
                        eventClass = "meeting";
                    } else if (event.class_name.includes("warning")) {
                        eventClass = "deadline";
                    } else if (event.class_name.includes("danger")) {
                        eventClass = "important";
                    }

                    return `
                    <div class="small-event-item ${eventClass}">
                        <div class="small-event-item-title">${event.title}</div>
                        <div class="small-event-item-time">${startTime} - ${endTime}</div>
                    </div>
                `;
                })
                .join("");
        }
    }
}

// Function to setup the small screen All Events button
function setupSmallAllEventsButton() {
    const smallAllEventsButton = document.getElementById("smallAllEventsBtn");
    if (smallAllEventsButton) {
        smallAllEventsButton.addEventListener(
            "click",
            toggleSmallAllEventsView
        );
    }
}

// Function to toggle between all events and single day view for small screen
function toggleSmallAllEventsView() {
    const button = document.getElementById("smallAllEventsBtn");

    if (isShowingAllEventsSmall) {
        // Switch back to single day view
        isShowingAllEventsSmall = false;
        button.textContent = "All Events";

        // Show events for the currently selected date
        if (smallSelectedDate) {
            updateSmallEventDisplay(smallSelectedDate);
        }
    } else {
        // Switch to all events view
        isShowingAllEventsSmall = true;
        button.textContent = "Back to Day View";
        showSmallAllEventsFromToday();
    }
}

// Function to show all events from current date onwards for small screen
function showSmallAllEventsFromToday() {
    const today = new Date();
    const todayString = formatDateToString(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    // Filter events from today onwards
    const upcomingEvents = eventData.filter((event) => {
        const eventDate = event.start.split(" ")[0];
        return eventDate >= todayString;
    });

    // Sort events by date and time
    upcomingEvents.sort((a, b) => new Date(a.start) - new Date(b.start));

    const titleElement = document.getElementById("smallEventsTitle");
    const contentElement = document.getElementById("smallEventsContent");

    // Update the title
    if (titleElement) {
        titleElement.textContent = "All Upcoming Events";
    }

    // Update the content
    if (contentElement) {
        if (upcomingEvents.length === 0) {
            contentElement.innerHTML =
                '<div class="no-events-small">No upcoming events scheduled.</div>';
        } else {
            // Group events by date
            const eventsByDate = {};
            upcomingEvents.forEach((event) => {
                const eventDate = event.start.split(" ")[0];
                if (!eventsByDate[eventDate]) {
                    eventsByDate[eventDate] = [];
                }
                eventsByDate[eventDate].push(event);
            });

            // Generate HTML for all events grouped by date
            let allEventsHTML = "";
            Object.keys(eventsByDate).forEach((date) => {
                const events = eventsByDate[date];
                allEventsHTML += `
                    <div class="small-all-events-date-group">
                        <div class="small-all-events-date-header">
                            <h6>${formatDateForDisplay(date)}</h6>
                        </div>
                        <div class="small-all-events-date-content">
                            ${events
                                .map((event) => {
                                    const startTime = formatTime(event.start);
                                    const endTime = formatTime(event.end);

                                    // Map class names to our CSS classes
                                    let eventClass = "other"; // default
                                    if (event.class_name.includes("success")) {
                                        eventClass = "online-offline";
                                    } else if (
                                        event.class_name.includes("info")
                                    ) {
                                        eventClass = "meeting";
                                    } else if (
                                        event.class_name.includes("warning")
                                    ) {
                                        eventClass = "deadline";
                                    } else if (
                                        event.class_name.includes("danger")
                                    ) {
                                        eventClass = "important";
                                    }

                                    return `
                                    <div class="small-event-item ${eventClass}">
                                        <div class="small-event-item-title">${event.title}</div>
                                        <div class="small-event-item-time">${startTime} - ${endTime}</div>
                                    </div>
                                `;
                                })
                                .join("")}
                        </div>
                    </div>
                `;
            });

            contentElement.innerHTML = allEventsHTML;
        }
    }
}

// Helper function to get events for a specific date
function getEventsForDate(dateString) {
    return eventData.filter((event) => {
        const eventDate = event.start.split(" ")[0]; // Get date part from datetime
        return eventDate === dateString;
    });
}

// Helper function to check if a date has events
function hasEventsOnDate(dateString) {
    return eventDates.includes(dateString);
}

// Helper function to format date to YYYY-MM-DD
function formatDateToString(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
    ).padStart(2, "0")}`;
}

// Helper function to format date for display
function formatDateForDisplay(dateString) {
    const date = new Date(dateString + "T00:00:00");
    const options = {
        day: "numeric",
        month: "long",
        year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
}

// Helper function to format time
function formatTime(timeString) {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

// Function to update the event display (for big screen)
function updateEventDisplay(selectedDate) {
    currentSelectedDate = selectedDate;
    const events = getEventsForDate(selectedDate);
    const titleElement = document.querySelector(".big-screen-title");
    const contentElement = document.querySelector(".big-screen-event-content");

    // Update the title
    if (titleElement) {
        titleElement.textContent = formatDateForDisplay(selectedDate);
    }

    // Update the content
    if (contentElement) {
        if (events.length === 0) {
            contentElement.innerHTML =
                '<div class="no-events">No events scheduled for this date.</div>';
        } else {
            contentElement.innerHTML = events
                .map((event) => {
                    const startTime = formatTime(event.start);
                    const endTime = formatTime(event.end);

                    // Map class names to our CSS classes
                    let eventClass = "other"; // default
                    if (event.class_name.includes("success")) {
                        eventClass = "online-offline";
                    } else if (event.class_name.includes("info")) {
                        eventClass = "meeting";
                    } else if (event.class_name.includes("warning")) {
                        eventClass = "deadline";
                    } else if (event.class_name.includes("danger")) {
                        eventClass = "important";
                    }

                    return `
                    <div class="big-screen-event-item ${eventClass}">
                        <div class="big-screen-event-item-title">
                            <span>${event.title}</span>
                        </div>
                        <div class="big-screen-event-item-time">
                            <span>${startTime} - ${endTime}</span>
                        </div>
                    </div>
                `;
                })
                .join("");
        }
    }
}

// Function to setup the All Events button
function setupAllEventsButton() {
    const allEventsButton = document.getElementById("bigAllEventsBtn");
    if (allEventsButton) {
        allEventsButton.addEventListener("click", toggleAllEventsView);
    }
}

// Function to toggle between all events and single day view
function toggleAllEventsView() {
    const button = document.getElementById("bigAllEventsBtn");

    if (isShowingAllEvents) {
        // Switch back to single day view
        isShowingAllEvents = false;
        button.textContent = "All Events";

        // Show events for the currently selected date
        if (currentSelectedDate) {
            updateEventDisplay(currentSelectedDate);
        }
    } else {
        // Switch to all events view
        isShowingAllEvents = true;
        button.textContent = "Back to Day View";
        showAllEventsFromToday();
    }
}

// Function to show all events from current date onwards
function showAllEventsFromToday() {
    const today = new Date();
    const todayString = formatDateToString(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    // Filter events from today onwards
    const upcomingEvents = eventData.filter((event) => {
        const eventDate = event.start.split(" ")[0];
        return eventDate >= todayString;
    });

    // Sort events by date and time
    upcomingEvents.sort((a, b) => new Date(a.start) - new Date(b.start));

    const titleElement = document.querySelector(".big-screen-title");
    const contentElement = document.querySelector(".big-screen-event-content");

    // Update the title
    if (titleElement) {
        titleElement.textContent = "All Upcoming Events";
    }

    // Update the content
    if (contentElement) {
        if (upcomingEvents.length === 0) {
            contentElement.innerHTML =
                '<div class="no-events">No upcoming events scheduled.</div>';
        } else {
            // Group events by date
            const eventsByDate = {};
            upcomingEvents.forEach((event) => {
                const eventDate = event.start.split(" ")[0];
                if (!eventsByDate[eventDate]) {
                    eventsByDate[eventDate] = [];
                }
                eventsByDate[eventDate].push(event);
            });

            // Generate HTML for all events grouped by date
            let allEventsHTML = "";
            Object.keys(eventsByDate).forEach((date) => {
                const events = eventsByDate[date];
                allEventsHTML += `
                    <div class="all-events-date-group">
                        <div class="all-events-date-header">
                            <h6>${formatDateForDisplay(date)}</h6>
                        </div>
                        <div class="all-events-date-content">
                            ${events
                                .map((event) => {
                                    const startTime = formatTime(event.start);
                                    const endTime = formatTime(event.end);

                                    // Map class names to our CSS classes
                                    let eventClass = "other"; // default
                                    if (event.class_name.includes("success")) {
                                        eventClass = "online-offline";
                                    } else if (
                                        event.class_name.includes("info")
                                    ) {
                                        eventClass = "meeting";
                                    } else if (
                                        event.class_name.includes("warning")
                                    ) {
                                        eventClass = "deadline";
                                    } else if (
                                        event.class_name.includes("danger")
                                    ) {
                                        eventClass = "important";
                                    }

                                    return `
                                    <div class="big-screen-event-item ${eventClass}">
                                        <div class="big-screen-event-item-title">
                                            <span>${event.title}</span>
                                        </div>
                                        <div class="big-screen-event-item-time">
                                            <span>${startTime} - ${endTime}</span>
                                        </div>
                                    </div>
                                `;
                                })
                                .join("")}
                        </div>
                    </div>
                `;
            });

            contentElement.innerHTML = allEventsHTML;
        }
    }
}

// Hide loading when page loads
window.addEventListener("load", function () {
    setTimeout(hideLoading, 500);
});
setTimeout(hideLoading, 5000);

// When DOM loaded
document.addEventListener("DOMContentLoaded", () => {
    if (window.innerWidth >= 992) {
        showBigCalendar();
    } else {
        showSmallCalendar();
    }
});

// Handle window resize
window.addEventListener("resize", () => {
    const bigCalendar = document.querySelector(".big-screen-calendar");
    const smallCalendar = document.querySelector(".small-screen-calendar");

    if (window.innerWidth >= 992) {
        if (bigCalendar) bigCalendar.style.display = "block";
        if (smallCalendar) smallCalendar.style.display = "none";

        // Initialize big calendar if not already done
        if (!bigCalendarInitialized) {
            showBigCalendar();
        }
    } else {
        if (bigCalendar) bigCalendar.style.display = "none";
        if (smallCalendar) smallCalendar.style.display = "block";

        // Initialize small calendar if not already done
        if (!smallCalendarInitialized) {
            showSmallCalendar();
        }
    }
});
