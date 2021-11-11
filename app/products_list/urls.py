from django.urls import path
from . import views

app_name = 'products_list'
urlpatterns = [
    # Домашняя страница
    path('', views.index, name='index'),
]