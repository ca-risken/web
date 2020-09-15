#!/bin/bash -e

cd "$(dirname "$0")"

# load env
. ../env.sh

# setting remote repository
# export BUILD_OPT="--no-cache --pull"
export BUILD_OPT=""
export IMAGE="gateway/web"
export TAG="local-test-$(date '+%Y%m%d')"

# build & push
docker build ${BUILD_OPT} -t ${IMAGE}:${TAG} ..
$(aws ecr get-login --no-include-email --region ${AWS_DEFAULT_REGION})
docker tag ${IMAGE}:${TAG} ${REGISTORY}/${IMAGE}:${TAG}
docker push ${REGISTORY}/${IMAGE}:${TAG}
