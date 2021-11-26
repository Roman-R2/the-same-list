from django.urls import path
from . import views

app_name = 'api_v1'

urlpatterns = [
    # Домашняя страница
    path('v1/get_products_dict/', views.get_products_dict, name='get_products_dict'),
    path('v1/add_product_for_id/', views.add_product_for_id, name='add_product_for_id'),
    path('v1/add_product_for_name/', views.add_product_for_name, name='add_product_for_name'),
    path('v1/get_lists_and_products/', views.get_lists_and_products, name='get_lists_and_products'),
    path('v1/get_product_name_for_id/', views.get_product_name_for_id, name='get_product_name_for_id'),
    path('v1/get_product_id_for_name/', views.get_product_id_for_name, name='get_product_id_for_name'),
    path('v1/set_list_new_name/', views.set_list_new_name, name='set_list_new_name'),
    # Создадим новый пустой список
    path('v1/add_new_list/', views.add_new_list, name='add_new_list'),
    # Удалить список по его id
    path('v1/delete_list_for_id/', views.delete_list_for_id, name='delete_list_for_id'),
    # Удалить продукт из списка продуктов по его id в списке продуктов
    path('v1/delete_product_for_id/', views.delete_product_for_id, name='delete_product_for_id'),
    # Переключить выбор продукта в противоположное положение
    path('v1/toggle_check_for_product/', views.toggle_check_for_product,
         name='toggle_check_for_product'),
]
