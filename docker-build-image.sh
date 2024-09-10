echo $0
set -e
set -u
source ./docker.env
echo "Building $IMAGE_NAME"
docker build --pull -t $IMAGE_NAME .
