from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),  
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    path('index/', views.index, name='index'),
    path('room-details/', views.room_details, name='room_details'), 
    path('rooms/', views.rooms, name='rooms'), 
    path('bookings/', views.bookings, name='bookings'), 
    path('dashboard/', views.dashboard, name='dashboard'),
    path('rooms_admin/', views.rooms_admin, name='rooms_admin'),  
    path('users/', views.users, name='users'),
    path('add-room/', views.add_room, name='add_room'),
]
