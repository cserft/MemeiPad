DEV_PATH=/Users/gc/Projetos/MemeiPad/
PROD_PATH=/Users/gc/Projetos/iwasay/etc/MemeiPad/trunk/

clean: clean-languages
	@rm -rf ${DEV_PATH}/src/build/iphone/*
	@echo "Deleted: src/build/iphone/*"

clean-languages:
	@bash ./bin/i18n.sh clean

languages:
	@bash ./bin/i18n.sh

publish: clean languages
	@cp -prvf ${DEV_PATH}/src/* ${PROD_PATH}