from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.forms import UserCreationForm

from products_list.models import List


def register(request):
    """Регистрирует нового пользователя."""
    if request.method != 'POST':
        # Выводит пустую форму регистрации.
        form = UserCreationForm()
    else:
        # Обработка заполненной формы.
        form = UserCreationForm(data=request.POST)

        if form.is_valid():
            new_user = form.save()

            # Создадим новый пустой список для пользователя
            List.objects.create(title='Новый список', owner=new_user)

            # Выполнение входа и перенаправление на домашнюю страницу.
            login(request, new_user)
            return redirect('products_list:index')

    # Вывести пустую или недействительную форму.
    context = {'form': form}
    return render(request, 'users/register.html', context)


def user_logout(request):
    logout(request)
    return redirect('products_list:home')
