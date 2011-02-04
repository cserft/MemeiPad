DEV_PATH=/Users/gc/Projetos/MemeiPad/
PROD_PATH=/Users/gc/Projetos/iwasay/etc/MemeiPad/trunk/

clean:
	@rm -rf ${DEV_PATH}/src/build/iphone/*
	@echo "Cleaned src/build/iphone/*"

publish:
	cp -prvf ${DEV_PATH}/src/build/iphone/* ${PROD_PATH}