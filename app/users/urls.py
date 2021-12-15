from django.urls import path, include
from . import views

app_name = 'users'

urlpatterns = [
    # Включить URL авторизации по умолчанию.
    # path('', include('django.contrib.auth.urls')),
    # Страница аутентификации
    path('login/', views.login, name='login'),
    # Страница регистрации.
    path('register/', views.register, name='register'),
    # Страница редактирования профиля
    path('edit/', views.edit, name='edit'),

    # Выход из профиля
    path('logout/', views.user_logout, name='logout')
]
