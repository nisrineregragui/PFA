// document.addEventListener('DOMContentLoaded', function() {
//     // Booking Modal
//     const addBookingBtn = document.getElementById('add-booking-btn');
//     const bookingModal = document.getElementById('booking-modal');
//     const closeModal = document.querySelector('.close-modal');
//     const cancelBtn = document.getElementById('cancel-btn');
//     const bookingForm = document.getElementById('booking-form');
//     const modalTitle = document.getElementById('modal-title');
    
//     // Booking calculation elements
//     const startTimeInput = document.getElementById('booking-start-time');
//     const endTimeInput = document.getElementById('booking-end-time');
//     const hoursCount = document.getElementById('hours-count');
//     const equipmentFee = document.getElementById('equipment-fee');
//     const totalAmount = document.getElementById('total-amount');
//     const equipmentCheckboxes = document.querySelectorAll('input[name="equipment"]');
//     const roomSelect = document.getElementById('booking-room');
    
//     // Filter Button
//     const filterBtn = document.getElementById('filter-btn');
    
//     // Open modal when Add New Booking button is clicked
//     if (addBookingBtn) {
//         addBookingBtn.addEventListener('click', function() {
//             modalTitle.textContent = 'Add New Booking';
//             bookingForm.reset();
            
//             // Set default date to today
//             const today = new Date().toISOString().split('T')[0];
//             document.getElementById('booking-date').value = today;
            
//             // Set default times
//             const now = new Date();
//             const later = new Date(now);
//             later.setHours(later.getHours() + 2);
            
//             // Format times for input (HH:MM)
//             startTimeInput.value = formatTime(now);
//             endTimeInput.value = formatTime(later);
            
//             // Calculate initial values
//             calculateBooking();
            
//             bookingModal.classList.add('show');
//         });
//     }
    
//     // Close modal when X button is clicked
//     if (closeModal) {
//         closeModal.addEventListener('click', function() {
//             bookingModal.classList.remove('show');
//         });
//     }
    
//     // Close modal when Cancel button is clicked
//     if (cancelBtn) {
//         cancelBtn.addEventListener('click', function() {
//             bookingModal.classList.remove('show');
//         });
//     }
    
//     // Close modal when clicking outside
//     window.addEventListener('click', function(event) {
//         if (event.target === bookingModal) {
//             bookingModal.classList.remove('show');
//         }
//     });
    
//     // Handle booking form submission - MODIFIED TO NOT PREVENT DEFAULT
//     if (bookingForm) {
//         bookingForm.addEventListener('submit', function(e) {
//             // Do not prevent default - let the form submit normally
//             // e.preventDefault();
            
//             // You can still show a loading indicator or do other UI updates
//             // but don't stop the form submission
            
//             // REMOVED: alert('Booking saved successfully!');
//             // REMOVED: bookingModal.classList.remove('show');
//         });
//     }
    
//     // Handle booking calculation
//     if (startTimeInput && endTimeInput) {
//         // Recalculate on time change
//         startTimeInput.addEventListener('change', calculateBooking);
//         endTimeInput.addEventListener('change', calculateBooking);
        
//         // Recalculate when equipment is selected/deselected
//         equipmentCheckboxes.forEach(checkbox => {
//             checkbox.addEventListener('change', calculateBooking);
//         });
        
//         // Recalculate when room changes
//         if (roomSelect) {
//             roomSelect.addEventListener('change', calculateBooking);
//         }
//     }
    
//     function formatTime(date) {
//         return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
//     }
    
//     function calculateBooking() {
//         // Parse times
//         const startParts = startTimeInput.value.split(':');
//         const endParts = endTimeInput.value.split(':');
        
//         const startHours = parseInt(startParts[0]);
//         const startMinutes = parseInt(startParts[1]);
//         const endHours = parseInt(endParts[0]);
//         const endMinutes = parseInt(endParts[1]);
        
//         // Calculate duration in hours
//         let durationHours = endHours - startHours;
//         let durationMinutes = endMinutes - startMinutes;
        
//         if (durationMinutes < 0) {
//             durationHours--;
//             durationMinutes += 60;
//         }
        
//         // Convert to decimal hours
//         const duration = durationHours + (durationMinutes / 60);
        
//         // Ensure positive duration
//         if (duration <= 0) {
//             // If end time is before start time, set end time to 2 hours after start time
//             const newEndTime = new Date();
//             newEndTime.setHours(startHours, startMinutes);
//             newEndTime.setHours(newEndTime.getHours() + 2);
            
//             endTimeInput.value = formatTime(newEndTime);
//             calculateBooking();
//             return;
//         }
        
//         // Round to nearest 0.5 hour
//         const roundedDuration = Math.ceil(duration * 2) / 2;
        
//         // Update display
//         hoursCount.textContent = roundedDuration;
        
//         // Get room rate based on selected room
//         let roomRate = 150; // Default rate
        
//         if (roomSelect && roomSelect.value) {
//             switch(roomSelect.value) {
//                 case 'studioPhotoPro':
//                     roomRate = 150;
//                     break;
//                 case 'podcastStudio':
//                     roomRate = 400;
//                     break;
//                 case 'coworkingSpace':
//                     roomRate = 300;
//                     break;
//                 case 'projectionRoom':
//                     roomRate = 500;
//                     break;
//                 case 'cafeSpace':
//                     roomRate = 300;
//                     break;
//                 case 'musicStudio':
//                     roomRate = 500;
//                     break;
//                 case 'wellnessRoom':
//                     roomRate = 400;
//                     break;
//                 case 'diyWorkshop':
//                     roomRate = 120;
//                     break;
//             }
//         }
        
//         const subtotal = roomRate * roundedDuration;
        
//         // Calculate equipment fees
//         let equipmentTotal = 0;
//         equipmentCheckboxes.forEach(checkbox => {
//             if (checkbox.checked) {
//                 switch(checkbox.value) {
//                     case 'Professional Acoustics':
//                         equipmentTotal += 50 * roundedDuration;
//                         break;
//                     case 'Wireless Microphones':
//                         equipmentTotal += 50 * roundedDuration;
//                         break;
//                     case 'Live Recording Options':
//                         equipmentTotal += 150 * roundedDuration;
//                         break;
//                 }
//             }
//         });
        
//         equipmentFee.textContent = `${equipmentTotal} MAD`;
//         totalAmount.textContent = `${(subtotal + equipmentTotal)} MAD`;
//     }
    
//     // Handle edit booking buttons
//     const editBtns = document.querySelectorAll('.edit-btn');
    
//     if (editBtns.length > 0) {
//         editBtns.forEach(btn => {
//             btn.addEventListener('click', function() {
//                 const row = this.closest('tr');
//                 const bookingId = row.querySelector('td:first-child').textContent;
//                 const userName = row.querySelector('.user-info span').textContent;
//                 const roomName = row.querySelector('td:nth-child(3)').textContent;
//                 const bookingDate = row.querySelector('td:nth-child(4)').textContent;
//                 const bookingTime = row.querySelector('td:nth-child(5)').textContent;
//                 const bookingStatus = row.querySelector('.status-badge').textContent.toLowerCase();
                
//                 // Set modal title
//                 modalTitle.textContent = 'Edit Booking';
                
//                 // Fill form with booking data
//                 // Set user select
//                 const userSelect = document.getElementById('booking-user');
//                 for (let i = 0; i < userSelect.options.length; i++) {
//                     if (userSelect.options[i].text === userName) {
//                         userSelect.selectedIndex = i;
//                         break;
//                     }
//                 }
                
//                 // Set room select
//                 const roomSelect = document.getElementById('booking-room');
//                 for (let i = 0; i < roomSelect.options.length; i++) {
//                     if (roomSelect.options[i].text === roomName) {
//                         roomSelect.selectedIndex = i;
//                         break;
//                     }
//                 }
                
//                 // Set date
//                 document.getElementById('booking-date').value = bookingDate;
                
//                 // Set times
//                 const times = bookingTime.split(' - ');
//                 document.getElementById('booking-start-time').value = times[0];
//                 document.getElementById('booking-end-time').value = times[1];
                
//                 // Set status
//                 const statusSelect = document.getElementById('booking-status');
//                 for (let i = 0; i < statusSelect.options.length; i++) {
//                     if (statusSelect.options[i].text.toLowerCase() === bookingStatus) {
//                         statusSelect.selectedIndex = i;
//                         break;
//                     }
//                 }
                
//                 // In a real application, you would fetch the full booking details from the server
//                 // and populate all form fields
                
//                 // Calculate booking
//                 calculateBooking();
                
//                 // Show the modal
//                 bookingModal.classList.add('show');
//             });
//         });
//     }
    
//     // Handle delete booking buttons
//     const deleteBtns = document.querySelectorAll('.delete-btn');
    
//     if (deleteBtns.length > 0) {
//         deleteBtns.forEach(btn => {
//             btn.addEventListener('click', function() {
//                 const row = this.closest('tr');
//                 const bookingId = row.querySelector('td:first-child').textContent;
//                 const userName = row.querySelector('.user-info span').textContent;
                
//                 if (confirm(`Are you sure you want to delete booking ${bookingId} for ${userName}?`)) {
//                     // In a real application, this would send a delete request to the server
//                     // alert(`Booking ${bookingId} deleted successfully!`);
                    
//                     // Remove the row from the table
//                     row.remove();
//                 }
//             });
//         });
//     }
    
//     // Handle view booking buttons
//     const viewBtns = document.querySelectorAll('.view-btn');
    
//     if (viewBtns.length > 0) {
//         viewBtns.forEach(btn => {
//             btn.addEventListener('click', function() {
//                 const row = this.closest('tr');
//                 const bookingId = row.querySelector('td:first-child').textContent;
//                 const userName = row.querySelector('.user-info span').textContent;
                
//                 // In a real application, this would navigate to a booking details page
//                 // alert(`Viewing details for booking ${bookingId} by ${userName}`);
//             });
//         });
//     }
    
//     // Handle filter button
//     if (filterBtn) {
//         filterBtn.addEventListener('click', function() {
//             const startDateFilter = document.getElementById('filter-start-date').value;
//             const endDateFilter = document.getElementById('filter-end-date').value;
//             const roomFilter = document.getElementById('filter-room').value;
//             const statusFilter = document.getElementById('filter-status').value;
            
//             // In a real application, this would filter the bookings based on the selected criteria
//             console.log('Filtering bookings:', {
//                 startDate: startDateFilter,
//                 endDate: endDateFilter,
//                 status: statusFilter
//             });
            
//             // alert('Filters applied!');
//         });
//     }
// });