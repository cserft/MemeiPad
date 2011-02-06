PROJECT_ROOT=`pwd`
SVN_DIR=/Users/gc/Projetos/iwasay/etc/MemeiPad/trunk/

clean: clean-languages
	@rm -rf ${PROJECT_ROOT}/src/build/iphone/*
	@echo "Deleted: ${PROJECT_ROOT}/src/build/iphone/*"

clean-languages:
	@PROJECT_ROOT=${PROJECT_ROOT} bash ${PROJECT_ROOT}/bin/i18n.sh clean

languages:
	@PROJECT_ROOT=${PROJECT_ROOT} bash ${PROJECT_ROOT}/bin/i18n.sh

launch-titanium:
	@echo "Building with Titanium..."
	@mkdir -p ${PROJECT_ROOT}/src/build/iphone/
	@PROJECT_ROOT=${PROJECT_ROOT} bash ${PROJECT_ROOT}/bin/titanium.sh

test:
	@echo "var testsEnabled = true;" > ${PROJECT_ROOT}/src/Resources/test/enabled.js
	@make launch-titanium
run:
	@echo "var testsEnabled = false;" > ${PROJECT_ROOT}/src/Resources/test/enabled.js
	@make launch-titanium

# APP BUILD WITHOUT OPENING SIMULATOR
titanium:
	@echo "TODO"

# DOWNLOAD SVN
# CHECKIN FILES
# UPLOAD
publish: clean languages titanium
	#@cp -prvf ${PROJECT_ROOT}/src/* ${SVN_DIR}

log:
	@tail -n100 -f ${PROJECT_ROOT}/src/build/iphone/build/build.log