#!/bin/bash

# This script transforms i18n files from Titanium format (XML)
# to Xcode format (Localizable.strings)

SRCROOT="/Users/gc/Projetos/MemeiPad"
LANGUAGES=( en es id pt zh-Hant )
IFS=$'\n' # set line separator to \n

for language in ${LANGUAGES[@]}; do
	IN="${SRCROOT}/src/i18n/${language}/strings.xml"
	OUT="${SRCROOT}/src/Resources/${language}.lproj/Localizable.strings"

	# delete old language files
	rm -rf $OUT

	if [ "${1}" == "clean" ]; then
		echo "Deleted: ${OUT}"
	else
		for line in `cat ${IN}`; do
			if [[ $line =~ '<string' ]]; then
				echo $line | sed -e 's/[[:blank:]]*<string name=//g' -e 's/">/" = "/g' -e 's/<\/string>/";/g' -e 's/<!--.*-->//g' >> $OUT
			fi
		done
		echo "Generated: ${OUT}"
	fi
done