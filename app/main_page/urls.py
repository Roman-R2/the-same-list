from django.urls import path, include
from . import views

app_name = 'main_page'
urlpatterns = [
    # Домашняя страница
    path('', views.index, name='index'),
]