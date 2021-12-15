from django.contrib import auth
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect

from products_list.models import List
from users.forms import UserLoginForm, UserRegisterForm, UserEditForm


def login(request):
    login_form = UserLoginForm(data=request.POST)
    if request.method == 'POST' and login_form.is_valid():
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = auth.authenticate(username=username, password=password)
        if user and user.is_active:
            auth.login(request, user)
            return redirect('products_list:index')
    context = {
        'form': login_form,
    }

    return render(request, 'users/login.html', context=context)


def register(request):
    """Регистрирует нового пользователя."""
    if request.method == 'POST':
        register_form = UserRegisterForm(request.POST)
        if register_form.is_valid():
            new_user = register_form.save()

            # Создадим новый пустой список для пользователя
            List.objects.create(title='Новый список', owner=new_user)

            # Выполнение входа и перенаправление на домашнюю страницу.
            auth.login(request, new_user)
            return redirect('products_list:index')

    register_form = UserRegisterForm()
    context = {'form': register_form}

    return render(request, 'users/register.html', context=context)


@login_required
def edit(request):
    if request.method == "POST":
        edit_form = UserEditForm(request.POST, instance=request.user)

        if edit_form.is_valid():
            edit_form.save()
            return redirect('products_list:index')

    edit_form = UserEditForm(instance=request.user)
    context = {
        'form': edit_form,
    }

    return render(request, 'users/edit.html', context=context)


def user_logout(request):
    auth.logout(request)
    return redirect('main_page:index')
