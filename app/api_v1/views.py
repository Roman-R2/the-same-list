import json

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from .services import HTTPStatusCode
from products_list.models import List, Product, ProductInList


@login_required
def get_products_dict(request):
    if not request.user.is_authenticated:
        return JsonResponse({"status": "error"}, status=HTTPStatusCode.UNAUTHORIZED)
    if request.method != 'GET':
        return JsonResponse({"status": "error"}, status=HTTPStatusCode.METHOD_NOT_ALLOWED)

    products_dict = Product.objects.filter(owner__in=[1, request.user.pk])

    data = {}
    for product in products_dict:
        data.update({product.id: product.name})

    return JsonResponse({
        "status": "success",
        "productsDict": data
    }, status=HTTPStatusCode.OK)


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

        # print('unpack_json -------> ', list_id, product_name, quantity)

        add_product_to_dict = Product.objects.create(
            name=product_name,
            owner=request.user
        )

        new_product_in_list = ProductInList.objects.create(
            name=add_product_to_dict,
            list=List.objects.get(pk=list_id),
            quantity=quantity,
            owner=request.user
        )

        return JsonResponse({
            "status": "success",
            "newProductId": new_product_in_list.pk,
            "newProductName": add_product_to_dict.name,
            "newProductQuantity": new_product_in_list.quantity,
        }, status=HTTPStatusCode.CREATED)
    return JsonResponse({"status": "error"})


@csrf_exempt
def add_product_for_id(request):
    """
    Получает json формата {"productId": 1 ,"listId": "1", "quantity": "500 гр." }
    и добавляет продукт по id из данного json в список по id из данного json
    :param request:
    :return: JsonResponse
    """

    if not request.user.is_authenticated:
        return JsonResponse({"status": "error"}, status=HTTPStatusCode.UNAUTHORIZED)
    if request.method != 'POST':
        return JsonResponse({"status": "error"}, status=HTTPStatusCode.METHOD_NOT_ALLOWED)

    unpack_json = json.loads(request.body)
    list_id = unpack_json['listId']
    product_id = unpack_json['productId']
    quantity = unpack_json['quantity']

    # print('add_product_for_id unpack_json:', unpack_json)

    new_product_in_list = ProductInList.objects.create(
        name=Product.objects.get(pk=product_id),
        list=List.objects.get(pk=list_id),
        quantity=quantity,
        owner=request.user
    )

    return JsonResponse(
        {
            "status": "success",
            "newProductId": new_product_in_list.pk,
            "newProductName": new_product_in_list.name.name,
            "newProductQuantity": new_product_in_list.quantity,
        }, status=HTTPStatusCode.CREATED)


def get_lists_and_products(request):
    """
    Получает из бызы данных списки пользователя и продукты по этим спискам,
    формирует объект списков с продуктами и отправляет json
    :param request:
    :return:
    """

    if not request.user.is_authenticated:
        return JsonResponse({"status": "error"}, status=HTTPStatusCode.UNAUTHORIZED)
    if request.method != 'GET':
        return JsonResponse({"status": "error"}, status=HTTPStatusCode.METHOD_NOT_ALLOWED)

    lists = List.objects.filter(owner=request.user)

    data = {}
    for some_list in lists:
        products_for_list = ProductInList.objects.filter(owner=request.user, list=some_list)

        products = {}
        for product in products_for_list:
            products.update({
                product.pk: [product.name.name, product.quantity, product.is_checked],
            })
        data.update({
            some_list.pk: {
                'name': some_list.title,
                'products': products,
            }
        })

    return JsonResponse({
        "status": "success",
        "listsAndProducts": data
    }, status=HTTPStatusCode.OK)


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


@csrf_exempt
def set_list_new_name(request):
    if not request.user.is_authenticated:
        return JsonResponse({"status": "error"}, status=HTTPStatusCode.UNAUTHORIZED)
    if request.method != 'POST':
        return JsonResponse({"status": "error"}, status=HTTPStatusCode.METHOD_NOT_ALLOWED)

    unpack_json = json.loads(request.body)
    list_id = unpack_json['listId']
    list_new_name = unpack_json['listNewName']

    list_for_rename = List.objects.get(pk=list_id)
    list_for_rename.title = list_new_name
    list_for_rename.save()

    return JsonResponse({"status": "success"})


@csrf_exempt
def add_new_list(request):
    """
    Добавляет новый список с именем в базу данных по запросу {"comment": "giveMeNewList"}
    :param request:
    :return:
    """
    if not request.user.is_authenticated:
        return JsonResponse({"status": "error"}, status=HTTPStatusCode.UNAUTHORIZED)
    if request.method != 'POST':
        return JsonResponse({"status": "error"}, status=HTTPStatusCode.METHOD_NOT_ALLOWED)

    unpack_json = json.loads(request.body)
    comment = unpack_json['comment']
    if comment == "giveMeNewList":
        new_list = List.objects.create(title="Новый список", owner=request.user)
        return JsonResponse(
            {
                "status": "success",
                "listId": new_list.pk,
                "listTitle": new_list.title,
            }, status=201)


@csrf_exempt
def delete_list_for_id(request):
    """
    Удалит список по определенному id
    :param request:
    :return:
    """
    if not request.user.is_authenticated:
        return JsonResponse({"status": "error"}, status=HTTPStatusCode.UNAUTHORIZED)
    if request.method != 'DELETE':
        return JsonResponse({"status": "error"}, status=HTTPStatusCode.METHOD_NOT_ALLOWED)

    unpack_json = json.loads(request.body)
    list_id = unpack_json['listId']

    List.objects.filter(pk=list_id).delete()

    return JsonResponse(
        {
            "status": "success",
            "deletedListId": list_id
        }, status=HTTPStatusCode.OK)


@csrf_exempt
def delete_product_for_id(request):
    """
    Удалит продукт из списка по определенному id
    :param request:
    :return:
    """
    if not request.user.is_authenticated:
        return JsonResponse({"status": "error"}, status=HTTPStatusCode.UNAUTHORIZED)
    if request.method != 'DELETE':
        return JsonResponse({"status": "error"}, status=HTTPStatusCode.METHOD_NOT_ALLOWED)

    unpack_json = json.loads(request.body)
    product_in_list_id = unpack_json['productInListId']

    product_for_delete = ProductInList.objects.get(pk=product_in_list_id)
    product_for_delete.delete()

    return JsonResponse(
        {
            "status": "success",
            "idListWhereDeletionWas": product_for_delete.list.pk,
            "deletedProductInListId": product_in_list_id
        }, status=HTTPStatusCode.OK)


@csrf_exempt
def toggle_check_for_product(request):
    if not request.user.is_authenticated:
        return JsonResponse({"status": "error"}, status=HTTPStatusCode.UNAUTHORIZED)
    if request.method != 'POST':
        return JsonResponse({"status": "error"}, status=HTTPStatusCode.METHOD_NOT_ALLOWED)

    unpack_json = json.loads(request.body)
    product_in_list_id = unpack_json['productInListId']

    product_for_check = ProductInList.objects.get(pk=product_in_list_id)
    product_for_check.is_checked = not product_for_check.is_checked
    product_for_check.save()

    return JsonResponse(
        {
            "status": "success",
            "idListWhereCheckWas": product_for_check.list.pk,
            "checkProductInListId": product_in_list_id,
            "checkStatus": product_for_check.is_checked,
        }, status=HTTPStatusCode.ACCEPTED)
