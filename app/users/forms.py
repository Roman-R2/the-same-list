from django.contrib.auth.forms import AuthenticationForm, UserCreationForm, \
    UserChangeForm
from django.contrib.auth.models import User
from django.forms import HiddenInput, forms

from users.utils import UniqueValidationMixin, WithAnotherUsersValidationMixin


class UserLoginForm(AuthenticationForm):
    class Meta:
        model = User
        fields = ('username', 'password',)


class UserRegisterForm(UniqueValidationMixin, UserCreationForm):
    class Meta:
        model = User
        fields = (
            'username',
            'email',
            'password1',
            'password2',
        )


class UserEditForm(WithAnotherUsersValidationMixin, UserChangeForm):
    class Meta:
        model = User
        fields = (
            'username',
            'first_name',
            'last_name',
            'email',
            'password',
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name == 'password':
                field.widget = HiddenInput()
