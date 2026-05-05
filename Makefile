.PHONY: install dev build start test test-watch test-coverage test-e2e lint format clean

install:
	npm install

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

test:
	npm test

test-watch:
	npm run test:watch

test-coverage:
	npm run test:coverage

test-e2e:
	npm run test:e2e

lint:
	npm run lint

format:
	npm run prettier

clean:
	rm -rf .next out node_modules/.cache test-results playwright-report
