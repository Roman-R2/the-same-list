start: docker-up
stop: docker-down
restart: docker-down docker-up

rebuild: docker-down docker-build docker-up

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down --remove-orphans

docker-build:
	docker-compose build

migrate:
	docker-compose exec web python manage.py makemigrations
	docker-compose exec web python manage.py migrate --noinput
	# echo "from products_list.models import execute_my_sql_for_create_view_in_db; execute_my_sql_for_create_view_in_db()" | docker-compose exec -T web python manage.py shell

logs:
	docker-compose logs -f

shell:
	docker-compose exec web python manage.py shell

runserver:
	docker-compose exec web python manage.py runserver

collectstatic:
	docker-compose exec web python manage.py collectstatic

createsuperuser:
	docker-compose exec web python manage.py createsuperuser --noinput

restore-db: docker-down
	docker volume rm thesamelist_postgres-volume
	make docker-up
	docker-compose exec web rm -fr products_list/migrations
	docker-compose exec web mkdir products_list/migrations
	docker-compose exec web touch products_list/migrations/__init__.py
	make migrate
	make createsuperuser
	docker-compose exec web python manage.py loaddata product
	docker-compose exec web python manage.py loaddata list
	docker-compose exec web python manage.py loaddata product_in_list

