import json
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import List, Product, ProductInList


@login_required
def index(request):
    product_lists = List.objects.filter(owner=request.user)

    # Создадим словарь списков пользователя для последующей передачи json
    # data = {}
    # for some_list in product_lists:
    #     products = {}
    #     for some_set in some_list.products.all():
    #         products.update({
    #             some_set.pk: some_set.product_in_dict.name,
    #         })
    #     data.update({
    #         some_list.pk: {
    #             'name': some_list.title,
    #             'products': products,
    #         }
    #     })

    # data_dump = json.dumps(data)

    context = {
        "product_lists": product_lists,
        # 'data': data_dump,
    }

    return render(request, 'products_list/index.html', context=context)
