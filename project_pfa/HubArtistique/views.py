from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login, logout
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .models import User
from django.core.paginator import Paginator
from django.shortcuts import render, redirect
from .forms import RoomForm

def index(request):
    return render(request, 'CLIENT/index.html')

def room_details(request):
    return render(request, 'CLIENT/room-details.html')

def rooms(request):
    return render(request, 'CLIENT/rooms.html')

def bookings(request):
    return render(request, 'ADMIN/bookings.html')

@login_required
def dashboard(request):
    return render(request, 'ADMIN/dashboard.html')

from .models import Room  # Make sure this matches your actual model name

@login_required
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
            room = form.save(commit=False)
            room.save() 
            return redirect('rooms_admin')
        else:
            print(form.errors) 
    else:
        form = RoomForm()

    return render(request, 'ADMIN/rooms.html', {'form': form})
# def rooms(request):
#     all_rooms= rooms.objects.all()
