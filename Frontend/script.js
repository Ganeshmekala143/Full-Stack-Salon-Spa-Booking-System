// =====================================================================
// Salon & Spa Booking System - Frontend Logic & Backend Fetch API
// =====================================================================

const API_BASE = "http://127.0.0.1:8000";

// Toast Notifications helper
function showToast(message, type = "info") {
    let host = document.getElementById("notification-host");
    if (!host) {
        host = document.createElement("div");
        host.id = "notification-host";
        document.body.appendChild(host);
    }
    
    const toast = document.createElement("div");
    toast.className = `notification-toast ${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <span style="cursor:pointer;" onclick="this.parentElement.remove()">&times;</span>
    `;
    host.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// Session Helpers
const Auth = {
    getUser: () => {
        const user = localStorage.getItem("salon_user");
        return user ? JSON.parse(user) : null;
    },
    setUser: (userData) => {
        localStorage.setItem("salon_user", JSON.stringify(userData));
    },
    logout: () => {
        localStorage.removeItem("salon_user");
        showToast("Logged out successfully", "success");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);
    },
    isAdmin: () => {
        const user = Auth.getUser();
        return user && user.email === "admin@salon.com";
    }
};

// Auto-run on Page Load: Update Navigation bar
document.addEventListener("DOMContentLoaded", () => {
    updateNavbar();
    initCurrentPage();
});

function updateNavbar() {
    const userBadgeContainer = document.getElementById("nav-auth-container");
    if (!userBadgeContainer) return;
    
    const user = Auth.getUser();
    if (user) {
        // Logged in
        const isAdm = Auth.isAdmin();
        userBadgeContainer.innerHTML = `
            <div class="user-profile-badge" id="profile-badge-btn">
                <i class="bi bi-person-circle"></i>
                <span>Hello, ${user.full_name.split(' ')[0]}</span>
                <i class="bi bi-chevron-down"></i>
            </div>
            <div id="profile-dropdown" class="glass-card" style="display:none; position:absolute; right:20px; top:65px; z-index:1000; width:200px; padding:1rem; border-radius:10px;">
                <p style="font-weight:600; margin-bottom:0.5rem; font-size:0.9rem;">${user.full_name}</p>
                <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:1rem;">${user.email}</p>
                <hr style="border:none; border-top:1px solid rgba(255,255,255,0.05); margin-bottom:0.8rem;">
                <a href="${isAdm ? 'admin_dashboard.html' : 'customer_dashboard.html'}" style="display:block; margin-bottom:0.8rem; font-size:0.9rem; color:var(--primary);"><i class="bi bi-speedometer2"></i> Dashboard</a>
                <a href="#" id="logout-link" style="display:block; font-size:0.9rem; color:var(--danger);"><i class="bi bi-box-arrow-right"></i> Logout</a>
            </div>
        `;
        
        const badgeBtn = document.getElementById("profile-badge-btn");
        const dropdown = document.getElementById("profile-dropdown");
        badgeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
        });
        
        document.addEventListener("click", () => {
            dropdown.style.display = "none";
        });
        
        document.getElementById("logout-link").addEventListener("click", (e) => {
            e.preventDefault();
            Auth.logout();
        });
    } else {
        // Not logged in
        userBadgeContainer.innerHTML = `
            <button class="btn-nav-auth" onclick="window.location.href='login.html'">Login / Register</button>
        `;
    }
}

// Route handler for page specific actions
function initCurrentPage() {
    const path = window.location.pathname;
    const pageName = path.substring(path.lastIndexOf('/') + 1);

    if (pageName === "index.html" || pageName === "") {
        initHomePage();
    } else if (pageName === "register.html") {
        initRegisterPage();
    } else if (pageName === "login.html") {
        initLoginPage();
    } else if (pageName === "services.html") {
        initServicesPage();
    } else if (pageName === "stylists.html") {
        initStylistsPage();
    } else if (pageName === "booking.html") {
        initBookingPage();
    } else if (pageName === "payment.html") {
        initPaymentPage();
    } else if (pageName === "customer_dashboard.html") {
        initCustomerDashboard();
    } else if (pageName === "admin_dashboard.html") {
        initAdminDashboard();
    }
}


// =====================================================================
// PAGE LOGIC IMPLEMENTATIONS
// =====================================================================

// 1. HOME PAGE
async function initHomePage() {
    try {
        // Fetch and show 3 services
        const resServ = await fetch(`${API_BASE}/services/`);
        const services = await resServ.json();
        const featGrid = document.getElementById("featured-services-grid");
        
        if (featGrid) {
            featGrid.innerHTML = services.slice(0, 3).map(s => `
                <div class="glass-card service-card">
                    <div class="service-meta">
                        <span class="service-category">${s.category}</span>
                        <span class="service-duration"><i class="bi bi-clock"></i> ${s.duration} mins</span>
                    </div>
                    <h3>${s.service_name}</h3>
                    <p class="service-desc">${s.description || 'Pamper yourself with our high-end luxury session.'}</p>
                    <div class="service-footer">
                        <span class="service-price">₹${s.price}</span>
                        <button class="btn-primary" onclick="bookNow('${s.service_name}')">Book Now</button>
                    </div>
                </div>
            `).join('');
        }
        
        // Fetch and show 3 stylists
        const resSty = await fetch(`${API_BASE}/stylists/`);
        const stylists = await resSty.json();
        const styGrid = document.getElementById("popular-stylists-grid");
        
        if (styGrid) {
            styGrid.innerHTML = stylists.slice(0, 3).map(s => `
                <div class="glass-card stylist-card">
                    <div class="stylist-avatar">${s.stylist_name.charAt(0)}</div>
                    <h3>${s.stylist_name}</h3>
                    <p class="stylist-specialty">${s.specialization}</p>
                    <p class="stylist-experience">${s.experience} Years Experience</p>
                    <span class="stylist-availability status-${s.availability.toLowerCase()}">${s.availability}</span>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error("Error loading home page details", err);
    }
}

// Redirect helpers
function bookNow(serviceName) {
    localStorage.setItem("selected_booking_service", serviceName);
    window.location.href = "booking.html";
}


// 2. REGISTRATION PAGE
function initRegisterPage() {
    const regForm = document.getElementById("register-form");
    if (!regForm) return;
    
    regForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const full_name = document.getElementById("reg-name").value.trim();
        const email = document.getElementById("reg-email").value.trim();
        const phone = document.getElementById("reg-phone").value.trim();
        const gender = document.getElementById("reg-gender").value;
        const password = document.getElementById("reg-password").value;
        const confirm_password = document.getElementById("reg-confirm-password").value;
        
        if (password !== confirm_password) {
            showToast("Passwords do not match!", "error");
            return;
        }
        
        try {
            const res = await fetch(`${API_BASE}/customers/add/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ full_name, email, phone, gender, password })
            });
            
            const data = await res.json();
            if (res.ok) {
                showToast("Registration successful! Redirecting to login...", "success");
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000);
            } else {
                showToast(data.error || "Registration failed", "error");
            }
        } catch (err) {
            showToast("Network error occurred", "error");
        }
    });
}


// 3. LOGIN PAGE
function initLoginPage() {
    const loginForm = document.getElementById("login-form");
    if (!loginForm) return;
    
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;
        
        // Handle admin static login override
        if (email === "admin@salon.com" && password === "admin123") {
            Auth.setUser({
                customer_id: 999,
                full_name: "System Administrator",
                email: "admin@salon.com"
            });
            showToast("Admin access granted. Redirecting dashboard...", "success");
            setTimeout(() => {
                window.location.href = "admin_dashboard.html";
            }, 1000);
            return;
        }
        
        try {
            const res = await fetch(`${API_BASE}/customers/login/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            
            const data = await res.json();
            if (res.ok) {
                Auth.setUser(data);
                showToast("Login successful!", "success");
                setTimeout(() => {
                    window.location.href = "customer_dashboard.html";
                }, 1000);
            } else {
                showToast(data.error || "Invalid credentials", "error");
            }
        } catch (err) {
            showToast("Network error occurred", "error");
        }
    });
}


// 4. SERVICES PAGE (Includes Search & Category Filter - Bonus)
let allServicesData = [];
async function initServicesPage() {
    const servicesGrid = document.getElementById("services-list-grid");
    if (!servicesGrid) return;
    
    try {
        const res = await fetch(`${API_BASE}/services/`);
        allServicesData = await res.json();
        renderServices(allServicesData);
        
        // Setup Search and Categories
        const searchInput = document.getElementById("service-search");
        const categoryTags = document.querySelectorAll(".tag-btn");
        
        const applyFilters = () => {
            const query = searchInput.value.toLowerCase().trim();
            const activeCategory = document.querySelector(".tag-btn.active").dataset.category;
            
            const filtered = allServicesData.filter(s => {
                const matchesSearch = s.service_name.toLowerCase().includes(query) || 
                                      s.description.toLowerCase().includes(query);
                const matchesCategory = activeCategory === "All" || s.category === activeCategory;
                return matchesSearch && matchesCategory;
            });
            renderServices(filtered);
        };
        
        if (searchInput) {
            searchInput.addEventListener("input", applyFilters);
        }
        
        categoryTags.forEach(tag => {
            tag.addEventListener("click", () => {
                categoryTags.forEach(t => t.classList.remove("active"));
                tag.classList.add("active");
                applyFilters();
            });
        });
        
    } catch (err) {
        showToast("Error loading services roster", "error");
    }
}

function renderServices(list) {
    const grid = document.getElementById("services-list-grid");
    if (list.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:3rem; color:var(--text-muted);">No services matching your filters were found.</div>`;
        return;
    }
    
    grid.innerHTML = list.map(s => `
        <div class="glass-card service-card">
            <div class="service-meta">
                <span class="service-category">${s.category}</span>
                <span class="service-duration"><i class="bi bi-clock"></i> ${s.duration} mins</span>
            </div>
            <h3>${s.service_name}</h3>
            <p class="service-desc">${s.description || 'Experience comfort and professional treatment.'}</p>
            <div class="service-footer">
                <span class="service-price">₹${s.price}</span>
                <button class="btn-primary" onclick="bookNow('${s.service_name}')">Book Now</button>
            </div>
        </div>
    `).join('');
}


// 5. STYLISTS PAGE (Includes availability calendar and ratings - Bonus)
async function initStylistsPage() {
    const grid = document.getElementById("stylists-list-grid");
    if (!grid) return;
    
    try {
        const res = await fetch(`${API_BASE}/stylists/`);
        const stylists = await res.json();
        
        grid.innerHTML = stylists.map((s, idx) => {
            // Fake rating and review count based on specialist
            const rating = (4.3 + (idx * 0.17) % 0.7).toFixed(1);
            const reviewsCount = 18 + (idx * 7) % 43;
            
            return `
                <div class="glass-card stylist-card">
                    <div class="stylist-avatar">${s.stylist_name.charAt(0)}</div>
                    <h3>${s.stylist_name}</h3>
                    <p class="stylist-specialty">${s.specialization}</p>
                    <p class="stylist-experience">${s.experience} Years Experience</p>
                    <span class="stylist-availability status-${s.availability.toLowerCase()}">${s.availability}</span>
                    
                    <div class="stylist-rating" onclick="openReviewModal('${s.stylist_name}', ${rating})">
                        <i class="bi bi-star-fill"></i> <span>${rating} (${reviewsCount} Reviews)</span>
                    </div>

                    <!-- Stylist Availability Calendar Block (Bonus) -->
                    <div class="stylist-calendar-container">
                        <p style="font-size:0.75rem; color:var(--text-muted); margin-top:0.8rem; font-weight:600;">WEEKLY CALENDAR</p>
                        <div class="stylist-calendar-grid">
                            <div class="calendar-day-header">M</div>
                            <div class="calendar-day-header">T</div>
                            <div class="calendar-day-header">W</div>
                            <div class="calendar-day-header">T</div>
                            <div class="calendar-day-header">F</div>
                            <div class="calendar-day-header">S</div>
                            <div class="calendar-day-header">S</div>
                            <div class="calendar-day-cell ${s.availability === 'Available' ? 'available' : 'busy'}"></div>
                            <div class="calendar-day-cell available"></div>
                            <div class="calendar-day-cell available"></div>
                            <div class="calendar-day-cell ${s.availability === 'Leave' ? 'busy' : 'available'}"></div>
                            <div class="calendar-day-cell available"></div>
                            <div class="calendar-day-cell available"></div>
                            <div class="calendar-day-cell busy"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        showToast("Error loading stylists roster", "error");
    }
}

// Rating & Reviews Modal trigger
function openReviewModal(stylistName, rating) {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop active";
    backdrop.id = "review-modal-root";
    backdrop.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Reviews for ${stylistName}</h3>
                <button class="modal-close" onclick="document.getElementById('review-modal-root').remove()">&times;</button>
            </div>
            <div>
                <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:1rem;">
                    <span style="font-size:2rem; font-weight:700; color:var(--primary);">${rating}</span>
                    <div>
                        <div style="color:var(--warning)">
                            <i class="bi bi-star-fill"></i>
                            <i class="bi bi-star-fill"></i>
                            <i class="bi bi-star-fill"></i>
                            <i class="bi bi-star-fill"></i>
                            <i class="bi bi-star-half"></i>
                        </div>
                        <span style="font-size:0.8rem; color:var(--text-muted)">Average customer score</span>
                    </div>
                </div>
                <div style="display:flex; flex-direction:column; gap:0.8rem;">
                    <div style="border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:0.5rem;">
                        <p style="font-weight:600; font-size:0.9rem;">Rohan Mehra <span style="font-weight:400; color:var(--text-muted); font-size:0.8rem;">- 2 days ago</span></p>
                        <p style="font-size:0.85rem; color:var(--text-muted);">Excellent attention to detail. Totally satisfied with the service.</p>
                    </div>
                    <div style="border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:0.5rem;">
                        <p style="font-weight:600; font-size:0.9rem;">Aishwarya R. <span style="font-weight:400; color:var(--text-muted); font-size:0.8rem;">- 1 week ago</span></p>
                        <p style="font-size:0.85rem; color:var(--text-muted);">Very professional and understanding. Highly recommend for haircuts!</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-primary" onclick="document.getElementById('review-modal-root').remove()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(backdrop);
}


// 6. BOOKING APPOINTMENT PAGE
let servicesList = [];
let stylistsList = [];
async function initBookingPage() {
    // Check auth
    if (!Auth.getUser()) {
        showToast("Please register or login to book appointments!", "warning");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
        return;
    }
    
    const serviceSel = document.getElementById("book-service-select");
    const stylistSel = document.getElementById("book-stylist-select");
    if (!serviceSel || !stylistSel) return;
    
    try {
        // Fetch services
        const resS = await fetch(`${API_BASE}/services/`);
        servicesList = await resS.json();
        
        serviceSel.innerHTML = `<option value="">Select Service</option>` + 
            servicesList.map(s => `<option value="${s.service_name}">${s.service_name} - ₹${s.price}</option>`).join('');
            
        // Fetch stylists
        const resSty = await fetch(`${API_BASE}/stylists/`);
        stylistsList = await resSty.json();
        
        stylistSel.innerHTML = `<option value="">Select Stylist</option>` + 
            stylistsList.map(s => `<option value="${s.stylist_name}" ${s.availability !== 'Available' ? 'disabled' : ''}>${s.stylist_name} (${s.availability})</option>`).join('');
            
        // Auto-select service if stored in localStorage
        const storedService = localStorage.getItem("selected_booking_service");
        if (storedService) {
            serviceSel.value = storedService;
            localStorage.removeItem("selected_booking_service");
            updateBookingSummary();
        }
        
        // Listeners for updates
        serviceSel.addEventListener("change", updateBookingSummary);
        stylistSel.addEventListener("change", updateBookingSummary);
        
        document.getElementById("book-date").valueAsDate = new Date();
        document.getElementById("book-date").addEventListener("change", updateBookingSummary);
        
        // Setup timeslots
        const timeslotBtns = document.querySelectorAll(".time-slot");
        timeslotBtns.forEach(slot => {
            slot.addEventListener("click", () => {
                timeslotBtns.forEach(b => b.classList.remove("selected"));
                slot.classList.add("selected");
                updateBookingSummary();
            });
        });
        
        // Booking Submit
        document.getElementById("btn-confirm-booking").addEventListener("click", proceedToPayment);
        
    } catch (err) {
        showToast("Error initializing appointment form", "error");
    }
}

function updateBookingSummary() {
    const sName = document.getElementById("book-service-select").value;
    const styName = document.getElementById("book-stylist-select").value;
    const dateVal = document.getElementById("book-date").value;
    
    const selectedSlot = document.querySelector(".time-slot.selected");
    const timeVal = selectedSlot ? selectedSlot.dataset.time : "";
    
    // Find service cost
    const service = servicesList.find(s => s.service_name === sName);
    const cost = service ? service.price : 0;
    
    document.getElementById("summary-service").innerText = sName || "Not Selected";
    document.getElementById("summary-stylist").innerText = styName || "Not Selected";
    document.getElementById("summary-date").innerText = dateVal || "Not Selected";
    document.getElementById("summary-time").innerText = timeVal || "Not Selected";
    document.getElementById("summary-price").innerText = cost ? `₹${cost}` : "₹0";
    document.getElementById("summary-total").innerText = `₹${cost}`;
}

function proceedToPayment() {
    const serviceName = document.getElementById("book-service-select").value;
    const stylistName = document.getElementById("book-stylist-select").value;
    const dateVal = document.getElementById("book-date").value;
    
    const selectedSlot = document.querySelector(".time-slot.selected");
    const timeVal = selectedSlot ? selectedSlot.dataset.time : "";
    
    if (!serviceName || !stylistName || !dateVal || !timeVal) {
        showToast("Please fill all details and select a timeslot!", "warning");
        return;
    }
    
    const service = servicesList.find(s => s.service_name === serviceName);
    const amount = service ? service.price : 0;
    
    // Store in temporary session state
    localStorage.setItem("pending_booking", JSON.stringify({
        customer_name: Auth.getUser().full_name,
        stylist_name: stylistName,
        service_name: serviceName,
        appointment_date: dateVal,
        appointment_time: timeVal,
        total_amount: amount,
        appointment_status: "Booked"
    }));
    
    window.location.href = "payment.html";
}


// 7. PAYMENT PAGE
function initPaymentPage() {
    const bookingStr = localStorage.getItem("pending_booking");
    if (!bookingStr) {
        showToast("No active booking session found", "error");
        setTimeout(() => { window.location.href = "booking.html"; }, 1500);
        return;
    }
    
    const booking = JSON.parse(bookingStr);
    
    document.getElementById("pay-service-name").innerText = booking.service_name;
    document.getElementById("pay-stylist-name").innerText = booking.stylist_name;
    document.getElementById("pay-date-time").innerText = `${booking.appointment_date} at ${booking.appointment_time}`;
    document.getElementById("pay-amount").innerText = `₹${booking.total_amount}`;
    document.getElementById("pay-total").innerText = `₹${booking.total_amount}`;
    
    // Payment method selector
    const methodCards = document.querySelectorAll(".payment-method-card");
    let selectedMethod = "";
    
    methodCards.forEach(card => {
        card.addEventListener("click", () => {
            methodCards.forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            selectedMethod = card.dataset.method;
        });
    });
    
    document.getElementById("btn-submit-payment").addEventListener("click", async () => {
        if (!selectedMethod) {
            showToast("Please select a payment method", "warning");
            return;
        }
        
        try {
            // 1. Submit Appointment
            const resApp = await fetch(`${API_BASE}/appointments/add/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(booking)
            });
            
            const appData = await resApp.json();
            if (!resApp.ok) {
                showToast("Failed to book appointment", "error");
                return;
            }
            
            // 2. Submit Payment
            const paymentPayload = {
                customer_name: booking.customer_name,
                appointment_id: appData.appointment_id,
                amount: booking.total_amount,
                payment_method: selectedMethod,
                payment_status: "Paid",
                payment_date: booking.appointment_date
            };
            
            const resPay = await fetch(`${API_BASE}/payments/add/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(paymentPayload)
            });
            
            if (resPay.ok) {
                // Trigger In-App Reminder notification (Bonus)
                showToast("Payment Successful! Booking confirmed.", "success");
                
                // Clear state
                localStorage.removeItem("pending_booking");
                
                // Set appointment notification alert
                localStorage.setItem("has_new_booking_notification", "true");
                
                setTimeout(() => {
                    window.location.href = "customer_dashboard.html";
                }, 1500);
            } else {
                showToast("Payment processing failed", "error");
            }
        } catch (err) {
            showToast("Error communicating with server", "error");
        }
    });
}


// 8. CUSTOMER DASHBOARD
async function initCustomerDashboard() {
    const user = Auth.getUser();
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    
    // Print Profile Details
    document.getElementById("dash-client-name").innerText = user.full_name;
    document.getElementById("dash-client-email").innerText = user.email;
    document.getElementById("dash-client-phone").innerText = user.phone || "Not provided";
    document.getElementById("dash-client-gender").innerText = user.gender || "Not specified";
    
    // In-App Booking Reminder Check (Bonus)
    const hasNotification = localStorage.getItem("has_new_booking_notification");
    if (hasNotification) {
        showToast(`🔔 Reminder: You have an upcoming session scheduled!`, "info");
        localStorage.removeItem("has_new_booking_notification");
    }
    
    try {
        // Fetch appointments
        const res = await fetch(`${API_BASE}/appointments/`);
        const appointments = await res.json();
        
        // Filter user appointments
        const userApp = appointments.filter(a => a.customer_name === user.full_name);
        
        // Upcoming Appointments
        const upcomingList = userApp.filter(a => a.appointment_status === "Booked");
        const upcomingContainer = document.getElementById("upcoming-appointments-list");
        
        if (upcomingList.length === 0) {
            upcomingContainer.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No upcoming appointments. Book one now!</td></tr>`;
        } else {
            upcomingContainer.innerHTML = upcomingList.map(a => `
                <tr>
                    <td>#${a.appointment_id}</td>
                    <td>${a.service_name}</td>
                    <td>${a.stylist_name}</td>
                    <td>${a.appointment_date}</td>
                    <td>${a.appointment_time}</td>
                    <td>
                        <button class="btn-secondary" style="padding:0.3rem 0.8rem; font-size:0.8rem; border-color:var(--danger); color:var(--danger);" onclick="cancelAppointment(${a.appointment_id})">Cancel</button>
                    </td>
                </tr>
            `).join('');
        }
        
        // Completed appointments
        const completedList = userApp.filter(a => a.appointment_status === "Completed");
        const completedContainer = document.getElementById("completed-appointments-list");
        
        if (completedList.length === 0) {
            completedContainer.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No completed services in history.</td></tr>`;
        } else {
            completedContainer.innerHTML = completedList.map(a => `
                <tr>
                    <td>#${a.appointment_id}</td>
                    <td>${a.service_name}</td>
                    <td>${a.stylist_name}</td>
                    <td>${a.appointment_date}</td>
                    <td><span class="badge-status badge-completed">Completed</span></td>
                </tr>
            `).join('');
        }
        
        // Payment History
        const payRes = await fetch(`${API_BASE}/payments/`);
        const payments = await payRes.json();
        const userPay = payments.filter(p => p.customer_name === user.full_name);
        const paymentContainer = document.getElementById("payment-history-list");
        
        if (userPay.length === 0) {
            paymentContainer.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No payment records found.</td></tr>`;
        } else {
            paymentContainer.innerHTML = userPay.map(p => `
                <tr>
                    <td>#${p.payment_id}</td>
                    <td>#${p.appointment_id}</td>
                    <td>₹${p.amount}</td>
                    <td>${p.payment_method}</td>
                    <td><span class="badge-status badge-${p.payment_status.toLowerCase()}">${p.payment_status}</span></td>
                </tr>
            `).join('');
        }
        
    } catch (err) {
        showToast("Error loading customer records", "error");
    }
}

async function cancelAppointment(appId) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
        // Fetch current details to update
        const res = await fetch(`${API_BASE}/appointments/`);
        const list = await res.json();
        const appointment = list.find(a => a.appointment_id === appId);
        
        if (!appointment) return;
        
        // Update appointment status to Cancelled
        const appRes = await fetch(`${API_BASE}/appointments/update/${appId}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ appointment_status: "Cancelled" })
        });
        
        // Try to update corresponding payment status to Failed
        const payResList = await fetch(`${API_BASE}/payments/`);
        const payments = await payResList.json();
        const payment = payments.find(p => p.appointment_id === appId);
        
        if (payment) {
            await fetch(`${API_BASE}/payments/update/${payment.payment_id}/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ payment_status: "Failed" })
            });
        }
        
        if (appRes.ok) {
            showToast("Appointment cancelled successfully", "success");
            initCustomerDashboard();
        } else {
            showToast("Failed to cancel booking", "error");
        }
    } catch (err) {
        showToast("Network error cancelling booking", "error");
    }
}


// =====================================================================
// 9. ADMIN DASHBOARD (CRUD Actions for all models)
// =====================================================================

let adminCustomers = [];
let adminServices = [];
let adminStylists = [];
let adminAppointments = [];
let adminPayments = [];

async function initAdminDashboard() {
    if (!Auth.isAdmin()) {
        showToast("Unauthorized! Admin login required.", "error");
        setTimeout(() => { window.location.href = "login.html"; }, 1500);
        return;
    }
    
    // Menu tab toggles
    const links = document.querySelectorAll(".sidebar-link");
    links.forEach(link => {
        link.addEventListener("click", () => {
            links.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
            
            const targetSection = link.dataset.section;
            document.querySelectorAll(".admin-section").forEach(sec => {
                sec.style.display = "none";
            });
            document.getElementById(`admin-sec-${targetSection}`).style.display = "block";
        });
    });
    
    // Load counts and tables
    await loadAdminData();
}

async function loadAdminData() {
    try {
        // Fetch everything
        const cRes = await fetch(`${API_BASE}/customers/`);
        adminCustomers = await cRes.json();
        
        const sRes = await fetch(`${API_BASE}/services/`);
        adminServices = await sRes.json();
        
        const stRes = await fetch(`${API_BASE}/stylists/`);
        adminStylists = await stRes.json();
        
        const aRes = await fetch(`${API_BASE}/appointments/`);
        adminAppointments = await aRes.json();
        
        const pRes = await fetch(`${API_BASE}/payments/`);
        adminPayments = await pRes.json();
        
        // Render statistics
        document.getElementById("stat-total-clients").innerText = adminCustomers.length;
        document.getElementById("stat-total-services").innerText = adminServices.length;
        document.getElementById("stat-total-stylists").innerText = adminStylists.length;
        document.getElementById("stat-total-bookings").innerText = adminAppointments.length;
        
        // Render tables
        renderAdminCustomersTable();
        renderAdminServicesTable();
        renderAdminStylistsTable();
        renderAdminAppointmentsTable();
        renderAdminPaymentsTable();
        
    } catch (err) {
        showToast("Error loading administrative datasets", "error");
    }
}

// Render tables
function renderAdminCustomersTable() {
    const tbody = document.getElementById("admin-customers-tbody");
    tbody.innerHTML = adminCustomers.map(c => `
        <tr>
            <td>${c.customer_id}</td>
            <td>${c.full_name}</td>
            <td>${c.email}</td>
            <td>${c.phone || '-'}</td>
            <td>${c.gender || '-'}</td>
            <td>
                <div class="btn-action-group">
                    <button class="btn-icon btn-icon-delete" onclick="deleteCustomer(${c.customer_id})"><i class="bi bi-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderAdminServicesTable() {
    const tbody = document.getElementById("admin-services-tbody");
    tbody.innerHTML = adminServices.map(s => `
        <tr>
            <td>${s.service_id}</td>
            <td>${s.service_name}</td>
            <td>${s.category}</td>
            <td>${s.duration} mins</td>
            <td>₹${s.price}</td>
            <td>
                <div class="btn-action-group">
                    <button class="btn-icon btn-icon-edit" onclick="openEditServiceModal(${s.service_id})"><i class="bi bi-pencil"></i></button>
                    <button class="btn-icon btn-icon-delete" onclick="deleteService(${s.service_id})"><i class="bi bi-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderAdminStylistsTable() {
    const tbody = document.getElementById("admin-stylists-tbody");
    tbody.innerHTML = adminStylists.map(s => `
        <tr>
            <td>${s.stylist_id}</td>
            <td>${s.stylist_name}</td>
            <td>${s.specialization || '-'}</td>
            <td>${s.experience} yrs</td>
            <td>${s.phone || '-'}</td>
            <td><span class="stylist-availability status-${s.availability.toLowerCase()}">${s.availability}</span></td>
            <td>
                <div class="btn-action-group">
                    <button class="btn-icon btn-icon-edit" onclick="openEditStylistModal(${s.stylist_id})"><i class="bi bi-pencil"></i></button>
                    <button class="btn-icon btn-icon-delete" onclick="deleteStylist(${s.stylist_id})"><i class="bi bi-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderAdminAppointmentsTable() {
    const tbody = document.getElementById("admin-appointments-tbody");
    tbody.innerHTML = adminAppointments.map(a => `
        <tr>
            <td>${a.appointment_id}</td>
            <td>${a.customer_name}</td>
            <td>${a.service_name}</td>
            <td>${a.stylist_name}</td>
            <td>${a.appointment_date} ${a.appointment_time}</td>
            <td><span class="badge-status badge-${a.appointment_status.toLowerCase()}">${a.appointment_status}</span></td>
            <td>
                <div class="btn-action-group">
                    <button class="btn-icon btn-icon-edit" onclick="openEditAppointmentModal(${a.appointment_id})"><i class="bi bi-pencil"></i></button>
                    <button class="btn-icon btn-icon-delete" onclick="deleteAppointment(${a.appointment_id})"><i class="bi bi-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderAdminPaymentsTable() {
    const tbody = document.getElementById("admin-payments-tbody");
    tbody.innerHTML = adminPayments.map(p => `
        <tr>
            <td>${p.payment_id}</td>
            <td>${p.customer_name}</td>
            <td>#${p.appointment_id}</td>
            <td>₹${p.amount}</td>
            <td>${p.payment_method}</td>
            <td><span class="badge-status badge-${p.payment_status.toLowerCase()}">${p.payment_status}</span></td>
            <td>
                <div class="btn-action-group">
                    <button class="btn-icon btn-icon-edit" onclick="openEditPaymentModal(${p.payment_id})"><i class="bi bi-pencil"></i></button>
                    <button class="btn-icon btn-icon-delete" onclick="deletePayment(${p.payment_id})"><i class="bi bi-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}


// Delete operations
async function deleteCustomer(id) {
    if (!confirm("Remove this customer account?")) return;
    const res = await fetch(`${API_BASE}/customers/delete/${id}/`, { method: "DELETE" });
    if (res.ok) { showToast("Customer removed", "success"); loadAdminData(); }
}

async function deleteService(id) {
    if (!confirm("Delete this service?")) return;
    const res = await fetch(`${API_BASE}/services/delete/${id}/`, { method: "DELETE" });
    if (res.ok) { showToast("Service deleted", "success"); loadAdminData(); }
}

async function deleteStylist(id) {
    if (!confirm("Remove this stylist profile?")) return;
    const res = await fetch(`${API_BASE}/stylists/delete/${id}/`, { method: "DELETE" });
    if (res.ok) { showToast("Stylist removed", "success"); loadAdminData(); }
}

async function deleteAppointment(id) {
    if (!confirm("Remove this appointment record?")) return;
    const res = await fetch(`${API_BASE}/appointments/delete/${id}/`, { method: "DELETE" });
    if (res.ok) { showToast("Appointment deleted", "success"); loadAdminData(); }
}

async function deletePayment(id) {
    if (!confirm("Delete this payment transaction record?")) return;
    const res = await fetch(`${API_BASE}/payments/delete/${id}/`, { method: "DELETE" });
    if (res.ok) { showToast("Payment record deleted", "success"); loadAdminData(); }
}


// MODALS & CRUD FORM CREATES/UPDATES

// 1. SERVICES
function openAddServiceModal() {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop active";
    backdrop.id = "admin-modal-root";
    backdrop.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add New Service</h3>
                <button class="modal-close" onclick="document.getElementById('admin-modal-root').remove()">&times;</button>
            </div>
            <form id="add-service-form">
                <div class="form-group">
                    <label>Service Name</label>
                    <input type="text" class="form-control" id="m-service-name" required>
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <select class="form-control form-select" id="m-service-cat" required>
                        <option value="Hair Cut">Hair Cut</option>
                        <option value="Hair Styling">Hair Styling</option>
                        <option value="Hair Coloring">Hair Coloring</option>
                        <option value="Facial">Facial</option>
                        <option value="Spa">Spa</option>
                        <option value="Massage">Massage</option>
                        <option value="Manicure">Manicure</option>
                        <option value="Pedicure">Pedicure</option>
                    </select>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                    <div class="form-group">
                        <label>Duration (Minutes)</label>
                        <input type="number" class="form-control" id="m-service-dur" required>
                    </div>
                    <div class="form-group">
                        <label>Price (₹)</label>
                        <input type="number" class="form-control" id="m-service-price" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea class="form-control" id="m-service-desc" rows="3"></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="document.getElementById('admin-modal-root').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Add Service</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(backdrop);
    
    document.getElementById("add-service-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            service_name: document.getElementById("m-service-name").value,
            category: document.getElementById("m-service-cat").value,
            duration: document.getElementById("m-service-dur").value,
            price: document.getElementById("m-service-price").value,
            description: document.getElementById("m-service-desc").value
        };
        
        const res = await fetch(`${API_BASE}/services/add/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            showToast("Service added successfully", "success");
            document.getElementById("admin-modal-root").remove();
            loadAdminData();
        }
    });
}

function openEditServiceModal(id) {
    const s = adminServices.find(item => item.service_id === id);
    if (!s) return;
    
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop active";
    backdrop.id = "admin-modal-root";
    backdrop.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Edit Service #${id}</h3>
                <button class="modal-close" onclick="document.getElementById('admin-modal-root').remove()">&times;</button>
            </div>
            <form id="edit-service-form">
                <div class="form-group">
                    <label>Service Name</label>
                    <input type="text" class="form-control" id="m-service-name" value="${s.service_name}" required>
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <select class="form-control form-select" id="m-service-cat" required>
                        <option value="Hair Cut" ${s.category==='Hair Cut'?'selected':''}>Hair Cut</option>
                        <option value="Hair Styling" ${s.category==='Hair Styling'?'selected':''}>Hair Styling</option>
                        <option value="Hair Coloring" ${s.category==='Hair Coloring'?'selected':''}>Hair Coloring</option>
                        <option value="Facial" ${s.category==='Facial'?'selected':''}>Facial</option>
                        <option value="Spa" ${s.category==='Spa'?'selected':''}>Spa</option>
                        <option value="Massage" ${s.category==='Massage'?'selected':''}>Massage</option>
                        <option value="Manicure" ${s.category==='Manicure'?'selected':''}>Manicure</option>
                        <option value="Pedicure" ${s.category==='Pedicure'?'selected':''}>Pedicure</option>
                    </select>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                    <div class="form-group">
                        <label>Duration (Minutes)</label>
                        <input type="number" class="form-control" id="m-service-dur" value="${s.duration}" required>
                    </div>
                    <div class="form-group">
                        <label>Price (₹)</label>
                        <input type="number" class="form-control" id="m-service-price" value="${s.price}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea class="form-control" id="m-service-desc" rows="3">${s.description || ''}</textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="document.getElementById('admin-modal-root').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(backdrop);
    
    document.getElementById("edit-service-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            service_name: document.getElementById("m-service-name").value,
            category: document.getElementById("m-service-cat").value,
            duration: document.getElementById("m-service-dur").value,
            price: document.getElementById("m-service-price").value,
            description: document.getElementById("m-service-desc").value
        };
        
        const res = await fetch(`${API_BASE}/services/update/${id}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            showToast("Service updated", "success");
            document.getElementById("admin-modal-root").remove();
            loadAdminData();
        }
    });
}


// 2. STYLISTS
function openAddStylistModal() {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop active";
    backdrop.id = "admin-modal-root";
    backdrop.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add New Stylist</h3>
                <button class="modal-close" onclick="document.getElementById('admin-modal-root').remove()">&times;</button>
            </div>
            <form id="add-stylist-form">
                <div class="form-group">
                    <label>Stylist Name</label>
                    <input type="text" class="form-control" id="m-stylist-name" required>
                </div>
                <div class="form-group">
                    <label>Specialization</label>
                    <input type="text" class="form-control" id="m-stylist-spec" placeholder="e.g. Hair Coloring, Massages" required>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                    <div class="form-group">
                        <label>Experience (Years)</label>
                        <input type="number" class="form-control" id="m-stylist-exp" required>
                    </div>
                    <div class="form-group">
                        <label>Phone</label>
                        <input type="text" class="form-control" id="m-stylist-phone" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Availability</label>
                    <select class="form-control form-select" id="m-stylist-avail" required>
                        <option value="Available">Available</option>
                        <option value="Busy">Busy</option>
                        <option value="Leave">Leave</option>
                    </select>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="document.getElementById('admin-modal-root').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Add Stylist</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(backdrop);
    
    document.getElementById("add-stylist-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            stylist_name: document.getElementById("m-stylist-name").value,
            specialization: document.getElementById("m-stylist-spec").value,
            experience: document.getElementById("m-stylist-exp").value,
            phone: document.getElementById("m-stylist-phone").value,
            availability: document.getElementById("m-stylist-avail").value
        };
        
        const res = await fetch(`${API_BASE}/stylists/add/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            showToast("Stylist profile added", "success");
            document.getElementById("admin-modal-root").remove();
            loadAdminData();
        }
    });
}

function openEditStylistModal(id) {
    const s = adminStylists.find(item => item.stylist_id === id);
    if (!s) return;
    
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop active";
    backdrop.id = "admin-modal-root";
    backdrop.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Edit Stylist #${id}</h3>
                <button class="modal-close" onclick="document.getElementById('admin-modal-root').remove()">&times;</button>
            </div>
            <form id="edit-stylist-form">
                <div class="form-group">
                    <label>Stylist Name</label>
                    <input type="text" class="form-control" id="m-stylist-name" value="${s.stylist_name}" required>
                </div>
                <div class="form-group">
                    <label>Specialization</label>
                    <input type="text" class="form-control" id="m-stylist-spec" value="${s.specialization || ''}" required>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                    <div class="form-group">
                        <label>Experience (Years)</label>
                        <input type="number" class="form-control" id="m-stylist-exp" value="${s.experience}" required>
                    </div>
                    <div class="form-group">
                        <label>Phone</label>
                        <input type="text" class="form-control" id="m-stylist-phone" value="${s.phone || ''}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Availability</label>
                    <select class="form-control form-select" id="m-stylist-avail" required>
                        <option value="Available" ${s.availability==='Available'?'selected':''}>Available</option>
                        <option value="Busy" ${s.availability==='Busy'?'selected':''}>Busy</option>
                        <option value="Leave" ${s.availability==='Leave'?'selected':''}>Leave</option>
                    </select>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="document.getElementById('admin-modal-root').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(backdrop);
    
    document.getElementById("edit-stylist-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            stylist_name: document.getElementById("m-stylist-name").value,
            specialization: document.getElementById("m-stylist-spec").value,
            experience: document.getElementById("m-stylist-exp").value,
            phone: document.getElementById("m-stylist-phone").value,
            availability: document.getElementById("m-stylist-avail").value
        };
        
        const res = await fetch(`${API_BASE}/stylists/update/${id}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            showToast("Stylist updated", "success");
            document.getElementById("admin-modal-root").remove();
            loadAdminData();
        }
    });
}


// 3. APPOINTMENTS
function openEditAppointmentModal(id) {
    const a = adminAppointments.find(item => item.appointment_id === id);
    if (!a) return;
    
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop active";
    backdrop.id = "admin-modal-root";
    backdrop.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Edit Appointment #${id}</h3>
                <button class="modal-close" onclick="document.getElementById('admin-modal-root').remove()">&times;</button>
            </div>
            <form id="edit-app-form">
                <div class="form-group">
                    <label>Customer Name</label>
                    <input type="text" class="form-control" id="m-app-cust" value="${a.customer_name}" disabled>
                </div>
                <div class="form-group">
                    <label>Service Name</label>
                    <input type="text" class="form-control" id="m-app-serv" value="${a.service_name}" disabled>
                </div>
                <div class="form-group">
                    <label>Appointment Status</label>
                    <select class="form-control form-select" id="m-app-status" required>
                        <option value="Booked" ${a.appointment_status==='Booked'?'selected':''}>Booked</option>
                        <option value="Completed" ${a.appointment_status==='Completed'?'selected':''}>Completed</option>
                        <option value="Cancelled" ${a.appointment_status==='Cancelled'?'selected':''}>Cancelled</option>
                    </select>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="document.getElementById('admin-modal-root').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(backdrop);
    
    document.getElementById("edit-app-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            appointment_status: document.getElementById("m-app-status").value
        };
        
        const res = await fetch(`${API_BASE}/appointments/update/${id}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            showToast("Appointment status updated", "success");
            document.getElementById("admin-modal-root").remove();
            loadAdminData();
        }
    });
}


// 4. PAYMENTS
function openEditPaymentModal(id) {
    const p = adminPayments.find(item => item.payment_id === id);
    if (!p) return;
    
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop active";
    backdrop.id = "admin-modal-root";
    backdrop.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Edit Payment Transaction #${id}</h3>
                <button class="modal-close" onclick="document.getElementById('admin-modal-root').remove()">&times;</button>
            </div>
            <form id="edit-pay-form">
                <div class="form-group">
                    <label>Client</label>
                    <input type="text" class="form-control" value="${p.customer_name}" disabled>
                </div>
                <div class="form-group">
                    <label>Amount (₹)</label>
                    <input type="text" class="form-control" value="₹${p.amount}" disabled>
                </div>
                <div class="form-group">
                    <label>Payment Status</label>
                    <select class="form-control form-select" id="m-pay-status" required>
                        <option value="Paid" ${p.payment_status==='Paid'?'selected':''}>Paid</option>
                        <option value="Pending" ${p.payment_status==='Pending'?'selected':''}>Pending</option>
                        <option value="Failed" ${p.payment_status==='Failed'?'selected':''}>Failed</option>
                    </select>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="document.getElementById('admin-modal-root').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(backdrop);
    
    document.getElementById("edit-pay-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            payment_status: document.getElementById("m-pay-status").value
        };
        
        const res = await fetch(`${API_BASE}/payments/update/${id}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            showToast("Payment transaction status updated", "success");
            document.getElementById("admin-modal-root").remove();
            loadAdminData();
        }
    });
}
