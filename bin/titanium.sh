#!/bin/bash

PROJECT_ROOT=${PROJECT_ROOT:-../}
IPHONE_SDK_VERSION="4.2"
TI_SDK_VERSION="1.5.1"
TI_DIR="/Library/Application Support/Titanium"
TI_ASSETS_DIR="${TI_DIR}/mobilesdk/osx/${TI_SDK_VERSION}"
TI_IPHONE_DIR="${TI_ASSETS_DIR}/iphone"
TI_BUILD="${TI_IPHONE_DIR}/builder.py"
TI_BUILD_HOOK="${PROJECT_ROOT}/bin/titanium_hook.py"
APP_ID="com.yahoo.meme.ipad"
APP_NAME="MemeiPad"
APP_DEVICE="ipad"
PYTHONPATH="${TI_IPHONE_DIR}:${PROJECT_ROOT}/bin"

# execute builder directly
# bash -c "${TI_BUILD} run ${PROJECT_ROOT}/src/ ${IPHONE_SDK_VERSION} ${APP_ID} ${APP_NAME} ${APP_DEVICE}"

# execute builder through titanium_hook
PYTHONPATH=${PYTHONPATH} ${TI_BUILD_HOOK} run ${PROJECT_ROOT}/src/ ${IPHONE_SDK_VERSION} ${APP_ID} ${APP_NAME} ${APP_DEVICE}