#!/bin/bash

PROJECT_ROOT=${PROJECT_ROOT:-../}
IPHONE_SDK_VERSION="4.2"
TI_SDK_VERSION="1.5.1"
TI_DIR="/Library/Application\ Support/Titanium"
TI_ASSETS_DIR="${TI_DIR}/mobilesdk/osx/${TI_SDK_VERSION}"
TI_IPHONE_DIR="${TI_ASSETS_DIR}/iphone"
TI_BUILD="${TI_IPHONE_DIR}/builder.py"
COLORS_HOOK="${PROJECT_ROOT}/bin/colors_hook.py"
APP_ID="com.yahoo.meme.ipad"
APP_NAME="MemeiPad"
APP_DEVICE="ipad"

bash -c "${TI_BUILD} run ${PROJECT_ROOT}/src/ ${IPHONE_SDK_VERSION} ${APP_ID} ${APP_NAME} ${APP_DEVICE}" \
	| perl -pe 's/^\[DEBUG\].*$/\e[35m$&\e[0m/g;s/^\[INFO\].*$/\e[36m$&\e[0m/g;s/^\[WARN\].*$/\e[33m$&\e[0m/g;s/^\[ERROR\].*$/\e[31m$&\e[0m/g;'

killall "iPhone Simulator"