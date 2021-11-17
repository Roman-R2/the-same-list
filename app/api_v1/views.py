import json

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from products_list.models import ProductDictionary, ProductList


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
        # {"product_id":3,"list_id":"1"}'
        # print("BODY:", request.body)
        # print(request.user.username)

        unpack_json = json.loads(request.body)
        product_id = unpack_json['product_id']
        list_id = unpack_json['list_id']

        product_list = ProductList.objects.get(pk=list_id)
        print(product_list)
        return JsonResponse({"status": "success"})
    return JsonResponse({"status": "error"})


def get_lists_and_products(request):
    product_lists = ProductList.objects.filter(owner=request.user)
    data = {}
    for some_list in product_lists:
        products = {}
        for some_set in some_list.products.all():
            products.update({
                some_set.pk: some_set.product_in_dict.name,
            })
        data.update({
            some_list.pk: {
                'name': some_list.title,
                'products': products,
            }
        })
    return JsonResponse(data)
