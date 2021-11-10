start: docker-up

stop: docker-down

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down --remove-orphans