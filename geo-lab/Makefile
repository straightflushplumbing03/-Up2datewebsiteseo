.PHONY: install test typecheck build seed job backup

install:
	npm install

test:
	npm test

typecheck:
	npx tsc --noEmit

build:
	npm run build

seed:
	npm run seed

job:
	npm run job

backup:
	npm run backup -- data/backups/geo-lab-$$(date +%F).db
