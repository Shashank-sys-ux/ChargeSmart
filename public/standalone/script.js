// Global state
let currentUser = null;
let currentVehicle = null;
let currentPage = 'home';
let isSignupMode = false;
let isLoading = false;

// Mock user data for demonstration
const mockUsers = [
    { username: 'demo', email: 'demo@example.com', password: 'demo123' },
    { username: 'admin', email: 'admin@admin.com', password: 'admin123' }
];

// Vehicle data
const vehicleTypes = [
    { id: "car", name: "Car", icon: "🚗" },
    { id: "scooter", name: "Scooter", icon: "🛵" },
    { id: "bike", name: "Bike", icon: "🏍️" }
];

const vehicleModels = {
    car: [
        { id: "tata-nexon", name: "Tata Nexon EV", range: 312, connector: "CCS2", price: "₹14.99L" },
        { id: "mg-zs", name: "MG ZS EV", range: 461, connector: "CCS2", price: "₹21.99L" },
        { id: "hyundai-kona", name: "Hyundai Kona Electric", range: 452, connector: "CCS2", price: "₹23.84L" },
        { id: "mahindra-e2o", name: "Mahindra e2oPlus", range: 140, connector: "Type 2", price: "₹8.31L" }
    ],
    scooter: [
        { id: "ather-450x", name: "Ather 450X", range: 146, connector: "Type 2", price: "₹1.39L" },
        { id: "ola-s1-pro", name: "Ola S1 Pro", range: 181, connector: "Type 2", price: "₹1.30L" },
        { id: "tvs-iqube", name: "TVS iQube Electric", range: 140, connector: "Type 2", price: "₹1.15L" },
        { id: "bajaj-chetak", name: "Bajaj Chetak", range: 108, connector: "Type 2", price: "₹1.20L" }
    ],
    bike: [
        { id: "hero-electric", name: "Hero Electric Optima", range: 82, connector: "Type 2", price: "₹48K" },
        { id: "okinawa-praise", name: "Okinawa Praise Pro", range: 88, connector: "Type 2", price: "₹58K" },
        { id: "ampere-zeal", name: "Ampere Zeal Ex", range: 121, connector: "Type 2", price: "₹68K" },
        { id: "revolt-rv400", name: "Revolt RV400", range: 156, connector: "Type 2", price: "₹1.38L" }
    ]
};

// Station data
const stations = [
    {
        id: 1,
        name: "Koramangala Hub",
        type: "fast-charging",
        location: "Koramangala, Bangalore",
        lat: 12.9279, lng: 77.6271,
        price: 15,
        distance: 2.1,
        total: 4,
        baseAvailability: 3,
        baseWaitTime: 5
    },
    {
        id: 2,
        name: "Electronic City Express",
        type: "battery-swap",
        location: "Electronic City, Bangalore",
        lat: 12.8456, lng: 77.6603,
        price: 12,
        distance: 8.5,
        total: 6,
        baseAvailability: 4,
        baseWaitTime: 8
    },
    {
        id: 3,
        name: "Whitefield Tech Park",
        type: "fast-charging",
        location: "Whitefield, Bangalore",
        lat: 12.9698, lng: 77.7500,
        price: 18,
        distance: 15.2,
        total: 8,
        baseAvailability: 6,
        baseWaitTime: 3
    },
    {
        id: 4,
        name: "Indiranagar Central",
        type: "standard",
        location: "Indiranagar, Bangalore",
        lat: 12.9784, lng: 77.6408,
        price: 10,
        distance: 4.8,
        total: 3,
        baseAvailability: 2,
        baseWaitTime: 12
    },
    {
        id: 5,
        name: "JP Nagar Station",
        type: "fast-charging",
        location: "JP Nagar, Bangalore",
        lat: 12.9082, lng: 77.5753,
        price: 14,
        distance: 3.2,
        total: 5,
        baseAvailability: 4,
        baseWaitTime: 6
    }
];

// Application state variables
let currentTime = new Date();
let selectedStationId = null;
let currentFilter = "all";
let searchInput;
let stationsContainer;
let timeDisplay;
let timeBadge;
let map;
let markers = [];

// Toast functionality
function showToast(title, description, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : ''}`;
    
    toast.innerHTML = `
        <div class="toast-title">${title}</div>
        <div class="toast-description">${description}</div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'toastSlideIn 0.3s ease-out reverse';
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        }
    }, 5000);
}

// Modal functionality
function showAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.add('show');
    updateModalContent();
}

function hideAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.remove('show');
    resetForm();
}

function toggleAuthMode() {
    isSignupMode = !isSignupMode;
    updateModalContent();
}

function updateModalContent() {
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const submitText = document.getElementById('submitText');
    const toggleAuth = document.getElementById('toggleAuth');
    
    if (isSignupMode) {
        modalTitle.textContent = 'Join ChargeSmart';
        modalDescription.textContent = 'Create your account to get started';
        submitText.textContent = 'Sign Up';
        toggleAuth.textContent = 'Already have an account? Sign in';
    } else {
        modalTitle.textContent = 'Welcome Back';
        modalDescription.textContent = 'Sign in to your account';
        submitText.textContent = 'Sign In';
        toggleAuth.textContent = "Don't have an account? Sign up";
    }
}

function resetForm() {
    const form = document.getElementById('authForm');
    form.reset();
    isLoading = false;
    updateSubmitButton();
}

function updateSubmitButton() {
    const submitButton = document.querySelector('.submit-button');
    const submitText = document.getElementById('submitText');
    
    if (isLoading) {
        submitButton.disabled = true;
        submitText.textContent = 'Please wait...';
    } else {
        submitButton.disabled = false;
        submitText.textContent = isSignupMode ? 'Sign Up' : 'Sign In';
    }
}

// Authentication logic
function authenticateUser(username, email, password) {
    return new Promise((resolve) => {
        // Simulate API call delay
        setTimeout(() => {
            if (isSignupMode) {
                // For signup, just add to mock users and return success
                mockUsers.push({ username, email, password });
                resolve({ success: true, user: { username, email } });
            } else {
                // For login, check against mock users
                const user = mockUsers.find(u => 
                    (u.username === username || u.email === email) && u.password === password
                );
                
                if (user) {
                    resolve({ success: true, user: { username: user.username, email: user.email } });
                } else {
                    resolve({ success: false });
                }
            }
        }, 1000);
    });
}

function handleSuccessfulAuth(user) {
    hideAuthModal();
    
    // Store user in localStorage for persistence
    localStorage.setItem('chargeSmartUser', JSON.stringify(user));
    
    const title = isSignupMode ? "Welcome to ChargeSmart! 🎉" : "Welcome back! 🚗";
    const description = `Successfully ${isSignupMode ? 'signed up' : 'logged in'} as ${user.username}`;
    
    showToast(title, description);
    
    // Simulate redirect to dashboard after successful login
    setTimeout(() => {
        showToast(
            "Redirecting to Dashboard", 
            "Taking you to your EV management dashboard...",
            "success"
        );
    }, 2000);
}

// Update time display and badge
function updateDisplay() {
    const timeString = currentTime.toLocaleTimeString('en-US', { 
        hour12: true, 
        hour: 'numeric', 
        minute: '2-digit' 
    });
    timeDisplay.textContent = timeString;
    
    const hour = currentTime.getHours();
    const timeOfDay = getTimeOfDay(hour);
    timeBadge.textContent = timeOfDay;
    
    // Update badge styling
    timeBadge.className = 'time-badge';
    if (timeOfDay.includes('Peak')) {
        timeBadge.classList.add('peak');
    } else if (timeOfDay.includes('Night')) {
        timeBadge.classList.add('night');
    } else {
        timeBadge.classList.add('normal');
    }
}

function getTimeOfDay(hour) {
    if (hour >= 8 && hour <= 10) return "Morning Peak";
    if (hour >= 17 && hour <= 19) return "Evening Peak";
    if (hour >= 22 || hour <= 6) return "Night Time";
    return "Normal Hours";
}

// Station status calculation
function getStationStatus(station, time) {
    const hour = time.getHours();
    const isPeakHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19);
    const isNightTime = hour >= 22 || hour <= 6;
    
    let availability = station.baseAvailability;
    let waitTime = station.baseWaitTime;
    
    if (isPeakHour) {
        availability = Math.max(0, Math.floor(availability * 0.3));
        waitTime = Math.floor(waitTime * 3);
    } else if (isNightTime) {
        availability = Math.min(station.total, Math.floor(availability * 1.5));
        waitTime = Math.floor(waitTime * 0.5);
    }
    
    let status = "available";
    if (availability === 0) status = "full";
    else if (availability <= station.total * 0.3) status = "busy";
    
    return { availability, waitTime, status };
}

// Get heat map color based on usage
function getHeatColor(station, time) {
    const { availability } = getStationStatus(station, time);
    const usagePercent = ((station.total - availability) / station.total) * 100;
    
    if (usagePercent >= 90) return '#8B0000'; // Deep red
    if (usagePercent >= 70) return '#FF4500'; // Orange red
    if (usagePercent >= 50) return '#FFA500'; // Orange
    if (usagePercent >= 30) return '#FFD700'; // Gold
    return '#90EE90'; // Light green
}

// Map operations
function initMap() {
    // Initialize Leaflet map centered on India
    map = L.map('map-leaflet').setView([20.5937, 78.9629], 5);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

function updateMapMarkers() {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => {
        map.removeLayer(marker);
    });
    markers = [];

    // Add new markers
    stations.forEach(station => {
        if (currentFilter !== "all" && station.type !== currentFilter) return;

        const color = getHeatColor(station, currentTime);
        const { status, availability, waitTime } = getStationStatus(station, currentTime);
        
        // Create custom icon
        const iconHtml = `
            <div style="
                background-color: ${color};
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 2px solid ${selectedStationId === station.id ? '#16a34a' : (status === 'full' ? '#FFFFFF' : '#000000')};
                border-width: ${selectedStationId === station.id ? '3px' : '2px'};
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
                ${station.type === 'fast-charging' ? '⚡' : station.type === 'battery-swap' ? '🔋' : '📍'}
            </div>
        `;

        const icon = L.divIcon({
            className: 'custom-div-icon',
            html: iconHtml,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        const marker = L.marker([station.lat, station.lng], { icon })
            .addTo(map)
            .bindPopup(`
                <div style="min-width: 200px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">
                        ${station.name}
                    </h3>
                    <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
                        ${station.location}
                    </p>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="
                            display: inline-block;
                            width: 8px;
                            height: 8px;
                            border-radius: 50%;
                            background-color: ${
                                status === 'available' ? '#10b981' :
                                status === 'busy' ? '#f59e0b' : '#ef4444'
                            };
                        "></span>
                        <span style="font-size: 12px; text-transform: capitalize; font-weight: 500;">
                            ${status}
                        </span>
                    </div>
                    <div style="font-size: 12px; line-height: 1.4;">
                        <div>Availability: ${availability}/${station.total}</div>
                        <div>Wait time: ${waitTime}m</div>
                        <div>Distance: ${station.distance}km</div>
                        <div>Rate: ₹${station.price}/hr</div>
                    </div>
                </div>
            `)
            .on('click', () => {
                selectedStationId = station.id;
                updateMapMarkers();
                renderStationList();
            });

        markers.push(marker);
    });
}

// Filter operations
function setFilter(filter) {
    currentFilter = filter;
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    updateMapMarkers();
    renderStationList();
}

// Station list rendering
function renderStationList() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredStations = stations.filter(station => {
        const matchesFilter = currentFilter === 'all' || station.type === currentFilter;
        const matchesSearch = station.name.toLowerCase().includes(searchTerm) || 
                            station.location.toLowerCase().includes(searchTerm);
        return matchesFilter && matchesSearch;
    });
    
    stationsContainer.innerHTML = '';
    
    filteredStations.forEach(station => {
        const stationData = getStationStatus(station, currentTime);
        const stationCard = createStationCard(station, stationData);
        stationsContainer.appendChild(stationCard);
    });
}

function createStationCard(station, stationData) {
    const card = document.createElement('div');
    card.className = `station-card ${selectedStationId === station.id ? 'selected' : ''}`;
    card.addEventListener('click', () => {
        selectedStationId = station.id;
        updateMapMarkers();
        renderStationList();
    });
    
    const typeIcon = station.type === 'fast-charging' ? '⚡' : 
                    station.type === 'battery-swap' ? '🔋' : '📍';
    
    card.innerHTML = `
        <div class="station-header">
            <div>
                <div class="station-title">${typeIcon} ${station.name}</div>
                <div class="station-location">${station.location}</div>
            </div>
            <div class="station-status">
                <div class="status-dot ${stationData.status}"></div>
                <div class="status-badge ${stationData.status}">${stationData.status}</div>
            </div>
        </div>
        
        <div class="availability-info">
            <div class="availability-text">
                <span>Availability</span>
                <span>${stationData.availability}/${station.total}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(stationData.availability / station.total) * 100}%"></div>
            </div>
        </div>
        
        <div class="station-stats">
            <div class="stat-item">
                <div class="stat-icon">🕐</div>
                <div class="stat-value">${stationData.waitTime}m</div>
                <div class="stat-label">Wait time</div>
            </div>
            <div class="stat-item">
                <div class="stat-icon">🧭</div>
                <div class="stat-value">${station.distance}km</div>
                <div class="stat-label">Distance</div>
            </div>
            <div class="stat-item">
                <div class="stat-icon">⚡</div>
                <div class="stat-value">₹${station.price}/hr</div>
                <div class="stat-label">Rate</div>
            </div>
        </div>
        
        <button class="navigate-btn">
            🧭 Navigate Here
        </button>
    `;
    
    return card;
}

function handleSearch() {
    renderStationList();
}

// Page management functions
function showPage(page) {
    currentPage = page;
    const app = document.querySelector('.app');
    
    // Show appropriate content based on page and auth state
    if (!currentUser) {
        showHomePage();
    } else if (!currentVehicle) {
        showVehicleSelection();
    } else {
        showDashboard();
    }
}

function showHomePage() {
    document.body.innerHTML = getHomePageHTML();
    setupHomePageEvents();
}

function showVehicleSelection() {
    document.body.innerHTML = getVehicleSelectionHTML();
    setupVehicleSelectionEvents();
}

function showDashboard() {
    document.body.innerHTML = getDashboardHTML();
    setupDashboardEvents();
}

// HTML generators for different pages
function getHomePageHTML() {
    return `
        <div class="app">
            <!-- Hero Section -->
            <section class="hero-section">
                <div class="bg-grid"></div>
                
                <div class="container">
                    <div class="hero-content">
                        <div class="hero-badge">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"></polygon>
                            </svg>
                            AI-Powered EV Infrastructure
                        </div>
                        
                        <h1 class="hero-title">ChargeSmart</h1>
                        
                        <p class="hero-description">
                            India's smartest EV charging network powered by AI. Find stations, predict availability, and optimize your electric journey.
                        </p>
                        
                        <button class="cta-button" onclick="showAuthModal()">
                            Get Started
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12,5 19,12 12,19"></polyline>
                            </svg>
                        </button>
                        
                        <!-- Live Stats -->
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-icon stat-icon-green">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                                        <circle cx="12" cy="10" r="3"/>
                                    </svg>
                                </div>
                                <div class="stat-value">1,247</div>
                                <div class="stat-label">Active Stations</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon stat-icon-blue">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                    </svg>
                                </div>
                                <div class="stat-value">28.5K</div>
                                <div class="stat-label">EV Users</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon stat-icon-emerald">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                                    </svg>
                                </div>
                                <div class="stat-value">342h</div>
                                <div class="stat-label">Time Saved Daily</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Features Section -->
            <section class="features-section">
                <div class="container">
                    <div class="section-header">
                        <h2 class="section-title">Why Choose ChargeSmart?</h2>
                        <p class="section-description">
                            Experience the future of electric vehicle charging with our intelligent platform
                        </p>
                    </div>

                    <div class="features-grid">
                        <div class="feature-card">
                            <div class="feature-header">
                                <div class="feature-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect width="16" height="10" x="2" y="7" rx="2" ry="2"/>
                                        <line x1="22" y1="11" x2="22" y2="13"/>
                                    </svg>
                                </div>
                                <h3 class="feature-title">Smart Charging</h3>
                            </div>
                            <p class="feature-description">
                                AI-powered station recommendations based on availability and your vehicle's needs
                            </p>
                        </div>

                        <div class="feature-card">
                            <div class="feature-header">
                                <div class="feature-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                                        <circle cx="12" cy="10" r="3"/>
                                    </svg>
                                </div>
                                <h3 class="feature-title">Real-time Navigation</h3>
                            </div>
                            <p class="feature-description">
                                Live traffic and station status updates for optimal route planning
                            </p>
                        </div>

                        <div class="feature-card">
                            <div class="feature-header">
                                <div class="feature-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12,6 12,12 16,14"/>
                                    </svg>
                                </div>
                                <h3 class="feature-title">Predictive Analytics</h3>
                            </div>
                            <p class="feature-description">
                                Know before you go - predict wait times and station availability
                            </p>
                        </div>

                        <div class="feature-card">
                            <div class="feature-header">
                                <div class="feature-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                                    </svg>
                                </div>
                                <h3 class="feature-title">Secure & Reliable</h3>
                            </div>
                            <p class="feature-description">
                                Safe transactions and trusted network of verified charging stations
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- EV Types Section -->
            <section class="ev-types-section">
                <div class="container">
                    <div class="section-header">
                        <h2 class="section-title">Supporting All Electric Vehicles</h2>
                        <p class="section-description">
                            From cars to scooters, we've got you covered
                        </p>
                    </div>

                    <div class="ev-types-grid">
                        <div class="ev-type-card">
                            <div class="ev-type-header">
                                <div class="ev-type-icon ev-type-icon-blue">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.4 9.9c-.3-.6-.9-1-1.5-1H15"/>
                                        <path d="M11 17h2"/>
                                        <path d="M5 17h6v-6H4v4c0 1.1.9 2 2 2z"/>
                                        <circle cx="7" cy="17" r="2"/>
                                        <circle cx="17" cy="17" r="2"/>
                                    </svg>
                                </div>
                                <h3 class="ev-type-title">Electric Cars</h3>
                            </div>
                            <p class="ev-type-description">Tata Nexon EV, MG ZS EV, Hyundai Kona & more</p>
                        </div>

                        <div class="ev-type-card">
                            <div class="ev-type-header">
                                <div class="ev-type-icon ev-type-icon-green">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
                                        <path d="M12 18h.01"/>
                                    </svg>
                                </div>
                                <h3 class="ev-type-title">Electric Scooters</h3>
                            </div>
                            <p class="ev-type-description">Ather 450X, Ola S1 Pro, TVS iQube & more</p>
                        </div>

                        <div class="ev-type-card">
                            <div class="ev-type-header">
                                <div class="ev-type-icon ev-type-icon-purple">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="18.5" cy="17.5" r="3.5"/>
                                        <circle cx="5.5" cy="17.5" r="3.5"/>
                                        <circle cx="15" cy="5" r="1"/>
                                        <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
                                    </svg>
                                </div>
                                <h3 class="ev-type-title">Electric Bikes</h3>
                            </div>
                            <p class="ev-type-description">Hero Electric, Okinawa, Ampere & more</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <!-- Auth Modal -->
        <div id="authModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <button class="close-button" onclick="hideAuthModal()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <h2 id="modalTitle" class="modal-title">Welcome Back</h2>
                    <p id="modalDescription" class="modal-description">Sign in to your account</p>
                </div>
                <div class="modal-body">
                    <form id="authForm" class="auth-form">
                        <div class="form-group">
                            <label for="username">Username</label>
                            <input type="text" id="username" name="username" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" name="password" required minlength="6">
                        </div>
                        <button type="submit" class="submit-button">
                            <span id="submitText">Sign In</span>
                        </button>
                    </form>
                    <div class="auth-toggle">
                        <button id="toggleAuth" onclick="toggleAuthMode()">
                            Don't have an account? Sign up
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Toast Container -->
        <div id="toastContainer" class="toast-container"></div>
    `;
}

function getVehicleSelectionHTML() {
    return `
        <div class="app">
            <div class="vehicle-selection-page">
                <div class="container">
                    <div class="vehicle-header">
                        <div class="vehicle-icon">🚗</div>
                        <h1>Select Your Vehicle</h1>
                        <p>Choose your electric vehicle to get personalized recommendations</p>
                        <div class="user-info">Welcome, ${currentUser.username}!</div>
                    </div>

                    <div class="vehicle-types-section">
                        <h2>Vehicle Type</h2>
                        <div class="vehicle-types-grid" id="vehicleTypesGrid">
                            ${vehicleTypes.map(type => `
                                <div class="vehicle-type-card" data-type="${type.id}">
                                    <div class="vehicle-type-content">
                                        <div class="vehicle-emoji">${type.icon}</div>
                                        <h3>${type.name}</h3>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="vehicle-models-section" id="vehicleModelsSection" style="display: none;">
                        <h2>Select Model</h2>
                        <div class="vehicle-models-grid" id="vehicleModelsGrid">
                            <!-- Models will be populated by JavaScript -->
                        </div>
                    </div>

                    <div class="continue-section" id="continueSection" style="display: none;">
                        <button class="cta-button" onclick="continueWithVehicle()">
                            Continue to Dashboard
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12,5 19,12 12,19"></polyline>
                            </svg>
                        </button>
                    </div>

                    <div class="logout-section">
                        <button class="logout-button" onclick="logout()">Logout</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Toast Container -->
        <div id="toastContainer" class="toast-container"></div>
    `;
}

function getDashboardHTML() {
    const currentTab = localStorage.getItem('currentTab') || 'dashboard';
    
    return `
        <div class="app dashboard-app">
            <!-- Header -->
            <header class="dashboard-header">
                <div class="container">
                    <div class="header-content">
                        <div class="logo-section">
                            <div class="logo-icon">⚡</div>
                            <h1>ChargeSmart Bangalore</h1>
                            <span class="vehicle-badge">${currentVehicle.model}</span>
                        </div>
                        
                        <nav class="nav-tabs">
                            <button class="nav-tab ${currentTab === 'dashboard' ? 'active' : ''}" onclick="switchTab('dashboard')">
                                Dashboard
                            </button>
                            <button class="nav-tab ${currentTab === 'map' ? 'active' : ''}" onclick="switchTab('map')">
                                Bangalore Live Map
                            </button>
                            <button class="nav-tab ${currentTab === 'routing' ? 'active' : ''}" onclick="switchTab('routing')">
                                AI Route Planner
                            </button>
                        </nav>
                        
                        <div class="user-section">
                            <div class="user-info">
                                <div class="user-avatar">👤</div>
                                <span>${currentUser.username}</span>
                            </div>
                            <button class="logout-button" onclick="logout()">Logout</button>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Main Content -->
            <main class="dashboard-main">
                <div id="dashboardContent" class="tab-content ${currentTab === 'dashboard' ? 'active' : ''}">
                    ${getDashboardContentHTML()}
                </div>
                <div id="mapContent" class="tab-content ${currentTab === 'map' ? 'active' : ''}">
                    ${getMapContentHTML()}
                </div>
                <div id="routingContent" class="tab-content ${currentTab === 'routing' ? 'active' : ''}">
                    ${getRoutePlannerContentHTML()}
                </div>
            </main>

            <!-- Footer -->
            <footer class="dashboard-footer">
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-logo">
                            <div class="logo-icon">⚡</div>
                            <span>ChargeSmart Bangalore</span>
                        </div>
                        <p>AI-powered EV charging optimization for Bangalore's electric future.</p>
                        <p class="copyright">&copy; 2024 ChargeSmart. Powering Bangalore's EV Revolution.</p>
                    </div>
                </div>
            </footer>
        </div>

        <!-- Toast Container -->
        <div id="toastContainer" class="toast-container"></div>
    `;
}

function getDashboardContentHTML() {
    const batteryLevel = currentVehicle.batteryLevel;
    const usableRange = currentVehicle.usableRange;
    
    return `
        <div class="container dashboard-container">
            <div class="welcome-section">
                <h1>Hello, ${currentUser.username}! 👋</h1>
                <p>Welcome to your EV dashboard</p>
            </div>

            <div class="dashboard-grid">
                <!-- Vehicle Status -->
                <div class="dashboard-card vehicle-card">
                    <div class="card-header">
                        <h3>🚗 Your Vehicle</h3>
                    </div>
                    <div class="card-content">
                        <div class="vehicle-info">
                            <h4>${currentVehicle.model}</h4>
                            <p>${currentVehicle.vehicleType}</p>
                        </div>
                        
                        <div class="battery-section">
                            <div class="battery-header">
                                <span>Battery</span>
                                <span>${batteryLevel}%</span>
                            </div>
                            <div class="battery-bar">
                                <div class="battery-fill" style="width: ${batteryLevel}%"></div>
                            </div>
                            <p class="range-info">${usableRange} km remaining</p>
                        </div>

                        <div class="connector-info">
                            <span>Connector</span>
                            <span class="connector-badge">⚡ ${currentVehicle.connectorType}</span>
                        </div>
                    </div>
                </div>

                <!-- Nearby Stations -->
                <div class="dashboard-card stations-card">
                    <div class="card-header">
                        <h3>📍 Nearby Stations</h3>
                    </div>
                    <div class="card-content">
                        <div class="map-placeholder">
                            <div class="map-icon">🗺️</div>
                            <p>Interactive Map</p>
                            <p class="map-subtitle">Stations within 10km</p>
                        </div>
                        
                        <div class="stations-list">
                            ${stations.slice(0, 4).map(station => {
                                const stationData = getStationStatus(station, currentTime);
                                return `
                                    <div class="station-item" onclick="selectStation(${station.id})">
                                        <div class="station-info">
                                            <div class="station-status-dot ${stationData.status}"></div>
                                            <div>
                                                <h4>${station.name}</h4>
                                                <p>${station.distance}km • ${station.price}/kWh</p>
                                            </div>
                                        </div>
                                        <div class="station-availability">
                                            ${stationData.availability}/${station.total}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Station Details Modal -->
        <div id="stationModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="stationModalTitle">Station Details</h2>
                    <button class="close-button" onclick="closeStationModal()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="modal-body" id="stationModalBody">
                    <!-- Station details will be populated by JavaScript -->
                </div>
            </div>
        </div>
    `;
}

function getMapContentHTML() {
    return `
        <div class="container map-container">
            <div class="map-header">
                <h2>🧠 Smart Bangalore EV Map</h2>
                <p>Hybrid ML prediction system with real-time optimization and intelligent navigation</p>
            </div>

            <div class="map-controls">
                <div class="filter-section">
                    <h3>Smart Prediction Map</h3>
                    <div class="filter-buttons">
                        <button class="filter-btn active" data-filter="all" onclick="setFilter('all')">All</button>
                        <button class="filter-btn" data-filter="fast-charging" onclick="setFilter('fast-charging')">⚡ Fast</button>
                        <button class="filter-btn" data-filter="battery-swap" onclick="setFilter('battery-swap')">🔋 Swap</button>
                        <button class="filter-btn" data-filter="standard" onclick="setFilter('standard')">📍 Standard</button>
                    </div>
                </div>
            </div>

            <div class="map-grid">
                <div class="map-section">
                    <div class="map-container-wrapper">
                        <div id="interactive-map" class="interactive-map">
                            <div class="map-placeholder">
                                <div class="map-icon">🗺️</div>
                                <h3>Interactive Bangalore Map</h3>
                                <p>Real-time EV charging stations</p>
                                ${stations.map((station, index) => `
                                    <div class="map-pin" 
                                         style="top: ${25 + index * 15}%; left: ${30 + index * 20}%;"
                                         onclick="selectStation(${station.id})"
                                         data-station-id="${station.id}">
                                        ${station.type === 'fast-charging' ? '⚡' : station.type === 'battery-swap' ? '🔋' : '📍'}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="stations-sidebar">
                    <div class="search-section">
                        <input type="text" 
                               class="search-input" 
                               placeholder="Search stations..." 
                               onkeyup="handleSearch()"
                               id="stationSearch">
                    </div>
                    
                    <div class="stations-list" id="stationsList">
                        ${stations.map(station => {
                            const stationData = getStationStatus(station, currentTime);
                            return `
                                <div class="station-card" onclick="selectStation(${station.id})" data-station-id="${station.id}">
                                    <div class="station-header">
                                        <div>
                                            <div class="station-title">
                                                ${station.type === 'fast-charging' ? '⚡' : station.type === 'battery-swap' ? '🔋' : '📍'} 
                                                ${station.name}
                                            </div>
                                            <div class="station-location">${station.location}</div>
                                        </div>
                                        <div class="station-status">
                                            <div class="status-dot ${stationData.status}"></div>
                                            <div class="status-badge ${stationData.status}">${stationData.status}</div>
                                        </div>
                                    </div>
                                    
                                    <div class="availability-info">
                                        <div class="availability-text">
                                            <span>Availability</span>
                                            <span>${stationData.availability}/${station.total}</span>
                                        </div>
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${(stationData.availability / station.total) * 100}%"></div>
                                        </div>
                                    </div>
                                    
                                    <div class="station-stats">
                                        <div class="stat-item">
                                            <div class="stat-icon">🕐</div>
                                            <div class="stat-value">${stationData.waitTime}m</div>
                                            <div class="stat-label">Wait time</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="stat-icon">🧭</div>
                                            <div class="stat-value">${station.distance}km</div>
                                            <div class="stat-label">Distance</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="stat-icon">⚡</div>
                                            <div class="stat-value">₹${station.price}/hr</div>
                                            <div class="stat-label">Rate</div>
                                        </div>
                                    </div>
                                    
                                    <button class="navigate-btn" onclick="event.stopPropagation(); navigateToStation(${station.id})">
                                        🧭 Navigate Here
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getRoutePlannerContentHTML() {
    return `
        <div class="container route-planner-container">
            <div class="route-header">
                <h2>Bangalore Smart Route Planner</h2>
                <p>AI-powered routing with ML-based charging optimization across Bangalore</p>
            </div>

            <div class="route-planner-grid">
                <div class="route-input-section">
                    <div class="route-card">
                        <div class="card-header">
                            <h3>🗺️ Plan Your Bangalore Journey</h3>
                        </div>
                        <div class="card-content">
                            <div class="input-group">
                                <label>From</label>
                                <input type="text" value="Bangalore Central, Karnataka" disabled class="disabled-input">
                            </div>
                            <div class="input-group">
                                <label>To</label>
                                <input type="text" 
                                       placeholder="Enter Bangalore destination..." 
                                       id="routeDestination"
                                       list="bangalore-areas">
                                <datalist id="bangalore-areas">
                                    <option value="Koramangala">
                                    <option value="Electronic City">
                                    <option value="Whitefield">
                                    <option value="Indiranagar">
                                    <option value="JP Nagar">
                                    <option value="Hebbal">
                                    <option value="Marathahalli">
                                    <option value="Jayanagar">
                                    <option value="Banashankari">
                                    <option value="Bellandur">
                                    <option value="HSR Layout">
                                    <option value="BTM Layout">
                                    <option value="Malleswaram">
                                    <option value="Rajajinagar">
                                </datalist>
                            </div>
                            <button class="cta-button route-plan-btn" onclick="planRoute()">
                                🧠 AI Plan Route
                            </button>
                        </div>
                    </div>

                    <div class="status-card">
                        <div class="card-header">
                            <h3>🔋 Current Status</h3>
                        </div>
                        <div class="card-content">
                            <div class="battery-section">
                                <div class="battery-header">
                                    <span>Battery Level</span>
                                    <span>${currentVehicle.batteryLevel}%</span>
                                </div>
                                <div class="battery-bar">
                                    <div class="battery-fill" style="width: ${currentVehicle.batteryLevel}%"></div>
                                </div>
                                <p class="range-info">Estimated range: ${currentVehicle.usableRange} km</p>
                            </div>
                            <div class="location-info">
                                📍 Bangalore Central, Karnataka
                            </div>
                            <div class="ml-info">
                                ML Model: Traffic + Weather + Demand Analysis
                            </div>
                        </div>
                    </div>

                    <div class="conditions-card">
                        <div class="card-header">
                            <h3>Live Conditions</h3>
                        </div>
                        <div class="card-content">
                            <div class="condition-item">
                                <span>Traffic</span>
                                <span class="condition-badge moderate">Moderate</span>
                            </div>
                            <div class="condition-item">
                                <span>Weather</span>
                                <span class="condition-badge good">Clear ☀️</span>
                            </div>
                            <div class="condition-item">
                                <span>Air Quality</span>
                                <span class="condition-badge moderate">Moderate</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="route-results-section">
                    <div id="routeResults" class="route-results">
                        <div class="route-placeholder">
                            <div class="placeholder-icon">🧠</div>
                            <h3>AI Route Optimization Ready</h3>
                            <p>Enter your Bangalore destination for ML-powered route suggestions</p>
                            <div class="features-list">
                                • Real-time traffic analysis<br/>
                                • Charging station demand prediction<br/>
                                • Weather impact assessment
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Event setup functions
function setupHomePageEvents() {
    const form = document.getElementById('authForm');
    if (form) {
        form.addEventListener('submit', handleAuthSubmit);
    }
}

function setupVehicleSelectionEvents() {
    const typeCards = document.querySelectorAll('.vehicle-type-card');
    typeCards.forEach(card => {
        card.addEventListener('click', () => selectVehicleType(card.dataset.type));
    });
}

function setupDashboardEvents() {
    // Set up search input if it exists
    const searchInput = document.getElementById('stationSearch');
    if (searchInput) {
        searchInput.addEventListener('input', handleStationSearch);
    }
}

// Authentication handlers
async function handleAuthSubmit(e) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');

    try {
        const result = await authenticateUser(username, email, password);
        
        if (result.success) {
            currentUser = result.user;
            localStorage.setItem('chargeSmartUser', JSON.stringify(currentUser));
            handleSuccessfulAuth(result.user);
            
            // Show vehicle selection page
            setTimeout(() => {
                showVehicleSelection();
            }, 2000);
        } else {
            showToast(
                "Authentication failed",
                "Please check your credentials and try again.",
                "error"
            );
        }
    } catch (error) {
        showToast(
            "Error",
            "Something went wrong. Please try again.",
            "error"
        );
    } finally {
        setIsLoading(false);
    }
}

function setIsLoading(loading) {
    isLoading = loading;
    updateSubmitButton();
}

// Vehicle selection handlers
let selectedVehicleType = '';
let selectedVehicleModel = '';

function selectVehicleType(type) {
    selectedVehicleType = type;
    selectedVehicleModel = '';
    
    // Update UI
    document.querySelectorAll('.vehicle-type-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('selected');
    
    // Show models section
    const modelsSection = document.getElementById('vehicleModelsSection');
    const modelsGrid = document.getElementById('vehicleModelsGrid');
    
    modelsGrid.innerHTML = vehicleModels[type].map(model => `
        <div class="vehicle-model-card" data-model="${model.id}" onclick="selectVehicleModel('${model.id}')">
            <div class="model-header">
                <h4>${model.name}</h4>
                <p class="model-price">${model.price}</p>
            </div>
            <div class="model-details">
                <div class="model-spec">
                    <span>Range</span>
                    <span class="spec-badge">🔋 ${model.range} km</span>
                </div>
                <div class="model-spec">
                    <span>Connector</span>
                    <span class="spec-badge">⚡ ${model.connector}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    modelsSection.style.display = 'block';
    document.getElementById('continueSection').style.display = 'none';
}

function selectVehicleModel(modelId) {
    selectedVehicleModel = modelId;
    
    // Update UI
    document.querySelectorAll('.vehicle-model-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`[data-model="${modelId}"]`).classList.add('selected');
    
    // Show continue button
    document.getElementById('continueSection').style.display = 'block';
}

function continueWithVehicle() {
    if (!selectedVehicleType || !selectedVehicleModel) return;
    
    const selectedModel = vehicleModels[selectedVehicleType].find(m => m.id === selectedVehicleModel);
    if (!selectedModel) return;
    
    const batteryLevel = Math.floor(Math.random() * 45) + 40;
    const usableRange = Math.floor((batteryLevel / 100) * selectedModel.range);
    
    currentVehicle = {
        vehicleType: selectedVehicleType,
        model: selectedModel.name,
        range: selectedModel.range,
        connectorType: selectedModel.connector,
        batteryLevel,
        usableRange
    };
    
    localStorage.setItem('chargeSmartVehicle', JSON.stringify(currentVehicle));
    
    showToast(
        "Vehicle Selected! 🚗",
        `${selectedModel.name} configured successfully`,
        "success"
    );
    
    setTimeout(() => {
        showDashboard();
    }, 1500);
}

// Dashboard functions
function switchTab(tabName) {
    localStorage.setItem('currentTab', tabName);
    
    // Update tab buttons
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Content`).classList.add('active');
    
    // Initialize specific functionality for each tab
    if (tabName === 'map') {
        initializeMapTab();
    } else if (tabName === 'routing') {
        initializeRoutingTab();
    }
}

function selectStation(stationId) {
    const station = stations.find(s => s.id === stationId);
    if (!station) return;
    
    const stationData = getStationStatus(station, currentTime);
    
    document.getElementById('stationModalTitle').textContent = station.name;
    document.getElementById('stationModalBody').innerHTML = `
        <div class="station-details">
            <div class="detail-item">
                <span>Status</span>
                <span class="status-badge ${stationData.status}">
                    ${stationData.availability}/${station.total} available
                </span>
            </div>
            <div class="detail-item">
                <span>Distance</span>
                <span>${station.distance}km</span>
            </div>
            <div class="detail-item">
                <span>Price</span>
                <span>₹${station.price}/kWh</span>
            </div>
            <div class="detail-item">
                <span>Wait Time</span>
                <span>🕐 ${stationData.waitTime}m</span>
            </div>
            <div class="ai-prediction">
                <div class="prediction-header">
                    <span>🧠 AI Prediction:</span>
                </div>
                <p>Based on current patterns, this station will have ${Math.max(1, stationData.availability + 1)} ports available in 15 minutes.</p>
            </div>
            <button class="cta-button navigate-btn-modal" onclick="navigateToStation(${station.id})">
                🧭 Navigate
            </button>
        </div>
    `;
    
    document.getElementById('stationModal').classList.add('show');
}

function closeStationModal() {
    document.getElementById('stationModal').classList.remove('show');
}

function navigateToStation(stationId) {
    const station = stations.find(s => s.id === stationId);
    if (!station) return;
    
    showToast(
        "Navigation Started 🧭",
        `Navigating to ${station.name}`,
        "success"
    );
    
    closeStationModal();
}

function initializeMapTab() {
    // Update station list based on current filter
    updateStationsList();
}

function updateStationsList() {
    const stationsList = document.getElementById('stationsList');
    if (!stationsList) return;
    
    const filteredStations = stations.filter(station => {
        return currentFilter === 'all' || station.type === currentFilter;
    });
    
    stationsList.innerHTML = filteredStations.map(station => {
        const stationData = getStationStatus(station, currentTime);
        return `
            <div class="station-card" onclick="selectStation(${station.id})" data-station-id="${station.id}">
                <div class="station-header">
                    <div>
                        <div class="station-title">
                            ${station.type === 'fast-charging' ? '⚡' : station.type === 'battery-swap' ? '🔋' : '📍'} 
                            ${station.name}
                        </div>
                        <div class="station-location">${station.location}</div>
                    </div>
                    <div class="station-status">
                        <div class="status-dot ${stationData.status}"></div>
                        <div class="status-badge ${stationData.status}">${stationData.status}</div>
                    </div>
                </div>
                
                <div class="availability-info">
                    <div class="availability-text">
                        <span>Availability</span>
                        <span>${stationData.availability}/${station.total}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(stationData.availability / station.total) * 100}%"></div>
                    </div>
                </div>
                
                <div class="station-stats">
                    <div class="stat-item">
                        <div class="stat-icon">🕐</div>
                        <div class="stat-value">${stationData.waitTime}m</div>
                        <div class="stat-label">Wait time</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">🧭</div>
                        <div class="stat-value">${station.distance}km</div>
                        <div class="stat-label">Distance</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">⚡</div>
                        <div class="stat-value">₹${station.price}/hr</div>
                        <div class="stat-label">Rate</div>
                    </div>
                </div>
                
                <button class="navigate-btn" onclick="event.stopPropagation(); navigateToStation(${station.id})">
                    🧭 Navigate Here
                </button>
            </div>
        `;
    }).join('');
}

function handleStationSearch() {
    const searchTerm = document.getElementById('stationSearch').value.toLowerCase();
    const stationCards = document.querySelectorAll('.station-card');
    
    stationCards.forEach(card => {
        const stationName = card.querySelector('.station-title').textContent.toLowerCase();
        const stationLocation = card.querySelector('.station-location').textContent.toLowerCase();
        
        if (stationName.includes(searchTerm) || stationLocation.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function setFilter(filter) {
    currentFilter = filter;
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    // Update stations list
    updateStationsList();
}

// Route planner functions
function initializeRoutingTab() {
    // Initialize route planner
}

function planRoute() {
    const destination = document.getElementById('routeDestination').value.trim();
    if (!destination) {
        showToast("Please enter a destination", "Enter a Bangalore destination to plan your route", "error");
        return;
    }
    
    showToast("Planning Route 🧠", "AI is analyzing the best route...", "success");
    
    setTimeout(() => {
        showRouteResults(destination);
    }, 2000);
}

function showRouteResults(destination) {
    const routeResults = document.getElementById('routeResults');
    
    const totalDistance = 45.8;
    const estimatedTime = "1h 35m";
    const chargingStops = 2;
    const mlConfidence = 94;
    
    routeResults.innerHTML = `
        <div class="route-overview">
            <div class="route-header">
                <h3>🧠 AI Optimized Route to ${destination}</h3>
                <span class="confidence-badge">${mlConfidence}% Confidence</span>
            </div>
            
            <div class="route-stats">
                <div class="route-stat">
                    <div class="stat-value">${totalDistance}km</div>
                    <div class="stat-label">Distance</div>
                </div>
                <div class="route-stat">
                    <div class="stat-value">${estimatedTime}</div>
                    <div class="stat-label">Est. Time</div>
                </div>
                <div class="route-stat">
                    <div class="stat-value">${chargingStops}</div>
                    <div class="stat-label">Charging Stops</div>
                </div>
                <div class="route-stat">
                    <div class="stat-value">2.3kg</div>
                    <div class="stat-label">CO₂ Saved</div>
                </div>
            </div>
            
            <div class="route-conditions">
                <div class="condition">
                    <span>Traffic</span>
                    <span class="condition-badge moderate">Moderate</span>
                </div>
                <div class="condition">
                    <span>Weather</span>
                    <span class="condition-badge good">Clear</span>
                </div>
            </div>
            
            ${currentVehicle.batteryLevel < 50 ? `
                <div class="route-warning">
                    ⚠️ ML recommends charging before journey for optimal route efficiency
                </div>
            ` : ''}
        </div>
        
        <div class="charging-stops">
            <h4>🔋 ML-Optimized Charging Stops</h4>
            <div class="stops-list">
                <div class="stop-item">
                    <div class="stop-number">1</div>
                    <div class="stop-details">
                        <div class="stop-header">
                            <h5>Koramangala Hub</h5>
                            <div class="stop-badges">
                                <span class="ml-badge">ML Score: 87</span>
                                <span class="type-badge fast">⚡ Fast Charge</span>
                            </div>
                        </div>
                        <p class="stop-location">Koramangala, Bangalore</p>
                        <div class="stop-stats">
                            <span>🧭 8.5km</span>
                            <span>🕐 18min</span>
                            <span>💰 ₹135</span>
                            <span>👥 3 users</span>
                        </div>
                        <div class="stop-prediction">
                            Congestion: Low • Weather Impact: None
                        </div>
                    </div>
                </div>
                
                <div class="stop-item">
                    <div class="stop-number">2</div>
                    <div class="stop-details">
                        <div class="stop-header">
                            <h5>Electronic City Express</h5>
                            <div class="stop-badges">
                                <span class="ml-badge">ML Score: 92</span>
                                <span class="type-badge swap">🔋 Battery Swap</span>
                            </div>
                        </div>
                        <p class="stop-location">Electronic City, Bangalore</p>
                        <div class="stop-stats">
                            <span>🧭 22.3km</span>
                            <span>🕐 12min</span>
                            <span>💰 ₹180</span>
                            <span>👥 1 user</span>
                        </div>
                        <div class="stop-prediction">
                            Congestion: Medium • Weather Impact: None
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="alternative-routes">
            <h4>Alternative AI Routes</h4>
            <div class="alternatives-list">
                <div class="alternative-item">
                    <div class="alt-info">
                        <h5>ML Optimized Route</h5>
                        <p>1h 35m • 2 stops • 2.3kg CO₂ saved</p>
                    </div>
                    <div class="alt-badges">
                        <span class="ml-badge">ML: 94</span>
                        <span class="savings-badge">Best Overall</span>
                    </div>
                </div>
                <div class="alternative-item">
                    <div class="alt-info">
                        <h5>Fastest Route</h5>
                        <p>1h 28m • 1 stop • 1.8kg CO₂ saved</p>
                    </div>
                    <div class="alt-badges">
                        <span class="ml-badge">ML: 78</span>
                        <span class="savings-badge">Save 7min</span>
                    </div>
                </div>
                <div class="alternative-item">
                    <div class="alt-info">
                        <h5>Eco Route</h5>
                        <p>1h 52m • 3 stops • 3.1kg CO₂ saved</p>
                    </div>
                    <div class="alt-badges">
                        <span class="ml-badge">ML: 85</span>
                        <span class="savings-badge">Save ₹45</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="start-journey">
            <button class="cta-button" onclick="startNavigation('${destination}')">
                🧭 Start AI Navigation
            </button>
        </div>
    `;
}

function startNavigation(destination) {
    showToast(
        "Navigation Started! 🚗",
        `AI-optimized route to ${destination} activated`,
        "success"
    );
}

// Utility functions
function logout() {
    currentUser = null;
    currentVehicle = null;
    localStorage.removeItem('chargeSmartUser');
    localStorage.removeItem('chargeSmartVehicle');
    localStorage.removeItem('currentTab');
    
    showToast("Logged out", "You have been logged out successfully", "success");
    
    setTimeout(() => {
        showHomePage();
    }, 1500);
}

// Initialize application
function init() {
    // Check for existing user session
    const savedUser = localStorage.getItem('chargeSmartUser');
    const savedVehicle = localStorage.getItem('chargeSmartVehicle');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
    
    if (savedVehicle) {
        currentVehicle = JSON.parse(savedVehicle);
    }
    
    // Show appropriate page based on state
    showPage(currentPage);
}

// Start the application
document.addEventListener('DOMContentLoaded', init);