docker-compose down
docker-compose build
docker image prune -f
docker volume prune -f
docker-compose up
