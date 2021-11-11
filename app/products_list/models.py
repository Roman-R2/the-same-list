from django.db import models


class Product(models.Model):
    name = models.CharField(max_length=150)

    def __str__(self):
        return self.name


class ProductList(models.Model):
    title = models.CharField(max_length=150)
    products = models.ManyToManyField(Product, blank=True, related_name='products')

    def __str__(self):
        return self.title
