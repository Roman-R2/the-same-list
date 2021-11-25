from django.db import models
from django.contrib.auth.models import User


# from django.db import connection


class Product(models.Model):
    name = models.CharField(max_length=150)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Продукт'
        verbose_name_plural = 'Продукты'
        ordering = ['name']
        db_table = "app_product"


class List(models.Model):
    title = models.CharField(max_length=150)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Список'
        verbose_name_plural = 'Списки'
        ordering = ['-created_at']
        db_table = "app_list"


class ProductInList(models.Model):
    name = models.ForeignKey(Product, on_delete=models.CASCADE)
    list = models.ForeignKey(List, on_delete=models.CASCADE)
    quantity = models.CharField(max_length=150, blank=True)
    is_checked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"List: {self.list.title}, Product: {self.name.name}"

    class Meta:
        verbose_name = 'Продукт в списке'
        verbose_name_plural = 'Продукт в списках'
        ordering = ['name']
        db_table = "app_product_in_list"

# ----------------------------------------------------------------


# def execute_my_sql_for_create_view_in_db():
#     """Создает представление app_all_product в базе данных
#     Для активации происходит выхов из Makefile:
#     	echo "from products_list.models import execute_my_sql_for_create_view_in_db;
#     	 execute_my_sql_for_create_view_in_db()" |
#     	 docker-compose exec -T web python manage.py shell
#     """
#
#     query = """CREATE VIEW app_all_product AS
#                     SELECT id, name from app_common_product
#                     UNION
#                     SELECT 10000+id as id, name from app_user_product"""
#     cursor = connection.cursor()
#     cursor.execute(query)
#
#
# class AllProduct(models.Model):
#     name = models.CharField(max_length=150)
#
#     class Meta:
#         managed = False
#         db_table = "app_all_product"
