start: docker-up

stop: docker-down

refresh: docker-down docker-build docker-up

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down --remove-orphans

docker-build:
	docker-compose build

migrate:
	docker-compose exec web python manage.py migrate --noinput

logs:
	docker-compose logs -f