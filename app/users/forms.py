from django.contrib.auth.forms import AuthenticationForm, UserCreationForm, \
    UserChangeForm
from django.contrib.auth.models import User
from django.forms import HiddenInput


class UserLoginForm(AuthenticationForm):
    class Meta:
        model = User

        fields = ('username', 'password',)


class UserRegisterForm(UserCreationForm):
    class Meta:
        model = User
        fields = (
            'username',
            'email',
            'password1',
            'password2',
        )

    # def clean_age(self):
    #     data_age = self.cleaned_data['age']
    #     if data_age < 18:
    #         raise forms.ValidationError('Вам мало лет.')
    #     return data_age


class UserEditForm(UserChangeForm):
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
            field.widget.attrs['class'] = 'form-control'
            if field_name == 'password':
                field.widget = HiddenInput()
