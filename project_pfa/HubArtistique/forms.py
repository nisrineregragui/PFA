from django import forms
from .models import Building, Reservation, Room, Equipment, Feature, User
from django.utils import timezone

class SearchForm(forms.Form):
    building = forms.CharField(required=False, widget=forms.Select(attrs={'class': 'form-control'}))
    date = forms.DateField(required=False, widget=forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}))
    start_time = forms.TimeField(required=False, widget=forms.TimeInput(attrs={'type': 'time', 'class': 'form-control'}))
    end_time = forms.TimeField(required=False, widget=forms.TimeInput(attrs={'type': 'time', 'class': 'form-control'}))
    capacity = forms.CharField(required=False, widget=forms.Select(attrs={'class': 'form-control'}))
    
    def __init__(self, *args, **kwargs):
        super(SearchForm, self).__init__(*args, **kwargs)
        
        # Set min date to today
        self.fields['date'].widget.attrs['min'] = timezone.now().date().strftime('%Y-%m-%d')
        
        # Set building choices
        building_choices = [('', 'Any Building')]
        for building in Building.objects.all():
            building_choices.append((building.name, building.name))
        self.fields['building'].widget.choices = building_choices
        
        # Set capacity choices
        capacity_choices = [
            ('', 'Any Capacity'),
            ('1-5', '1-5 People'),
            ('6-10', '6-10 People'),
            ('11-20', '11-20 People'),
            ('21+', '21+ People'),
        ]
        self.fields['capacity'].widget.choices = capacity_choices

class RoomForm(forms.ModelForm):
    available_equipment = forms.ModelMultipleChoiceField(
        queryset=Equipment.objects.all(),
        widget=forms.CheckboxSelectMultiple,
        required=False,
        label="Available Equipment"
    )
    additional_equipment = forms.ModelMultipleChoiceField(
        queryset=Equipment.objects.all(),
        widget=forms.CheckboxSelectMultiple,
        required=False,
        label="Additional Equipment"
    )
    features = forms.ModelMultipleChoiceField(
        queryset=Feature.objects.all(),
        widget=forms.CheckboxSelectMultiple,
        required=False,
        label="Features"
    )

    class Meta:
        model = Room
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super(RoomForm, self).__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if not isinstance(field.widget, forms.CheckboxSelectMultiple):
                field.widget.attrs.update({'class': 'form-control'})

class ReservationForm(forms.ModelForm):
    date = forms.DateField(widget=forms.DateInput(attrs={'type': 'date'}))
    start_time = forms.TimeField(widget=forms.TimeInput(attrs={'type': 'time'}))
    end_time = forms.TimeField(widget=forms.TimeInput(attrs={'type': 'time'}))

    # Not part of the model, just a custom form field
    equipment_choices = forms.ModelMultipleChoiceField(
        queryset=Equipment.objects.all(),
        widget=forms.CheckboxSelectMultiple,
        required=False,
        label='Optional Equipment'
    )

    class Meta:
        model = Reservation
        fields = ['date', 'start_time', 'end_time', 'number_of_attendees']

    def __init__(self, *args, room=None, **kwargs):
        super().__init__(*args, **kwargs)

        for field in self.fields.values():
            if not isinstance(field.widget, forms.CheckboxSelectMultiple):
                field.widget.attrs.update({'class': 'form-control'})

        # Filter equipment list based on selected room
        if room:
            self.fields['equipment_choices'].queryset = Equipment.objects.filter(
                rooms_with_available_equipment=room
            )

    def clean(self):
        cleaned_data = super().clean()
        start_time = cleaned_data.get('start_time')
        end_time = cleaned_data.get('end_time')

        if start_time and end_time and start_time >= end_time:
            raise forms.ValidationError("End time must be after start time.")

        return cleaned_data

class ReservationValidationForm(forms.Form):
    STATUS_CHOICES = (
        ('confirmed', 'Confirm'),
        ('cancelled', 'Cancel'),
    )

    status = forms.ChoiceField(
        choices=STATUS_CHOICES,
        widget=forms.RadioSelect,
        label="Update Reservation Status"
    )

    notes = forms.CharField(
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        required=False,
        label="Notes"
    )

class UserEditForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'phone', 'cin', 'role']
        widgets = {
            'role': forms.Select(choices=User.ROLE_CHOICES),
        }
