document.addEventListener('DOMContentLoaded', function() {
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
    
 // Gallery Thumbnails
    const galleryThumbnails = document.querySelectorAll('.gallery-thumbnails img');
    const mainImage = document.querySelector('.main-image img');
    
    if (galleryThumbnails.length > 0 && mainImage) {
        galleryThumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function() {
                // Update main image
                mainImage.src = this.src.replace('150x100', '800x500');
                
                // Update active state
                galleryThumbnails.forEach(thumb => thumb.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
    
    // Room Booking Form Calculation
    const bookingForm = document.getElementById('room-booking-form');
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const hoursCount = document.getElementById('hours-count');
    const equipmentFee = document.getElementById('equipment-fee');
    const totalAmount = document.getElementById('total-amount');
    const equipmentCheckboxes = document.querySelectorAll('input[name="equipment"]');
    
    if (bookingForm && startTimeInput && endTimeInput) {
        // Set default times
        const now = new Date();
        const later = new Date(now);
        later.setHours(later.getHours() + 2);
        
        // Format times for input (HH:MM)
        startTimeInput.value = formatTime(now);
        endTimeInput.value = formatTime(later);
        
        // Calculate initial values
        calculateBooking();
        
        // Recalculate on time change
        startTimeInput.addEventListener('change', calculateBooking);
        endTimeInput.addEventListener('change', calculateBooking);
        
        // Recalculate when equipment is selected/deselected
        equipmentCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', calculateBooking);
        });
        
        function formatTime(date) {
            return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        }
        
        function calculateBooking() {
            // Parse times
            const startParts = startTimeInput.value.split(':');
            const endParts = endTimeInput.value.split(':');
            
            const startHours = parseInt(startParts[0]);
            const startMinutes = parseInt(startParts[1]);
            const endHours = parseInt(endParts[0]);
            const endMinutes = parseInt(endParts[1]);
            
            // Calculate duration in hours
            let durationHours = endHours - startHours;
            let durationMinutes = endMinutes - startMinutes;
            
            if (durationMinutes < 0) {
                durationHours--;
                durationMinutes += 60;
            }
            
            // Convert to decimal hours
            const duration = durationHours + (durationMinutes / 60);
            
            // Ensure positive duration
            if (duration <= 0) {
                // If end time is before start time, set end time to 2 hours after start time
                const newEndTime = new Date();
                newEndTime.setHours(startHours, startMinutes);
                newEndTime.setHours(newEndTime.getHours() + 2);
                
                endTimeInput.value = formatTime(newEndTime);
                calculateBooking();
                return;
            }
            
            // Round to nearest 0.5 hour
            const roundedDuration = Math.ceil(duration * 2) / 2;
            
            // Update display
            hoursCount.textContent = roundedDuration;
            
            // Calculate costs (assuming 50 per hour)
            const roomRate = 50;
            const subtotal = roomRate * roundedDuration;
            
            // Calculate equipment fees (example rates)
        
            let equipmentTotal = 0;
            equipmentCheckboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    switch(checkbox.value) {
                        case 'laptop':
                            equipmentTotal += 10 * roundedDuration;
                            break;
                        case 'microphone':
                            equipmentTotal += 5 * roundedDuration;
                            break;
                        case 'videoconf':
                            equipmentTotal += 15 * roundedDuration;
                            break;
                    }
                }
            });
            
            equipmentFee.textContent = `${equipmentTotal.toFixed(2)}mad`;
            totalAmount.textContent = `${(subtotal + equipmentTotal).toFixed(2)}mad`;
        }
        
        // Handle form submission
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real application, this would submit the booking data to a server
            alert('Reservation submitted successfully! You will receive a confirmation email shortly.');
            
            // Redirect to a confirmation page (in a real app)
            // window.location.href = 'booking-confirmation.html';
        });

    }
    // Mobile Menu Toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            
            // Toggle icon
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Calendar Functionality
    const calendarDays = document.querySelectorAll('.calendar-day:not(.disabled)');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const calendarMonthDisplay = document.getElementById('calendar-month');
    
    if (calendarDays.length > 0) {
        // Set today as selected by default
        const today = new Date().getDate();
        calendarDays.forEach(day => {
            if (parseInt(day.textContent) === today && !day.classList.contains('disabled')) {
                day.classList.add('selected');
            }
            
            day.addEventListener('click', function() {
                if (!this.classList.contains('busy')) {
                    // Remove selected class from all days
                    calendarDays.forEach(d => d.classList.remove('selected'));
                    
                    // Add selected class to clicked day
                    this.classList.add('selected');
                    
                    // Update booking date if form exists
                    const bookingDateInput = document.getElementById('booking-date');
                    if (bookingDateInput) {
                        const currentDate = new Date();
                        const selectedDay = parseInt(this.textContent);
                        currentDate.setDate(selectedDay);
                        
                        // Format date for input (YYYY-MM-DD)
                        const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
                        bookingDateInput.value = formattedDate;
                    }
                }
            });
        });
        
        // Month navigation
        if (prevMonthBtn && nextMonthBtn && calendarMonthDisplay) {
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            let currentMonthIndex = new Date().getMonth();
            let currentYear = new Date().getFullYear();
            
            updateCalendarMonth();
            
            prevMonthBtn.addEventListener('click', function() {
                currentMonthIndex--;
                if (currentMonthIndex < 0) {
                    currentMonthIndex = 11;
                    currentYear--;
                }
                updateCalendarMonth();
            });
            
            nextMonthBtn.addEventListener('click', function() {
                currentMonthIndex++;
                if (currentMonthIndex > 11) {
                    currentMonthIndex = 0;
                    currentYear++;
                }
                updateCalendarMonth();
            });
            
            function updateCalendarMonth() {
                calendarMonthDisplay.textContent = `${months[currentMonthIndex]} ${currentYear}`;
                
                // In a real application, this would fetch availability data for the selected month
                // and update the calendar days accordingly
            }
        }
    }
    
    // Filter functionality
    const filterBtn = document.getElementById('filter-btn');
    if (filterBtn) {
        filterBtn.addEventListener('click', function() {
            const typeFilter = document.getElementById('filter-type').value;
            const buildingFilter = document.getElementById('filter-building').value;
            const capacityFilter = document.getElementById('filter-capacity').value;
            const featuresFilter = document.getElementById('filter-features').value;
            
            // In a real application, this would filter the rooms based on the selected criteria
            console.log('Filtering rooms:', {
                type: typeFilter,
                building: buildingFilter,
                capacity: capacityFilter,
                features: featuresFilter
            });
            
            alert('Filters applied!');
        });
    }
    
    // Check availability button
    const checkAvailabilityBtn = document.getElementById('check-availability-btn');
    if (checkAvailabilityBtn) {
        checkAvailabilityBtn.addEventListener('click', function() {
            const dateFilter = document.getElementById('filter-date').value;
            const startTimeFilter = document.getElementById('filter-start-time').value;
            const endTimeFilter = document.getElementById('filter-end-time').value;
            
            // In a real application, this would check room availability for the selected time slot
            console.log('Checking availability:', {
                date: dateFilter,
                startTime: startTimeFilter,
                endTime: endTimeFilter
            });
            
            alert('Showing rooms available for the selected time slot!');
        });
    }
    
    // Testimonial Slider
    const testimonialDots = document.querySelectorAll('.testimonial-dots .dot');
    if (testimonialDots.length > 0) {
        testimonialDots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                // Update active dot
                testimonialDots.forEach(d => d.classList.remove('active'));
                this.classList.add('active');
                
                // In a real slider, this would change the visible testimonial
                // For this demo, we'll just show an alert
                alert(`Showing testimonial ${index + 1}`);
            });
        });
    }
    
    // Newsletter Form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email === '') {
                alert('Please enter your email address.');
                return;
            }
            
            // In a real application, this would submit the email to a server
            alert(`Thank you for subscribing with ${email}!`);
            
            // Clear the input
            emailInput.value = '';
        });
    }
});
document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.main-nav ul li a');
    
    // Add click event listener to each link
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        // Remove active class from all links
        navLinks.forEach(item => {
          item.parentElement.classList.remove('active');
        });
        
        // Add active class to the clicked link's parent li
        this.parentElement.classList.add('active');
      });
    });
    
    // Set active class based on current page URL
    const currentPage = window.location.pathname.split('/').pop();
    
    navLinks.forEach(link => {
      const linkHref = link.getAttribute('href');
      if (linkHref === currentPage) {
        // Remove active from all
        navLinks.forEach(item => {
          item.parentElement.classList.remove('active');
        });
        // Add active to current
        link.parentElement.classList.add('active');
      }
    });
  });
