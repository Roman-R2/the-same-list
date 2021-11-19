from django.urls import path
from . import views

app_name = 'api_v1'
urlpatterns = [
    # Домашняя страница
    path('v1/get_products_dict/', views.get_products_dict, name='get_products_dict'),
    path('v1/add_product/', views.add_product, name='add_product'),
    path('v1/get_lists_and_products/', views.get_lists_and_products, name='get_lists_and_products'),
    path('v1/get_product_name_for_id/', views.get_product_name_for_id, name='get_product_name_for_id'),
]