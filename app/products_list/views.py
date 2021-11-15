from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import ProductList, Product


@login_required
def index(request):
    products_list = ProductList.objects.filter(owner=request.user)

    context = {"products_list": products_list}
    return render(request, 'products_list/index.html', context=context)
