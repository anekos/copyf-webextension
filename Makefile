
.PHONY: dist

watch:
	npm run watch

build:
	npm run build-production

release:
	./script/release

install:
	npm install
