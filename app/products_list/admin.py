from django.contrib import admin

from .models import Product, ProductList, ProductDictionary

admin.site.register(Product)
admin.site.register(ProductList)
admin.site.register(ProductDictionary)
