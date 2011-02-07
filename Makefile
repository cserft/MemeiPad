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
	@echo "" > ${PROJECT_ROOT}/src/Resources/test/enabled.js
	@make launch-titanium

# APP BUILD WITHOUT OPENING SIMULATOR
build:
	@echo "TODO"

# TODO: clean and build Titanium first (tarket 'build')
# TODO: download SVN first, then checkin files, then upload
# TODO: patch main.m to put correct TI_APPLICATION_RESOURCE_DIR
publish: languages
	@echo "Copying root files..."
	@cp -prf ${PROJECT_ROOT}/src/CHANGELOG.txt ${SVN_DIR}
	@cp -prf ${PROJECT_ROOT}/src/Info.plist ${SVN_DIR}
	@cp -prf ${PROJECT_ROOT}/src/LICENSE* ${SVN_DIR}
	@cp -prf ${PROJECT_ROOT}/src/manifest ${SVN_DIR}
	@cp -prf ${PROJECT_ROOT}/src/tiapp.xml ${SVN_DIR}
	@echo "Copying Resources..."
	@mkdir -p ${SVN_DIR}/Resources/
	@cp -prf ${PROJECT_ROOT}/src/Resources/images ${SVN_DIR}/Resources/
	@cp -prf ${PROJECT_ROOT}/src/Resources/iphone ${SVN_DIR}/Resources/
	@cp -prf ${PROJECT_ROOT}/src/Resources/lib ${SVN_DIR}/Resources/
	@cp -prf ${PROJECT_ROOT}/src/Resources/*.js ${SVN_DIR}/Resources/
	@cp -prf ${PROJECT_ROOT}/src/Resources/*.png ${SVN_DIR}/Resources/
	@echo "Copying Languages..."
	@cp -prf ${PROJECT_ROOT}/src/Resources/*.lproj ${SVN_DIR}/Resources/
	@echo "Disabling in destination..."
	@mkdir -p ${SVN_DIR}/Resources/test/
	@echo "" > ${SVN_DIR}/Resources/test/enabled.js
	@echo "Copying fonts..."
	@for FONT in `find . -type f -name "GothamRnd-*.otf"`;\
	do\
		cp -prf $$FONT ${SVN_DIR}/Resources/;\
	done
	@echo "Copying Titanium build directory..."
	@mkdir -p ${SVN_DIR}/build/iphone/
	@cp -prf ${PROJECT_ROOT}/src/build/iphone/Classes ${SVN_DIR}/build/iphone/
	@cp -prf ${PROJECT_ROOT}/src/build/iphone/headers ${SVN_DIR}/build/iphone/
	@cp -prf ${PROJECT_ROOT}/src/build/iphone/lib ${SVN_DIR}/build/iphone/
	@cp -prf ${PROJECT_ROOT}/src/build/iphone/Resources ${SVN_DIR}/build/iphone/
	@cp -prf ${PROJECT_ROOT}/src/build/iphone/Info.plist ${SVN_DIR}/build/iphone/
	#@cp -prf ${PROJECT_ROOT}/src/build/iphone/main.m ${SVN_DIR}/build/iphone/
	@cp -prf ${PROJECT_ROOT}/src/build/iphone/MemeiPad_Prefix.pch ${SVN_DIR}/build/iphone/
	@cp -prf ${PROJECT_ROOT}/src/build/iphone/module.xcconfig ${SVN_DIR}/build/iphone/
	@cp -prf ${PROJECT_ROOT}/src/build/iphone/project.xcconfig ${SVN_DIR}/build/iphone/
	@echo "**************************************************'
	@echo "Please remember that the following file:'
	@echo "- '${PROJECT_ROOT}/src/build/iphone/MemeiPad.xcodeproj/project.pbxproj'
	@echo "Needs to be published manually (to avoid SVN conflicts).'
	@echo "**************************************************'
	@echo "Done."

log:
	@tail -n100 -f ${PROJECT_ROOT}/src/build/iphone/build/build.log