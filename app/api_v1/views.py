from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from products_list.models import ProductDictionary


@login_required
def get_products_dict(request):
    products_dict = ProductDictionary.objects.all()
    # Создадим словарь типовых продуктов
    dict_data = {}
    for some_product in products_dict:
        dict_data.update({some_product.pk: some_product.name})
    return JsonResponse(dict_data)


@csrf_exempt
def add_product(request):
    if request.method == 'POST' and request.user.is_authenticated:
        print("BODY:", request.body)
        print(request.user.username)
        return JsonResponse({"status": "success"})
    return JsonResponse({"status": "error"})
