PROJECT_ROOT=`pwd`
SVN_DIR=/Users/gc/Projetos/iwasay/etc/MemeiPad/trunk/
IPHONE_SDK_VERSION=4.2
TI_SDK_VERSION=1.5.1
TI_DIR=/Library/Application\ Support/Titanium
TI_ASSETS_DIR=${TI_DIR}/mobilesdk/osx/${TI_SDK_VERSION}
TI_BUILD=${TI_ASSETS_DIR}/iphone/builder.py
APP_ID=com.yahoo.meme.ipad
APP_NAME=MemeiPad
APP_DEVICE=ipad

clean: clean-languages
	@rm -rf ${PROJECT_ROOT}/src/build/iphone/*
	@echo "Deleted: ${PROJECT_ROOT}/src/build/iphone/*"

clean-languages:
	@PROJECT_ROOT=${PROJECT_ROOT} bash ./bin/i18n.sh clean

languages:
	@PROJECT_ROOT=${PROJECT_ROOT} bash ./bin/i18n.sh

run:
	@echo "Building with Titanium..."
	@mkdir -p ${PROJECT_ROOT}/src/build/iphone/
	@${TI_BUILD} run ${PROJECT_ROOT}/src/ ${IPHONE_SDK_VERSION} ${APP_ID} ${APP_NAME} ${APP_DEVICE}

titanium:
	@echo "TODO"

publish: clean languages titanium
	#@cp -prvf ${PROJECT_ROOT}/src/* ${SVN_DIR}

log:
	@tail -n100 -f ${PROJECT_ROOT}/src/build/iphone/build/build.log