from django.contrib import admin

from .models import List, Product, ProductInList

admin.site.register(List)
admin.site.register(Product)
admin.site.register(ProductInList)


# @admin.register(AllProduct)
# class AllEntiryAdmin(admin.ModelAdmin):
#     list_display = ("id", "name")
