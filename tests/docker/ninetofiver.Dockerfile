FROM python:3.6

RUN mkdir /code
WORKDIR /code

RUN pip install pipenv
RUN apt-get update && apt-get install -y unzip python-dev libldap2-dev libsasl2-dev libssl-dev

RUN curl -OL 'https://github.com/kalmanolah/925r/archive/develop.zip' && \
    unzip develop.zip && \
    rm develop.zip

WORKDIR /code/925r-develop
RUN pipenv install
RUN pipenv run python manage.py migrate
RUN echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@example.org', 'password123')" | pipenv run python manage.py shell
RUN echo "from oauth2_provider.models import Application; from django.contrib.auth import get_user_model; User = get_user_model(); client = Application.objects.create(user=User.objects.filter(is_staff=True)[0], name='Generated Application', client_id='generated_client_id', client_secret='generated_client_secret', authorization_grant_type=Application.GRANT_PASSWORD)" | pipenv run python manage.py shell
RUN pipenv run python manage.py create_timesheets

EXPOSE 8000
ENTRYPOINT pipenv run python manage.py runserver 0.0.0.0:8000