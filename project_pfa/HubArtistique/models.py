from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('client', 'Client'),
    ) 
    username = models.CharField(
        max_length=150, 
        unique=True,
        default='',
    )
   
    cin = models.CharField(max_length=20, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='client')



class Building(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    photo_url = models.URLField(max_length=255, blank=True, null=True)
    open_hours = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.name


class Feature(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Equipment(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.name

class Room(models.Model):
    DISPONIBILITY_CHOICES = [
        ('dispo', 'Available'),
        ('maintenance', 'Maintenance'),
        ('no', 'Unavailable'),
    ]
    building = models.ForeignKey(Building, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    floor = models.IntegerField(blank=True, null=True)
    capacity = models.IntegerField(blank=True, null=True)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    available_equipment = models.ManyToManyField(Equipment,related_name='rooms_with_available_equipment', blank=True)
    image = models.ImageField(upload_to='room_images/', null=True, blank=True)
    disponibility = models.CharField(
        max_length=15,
        choices=DISPONIBILITY_CHOICES,
        default='dispo'
    )
    features = models.ManyToManyField(Feature, blank=True)
    def __str__(self):
        return self.name




class RoomEquipment(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    price=models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)


class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Cart for {self.user.username}"
    
    def get_total_price(self):
        return sum(item.total_price for item in self.cartitem_set.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    attendees = models.CharField(max_length=50, default='')
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    equipment_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    hours = models.DecimalField(max_digits=5, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.room.name} - {self.date}"
    
    class Meta:
        ordering = ['-created_at']


class CartItemEquipment(models.Model):
    cart_item = models.ForeignKey(CartItem, on_delete=models.CASCADE)
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ('cart_item', 'equipment')


class Reservation(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    number_of_attendees=models.CharField(max_length=50,default='')
    equipment = models.ManyToManyField(Equipment, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.room.name} - {self.date}"


class ReservationHistory(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    )

    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now_add=True)
