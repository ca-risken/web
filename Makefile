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

.PHONY: test
test:
	yarn lint

.PHONY: build
build: test
	yarn build

.PHONY: run
run: test
	yarn serve
