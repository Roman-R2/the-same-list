import json
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import ProductList, ProductDictionary


@login_required
def index(request):
    product_lists = ProductList.objects.filter(owner=request.user)
    products_dict = ProductDictionary.objects.all()

    # Создадим словарь списков пользователя для последующей передачи json
    data = {}
    for some_list in product_lists:
        products = {}
        for some_set in some_list.products.all():
            products.update({
                some_set.pk: some_set.name,
            })
        data.update({
            some_list.pk: {
                'name': some_list.title,
                'products': products,
            }
        })

    # Создадим словарь типовых продуктов
    dict_data = {}
    for some_product in products_dict:
        dict_data.update({some_product.pk: some_product.name})

    data_dump = json.dumps(data)
    products_dict_dump = json.dumps(dict_data)

    context = {
        "product_lists": product_lists,
        'data': data_dump,
        'products_dict': products_dict_dump,
    }

    return render(request, 'products_list/index.html', context=context)


