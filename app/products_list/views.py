from django.shortcuts import render


def index(request):
    """Домашняя страница приложения Learning Log"""
    return render(request, 'products_list/index.html')
