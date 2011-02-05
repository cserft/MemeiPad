PROJECT_ROOT=`pwd`
SVN_DIR=/Users/gc/Projetos/iwasay/etc/MemeiPad/trunk/

clean: clean-languages
	@rm -rf ${PROJECT_ROOT}/src/build/iphone/*
	@echo "Deleted: ${PROJECT_ROOT}/src/build/iphone/*"

clean-languages:
	@PROJECT_ROOT=${PROJECT_ROOT} bash ${PROJECT_ROOT}/bin/i18n.sh clean

languages:
	@PROJECT_ROOT=${PROJECT_ROOT} bash ${PROJECT_ROOT}/bin/i18n.sh

run:
	@echo "Building with Titanium..."
	@mkdir -p ${PROJECT_ROOT}/src/build/iphone/
	@PROJECT_ROOT=${PROJECT_ROOT} bash ${PROJECT_ROOT}/bin/titanium.sh

titanium:
	@echo "TODO"

publish: clean languages titanium
	#@cp -prvf ${PROJECT_ROOT}/src/* ${SVN_DIR}

log:
	@tail -n100 -f ${PROJECT_ROOT}/src/build/iphone/build/build.log