# Glow & Style - Salon & Spa Booking System

A full-stack online reservation and business management platform designed for luxury salons and spas. Enables customers to register accounts, search services, check stylist rosters, schedule bookings, and complete checkouts. Offers administrators a central control center to manage operations (CRUD on clients, services, stylists, bookings, and payments) and view business statistics.

---

## 🚀 Technology Stack

### Frontend:
- **Structure**: HTML5 Semantic markup.
- **Design System**: CSS3 styling featuring light/dark luxury glassmorphism, tailored Outfit & Playfair Display typography, HSL gradient buttons, and responsive grid layouts.
- **APIs Integration**: JavaScript (ES6) with async/await Fetch API requests.

### Backend:
- **Framework**: Django REST API.
- **Views Architecture**: Django Function-Based Views (FBVs).
- **Database**: PyMongo (MongoDB Atlas Sandbox Cluster).
- **Environment**: python-dotenv secure credential injection.

---

## 📂 Project Structure

```
Full Stack Salon & Spa Booking System/
│
├── Backend/
│   ├── db.py               # MongoDB Atlas PyMongo client wrapper
│   ├── views.py            # 20+ REST API Function-Based Views
│   ├── urls.py             # URL API Routing mapping
│   ├── settings.py         # App settings (CORS, load_dotenv, config)
│   ├── wsgi.py             # WSGI configuration
│   └── asgi.py             # ASGI configuration
│
├── Frontend/
│   ├── index.html          # Salon Homepage (Featured cards, Hero CTA)
│   ├── login.html          # Sign In form
│   ├── register.html       # Customer sign up form
│   ├── services.html       # Dynamic catalog with Search & Category filters (Bonus)
│   ├── stylists.html       # Roster with Weekly Calendar grid & Ratings/Reviews (Bonus)
│   ├── booking.html        # Interactive scheduler form & live summary card
│   ├── payment.html        # UPI, Card, Cash billing checkout screen
│   ├── customer_dashboard.html # Client appointments history & cancellation panel
│   ├── admin_dashboard.html    # Administrative analytics & CRUD tables
│   ├── style.css           # Global luxury CSS stylesheet
│   └── script.js           # Fetch API logic, triggers, and UI controllers
│
├── .env                    # Secret environment credentials
├── requirements.txt        # Backend dependencies
└── README.md               # Setup and usage documentation
```

---

## 🛠️ Local Installation & Launch

Follow these steps to run both the Django backend server and the static frontend locally.

### Prerequisites:
- Python 3.10 or higher.
- Internet connection (to query the remote MongoDB Atlas sandbox cluster).

### Step 1: Clone and setup virtual environment
```bash
# Clone the repository and open the workspace folder:
cd "Full Stack Salon & Spa Booking System"

# Initialize Python Virtual Environment:
python -m venv .venv

# Activate the Virtual Environment:
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On macOS/Linux:
source .venv/bin/activate
```

### Step 2: Install dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Run the Django Backend Server
```bash
# Start backend on default port 8000:
python manage.py runserver 127.0.0.1:8000
```
*Note: The backend will automatically ping the MongoDB Atlas Cluster and output: `MongoDB connection established successfully.`*

### Step 4: Run the Frontend Server
Serve the `Frontend` directory on a local HTTP port (e.g. port 3001) using Python's built-in web server:
```bash
python -m http.server 3001 --directory Frontend
```

Now, open your browser and navigate to: **[http://localhost:3001/index.html](http://localhost:3001/index.html)**.

---

## 🔑 Default Credentials for Verification

- **Customer Login**:
  - Email: `rahul@gmail.com`
  - Password: `rahul123`
- **Admin Login**:
  - Email: `admin@salon.com`
  - Password: `admin123`

---

## 🌐 API Reference (20 REST Endpoints)

| Module | Method | Endpoint | Action |
| :--- | :--- | :--- | :--- |
| **Customer** | POST | `/customers/add/` | Register new customer profile (Auto-Increments ID from 101) |
| | GET | `/customers/` | List all customer profiles |
| | PUT | `/customers/update/<id>/` | Update specific customer info by Custom ID or ObjectId |
| | DELETE | `/customers/delete/<id>/` | Delete customer profile |
| | POST | `/customers/login/` | Custom authentication validation login checks |
| **Service** | POST | `/services/add/` | Add new salon service (Auto-Increments ID from 201) |
| | GET | `/services/` | List all services |
| | PUT | `/services/update/<id>/` | Edit service details |
| | DELETE | `/services/delete/<id>/` | Remove service |
| **Stylist** | POST | `/stylists/add/` | Create stylist roster profile (Auto-Increments ID from 301) |
| | GET | `/stylists/` | List all stylists |
| | PUT | `/stylists/update/<id>/` | Edit stylist specialization or availability status |
| | DELETE | `/stylists/delete/<id>/` | Delete stylist profile |
| **Appointment**| POST | `/appointments/add/` | Schedule booking session (Auto-Increments ID from 401) |
| | GET | `/appointments/` | List all appointments |
| | PUT | `/appointments/update/<id>/` | Update appointment details (e.g. status: Booked, Completed, Cancelled) |
| | DELETE | `/appointments/delete/<id>/` | Delete booking record |
| **Payment** | POST | `/payments/add/` | Add transaction record (Auto-Increments ID from 501) |
| | GET | `/payments/` | List all transactions |
| | PUT | `/payments/update/<id>/` | Update payment details (e.g. status: Paid, Pending, Failed) |
| | DELETE | `/payments/delete/<id>/` | Delete payment record |

---

## 🌟 Included Bonus Features

1. **Service Search & Category Filter**: Services can be searched by typing in a search input and dynamically filtered using category tags in real time without refreshing.
2. **Stylist Availability Calendar**: The stylists roster lists a weekly availability cell chart representing the current stylist schedules.
3. **Appointment Reminder System**: The customer dashboard checks and issues in-app banner toast notification reminders for upcoming booked appointments.
4. **Customer Reviews & Ratings**: Customers can click rating badges on the stylists roster to display a details review popup modal showing real client testimonials.
5. **Responsive Mobile Design**: Full media queries layouts support mobile viewports, tablet containers, and widescreen monitors.
