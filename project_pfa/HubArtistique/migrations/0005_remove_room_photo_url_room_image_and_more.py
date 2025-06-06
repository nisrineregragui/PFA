# Generated by Django 4.2.20 on 2025-04-24 12:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("HubArtistique", "0004_alter_user_last_name"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="room",
            name="photo_url",
        ),
        migrations.AddField(
            model_name="room",
            name="image",
            field=models.ImageField(blank=True, null=True, upload_to="room_images/"),
        ),
        migrations.AlterField(
            model_name="user",
            name="last_name",
            field=models.CharField(
                blank=True, max_length=150, verbose_name="last name"
            ),
        ),
    ]
