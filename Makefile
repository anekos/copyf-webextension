
# See: https://addons.mozilla.org/en-US/developers/addon/api/key/
include .env
export PATH := node_modules/.bin:$(PATH)

.PHONY: dist

watch:
	npm run watch

build:
	npm run build

release:
	./script/release

sign:
	web-ext sign --source-dir dist

install:
	npm install

# Do `npm install npm-check-updates` to install `ncu`

check-update:
	ncu

update-modules:
	ncu -u
	npm update
