from django.urls import path
from . import views

app_name = 'api_v1'
urlpatterns = [
    # Домашняя страница
    path('v1/get_products_dict/', views.get_products_dict, name='get_products_dict'),
    path('v1/add_product/', views.add_product, name='add_product'),
]