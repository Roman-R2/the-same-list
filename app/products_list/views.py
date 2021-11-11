from django.shortcuts import render
from .models import ProductList, Product


def index(request):
    products_list = ProductList.objects.filter(owner=request.user).order_by('-created_at')
    context = {"products_list": products_list}
    return render(request, 'products_list/index.html', context=context)
