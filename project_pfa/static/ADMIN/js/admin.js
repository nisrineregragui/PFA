document.addEventListener('DOMContentLoaded', function() {
    // Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const adminContainer = document.querySelector('.admin-container');
    const adminSidebar = document.querySelector('.admin-sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            adminContainer.classList.toggle('sidebar-collapsed');
        });
    }
    
    // Mobile Sidebar Toggle
    const mobileToggle = document.querySelector('.sidebar-toggle');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            adminSidebar.classList.toggle('show');
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768 && 
            !adminSidebar.contains(event.target) && 
            !mobileToggle.contains(event.target) &&
            adminSidebar.classList.contains('show')) {
            adminSidebar.classList.remove('show');
        }
    });
    
    // Dropdown Toggle
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            if (dropdownMenu.classList.contains('show')) {
                dropdownMenu.classList.remove('show');
            }
        });
    }
    
    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    
    // Check if dark mode is enabled in localStorage
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
        updateDarkModeIcon(true);
    }
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            // Toggle dark mode
            if (body.classList.contains('dark-mode')) {
                body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'disabled');
                updateDarkModeIcon(false);
            } else {
                body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'enabled');
                updateDarkModeIcon(true);
            }
        });
    }
    
    // Update dark mode icon
    function updateDarkModeIcon(isDarkMode) {
        const icon = darkModeToggle.querySelector('i');
        if (isDarkMode) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
    
    // Date Picker Buttons
    const dateBtns = document.querySelectorAll('.date-btn');
    
    if (dateBtns.length > 0) {
        dateBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                dateBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // In a real application, this would update the dashboard data
                updateDashboardData(this.textContent.toLowerCase());
            });
        });
    }
    
    function updateDashboardData(timeframe) {
        console.log(`Updating dashboard data for timeframe: ${timeframe}`);
        // This would fetch new data and update the charts and stats
    }
    
    // Initialize Charts
    initializeCharts();
    
    // Action Buttons
    const actionBtns = document.querySelectorAll('.action-btn');
    
    if (actionBtns.length > 0) {
        actionBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.classList.contains('view-btn') ? 'view' :
                               this.classList.contains('edit-btn') ? 'edit' :
                               'delete';
                               
                const bookingId = this.closest('tr').querySelector('td:first-child').textContent;
                
                handleBookingAction(action, bookingId);
            });
        });
    }
    
    function handleBookingAction(action, bookingId) {
        console.log(`Handling ${action} action for booking ${bookingId}`);
        
        switch(action) {
            case 'view':
                // In a real application, this would open a modal or navigate to a details page
                alert(`Viewing details for booking ${bookingId}`);
                break;
            case 'edit':
                // In a real application, this would open an edit form
                alert(`Editing booking ${bookingId}`);
                break;
            case 'delete':
                // In a real application, this would show a confirmation dialog
                if (confirm(`Are you sure you want to delete booking ${bookingId}?`)) {
                    console.log(`Deleting booking ${bookingId}`);
                    // Delete the booking
                }
                break;
        }
    }
});

// Initialize Charts
function initializeCharts() {
    // Booking Statistics Chart
    const bookingChartEl = document.getElementById('bookingChart');
    
    if (bookingChartEl) {
        const bookingChart = new Chart(bookingChartEl, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Bookings',
                    data: [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70],
                    borderColor: '#573b8a',
                    backgroundColor: 'rgba(87, 59, 138, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    // Room Popularity Chart
    const roomChartEl = document.getElementById('roomChart');
    
    if (roomChartEl) {
        const roomChart = new Chart(roomChartEl, {
            type: 'bar',
            data: {
                labels: ['Studio Photo Pro', 'Podcast Studio', 'Coworking Space', 'Music Studio', 'Wellness Room'],
                datasets: [{
                    label: 'Bookings',
                    data: [42, 38, 35, 30, 25],
                    backgroundColor: [
                        'rgba(87, 59, 138, 0.7)',
                        'rgba(241, 180, 76, 0.7)',
                        'rgba(52, 195, 143, 0.7)',
                        'rgba(80, 165, 241, 0.7)',
                        'rgba(244, 106, 106, 0.7)'
                    ],
                    borderColor: [
                        'rgba(87, 59, 138, 1)',
                        'rgba(241, 180, 76, 1)',
                        'rgba(52, 195, 143, 1)',
                        'rgba(80, 165, 241, 1)',
                        'rgba(244, 106, 106, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
}