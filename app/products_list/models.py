from django.db import models
from django.contrib.auth.models import User


class ProductDictionary(models.Model):
    name = models.CharField(max_length=150)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = ' Словарь всех продуктов'
        verbose_name_plural = 'Словари всех продуктов'
        ordering = ['name']


class Product(models.Model):
    product_in_dict = models.ForeignKey(ProductDictionary, on_delete=models.CASCADE)
    quantity = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.product_in_dict.name

    class Meta:
        verbose_name = 'Продукты по спискам'
        verbose_name_plural = 'Продукты по спискам'


class ProductList(models.Model):
    title = models.CharField(max_length=150)
    created_at = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    products = models.ManyToManyField(Product, blank=True, related_name='products')

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Список продуктов'
        verbose_name_plural = 'Списки продуктов'
        ordering = ['-created_at']
