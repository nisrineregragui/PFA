document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const hoursCountElement = document.getElementById('hours-count');
    const equipmentFeeElement = document.getElementById('equipment-fee');
    const totalAmountElement = document.getElementById('total-amount');
    const equipmentCheckboxes = document.querySelectorAll('input[name="equipment"]');
    const bookingForm = document.getElementById('room-booking-form');
    
    // Room hourly rate (will be set in the template)
    const hourlyRate = window.roomHourlyRate || 0;
    
    // Equipment prices (will be set in the template)
    const equipmentPrices = window.equipmentPrices || {};
    
    // Function to calculate total price
    function calculatePrice() {
        // Get start and end times
        const startTime = startTimeInput.value;
        const endTime = endTimeInput.value;
        
        if (!startTime || !endTime) {
            return;
        }
        
        // Calculate hours
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        
        // Handle case where end time is on the next day
        let hours = (end - start) / (1000 * 60 * 60);
        if (hours < 0) {
            hours += 24;
        }
        
        // Update hours display
        hoursCountElement.textContent = hours.toFixed(1);
        
        // Calculate base price
        const basePrice = hourlyRate * hours;
        
        // Calculate equipment fee
        let equipmentFee = 0;
        equipmentCheckboxes.forEach(checkbox => {
            if (checkbox.checked && equipmentPrices[checkbox.value]) {
                equipmentFee += equipmentPrices[checkbox.value] * hours;
            }
        });
        
        // Update equipment fee display
        equipmentFeeElement.textContent = equipmentFee.toFixed(2) + 'mad';
        
        // Update total amount
        totalAmountElement.textContent = (basePrice + equipmentFee).toFixed(2) + 'mad';
    }
    
    // Add event listeners
    if (startTimeInput && endTimeInput) {
        startTimeInput.addEventListener('change', calculatePrice);
        endTimeInput.addEventListener('change', calculatePrice);
        
        // Set default times if they're empty
        if (!startTimeInput.value) {
            const now = new Date();
            startTimeInput.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        }
        
        if (!endTimeInput.value) {
            const later = new Date();
            later.setHours(later.getHours() + 2);
            endTimeInput.value = `${String(later.getHours()).padStart(2, '0')}:${String(later.getMinutes()).padStart(2, '0')}`;
        }
        
        // Calculate initial price
        calculatePrice();
    }
    
    if (equipmentCheckboxes) {
        equipmentCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', calculatePrice);
        });
    }
    
  
});