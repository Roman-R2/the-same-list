import json

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from products_list.models import List, Product, ProductInList


@login_required
def get_products_dict(request):
    products_dict = Product.objects.all()
    # Создадим словарь типовых продуктов
    dict_data = {}
    for some_product in products_dict:
        dict_data.update({some_product.pk: some_product.name})
    return JsonResponse(dict_data)


@csrf_exempt
def add_product(request):
    """
    Получает json формата {"product_id": 1 ,"list_id": "1" }
    и добавляет продукт по id из данного json в список по id из данного json
    :param request:
    :return: JsonResponse
    """
    if request.method == 'POST' and request.user.is_authenticated:
        # print(request.user.username)

        unpack_json = json.loads(request.body)
        product_id = unpack_json['product_id']
        list_id = unpack_json['list_id']
        quantity = unpack_json['quantity']

        ProductInList.objects.create(
            name=Product.objects.get(pk=product_id),
            list=List.objects.get(pk=list_id),
            quantity=quantity, owner=request.user
        )
        return JsonResponse({"status": "success"})
    return JsonResponse({"status": "error"})


def get_lists_and_products(request):
    """
    Получает из бызы данных списки пользователя и продукты по этим спискам,
    формирует объект списков с продуктами и отправляет json
    :param request:
    :return:
    """
    lists = List.objects.filter(owner=request.user)

    data = {}
    for some_list in lists:
        products_for_list = ProductInList.objects.filter(owner=request.user, list=some_list)

        products = {}
        for product in products_for_list:
            products.update({
                product.pk: product.name.name,
            })
        data.update({
            some_list.pk: {
                'name': some_list.title,
                'products': products,
            }
        })

    return JsonResponse(data)


@csrf_exempt
def get_product_name_for_id(request):
    if request.method == 'POST' and request.user.is_authenticated:
        unpack_json = json.loads(request.body)
        product_id = unpack_json['product_id']

        requested_product = Product.objects.get(pk=product_id)

        return JsonResponse({"status": "success", "product_name": requested_product.name})
    return JsonResponse({"status": "error"})
