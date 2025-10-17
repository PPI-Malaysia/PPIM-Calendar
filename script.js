// Global variables to store calendar data
let eventDates = [];
let eventData = [];
let activeEventData = []; // New variable for active events
let calendarInstance = null;
let isShowingAllEvents = false;
let currentSelectedDate = null;
let bigCalendarInitialized = false;

// Small calendar variables
let smallCalendarDate = new Date();
let smallSelectedDate = null;
let isShowingAllEventsSmall = false;
let smallCalendarInitialized = false;

// Filter variables
let currentSmallFilter = null; // null means show all
let currentBigFilter = null; // null means show all

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
            //"test.json"
        );
        const data = await response.json();

        if (data.success) {
            eventDates = data.data.event_dates || [];
            eventData = data.data.events || [];
            activeEventData = data.data.active_events || []; // Store active events
            console.log("Calendar data loaded:", {
                totalEventDates: eventDates.length,
                totalEvents: eventData.length,
                activeEvents: activeEventData.length,
            });
        } else {
            console.error("Failed to fetch calendar data:", data);
        }
    } catch (error) {
        console.error("Error fetching calendar data:", error);
        // Fallback to empty arrays if API fails
        eventDates = [];
        eventData = [];
        activeEventData = [];
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById("loadingOverlay");
    const loadingOverlay2 = document.getElementById("loadingOverlay2");
    const mainContent = document.getElementById("mainContent");

    loadingOverlay.classList.add("hidden");
    loadingOverlay2.classList.add("hidden");

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
    const prevMonth = new Date(year, month, 0);
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
    const activeEvents = getActiveEventsForDate(selectedDate); // Use date-specific active events
    const titleElement = document.getElementById("smallEventsTitle");
    const contentElement = document.getElementById("smallEventsContent");

    // Update the title
    if (titleElement) {
        titleElement.textContent = formatDateForDisplay(selectedDate);
    }

    // Update the content
    if (contentElement) {
        let eventsHTML = "";

        // Add active events section if there are any for this date
        if (activeEvents.length > 0) {
            eventsHTML += `
                <div class="small-active-events-section">
                    <div class="small-active-events-header">
                        <h6>Currently Active Events</h6>
                    </div>
                    <div class="small-active-events-content">
                        ${activeEvents
                            .map((event) => {
                                const startTime = formatTime(event.start);
                                const endTime = formatTime(event.end);

                                // Map class names to our CSS classes
                                let eventClass = "active"; // Special class for active events
                                if (event.class_name.includes("success")) {
                                    eventClass += " online-offline";
                                } else if (event.class_name.includes("info")) {
                                    eventClass += " meeting";
                                } else if (
                                    event.class_name.includes("warning")
                                ) {
                                    eventClass += " deadline";
                                } else if (
                                    event.class_name.includes("danger")
                                ) {
                                    eventClass += " important";
                                } else {
                                    eventClass += " other";
                                }

                                return `
                                <div class="small-event-item ${eventClass}" 
                                     data-event-id="${event.id}"
                                     data-event-name="${event.name}"
                                     data-event-title="${event.title}"
                                     data-event-start="${event.start}"
                                     data-event-end="${event.end}"
                                     onclick="showEventDetail(this)">
                                    <div class="small-event-item-title">${event.title} (Ongoing)</div>
                                    <div class="small-event-item-time">${startTime} - ${endTime}</div>
                                </div>
                            `;
                            })
                            .join("")}
                    </div>
                </div>
            `;
        }

        // Add regular events for the selected date
        if (events.length === 0 && activeEvents.length === 0) {
            // Only show "no events" if there are no regular events AND no active events for this date
            eventsHTML +=
                '<div class="no-events-small">No events scheduled for this date.</div>';
        } else {
            if (activeEvents.length > 0 && events.length > 0) {
                // Only show this header if there are both active events and regular events
                eventsHTML += `
                    <div class="small-date-events-section">
                        <div class="small-date-events-header">
                            <h6>Events for ${formatDateForDisplay(
                                selectedDate
                            )}</h6>
                        </div>
                    </div>
                `;
            }

            // Add regular events
            eventsHTML += events
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
                    <div class="small-event-item ${eventClass}"
                         data-event-id="${event.id}"
                         data-event-name="${event.name}"
                         data-event-title="${event.title}"
                         data-event-start="${event.start}"
                         data-event-end="${event.end}"
                         onclick="showEventDetail(this)">
                        <div class="small-event-item-title">${event.title}</div>
                        <div class="small-event-item-time">${startTime} - ${endTime}</div>
                    </div>
                `;
                })
                .join("");
        }

        contentElement.innerHTML = eventsHTML;
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
    const filterDropdown = document.getElementById("smallFilterDropdown");

    if (isShowingAllEventsSmall) {
        // Switch back to single day view
        isShowingAllEventsSmall = false;
        button.textContent = "All Events";

        // Hide filter dropdown
        if (filterDropdown) {
            filterDropdown.style.display = "none";
        }

        // Reset filter
        currentSmallFilter = null;

        // Show events for the currently selected date
        if (smallSelectedDate) {
            updateSmallEventDisplay(smallSelectedDate);
        }
    } else {
        // Switch to all events view
        isShowingAllEventsSmall = true;
        button.textContent = "Day";

        // Show and populate filter dropdown
        if (filterDropdown) {
            filterDropdown.style.display = "block";
            populateFilterDropdown("smallFilterDropdownMenu", true);
        }

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
    let upcomingEvents = eventData.filter((event) => {
        const eventDate = event.start.split(" ")[0];
        return eventDate >= todayString;
    });

    // Apply category filter if selected
    if (currentSmallFilter) {
        upcomingEvents = upcomingEvents.filter(
            (event) => event.name === currentSmallFilter
        );
    }

    // Sort events by date and time
    upcomingEvents.sort((a, b) => new Date(a.start) - new Date(b.start));

    let activeEvents = getActiveEvents();

    // Apply category filter to active events if selected
    if (currentSmallFilter) {
        activeEvents = activeEvents.filter(
            (event) => event.name === currentSmallFilter
        );
    }

    const titleElement = document.getElementById("smallEventsTitle");
    const contentElement = document.getElementById("smallEventsContent");

    // Update the title
    if (titleElement) {
        let titleText = "All Upcoming Events";
        if (currentSmallFilter) {
            titleText = `${getCategoryDisplayName(currentSmallFilter)} Events`;
        }
        titleElement.textContent = titleText;
    }

    // Update the content
    if (contentElement) {
        let allEventsHTML = "";

        // Add active events section if there are any
        if (activeEvents.length > 0) {
            allEventsHTML += `
                <div class="small-all-events-date-group">
                    <div class="small-all-events-date-header">
                        <h6>Currently Active Events</h6>
                    </div>
                    <div class="small-all-events-date-content">
                        ${activeEvents
                            .map((event) => {
                                const startTime = formatTime(event.start);
                                const endTime = formatTime(event.end);

                                // Map class names to our CSS classes
                                let eventClass = "active"; // Special class for active events
                                if (event.class_name.includes("success")) {
                                    eventClass += " online-offline";
                                } else if (event.class_name.includes("info")) {
                                    eventClass += " meeting";
                                } else if (
                                    event.class_name.includes("warning")
                                ) {
                                    eventClass += " deadline";
                                } else if (
                                    event.class_name.includes("danger")
                                ) {
                                    eventClass += " important";
                                } else {
                                    eventClass += " other";
                                }

                                return `
                                <div class="small-event-item ${eventClass}"
                                     data-event-id="${event.id}"
                                     data-event-name="${event.name}"
                                     data-event-title="${event.title}"
                                     data-event-start="${event.start}"
                                     data-event-end="${event.end}"
                                     onclick="showEventDetail(this)">
                                    <div class="small-event-item-title">${event.title} (Ongoing)</div>
                                    <div class="small-event-item-time">${startTime} - ${endTime}</div>
                                </div>
                            `;
                            })
                            .join("")}
                    </div>
                </div>
            `;
        }

        if (upcomingEvents.length === 0) {
            if (activeEvents.length === 0) {
                let noEventsText = "No upcoming events scheduled.";
                if (currentSmallFilter) {
                    noEventsText = `No upcoming ${getCategoryDisplayName(
                        currentSmallFilter
                    ).toLowerCase()} events scheduled.`;
                }
                allEventsHTML += `<div class="no-events-small">${noEventsText}</div>`;
            }
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
                                    <div class="small-event-item ${eventClass}"
                                         data-event-id="${event.id}"
                                         data-event-name="${event.name}"
                                         data-event-title="${event.title}"
                                         data-event-start="${event.start}"
                                         data-event-end="${event.end}"
                                         onclick="showEventDetail(this)">
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
        }

        contentElement.innerHTML = allEventsHTML;
    }
}

// Helper function to get events for a specific date
function getEventsForDate(dateString) {
    return eventData.filter((event) => {
        const eventDate = event.start.split(" ")[0]; // Get date part from datetime
        return eventDate === dateString;
    });
}

// Helper function to get active events
function getActiveEvents() {
    return activeEventData || [];
}

// Helper function to get active events for a specific date
function getActiveEventsForDate(dateString) {
    return activeEventData.filter((event) => {
        const eventStartDate = event.start.split(" ")[0]; // Get date part from datetime
        const eventEndDate = event.end.split(" ")[0]; // Get date part from datetime

        // Check if the selected date falls within the event's date range
        return dateString >= eventStartDate && dateString <= eventEndDate;
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
    return date.toLocaleDateString("en-GB", options);
}

// Helper function to format time
function formatTime(timeString) {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-GB", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

// Helper function to get unique event categories
function getUniqueEventCategories() {
    const categories = new Set();
    eventData.forEach((event) => {
        if (event.name) {
            categories.add(event.name);
        }
    });
    activeEventData.forEach((event) => {
        if (event.name) {
            categories.add(event.name);
        }
    });
    return Array.from(categories).sort();
}

// Helper function to get category display name
function getCategoryDisplayName(categoryName) {
    const displayNames = {
        sosmas: "Sosmas",
        kelembagaan: "Kelembagaan",
        pendidikan: "Pendidikan",
        danus: "Danus",
        segaya: "Segaya",
        ksa: "KSA",
        keagamaan: "Keagamaan",
        pusdatin: "Pusdatin",
        kominfo: "Kominfo",
        penkastrat: "Penkastrat",
        huvoks: "Huvoks",
    };
    return (
        displayNames[categoryName] ||
        categoryName.charAt(0).toUpperCase() + categoryName.slice(1)
    );
}

// Function to populate filter dropdown
function populateFilterDropdown(dropdownMenuId, isSmall = false) {
    const dropdownMenu = document.getElementById(dropdownMenuId);
    if (!dropdownMenu) return;

    const categories = getUniqueEventCategories();
    let menuHTML = "";

    // Add "All Categories" option
    menuHTML += `
        <li><a class="dropdown-item filter-item" href="#" data-filter="" data-is-small="${isSmall}">
            <div class="filter-category-item">
                <span>All Categories</span>
            </div>
        </a></li>
    `;

    if (categories.length > 0) {
        menuHTML += '<li><hr class="dropdown-divider"></li>';

        // Add category options
        categories.forEach((category) => {
            menuHTML += `
                <li><a class="dropdown-item filter-item" href="#" data-filter="${category}" data-is-small="${isSmall}">
                    <div class="filter-category-item">
                        <span class="filter-category-badge ${category}"></span>
                        <span>${getCategoryDisplayName(category)}</span>
                    </div>
                </a></li>
            `;
        });
    }

    dropdownMenu.innerHTML = menuHTML;

    // Add event listeners to filter items
    dropdownMenu.querySelectorAll(".filter-item").forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const filter = e.currentTarget.dataset.filter || null;
            const isSmallScreen = e.currentTarget.dataset.isSmall === "true";

            if (isSmallScreen) {
                applySmallFilter(filter);
            } else {
                applyBigFilter(filter);
            }
        });
    });
}

// Function to apply filter for small screen
function applySmallFilter(filter) {
    currentSmallFilter = filter;

    // Update dropdown button text
    const dropdownBtn = document.getElementById("smallFilterDropdownBtn");
    if (dropdownBtn) {
        if (filter) {
            dropdownBtn.textContent = getCategoryDisplayName(filter);
        } else {
            dropdownBtn.textContent = "All";
        }
    }

    // Re-render the events with filter applied
    showSmallAllEventsFromToday();
}

// Function to apply filter for big screen
function applyBigFilter(filter) {
    currentBigFilter = filter;

    // Update dropdown button text
    const dropdownBtn = document.getElementById("bigFilterDropdownBtn");
    if (dropdownBtn) {
        if (filter) {
            dropdownBtn.textContent = getCategoryDisplayName(filter);
        } else {
            dropdownBtn.textContent = "All";
        }
    }

    // Re-render the events with filter applied
    showAllEventsFromToday();
}

// Function to update the event display (for big screen)
function updateEventDisplay(selectedDate) {
    currentSelectedDate = selectedDate;
    const events = getEventsForDate(selectedDate);
    const activeEvents = getActiveEventsForDate(selectedDate); // Use date-specific active events
    const titleElement = document.querySelector(".big-screen-title");
    const contentElement = document.querySelector(".big-screen-event-content");

    // Update the title
    if (titleElement) {
        titleElement.textContent = formatDateForDisplay(selectedDate);
    }

    // Update the content
    if (contentElement) {
        let eventsHTML = "";

        // Add active events section if there are any for this date
        if (activeEvents.length > 0) {
            eventsHTML += `
                <div class="active-events-section">
                    <div class="active-events-header">
                        <h6>Currently Active Events</h6>
                    </div>
                    <div class="active-events-content">
                        ${activeEvents
                            .map((event) => {
                                const startTime = formatTime(event.start);
                                const endTime = formatTime(event.end);

                                // Map class names to our CSS classes
                                let eventClass = "active"; // Special class for active events
                                if (event.class_name.includes("success")) {
                                    eventClass += " online-offline";
                                } else if (event.class_name.includes("info")) {
                                    eventClass += " meeting";
                                } else if (
                                    event.class_name.includes("warning")
                                ) {
                                    eventClass += " deadline";
                                } else if (
                                    event.class_name.includes("danger")
                                ) {
                                    eventClass += " important";
                                } else {
                                    eventClass += " other";
                                }

                                return `
                                <div class="big-screen-event-item ${eventClass}"
                                     data-event-id="${event.id}"
                                     data-event-name="${event.name}"
                                     data-event-title="${event.title}"
                                     data-event-start="${event.start}"
                                     data-event-end="${event.end}"
                                     onclick="showEventDetail(this)">
                                    <div class="big-screen-event-item-title">
                                        <span>${event.title} (Ongoing)</span>
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
        }

        // Add regular events for the selected date
        if (events.length === 0 && activeEvents.length === 0) {
            // Only show "no events" if there are no regular events AND no active events for this date
            eventsHTML +=
                '<div class="no-events">No events scheduled for this date.</div>';
        } else {
            if (activeEvents.length > 0 && events.length > 0) {
                // Only show this header if there are both active events and regular events
                eventsHTML += `
                    <div class="date-events-section">
                        <div class="date-events-header">
                            <h6>Events for ${formatDateForDisplay(
                                selectedDate
                            )}</h6>
                        </div>
                    </div>
                `;
            }

            // Add regular events
            eventsHTML += events
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
                    <div class="big-screen-event-item ${eventClass}"
                         data-event-id="${event.id}"
                         data-event-name="${event.name}"
                         data-event-title="${event.title}"
                         data-event-start="${event.start}"
                         data-event-end="${event.end}"
                         onclick="showEventDetail(this)">
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

        contentElement.innerHTML = eventsHTML;
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
    const filterDropdown = document.getElementById("bigFilterDropdown");

    if (isShowingAllEvents) {
        // Switch back to single day view
        isShowingAllEvents = false;
        button.textContent = "All Events";

        // Hide filter dropdown
        if (filterDropdown) {
            filterDropdown.style.display = "none";
        }

        // Reset filter
        currentBigFilter = null;

        // Show events for the currently selected date
        if (currentSelectedDate) {
            updateEventDisplay(currentSelectedDate);
        }
    } else {
        // Switch to all events view
        isShowingAllEvents = true;
        button.textContent = "Day";

        // Show and populate filter dropdown
        if (filterDropdown) {
            filterDropdown.style.display = "block";
            populateFilterDropdown("bigFilterDropdownMenu", false);
        }

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
    let upcomingEvents = eventData.filter((event) => {
        const eventDate = event.start.split(" ")[0];
        return eventDate >= todayString;
    });

    // Apply category filter if selected
    if (currentBigFilter) {
        upcomingEvents = upcomingEvents.filter(
            (event) => event.name === currentBigFilter
        );
    }

    // Sort events by date and time
    upcomingEvents.sort((a, b) => new Date(a.start) - new Date(b.start));

    let activeEvents = getActiveEvents();

    // Apply category filter to active events if selected
    if (currentBigFilter) {
        activeEvents = activeEvents.filter(
            (event) => event.name === currentBigFilter
        );
    }

    const titleElement = document.querySelector(".big-screen-title");
    const contentElement = document.querySelector(".big-screen-event-content");

    // Update the title
    if (titleElement) {
        let titleText = "All Upcoming Events";
        if (currentBigFilter) {
            titleText = `${getCategoryDisplayName(currentBigFilter)} Events`;
        }
        titleElement.textContent = titleText;
    }

    // Update the content
    if (contentElement) {
        let allEventsHTML = "";

        // Add active events section if there are any
        if (activeEvents.length > 0) {
            allEventsHTML += `
                <div class="all-events-date-group">
                    <div class="all-events-date-header">
                        <h6>Currently Active Events</h6>
                    </div>
                    <div class="all-events-date-content">
                        ${activeEvents
                            .map((event) => {
                                const startTime = formatTime(event.start);
                                const endTime = formatTime(event.end);

                                // Map class names to our CSS classes
                                let eventClass = "active"; // Special class for active events
                                if (event.class_name.includes("success")) {
                                    eventClass += " online-offline";
                                } else if (event.class_name.includes("info")) {
                                    eventClass += " meeting";
                                } else if (
                                    event.class_name.includes("warning")
                                ) {
                                    eventClass += " deadline";
                                } else if (
                                    event.class_name.includes("danger")
                                ) {
                                    eventClass += " important";
                                } else {
                                    eventClass += " other";
                                }

                                return `
                                <div class="big-screen-event-item ${eventClass}"
                                     data-event-id="${event.id}"
                                     data-event-name="${event.name}"
                                     data-event-title="${event.title}"
                                     data-event-start="${event.start}"
                                     data-event-end="${event.end}"
                                     onclick="showEventDetail(this)">
                                    <div class="big-screen-event-item-title">
                                        <span>${event.title} (Ongoing)</span>
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
        }

        if (upcomingEvents.length === 0) {
            if (activeEvents.length === 0) {
                let noEventsText = "No upcoming events scheduled.";
                if (currentBigFilter) {
                    noEventsText = `No upcoming ${getCategoryDisplayName(
                        currentBigFilter
                    ).toLowerCase()} events scheduled.`;
                }
                allEventsHTML += `<div class="no-events">${noEventsText}</div>`;
            }
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
                                    <div class="big-screen-event-item ${eventClass}"
                                         data-event-id="${event.id}"
                                         data-event-name="${event.name}"
                                         data-event-title="${event.title}"
                                         data-event-start="${event.start}"
                                         data-event-end="${event.end}"
                                         onclick="showEventDetail(this)">
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
        }

        contentElement.innerHTML = allEventsHTML;
    }
}

// New function to show event detail modal
function showEventDetail(eventElement) {
    const eventId = eventElement.dataset.eventId;
    const eventName = eventElement.dataset.eventName;
    const eventTitle = eventElement.dataset.eventTitle;
    const eventStart = eventElement.dataset.eventStart;
    const eventEnd = eventElement.dataset.eventEnd;

    // Calculate duration
    const startDate = new Date(eventStart);
    const endDate = new Date(eventEnd);
    const durationMs = endDate - startDate;
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor(
        (durationMs % (1000 * 60 * 60)) / (1000 * 60)
    );

    let durationText = "";
    if (durationHours > 0) {
        durationText = `${durationHours}h ${durationMinutes}m`;
    } else {
        durationText = `${durationMinutes}m`;
    }

    // Check if it's a multi-day event
    const startDateStr = eventStart.split(" ")[0];
    const endDateStr = eventEnd.split(" ")[0];
    const isMultiDay = startDateStr !== endDateStr;

    // Update modal content
    const modalCategory = document.getElementById("modalEventCategory");
    const modalTitle = document.getElementById("modalEventTitle");
    const modalTime = document.getElementById("modalEventTime");
    const modalDate = document.getElementById("modalEventDate");
    const modalDuration = document.getElementById("modalEventDuration");

    // Set category with appropriate styling
    modalCategory.textContent = eventName.toUpperCase();
    modalCategory.className = `event-detail-category ${eventName}`;

    // Set title
    modalTitle.textContent = eventTitle;

    // Set time
    if (isMultiDay) {
        modalTime.textContent = `${formatTime(eventStart)} - ${formatTime(
            eventEnd
        )}`;
    } else {
        modalTime.textContent = `${formatTime(eventStart)} - ${formatTime(
            eventEnd
        )}`;
    }

    // Set date
    if (isMultiDay) {
        modalDate.textContent = `${formatDateForDisplay(
            startDateStr
        )} - ${formatDateForDisplay(endDateStr)}`;
    } else {
        modalDate.textContent = formatDateForDisplay(startDateStr);
    }

    // Set duration
    if (isMultiDay) {
        const days = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
        modalDuration.textContent = `${days} day${days > 1 ? "s" : ""}`;
    } else {
        modalDuration.textContent = durationText;
    }

    // Show the modal
    const modal = new bootstrap.Modal(
        document.getElementById("eventDetailModal")
    );
    modal.show();
}

// Hide loading when page loads
window.addEventListener("load", function () {
    setTimeout(hideLoading, 1000);
    //time: 500
});
setTimeout(hideLoading, 5000);
//time:

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
