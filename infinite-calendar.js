class InfiniteCalendar {
    constructor() {
        this.container = document.getElementById("infiniteCalendarContainer");
        this.content = document.getElementById("infiniteCalendarContent");
        this.loadingIndicator = document.getElementById(
            "infiniteLoadingIndicator"
        );

        this.currentDate = new Date();
        this.today = new Date();
        this.monthsLoaded = 0;
        this.isLoading = false;
        this.selectedDate = null;

        this.monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];

        this.weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        this.init();
    }

    init() {
        this.loadInitialMonths();
        this.setupScrollListener();
        // Set today as initially selected date and show its events
        const todayString = formatDateToString(
            this.today.getFullYear(),
            this.today.getMonth(),
            this.today.getDate()
        );
        this.selectDate(todayString);
    }

    loadInitialMonths() {
        // Load 1 year of previous months + current month + 2 next months (total: 15)
        const startDate = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth() - 12,
            1
        );

        for (let i = 0; i < 15; i++) {
            const monthDate = new Date(
                startDate.getFullYear(),
                startDate.getMonth() + i,
                1
            );
            this.renderMonth(monthDate);
            this.monthsLoaded++;
        }

        this.loadingIndicator.style.display = "none";

        // Scroll to current month (13th month in the list, index 12)
        setTimeout(() => {
            const currentMonthElement = this.content.children[12];
            if (currentMonthElement) {
                currentMonthElement.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        }, 100);
    }

    renderMonth(date) {
        const monthSection = document.createElement("div");
        monthSection.className = "infinite-month-section";
        monthSection.dataset.year = date.getFullYear();
        monthSection.dataset.month = date.getMonth();

        const isCurrentMonth =
            date.getFullYear() === this.today.getFullYear() &&
            date.getMonth() === this.today.getMonth();

        monthSection.innerHTML = `
            <div class="infinite-month-header">
                <div class="infinite-month-title">${
                    this.monthNames[date.getMonth()]
                } ${date.getFullYear()}</div>
            </div>
            <div class="infinite-weekdays">
                ${this.weekdays
                    .map((day) => `<div class="infinite-weekday">${day}</div>`)
                    .join("")}
            </div>
            <div class="infinite-days-grid">
                ${this.generateDaysForMonth(date)}
            </div>
        `;

        this.content.appendChild(monthSection);
    }

    generateDaysForMonth(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        let startDay = firstDay.getDay();
        startDay = startDay === 0 ? 6 : startDay - 1;

        let daysHTML = "";

        // Previous month's trailing days
        const prevMonth = new Date(year, month - 1, 0);
        for (let i = startDay - 1; i >= 0; i--) {
            const day = prevMonth.getDate() - i;
            const prevYear = month === 0 ? year - 1 : year;
            const prevMonthIndex = month === 0 ? 11 : month - 1;
            const dateString = formatDateToString(
                prevYear,
                prevMonthIndex,
                day
            );

            daysHTML += `<div class="infinite-day infinite-other-month" data-date="${dateString}">${day}</div>`;
        }

        // Current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const isToday = this.isSameDay(currentDate, this.today);
            const dateString = formatDateToString(year, month, day);
            const hasEvent = hasEventsOnDate(dateString);

            let classes = "infinite-day";
            if (isToday) classes += " infinite-today";
            if (hasEvent) classes += " infinite-has-event";

            daysHTML += `<div class="${classes}" data-date="${dateString}">${day}</div>`;
        }

        // Next month's leading days
        const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
        const remainingCells = totalCells - startDay - daysInMonth;
        for (let day = 1; day <= remainingCells; day++) {
            const nextYear = month === 11 ? year + 1 : year;
            const nextMonthIndex = month === 11 ? 0 : month + 1;
            const dateString = formatDateToString(
                nextYear,
                nextMonthIndex,
                day
            );

            daysHTML += `<div class="infinite-day infinite-other-month" data-date="${dateString}">${day}</div>`;
        }

        return daysHTML;
    }

    isSameDay(date1, date2) {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    }

    selectDate(dateString) {
        // If we're showing all events, switch back to single day view
        if (isShowingAllEvents) {
            const button = document.getElementById("bigAllEventsBtn");
            isShowingAllEvents = false;
            button.textContent = "All Events";
        }

        // Remove previous selection
        const prevSelected = this.content.querySelector(
            ".infinite-day.infinite-selected"
        );
        if (prevSelected) {
            prevSelected.classList.remove("infinite-selected");
        }

        // Add selection to new date
        const newSelected = this.content.querySelector(
            `[data-date="${dateString}"]`
        );
        if (
            newSelected &&
            !newSelected.classList.contains("infinite-other-month")
        ) {
            newSelected.classList.add("infinite-selected");
        }

        this.selectedDate = dateString;

        // Update the event display
        updateEventDisplay(dateString);
    }

    setupScrollListener() {
        let scrollTimeout;

        this.container.addEventListener("scroll", () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.handleScroll();
            }, 100);
        });

        // Handle day clicks
        this.content.addEventListener("click", (e) => {
            if (e.target.classList.contains("infinite-day")) {
                const clickedDate = e.target.dataset.date;
                if (clickedDate) {
                    this.selectDate(clickedDate);
                }
            }
        });
    }

    handleScroll() {
        const scrollTop = this.container.scrollTop;
        const scrollHeight = this.container.scrollHeight;
        const clientHeight = this.container.clientHeight;

        // Only load more months when near bottom (future months)
        if (scrollHeight - scrollTop - clientHeight < 500 && !this.isLoading) {
            this.loadMoreMonths("future");
        }

        // No more loading for past months since we already loaded 1 year
    }

    loadMoreMonths(direction) {
        if (this.isLoading) return;

        this.isLoading = true;
        this.loadingIndicator.style.display = "block";

        setTimeout(() => {
            const monthsToLoad = 6;

            if (direction === "future") {
                // Add months to the end
                const lastMonth = this.content.lastElementChild;
                const lastYear = parseInt(lastMonth.dataset.year);
                const lastMonthIndex = parseInt(lastMonth.dataset.month);

                for (let i = 1; i <= monthsToLoad; i++) {
                    const newDate = new Date(lastYear, lastMonthIndex + i, 1);
                    this.renderMonth(newDate);
                }
            }
            // Removed 'past' direction since we pre-load 1 year

            this.monthsLoaded += monthsToLoad;
            this.isLoading = false;
            this.loadingIndicator.style.display = "none";
        }, 500); // Simulate loading delay
    }
}
