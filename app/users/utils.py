from django.contrib.auth.models import User
from django.forms import forms


class UniqueValidationMixin:
    """
    Организует дополнительную проверку совпадения имен
    логина пользователя и совпадения email пользователя c какими либо
    данными в БД
    """

    def clean_username(self):
        data_username = self.cleaned_data['username']
        data_username = data_username.lower()
        if User.objects.filter(username=data_username):
            raise forms.ValidationError(
                'Пользователь с таким именем уже существует.'
            )
        return data_username

    def clean_email(self):
        data_email = self.cleaned_data['email']
        if User.objects.filter(email=data_email):
            raise forms.ValidationError(
                'Пользователь с таким email уже существует.'
            )
        return data_email


class WithAnotherUsersValidationMixin:
    """
        Организует дополнительную проверку совпадения имен
        с данными, отличными от данного пользователя, по логину и email
    """

    def clean_username(self):
        data_username = self.cleaned_data['username']
        data_username = data_username.lower()
        if User.objects.filter(username=data_username).count() > 1:
            raise forms.ValidationError(
                'Пользователь с таким именем уже существует.'
            )
        return data_username

    def clean_email(self):
        data_email = self.cleaned_data['email']
        if User.objects.filter(email=data_email).count() > 1:
            raise forms.ValidationError(
                'Пользователь с таким email уже существует.'
            )
        return data_email
