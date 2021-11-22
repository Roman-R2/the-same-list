import json

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from products_list.models import List, Product, ProductInList


@login_required
def get_products_dict(request):
    products_dict = Product.objects.filter(owner__in=[1, request.user.pk])
    # Создадим словарь типовых продуктов
    dict_data = {}
    for some_product in products_dict:
        dict_data.update({some_product.pk: some_product.name})
    return JsonResponse(dict_data)


@csrf_exempt
def add_product_for_name(request):
    """
    Получает json формата {"listId": "1", "productName": "Шоколадка", "quantity": "500 гр." }
    и добавляет новый продукт в базу данных
    :param request:
    :return:
    """
    if request.method == 'POST' and request.user.is_authenticated:
        unpack_json = json.loads(request.body)
        list_id = unpack_json['listId']
        product_name = unpack_json['productName']
        quantity = unpack_json['quantity']

        print('unpack_json -------> ', list_id, product_name, quantity)

        add_product_to_dict = Product.objects.create(
            name=product_name,
            owner=request.user
        )

        new_product_in_list = ProductInList.objects.create(
            name=add_product_to_dict,
            list=List.objects.get(pk=list_id),
            quantity=quantity, owner=request.user
        )

        print(
            'add_product_to_dict ----> ',
            add_product_to_dict.pk,
            add_product_to_dict.name,
            add_product_to_dict.owner,
        )
        print(
            'new_product_in_list ----> ',
            new_product_in_list.pk,
            new_product_in_list.name,
            new_product_in_list.list,
            new_product_in_list.created_at,
            new_product_in_list.owner,
        )

        return JsonResponse({
            "status": "success",
            "newProductId": new_product_in_list.pk,
            "newProductName": add_product_to_dict.name,
        })
    return JsonResponse({"status": "error"})


@csrf_exempt
def add_product_for_id(request):
    """
    Получает json формата {"product_id": 1 ,"list_id": "1", "quantity": "500 гр." }
    и добавляет продукт по id из данного json в список по id из данного json
    :param request:
    :return: JsonResponse
    """
    if request.method == 'POST' and request.user.is_authenticated:
        # print(request.user.username)

        unpack_json = json.loads(request.body)
        product_id = unpack_json['productId']
        list_id = unpack_json['listId']
        quantity = unpack_json['quantity']

        new_product_in_list = ProductInList.objects.create(
            name=Product.objects.get(pk=product_id),
            list=List.objects.get(pk=list_id),
            quantity=quantity, owner=request.user
        )
        return JsonResponse({"status": "success", "newProductId": new_product_in_list.pk})
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
    # TODO надо сделать, чтоб методом GET
    if request.method == 'POST' and request.user.is_authenticated:
        unpack_json = json.loads(request.body)
        product_id = unpack_json['productId']

        requested_product = Product.objects.get(pk=product_id)

        return JsonResponse({"status": "success", "product_name": requested_product.name})
    return JsonResponse({"status": "error"})


@csrf_exempt
def get_product_id_for_name(request):
    # TODO надо сделать, чтоб методом GET
    if request.method == 'POST' and request.user.is_authenticated:
        unpack_json = json.loads(request.body)
        product_name = unpack_json['productName']

        requested_product = Product.objects.get(name=product_name)

        return JsonResponse({"status": "success", "productId": requested_product.pk})
    return JsonResponse({"status": "error"})
