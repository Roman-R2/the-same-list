from django.urls import path, include
from . import views

app_name = 'users'

urlpatterns = [
    # Включить URL авторизации по умолчанию.
    path('', include('django.contrib.auth.urls')),
    # Страница регистрации.
    path('register/', views.register, name='register'),
    # Выход из профиля
    path('logout/', views.user_logout, name='logout')
]
