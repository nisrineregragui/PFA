from django import template

register = template.Library()

@register.filter
def times(number):
    return range(int(number))

@register.filter
def times_range(number, start=0):
    return range(int(start), int(number) + 1)
