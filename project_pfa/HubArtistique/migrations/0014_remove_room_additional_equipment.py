# Generated by Django 4.2.21 on 2025-05-24 23:59

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("HubArtistique", "0013_cart_cartitem_reservation_equipment_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="room",
            name="additional_equipment",
        ),
    ]
