// document.addEventListener('DOMContentLoaded', function() {
//     // User Modal
//     const addUserBtn = document.getElementById('add-user-btn');
//     const userModal = document.getElementById('user-modal');
//     const closeModal = document.querySelector('.close-modal');
//     const cancelBtn = document.getElementById('cancel-btn');
//     const userForm = document.getElementById('user-form');
//     const modalTitle = document.getElementById('modal-title');
    
//     // User Image Preview
//     const userImage = document.getElementById('user-image');
//     const imagePreview = document.getElementById('image-preview');
    
//     // Filter Button
//     const filterBtn = document.getElementById('filter-btn');
    
//     // Open modal when Add New User button is clicked
//     if (addUserBtn) {
//         addUserBtn.addEventListener('click', function() {
//             modalTitle.textContent = 'Add New User';
//             userForm.reset();
//             imagePreview.innerHTML = '';
            
//             // Show password fields for new users
//             document.getElementById('user-password').required = true;
//             document.getElementById('user-confirm-password').required = true;
            
//             // Set default role to Regular User
//             document.getElementById('user-role').value = 'user';
            
//             // Set default status to Active
//             document.getElementById('user-status').value = 'active';
            
//             // Clear permissions for new users
//             const permissionCheckboxes = document.querySelectorAll('input[name="permissions"]');
//             permissionCheckboxes.forEach(checkbox => {
//                 checkbox.checked = false;
//             });
            
//             userModal.classList.add('show');
//         });
//     }
    
//     // Close modal when X button is clicked
//     if (closeModal) {
//         closeModal.addEventListener('click', function() {
//             userModal.classList.remove('show');
//         });
//     }
    
//     // Close modal when Cancel button is clicked
//     if (cancelBtn) {
//         cancelBtn.addEventListener('click', function() {
//             userModal.classList.remove('show');
//         });
//     }
    
//     // Close modal when clicking outside
//     window.addEventListener('click', function(event) {
//         if (event.target === userModal) {
//             userModal.classList.remove('show');
//         }
//     });
    
//     // Handle user image preview
//     if (userImage) {
//         userImage.addEventListener('change', function() {
//             const file = this.files[0];
//             if (file) {
//                 const reader = new FileReader();
                
//                 reader.onload = function(e) {
//                     imagePreview.innerHTML = `<img src="${e.target.result}" alt="User Preview">`;
//                 }
                
//                 reader.readAsDataURL(file);
//             }
//         });
//     }
    
//     // Handle user form submission
//     if (userForm) {
//         userForm.addEventListener('submit', function(e) {
//             e.preventDefault();
            
//             // Validate passwords match
//             const password = document.getElementById('user-password').value;
//             const confirmPassword = document.getElementById('user-confirm-password').value;
            
//             if (password && password !== confirmPassword) {
//                 alert('Passwords do not match!');
//                 return;
//             }
            
//             // In a real application, this would submit the form data to a server
//             alert('User saved successfully!');
            
//             // Close the modal
//             userModal.classList.remove('show');
//         });
//     }
    
//     // Handle edit user buttons
//     const editBtns = document.querySelectorAll('.edit-btn');
    
//     if (editBtns.length > 0) {
//         editBtns.forEach(btn => {
//             btn.addEventListener('click', function() {
//                 const row = this.closest('tr');
//                 const userId = row.querySelector('td:first-child').textContent;
//                 const userName = row.querySelector('.user-info span').textContent;
//                 const userEmail = row.querySelector('td:nth-child(3)').textContent;
//                 const userPhone = row.querySelector('td:nth-child(4)').textContent;
//                 const userRole = row.querySelector('td:nth-child(5)').textContent;
//                 const userStatus = row.querySelector('.status-badge').textContent.toLowerCase();
                
//                 // Set modal title
//                 modalTitle.textContent = 'Edit User';
                
//                 // Split name into first and last name (assuming format is "First Last")
//                 const nameParts = userName.split(' ');
//                 const firstName = nameParts[0];
//                 const lastName = nameParts.slice(1).join(' ');
                
//                 // Fill form with user data
//                 document.getElementById('user-first-name').value = firstName;
//                 document.getElementById('user-last-name').value = lastName;
//                 document.getElementById('user-email').value = userEmail;
//                 document.getElementById('user-phone').value = userPhone;
                
//                 // Password fields not required when editing
//                 document.getElementById('user-password').required = false;
//                 document.getElementById('user-confirm-password').required = false;
                
//                 // Set role
//                 const roleSelect = document.getElementById('user-role');
//                 for (let i = 0; i < roleSelect.options.length; i++) {
//                     if (roleSelect.options[i].text === userRole) {
//                         roleSelect.selectedIndex = i;
//                         break;
//                     }
//                 }
                
//                 // Set status
//                 const statusSelect = document.getElementById('user-status');
//                 for (let i = 0; i < statusSelect.options.length; i++) {
//                     if (statusSelect.options[i].text.toLowerCase() === userStatus) {
//                         statusSelect.selectedIndex = i;
//                         break;
//                     }
//                 }
                
//                 // Set permissions based on role (in a real application, you would fetch the actual permissions)
//                 const permissionCheckboxes = document.querySelectorAll('input[name="permissions"]');
//                 permissionCheckboxes.forEach(checkbox => {
//                     checkbox.checked = false;
//                 });
                
//                 if (userRole === 'Admin') {
//                     permissionCheckboxes.forEach(checkbox => {
//                         checkbox.checked = true;
//                     });
//                 } else if (userRole === 'Manager') {
//                     permissionCheckboxes.forEach(checkbox => {
//                         if (checkbox.value !== 'manage_settings') {
//                             checkbox.checked = true;
//                         }
//                     });
//                 }
                
//                 // In a real application, you would fetch the full user details from the server
//                 // and populate all form fields
                
//                 // Show the modal
//                 userModal.classList.add('show');
//             });
//         });
//     }
    
//     // Handle delete user buttons
//     const deleteBtns = document.querySelectorAll('.delete-btn');
    
//     if (deleteBtns.length > 0) {
//         deleteBtns.forEach(btn => {
//             btn.addEventListener('click', function() {
//                 const row = this.closest('tr');
//                 const userId = row.querySelector('td:first-child').textContent;
//                 const userName = row.querySelector('.user-info span').textContent;
                
//                 if (confirm(`Are you sure you want to delete user ${userName} (${userId})?`)) {
//                     // In a real application, this would send a delete request to the server
//                     alert(`User ${userName} deleted successfully!`);
                    
//                     // Remove the row from the table
//                     row.remove();
//                 }
//             });
//         });
//     }
    
//     // Handle view user buttons
//     const viewBtns = document.querySelectorAll('.view-btn');
    
//     if (viewBtns.length > 0) {
//         viewBtns.forEach(btn => {
//             btn.addEventListener('click', function() {
//                 const row = this.closest('tr');
//                 const userId = row.querySelector('td:first-child').textContent;
//                 const userName = row.querySelector('.user-info span').textContent;
                
//                 // In a real application, this would navigate to a user details page
//                 alert(`Viewing details for user ${userName} (${userId})`);
//             });
//         });
//     }
    
//     // Handle filter button
//     if (filterBtn) {
//         filterBtn.addEventListener('click', function() {
//             const roleFilter = document.getElementById('filter-role').value;
//             const statusFilter = document.getElementById('filter-status').value;
//             const startDateFilter = document.getElementById('filter-start-date').value;
//             const endDateFilter = document.getElementById('filter-end-date').value;
            
//             // In a real application, this would filter the users based on the selected criteria
//             console.log('Filtering users:', {
//                 role: roleFilter,
//                 status: statusFilter,
//                 startDate: startDateFilter,
//                 endDate: endDateFilter
//             });
            
//             alert('Filters applied!');
//         });
//     }
// });