from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login as auth_login, logout
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .models import User, Room, Equipment, Reservation, ReservationHistory
from django.core.paginator import Paginator
from .forms import ReservationForm, ReservationValidationForm, RoomForm, UserEditForm
from django.http import JsonResponse
from django.utils import timezone
from datetime import datetime, timedelta, date
import calendar
import json
from decimal import Decimal

def index(request):
    rooms = Room.objects.all()[:3]
    return render(request, 'CLIENT/index.html',{'rooms':rooms})

def room_details(request):
    return render(request, 'CLIENT/room-details.html')



def dashboard(request):
    return render(request, 'ADMIN/dashboard.html')

def rooms_admin(request):
    if request.method == "POST":
        form = RoomForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('rooms')
    else:
        form = RoomForm()

    rooms = Room.objects.all()
    return render(request, 'admin/rooms.html', {'rooms': rooms, 'form': form})

def rooms_view(request):
    rooms = Room.objects.all()  
    return render(request, 'CLIENT/rooms.html', {'rooms': rooms})

def users(request):
    return render(request, 'ADMIN/users.html')

def login_page(request):
    """Render the login page"""
    if request.user.is_authenticated:
        return redirect('index')
    return render(request, 'login.html')

def login_view(request):
    """Handle login form submission"""
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        # Try to authenticate with username
        user = authenticate(request, username=username, password=password)
        
        # If authentication failed, try using the email as username
        if user is None:
            try:
                user_obj = User.objects.get(email=username)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None
        
        if user is not None:
            auth_login(request, user)
            return redirect('index')
        else:
            messages.error(request, "Invalid username or password", extra_tags='login')
            
    return render(request, 'login.html')

def signup_view(request):
    """Handle signup form submission"""
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        first_name = request.POST.get('first_name')
        cin = request.POST.get('cin')
        phone = request.POST.get('phone')

        if User.objects.filter(username=username).exists():
            messages.error(request, "Username already taken.", extra_tags='signup')
        elif User.objects.filter(email=email).exists():
            messages.error(request, "Email already in use.", extra_tags='signup')
        else:
            user = User.objects.create_user(username=username, email=email, password=password, first_name=first_name, cin=cin, phone=phone)
            user.save()
            auth_login(request, user)
            return redirect('login')
            
    return render(request, 'login.html')

def logout_view(request):
    """Handle user logout"""
    logout(request)
    return redirect('login')

def users(request):
    all_users = User.objects.all()
    
    # Pagination
    paginator = Paginator(all_users, 10)  # Show 10 users per page
    page_number = request.GET.get('page', 1)
    users_page = paginator.get_page(page_number)
    
    context = {
        'users': users_page
    }
    
    return render(request, 'ADMIN/users.html', context)

def add_room(request):
    if request.method == 'POST':
        form = RoomForm(request.POST, request.FILES)
        if form.is_valid():
            room = form.save(commit=False)  # Do not save yet, as we need to handle m2m fields
            room.save()  # Save the Room object first

            # Now, save the many-to-many related fields (assuming these are m2m fields)
            form.save_m2m()  # This saves the m2m relationships, like equipment

            return redirect('rooms_admin')  # Redirect after successful form submission
        else:
            print(form.errors)  # For debugging purposes, check the form errors
    else:
        form = RoomForm()

    return render(request, 'ADMIN/rooms.html', {'form': form})

def rooms(request):
    rooms = Room.objects.all()  
    return render(request, 'CLIENT/rooms.html', {'rooms': rooms})

def check_room_availability(room_id, date_str, start_time_str, end_time_str):
    """Check if a room is available for a specific date and time range"""
    try:
        room = Room.objects.get(id=room_id)
        
        # Check if room is available (not in maintenance or unavailable)
        if room.disponibility != 'dispo':
            return False, "Room is currently not available for booking."
        
        # Parse date and times
        booking_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        start_time = datetime.strptime(start_time_str, '%H:%M').time()
        end_time = datetime.strptime(end_time_str, '%H:%M').time()
        
        # Check if date is in the past
        if booking_date < timezone.now().date():
            return False, "Cannot book a date in the past."
        
        # Check if end time is after start time
        if end_time <= start_time:
            return False, "End time must be after start time."
        
        # Check for overlapping reservations
        overlapping_reservations = Reservation.objects.filter(
            room=room,
            date=booking_date,
            status__in=['pending', 'confirmed']
        )
        
        for reservation in overlapping_reservations:
            if (start_time < reservation.end_time and end_time > reservation.start_time):
                return False, "This time slot overlaps with an existing reservation."
        
        return True, "Room is available for booking."
    
    except Room.DoesNotExist:
        return False, "Room not found."
    except Exception as e:
        return False, str(e)

def generate_calendar_data(year, month, room_id):
    """Generate calendar data for a specific month and room"""
    # Get the first day of the month and the number of days
    first_day = date(year, month, 1)
    _, num_days = calendar.monthrange(year, month)
    
    # Get the day of the week for the first day (0 is Monday in Python's calendar)
    first_weekday = first_day.weekday()
    
    # Adjust for Sunday as the first day of the week (0 is Sunday in JavaScript)
    first_weekday = (first_weekday + 1) % 7
    
    # Get all reservations for this room in this month
    room = Room.objects.get(id=room_id)
    start_date = first_day
    end_date = date(year, month, num_days)
    
    reservations = Reservation.objects.filter(
        room=room,
        date__gte=start_date,
        date__lte=end_date,
        status__in=['pending', 'confirmed']
    )
    
    # Create a set of dates that have reservations
    reserved_dates = set()
    for reservation in reservations:
        reserved_dates.add(reservation.date)
    
    # Generate calendar data
    calendar_data = {
        'firstWeekday': first_weekday,
        'numDays': num_days,
        'year': year,
        'month': month,
        'monthName': calendar.month_name[month],
        'reservedDates': [d.strftime('%Y-%m-%d') for d in reserved_dates]
    }
    
    return calendar_data

def get_time_slots(room_id, date_str):
    """Get all reserved time slots for a room on a specific date"""
    try:
        room = Room.objects.get(id=room_id)
        booking_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        
        # Get all reservations for this room on this date
        reservations = Reservation.objects.filter(
            room=room,
            date=booking_date,
            status__in=['pending', 'confirmed']
        ).order_by('start_time')
        
        # Format the time slots
        time_slots = []
        for reservation in reservations:
            time_slots.append({
                'start_time': reservation.start_time.strftime('%H:%M'),
                'end_time': reservation.end_time.strftime('%H:%M')
            })
        
        return time_slots
    
    except Room.DoesNotExist:
        return []
    except Exception:
        return []

def calculate_price_internal(room, start_time_str, end_time_str, equipment_ids):
    """Internal function to calculate the total price for a reservation"""
    try:
        # Parse times
        start_time = datetime.strptime(start_time_str, '%H:%M')
        end_time = datetime.strptime(end_time_str, '%H:%M')
        
        # Handle case where end time is earlier than start time
        if end_time <= start_time:
            return {
                'base_price': 0,
                'equipment_price': 0,
                'total_price': 0,
                'hours': 0
            }
        
        # Calculate hours
        duration = end_time - start_time
        hours = duration.seconds / 3600
        
        # Calculate base price
        base_price = room.hourly_rate * Decimal(str(hours))
        
        # Calculate equipment price
        equipment_price = Decimal('0.00')
        if equipment_ids:
            for eq_id in equipment_ids:
                try:
                    equipment = Equipment.objects.get(id=int(eq_id))
                    room_equipment = room.roomequipment_set.filter(equipment=equipment).first()
                    if room_equipment and room_equipment.price:
                        equipment_price += room_equipment.price * Decimal(str(hours))
                except (Equipment.DoesNotExist, ValueError):
                    pass
        
        total_price = base_price + equipment_price
        
        return {
            'base_price': float(base_price),
            'equipment_price': float(equipment_price),
            'total_price': float(total_price),
            'hours': hours
        }
    except Exception as e:
        # Log the error
        print(f"Error calculating price: {str(e)}")
        return {
            'base_price': 0,
            'equipment_price': 0,
            'total_price': 0,
            'hours': 0,
            'error': str(e)
        }

def calculate_price(request, room_id):
    """Calculate price based on form inputs and return updated page"""
    room = get_object_or_404(Room, id=room_id)
    
    # Get form data
    booking_date = request.GET.get('booking-date')
    start_time = request.GET.get('start-time')
    end_time = request.GET.get('end-time')
    equipment_ids = request.GET.getlist('equipment')
    
    # Default values for context
    price_info = {
        'base_price': 0,
        'equipment_price': 0,
        'total_price': 0,
        'hours': 0
    }
    
    # Calculate price if we have start and end times
    if start_time and end_time:
        try:
            price_info = calculate_price_internal(room, start_time, end_time, equipment_ids)
        except Exception as e:
            messages.error(request, f"Error calculating price: {str(e)}")
    
    # Get other necessary context data
    similar_rooms = Room.objects.filter(type=room.type).exclude(id=room.id)[:3]
    today = timezone.now().date()
    
    # Get current month and year for the calendar
    current_month = today.month
    current_year = today.year
    
    # Generate calendar data
    calendar_data = generate_calendar_data(current_year, current_month, room_id)
    
    # Get selected date and time slots
    selected_date = request.GET.get('booking-date')
    time_slots = []
    if selected_date:
        time_slots = get_time_slots(room_id, selected_date)
    
    context = {
        'room': room,
        'similar_rooms': similar_rooms,
        'today': today,
        'calendar_data': calendar_data,
        'selected_date': selected_date,
        'time_slots': time_slots,
        'price_info': price_info,
        'selected_start_time': start_time,
        'selected_end_time': end_time,
        'selected_equipment_ids': equipment_ids,
    }
    
    return render(request, 'CLIENT/room-details.html', context)

# Fix for the room_details view function in views.py

def room_details(request, room_id):
    room = get_object_or_404(Room, id=room_id)
    similar_rooms = Room.objects.filter(type=room.type).exclude(id=room.id)[:3]
    
    # Get current date for the date input min attribute
    today = timezone.now().date()
    
    # Get current month and year for the calendar
    current_month = today.month
    current_year = today.year
    
    # Check if month/year parameters are provided
    if request.GET.get('month') and request.GET.get('year'):
        try:
            month = int(request.GET.get('month'))
            year = int(request.GET.get('year'))
            
            # Handle month overflow/underflow
            if month < 1:
                month = 12
                year -= 1
            elif month > 12:
                month = 1
                year += 1
                
            current_month = month
            current_year = year
        except ValueError:
            pass
    
    # Generate calendar data
    calendar_data = generate_calendar_data(current_year, current_month, room_id)
    
    # Initialize context
    context = {
        'room': room,
        'similar_rooms': similar_rooms,
        'today': today,
        'calendar_data': calendar_data,
        'time_slots': [],
        'price_info': {
            'base_price': 0,
            'equipment_price': 0,
            'total_price': 0,
            'hours': 0
        }
    }
    
    # Handle form submission
    if request.method == 'POST':
        if not request.user.is_authenticated:
            messages.error(request, "Please log in to make a reservation.")
            return redirect('login')
        
        # Get form data
        booking_date = request.POST.get('booking-date')
        start_time = request.POST.get('start-time')
        end_time = request.POST.get('end-time')
        attendees = request.POST.get('attendees')
        equipment_ids = request.POST.getlist('equipment')
        
        # Check capacity
        attendees_count = 0
        if attendees == '1-5':
            attendees_count = 5
        elif attendees == '6-10':
            attendees_count = 10
        elif attendees == '11-15':
            attendees_count = 15
        elif attendees == '16-20':
            attendees_count = 20
        elif attendees == '21+':
            attendees_count = 25
            
        if room.capacity and attendees_count > room.capacity:
            messages.error(request, f"The number of attendees exceeds the room capacity of {room.capacity} people.")
            
            # If date was selected, get time slots for that date
            if booking_date:
                context['time_slots'] = get_time_slots(room_id, booking_date)
                context['selected_date'] = booking_date
                context['selected_start_time'] = start_time
                context['selected_end_time'] = end_time
                context['selected_equipment_ids'] = equipment_ids
            
            return render(request, 'CLIENT/room-details.html', context)
        
        # Check availability
        is_available, message = check_room_availability(room_id, booking_date, start_time, end_time)
        
        if not is_available:
            messages.error(request, message)
            
            # If date was selected, get time slots for that date
            if booking_date:
                context['time_slots'] = get_time_slots(room_id, booking_date)
                context['selected_date'] = booking_date
                context['selected_start_time'] = start_time
                context['selected_end_time'] = end_time
                context['selected_equipment_ids'] = equipment_ids
            
            return render(request, 'CLIENT/room-details.html', context)
        
        # Calculate price
        price_info = calculate_price_internal(room, start_time, end_time, equipment_ids)

        # Initialize cart if it doesn't exist
        if 'cart' not in request.session:
            request.session['cart'] = []

        # Create cart item
        cart_item = {
            'room_id': room.id,
            'room_name': room.name,
            'room_type': room.type,
            'date': booking_date,
            'start_time': start_time,
            'end_time': end_time,
            'attendees': attendees,
            'equipment_ids': equipment_ids,
            'base_price': price_info['base_price'],
            'equipment_price': price_info['equipment_price'],
            'total_price': price_info['total_price'],
            'hours': price_info['hours'],
            'image_url': room.image.url if room.image else None
        }

        # Get the current cart, add the new item, and save it back
        cart = list(request.session.get('cart', []))
        cart.append(cart_item)
        request.session['cart'] = cart
        
        # Make sure to mark the session as modified
        request.session.modified = True

        # Debug information
        print(f"Added item to cart. Current cart has {len(request.session['cart'])} items.")
        print(f"Cart contents: {request.session['cart']}")

        messages.success(request, f"{room.name} has been added to your cart.")
        return redirect('cart')
    
    # Handle date selection (GET request with date parameter)
    selected_date = request.GET.get('date')
    if selected_date:
        try:
            # Validate date format
            selected_date_obj = datetime.strptime(selected_date, '%Y-%m-%d').date()
            
            # If date is valid, get time slots for that date
            context['time_slots'] = get_time_slots(room_id, selected_date)
            context['selected_date'] = selected_date
            
            # If month is different from current calendar, update calendar
            if selected_date_obj.month != current_month or selected_date_obj.year != current_year:
                context['calendar_data'] = generate_calendar_data(
                    selected_date_obj.year, 
                    selected_date_obj.month, 
                    room_id
                )
        except ValueError:
            # Invalid date format, ignore
            pass
    
    return render(request, 'CLIENT/room-details.html', context)


@login_required
def cart(request):
    """View the cart contents"""
    # Ensure cart exists in session
    if 'cart' not in request.session:
        request.session['cart'] = []
        request.session.modified = True
    
    cart_items = request.session.get('cart', [])
    
    # Debug information
    print(f"Cart view: {len(cart_items)} items in cart")
    for i, item in enumerate(cart_items):
        print(f"Item {i}: {item}")
    
    # Calculate total
    total = sum(item['total_price'] for item in cart_items)
    
    return render(request, 'CLIENT/cart.html', {
        'cart_items': cart_items,
        'total': total
    })

@login_required
def remove_from_cart(request, item_index):
    """Remove an item from the cart"""
    cart = list(request.session.get('cart', []))
    
    if 0 <= item_index < len(cart):
        del cart[item_index]
        request.session['cart'] = cart
        request.session.modified = True
        messages.success(request, "Item removed from cart.")
    
    return redirect('cart')

@login_required
def edit_cart_item(request, item_index):
    """Edit an item in the cart"""
    cart = list(request.session.get('cart', []))
    
    if 0 <= item_index < len(cart):
        item = cart[item_index]
        room = get_object_or_404(Room, id=item['room_id'])
        
        if request.method == 'POST':
            # Get form data
            booking_date = request.POST.get('booking-date')
            start_time = request.POST.get('start-time')
            end_time = request.POST.get('end-time')
            attendees = request.POST.get('attendees')
            equipment_ids = request.POST.getlist('equipment')
            
            # Check capacity
            attendees_count = 0
            if attendees == '1-5':
                attendees_count = 5
            elif attendees == '6-10':
                attendees_count = 10
            elif attendees == '11-15':
                attendees_count = 15
            elif attendees == '16-20':
                attendees_count = 20
            elif attendees == '21+':
                attendees_count = 25
                
            if room.capacity and attendees_count > room.capacity:
                messages.error(request, f"The number of attendees exceeds the room capacity of {room.capacity} people.")
                return redirect('edit_cart_item', item_index=item_index)
            
            # Check availability
            is_available, message = check_room_availability(room.id, booking_date, start_time, end_time)
            
            if not is_available:
                messages.error(request, message)
                return redirect('edit_cart_item', item_index=item_index)
            
            # Calculate price
            price_info = calculate_price_internal(room, start_time, end_time, equipment_ids)
            
            # Update cart item
            cart[item_index] = {
                'room_id': room.id,
                'room_name': room.name,
                'room_type': room.type,
                'date': booking_date,
                'start_time': start_time,
                'end_time': end_time,
                'attendees': attendees,
                'equipment_ids': equipment_ids,
                'base_price': price_info['base_price'],
                'equipment_price': price_info['equipment_price'],
                'total_price': price_info['total_price'],
                'hours': price_info['hours'],
                'image_url': room.image.url if room.image else None
            }
            
            request.session['cart'] = cart
            request.session.modified = True
            
            messages.success(request, f"{room.name} has been updated in your cart.")
            return redirect('cart')
        
        # Get all equipment for the room
        all_equipment = room.additional_equipment.all()
        
        # Get selected equipment IDs
        selected_equipment_ids = item.get('equipment_ids', [])
        
        # Get time slots for the selected date
        time_slots = get_time_slots(room.id, item['date'])
        
        return render(request, 'CLIENT/edit-cart-item.html', {
            'item': item,
            'item_index': item_index,
            'room': room,
            'all_equipment': all_equipment,
            'selected_equipment_ids': selected_equipment_ids,
            'time_slots': time_slots,
            'today': timezone.now().date()
        })
    
    messages.error(request, "Item not found in cart.")
    return redirect('cart')

@login_required
def checkout(request):
    """Process the checkout and create reservations"""
    cart_items = request.session.get('cart', [])
    
    if not cart_items:
        messages.error(request, "Your cart is empty.")
        return redirect('cart')
    
    if request.method == 'POST':
        # Process each cart item and create reservations
        for item in cart_items:
            try:
                room = get_object_or_404(Room, id=item['room_id'])
                
                # Convert string times to time objects
                start_time = datetime.strptime(item['start_time'], '%H:%M').time()
                end_time = datetime.strptime(item['end_time'], '%H:%M').time()
                booking_date = datetime.strptime(item['date'], '%Y-%m-%d').date()
                
                # Check availability again before finalizing
                is_available, message = check_room_availability(
                    item['room_id'], 
                    item['date'], 
                    item['start_time'], 
                    item['end_time']
                )
                
                if not is_available:
                    messages.error(request, f"Room {room.name} is no longer available for the selected time: {message}")
                    continue
                
                # Create the reservation
                reservation = Reservation.objects.create(
                    user=request.user,
                    room=room,
                    date=booking_date,
                    start_time=start_time,
                    end_time=end_time,
                    total_price=Decimal(str(item['total_price'])),
                    status='pending',
                    number_of_attendees=item['attendees']
                )
                
                # Create reservation history
                ReservationHistory.objects.create(
                    reservation=reservation,
                    status='pending',
                    updated_at=timezone.now()
                )
                
                # Add equipment if any
                if item['equipment_ids']:
                    for eq_id in item['equipment_ids']:
                        try:
                            equipment = Equipment.objects.get(id=int(eq_id))
                            reservation.equipment.add(equipment)
                        except Equipment.DoesNotExist:
                            pass
                
                messages.success(request, f"Reservation for {room.name} has been created successfully.")
                
                # Debug information
                print(f"Created reservation: {reservation.id} for room {room.name}")
                
            except Exception as e:
                messages.error(request, f"Error creating reservation: {str(e)}")
                print(f"Error creating reservation: {str(e)}")
        
        # Clear the cart
        request.session['cart'] = []
        request.session.modified = True
        
        return redirect('my_reservations')
    
    # Calculate total
    total = sum(item['total_price'] for item in cart_items)
    
    return render(request, 'CLIENT/checkout.html', {
        'cart_items': cart_items,
        'total': total
    })

@login_required
def my_reservations(request):
    """View user's reservations"""
    reservations = Reservation.objects.filter(user=request.user).order_by('-created_at')
    
    # Filter by status if provided
    status_filter = request.GET.get('status')
    if status_filter and status_filter != 'all':
        reservations = reservations.filter(status=status_filter)
    
    return render(request, 'CLIENT/my-reservations.html', {
        'reservations': reservations,
        'status_filter': status_filter or 'all'
    })

@login_required
def cancel_reservation(request, reservation_id):
    """Cancel a reservation"""
    reservation = get_object_or_404(Reservation, id=reservation_id, user=request.user)
    
    if reservation.status == 'cancelled':
        messages.error(request, "This reservation is already cancelled.")
    elif reservation.status == 'completed':
        messages.error(request, "Cannot cancel a completed reservation.")
    else:
        reservation.status = 'cancelled'
        reservation.save()
        
        # Create reservation history
        ReservationHistory.objects.create(
            reservation=reservation,
            status='cancelled',
            updated_at=timezone.now()
        )
        
        messages.success(request, "Reservation cancelled successfully.")
    
    return redirect('my_reservations')

def change_month(request, room_id):
    """Change the calendar month"""
    year = int(request.GET.get('year'))
    month = int(request.GET.get('month'))
    
    # Generate calendar data for the new month
    calendar_data = generate_calendar_data(year, month, room_id)
    
    return render(request, 'CLIENT/calendar_partial.html', {
        'calendar_data': calendar_data,
        'room_id': room_id
    })

def bookings(request):
    reservations = Reservation.objects.all()
    return render(request, 'ADMIN/bookings.html', {'reservations': reservations})

def validate_booking(request, reservation_id):
    reservation = get_object_or_404(Reservation, id=reservation_id)
    
    if request.method == 'POST':
        form = ReservationValidationForm(request.POST)
        if form.is_valid():
            status = form.cleaned_data['status']
            notes = form.cleaned_data['notes']
            
            # Update reservation status
            reservation.status = status
            reservation.save()
            
            # Create history record
            ReservationHistory.objects.create(
                reservation=reservation,
                status=status,
                updated_by=request.user,
                notes=notes
            )
            
            messages.success(request, f"Reservation #{reservation.id} has been {status}.")
            return redirect('bookings')
    else:
        form = ReservationValidationForm()
    
    context = {
        'reservation': reservation,
        'form': form
    }
    return render(request, 'ADMIN/validate_booking.html', context)




def edit_booking(request, reservation_id):
    reservation = get_object_or_404(Reservation, id=reservation_id)
    room = reservation.room
    
    if request.method == 'POST':
        form = ReservationForm(request.POST, instance=reservation)
        if form.is_valid():
            # Get cleaned data
            new_date = form.cleaned_data['date']
            new_start_time = form.cleaned_data['start_time']
            new_end_time = form.cleaned_data['end_time']
            new_attendees = form.cleaned_data['number_of_attendees']
            
            # Check for overlapping reservations
            overlapping = Reservation.objects.filter(
                room=room,
                date=new_date,
                status__in=['pending', 'confirmed']
            ).exclude(id=reservation.id)
            
            for other_res in overlapping:
                if (new_start_time < other_res.end_time and new_end_time > other_res.start_time):
                    messages.error(request, "This time slot overlaps with another reservation.")
                    return redirect('edit_booking', reservation_id=reservation_id)
            
            # Calculate duration in hours
            start_dt = datetime.combine(date.today(), new_start_time)
            end_dt = datetime.combine(date.today(), new_end_time)
            duration_hours = (end_dt - start_dt).seconds / 3600
            
            # BASE PRICE calculation
            base_price = room.hourly_rate * Decimal(duration_hours)
            
            # EQUIPMENT PRICE calculation (from room's additional equipment)
            equipment_price = Decimal('0.00')
            for room_equip in room.roomequipment_set.all():
                if room_equip.price:
                    equipment_price += room_equip.price * Decimal(duration_hours)
            
            # TOTAL PRICE
            total_price = base_price + equipment_price
            
            # Update reservation
            reservation.date = new_date
            reservation.start_time = new_start_time
            reservation.end_time = new_end_time
            reservation.number_of_attendees = new_attendees
            reservation.total_price = total_price
            reservation.save()
            
            messages.success(request, f"Reservation updated. New total: {total_price} MAD")
            return redirect('bookings')
    else:
        form = ReservationForm(instance=reservation)
    
    context = {
        'form': form,
        'reservation': reservation,
        'room': room,
    }
    return render(request, 'ADMIN/edit_booking.html', context)

def delete_booking(request, reservation_id):
    reservation = get_object_or_404(Reservation, id=reservation_id)
    reservation.delete()
    messages.success(request, f"Booking #{reservation_id} was successfully deleted.")
    return redirect('bookings')

def edit_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    
    if request.method == 'POST':
        form = UserEditForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            messages.success(request, f"User {user.username} updated successfully.")
            return redirect('users')
    else:
        form = UserEditForm(instance=user)
    
    context = {
        'form': form,
        'user': user,
    }
    return render(request, 'ADMIN/edit_user.html', context)


def delete_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.method == 'POST':
        username = user.username
        user.delete()
        messages.success(request, f"User {username} was successfully deleted.")
        return redirect('users')
    return redirect('users') 




def edit_room(request, room_id):
    room = get_object_or_404(Room, id=room_id)
    
    if request.method == 'POST':
        form = RoomForm(request.POST, request.FILES, instance=room)
        if form.is_valid():
            room = form.save()
            messages.success(request, f"Room {room.name} updated successfully.")
            return redirect('rooms_admin')
    else:
        form = RoomForm(instance=room)
    
    context = {
        'form': form,
        'room': room,
    }
    return render(request, 'ADMIN/edit_room.html', context)


def delete_room(request, room_id):
    room = get_object_or_404(Room, id=room_id)
    
    if request.method == 'POST':
        room_name = room.name
        room.delete()
        messages.success(request, f"Room {room_name} deleted successfully.")
        return redirect('rooms_admin')
    
    return redirect('rooms_admin')