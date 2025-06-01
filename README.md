# 📅 PPI Malaysia Calendar

> A modern, responsive calendar application for PPI Malaysia events and activities

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](package.json)
[![Responsive](https://img.shields.io/badge/responsive-yes-brightgreen.svg)](README.md)
[![JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow.svg)](README.md)

## Overview

PPI Malaysia Calendar is a web application designed to showcase events and activities for Perhimpunan Pelajar Indonesia (PPI) Malaysia. The application features an infinite scrolling calendar interface with advanced filtering capabilities and detailed event management.

## 🌐 Live Demo

**[Visit Live Website](https://calendar.ppimalaysia.id)**

### ✨ Key Features

-   **Responsive Design** - Optimized for both desktop and mobile devices
-   **Infinite Calendar** - Smooth infinite scrolling calendar view
-   **Event Categories** - Color-coded events by department/category
-   **Advanced Filtering** - Filter events by category or view all upcoming events
-   **Active Events** - Real-time display of currently ongoing events
-   **Event Details** - Comprehensive modal with event information
-   **Fast Loading** - Optimized performance with smooth animations

## 🛠️ Technologies Used

-   **Frontend:**

    -   HTML5
    -   CSS3 (Custom styling with CSS Grid & Flexbox)
    -   JavaScript (ES6+)
    -   Bootstrap 5.3.6

-   **Fonts:**

    -   Google Fonts (Work Sans)

-   **API Integration:**
    -   RESTful API consumption
    -   JSON data handling

## 🚀 Getting Started

### Prerequisites

-   Modern web browser (Chrome, Firefox, Safari, Edge)
-   Web server (for local development)

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/ppi-malaysia-calendar.git
    cd ppi-malaysia-calendar
    ```

2. **Set up a local server**

    ```bash
    # Using Python
    python -m http.server 8000

    # Using Web Browser
    open the index.html file
    ```

3. **Open in browser**
    ```
    http://localhost:8000
    ```

## 📱 Responsive Breakpoints

-   **Desktop:** ≥ 992px - Full infinite calendar with sidebar
-   **Mobile:** < 992px - Compact calendar with stacked events

## Event Categories

The calendar supports various event categories with distinct color coding:

| Category        | Color      | Description                   |
| --------------- | ---------- | ----------------------------- |
| **Sosmas**      | Blue       | Social and Community Events   |
| **Kelembagaan** | Light Blue | Institutional Affairs         |
| **Pendidikan**  | Green      | Educational Programs          |
| **Danus**       | Orange     | Fundraising Activities        |
| **Segaya**      | Pink       | Sports and Recreation         |
| **KSA**         | Purple     | Student Affairs               |
| **Keagamaan**   | Red        | Religious Activities          |
| **Pusdatin**    | Gray       | Data and Information Center   |
| **Kominfo**     | Purple     | Communication and Information |
| **Penkastrat**  | Cyan       | Strategic Planning            |
| **Huvoks**      | Emerald    | Public Relations              |

## 🔧 Configuration

### API Endpoint

The application fetches data from:

```javascript
const API_URL =
    "https://portal.ppimalaysia.id/assets/php/API/frontend-calendar.php";
```

### Expected API Response Format

```json
{
    "success": true,
    "data": {
        "event_dates": ["2025-06-01", "2025-06-02"],
        "events": [
            {
                "id": "1",
                "name": "sosmas",
                "title": "Community Meeting",
                "start": "2025-06-01 14:00:00",
                "end": "2025-06-01 16:00:00",
                "class_name": "event-success"
            }
        ],
        "active_events": [
            {
                "id": "2",
                "name": "pendidikan",
                "title": "Workshop Series",
                "start": "2025-06-01 09:00:00",
                "end": "2025-06-03 17:00:00",
                "class_name": "event-info"
            }
        ]
    }
}
```

## 📂 Project Structure

```
ppi-malaysia-calendar/
├── index.html              # Main HTML file
├── style.css               # Main stylesheet
├── script.js               # Main JavaScript logic
├── infinite-calendar.js    # Infinite calendar component
├── media/
│   ├── logo.png            # PPI Malaysia logo
│   └── favicon.ico         # Website favicon
└── README.md              # Project documentation
```

## Usage

### Desktop View

-   Navigate through months using infinite scroll
-   Click on any date to view events
-   Use "All Events" button to see upcoming events
-   Filter events by category using the dropdown

### Mobile View

-   Navigate months using arrow buttons
-   Tap dates to view events
-   Toggle between day view and all events view
-   Apply category filters in all events mode

### Event Interaction

-   Click on any event to view detailed information
-   Modal displays event duration, time, and category
-   Events are color-coded by category

## Event States

-   **📅 Regular Events** - Standard scheduled events
-   **🔴 Active Events** - Currently ongoing events (highlighted)
-   **📍 Today** - Current date highlighting
-   **🎯 Selected** - User-selected date

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

-   Follow existing code style and conventions
-   Test on both desktop and mobile devices
-   Ensure responsive design principles
-   Add comments for complex logic
-   Update documentation for new features

## Browser Support

| Browser | Version |
| ------- | ------- |
| Chrome  | 70+     |
| Firefox | 65+     |
| Safari  | 12+     |
| Edge    | 79+     |

## 🐛 Known Issues

-   Large datasets may affect scroll performance
-   Internet connection required for API data
-   Some older mobile browsers may have styling issues

## 📈 Future Enhancements

-   [ ] Offline mode support
-   [ ] Event creation interface
-   [ ] Calendar export functionality
-   [ ] Push notifications
-   [ ] Multi-language support
-   [ ] Dark mode theme
-   [ ] Event search functionality

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 About PPI Malaysia

Perhimpunan Pelajar Indonesia (PPI) Malaysia is an organization that unites Indonesian students studying in Malaysia. This calendar application helps coordinate events, activities, and important dates for the Indonesian student community.

## 📞 Contact

-   **Website:** [PPI Malaysia](https://ppimalaysia.id)
-   **Project Issues:** [GitHub Issues](https://github.com/yourusername/ppi-malaysia-calendar/issues)

## 🙏 Acknowledgments

-   PPI Malaysia community for requirements and feedback
-   Bootstrap team for the excellent CSS framework
-   Google Fonts for the beautiful typography
-   All contributors who helped improve this project

---

<div align="center">
  <strong>Made by <a href="https://linkedin.com/in/rafi-daffa/" target="_blank">Rafi Daffa Ramadhani</a> - Pusdatin PPIM 2024-2025</strong>
</div>
