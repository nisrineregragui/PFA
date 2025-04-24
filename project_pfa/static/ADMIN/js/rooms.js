document.addEventListener('DOMContentLoaded', function() {
    // Room Modal
    const addRoomBtn = document.getElementById('add-room-btn');
    const roomModal = document.getElementById('room-modal');
    const closeModal = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const roomForm = document.getElementById('room-form');
    const modalTitle = document.getElementById('modal-title');
    
    // Room Image Preview
    const roomImage = document.getElementById('room-image');
    const imagePreview = document.getElementById('image-preview');
    
    // Filter Button
    const filterBtn = document.getElementById('filter-btn');
    
    // Open modal when Add New Room button is clicked
    if (addRoomBtn) {
        addRoomBtn.addEventListener('click', function() {
            modalTitle.textContent = 'Add New Room';
            roomForm.reset();
            imagePreview.innerHTML = '';
            roomModal.classList.add('show');
        });
    }
    
    // Close modal when X button is clicked
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            roomModal.classList.remove('show');
        });
    }
    
    // Close modal when Cancel button is clicked
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            roomModal.classList.remove('show');
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === roomModal) {
            roomModal.classList.remove('show');
        }
    });
    
    // Handle room image preview
    if (roomImage) {
        roomImage.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Room Preview">`;
                }
                
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Handle room form submission
    if (roomForm) {
        roomForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real application, this would submit the form data to a server
            alert('Room saved successfully!');
            
            // Close the modal
            roomModal.classList.remove('show');
        });
    }
    
    // Handle edit room buttons
    const editBtns = document.querySelectorAll('.edit-btn');
    
    if (editBtns.length > 0) {
        editBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const row = this.closest('tr');
                const roomId = row.querySelector('td:first-child').textContent;
                const roomName = row.querySelector('td:nth-child(3)').textContent;
                const roomType = row.querySelector('td:nth-child(4)').textContent;
                const roomBuilding = row.querySelector('td:nth-child(5)').textContent;
                const roomCapacity = row.querySelector('td:nth-child(6)').textContent.split(' ')[0];
                const roomPrice = row.querySelector('td:nth-child(7)').textContent.split(' ')[0];
                const roomStatus = row.querySelector('.status-badge').textContent.toLowerCase();
                
                // Set modal title
                modalTitle.textContent = 'Edit Room';
                
                // Fill form with room data
                document.getElementById('room-name').value = roomName;
                
                // Set select values (in a real application, you would map the text values to option values)
                const typeSelect = document.getElementById('room-type');
                for (let i = 0; i < typeSelect.options.length; i++) {
                    if (typeSelect.options[i].text.includes(roomType)) {
                        typeSelect.selectedIndex = i;
                        break;
                    }
                }
                
                const buildingSelect = document.getElementById('room-building');
                for (let i = 0; i < buildingSelect.options.length; i++) {
                    if (buildingSelect.options[i].text.includes(roomBuilding)) {
                        buildingSelect.selectedIndex = i;
                        break;
                    }
                }
                
                document.getElementById('room-capacity').value = roomCapacity;
                document.getElementById('room-price').value = roomPrice;
                
                const statusSelect = document.getElementById('room-status');
                for (let i = 0; i < statusSelect.options.length; i++) {
                    if (statusSelect.options[i].text.toLowerCase() === roomStatus) {
                        statusSelect.selectedIndex = i;
                        break;
                    }
                }
                
                // In a real application, you would fetch the full room details from the server
                // and populate all form fields
                
                // Show the modal
                roomModal.classList.add('show');
            });
        });
    }
    
    // Handle delete room buttons
    const deleteBtns = document.querySelectorAll('.delete-btn');
    
    if (deleteBtns.length > 0) {
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const row = this.closest('tr');
                const roomId = row.querySelector('td:first-child').textContent;
                const roomName = row.querySelector('td:nth-child(3)').textContent;
                
                if (confirm(`Are you sure you want to delete ${roomName} (${roomId})?`)) {
                    // In a real application, this would send a delete request to the server
                    alert(`Room ${roomName} deleted successfully!`);
                    
                    // Remove the row from the table
                    row.remove();
                }
            });
        });
    }
    
    // Handle view room buttons
    const viewBtns = document.querySelectorAll('.view-btn');
    
    if (viewBtns.length > 0) {
        viewBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const row = this.closest('tr');
                const roomId = row.querySelector('td:first-child').textContent;
                const roomName = row.querySelector('td:nth-child(3)').textContent;
                
                // In a real application, this would navigate to a room details page
                alert(`Viewing details for ${roomName} (${roomId})`);
            });
        });
    }
    
    // Handle filter button
    if (filterBtn) {
        filterBtn.addEventListener('click', function() {
            const typeFilter = document.getElementById('filter-type').value;
            const buildingFilter = document.getElementById('filter-building').value;
            const statusFilter = document.getElementById('filter-status').value;
            
            // In a real application, this would filter the rooms based on the selected criteria
            console.log('Filtering rooms:', {
                type: typeFilter,
                building: buildingFilter,
                status: statusFilter
            });
            
            alert('Filters applied!');
        });
    }
});