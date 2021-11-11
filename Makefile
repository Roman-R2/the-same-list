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
	docker-compose exec web python manage.py migrate --noinput

logs:
	docker-compose logs -f