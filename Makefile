TARGET=web
BUILD_OPT=""
IMAGE_TAG=latest
MANIFEST_TAG=latest
IMAGE_PREFIX=gateway
IMAGE_REGISTRY=local

.PHONY: all
all: help

.PHONY: help
help:
	@echo "Usage: make <sub-command>"
	@echo "\n---------------- sub-command list ----------------"
	@cat Makefile | grep -e "^.PHONY:" | grep -v "all" | cut -f2 -d' '

.PHONY: clean
clean:
	rm -rf dist
	rm -rf node_modules

.PHONY: install
install:
	yarn install

.PHONY: build
build: test
	. env.sh && TARGET=$(TARGET) IMAGE_TAG=$(IMAGE_TAG) IMAGE_PREFIX=$(IMAGE_PREFIX) BUILD_OPT="$(BUILD_OPT)" . hack/docker-build.sh

.PHONY: build-ci
build-ci:
	TARGET=$(TARGET) IMAGE_TAG=$(IMAGE_TAG) IMAGE_PREFIX=$(IMAGE_PREFIX) BUILD_OPT="$(BUILD_OPT)" . hack/docker-build.sh
	docker tag $(IMAGE_PREFIX)/$(TARGET):$(IMAGE_TAG) $(IMAGE_REGISTRY)/$(IMAGE_PREFIX)/$(TARGET):$(IMAGE_TAG)

.PHONY: push-image
push-image:
	docker push $(IMAGE_REGISTRY)/$(IMAGE_PREFIX)/$(TARGET):$(IMAGE_TAG)

.PHONY: create-manifest
create-manifest:
	docker manifest create $(IMAGE_REGISTRY)/$(IMAGE_PREFIX)/$(TARGET):$(MANIFEST_TAG) $(IMAGE_REGISTRY)/$(IMAGE_PREFIX)/$(TARGET):$(IMAGE_TAG_BASE)_linux_amd64 $(IMAGE_REGISTRY)/$(IMAGE_PREFIX)/$(TARGET):$(IMAGE_TAG_BASE)_linux_arm64
	docker manifest annotate --arch amd64 $(IMAGE_REGISTRY)/$(IMAGE_PREFIX)/$(TARGET):$(MANIFEST_TAG) $(IMAGE_REGISTRY)/$(IMAGE_PREFIX)/$(TARGET):$(IMAGE_TAG_BASE)_linux_amd64
	docker manifest annotate --arch arm64 $(IMAGE_REGISTRY)/$(IMAGE_PREFIX)/$(TARGET):$(MANIFEST_TAG) $(IMAGE_REGISTRY)/$(IMAGE_PREFIX)/$(TARGET):$(IMAGE_TAG_BASE)_linux_arm64

.PHONY: push-manifest
push-manifest:
	docker manifest push $(IMAGE_REGISTRY)/$(IMAGE_PREFIX)/$(TARGET):$(MANIFEST_TAG)
	docker manifest inspect $(IMAGE_REGISTRY)/$(IMAGE_PREFIX)/$(TARGET):$(MANIFEST_TAG)

.PHONY: test
test:
	yarn lint

.PHONY: run
run: test
	yarn serve
