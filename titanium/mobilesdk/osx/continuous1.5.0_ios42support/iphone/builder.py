#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Build and Launch iPhone Application in Simulator or install
# the application on the device via iTunes
# 

import os, sys, uuid, subprocess, shutil, signal, string, traceback, imp
import platform, time, re, run, glob, codecs, hashlib, datetime, plistlib
from compiler import Compiler
from projector import Projector
from xml.dom.minidom import parseString
from pbxproj import PBXProj
from os.path import join, splitext, split, exists

# the template_dir is the path where this file lives on disk
template_dir = os.path.abspath(os.path.dirname(sys._getframe(0).f_code.co_filename))

# add the parent and the common directory so we can load libraries from those paths too
sys.path.append(os.path.join(template_dir,'../'))
sys.path.append(os.path.join(template_dir,'../common'))
script_ok = False

from tiapp import *
from css import csscompiler
import localecompiler

ignoreFiles = ['.gitignore', '.cvsignore']
ignoreDirs = ['.git','.svn', 'CVS']

# need this so unicode works
sys.stdout = codecs.getwriter('utf-8')(sys.stdout)

def version_sort(a,b):
	x = float(a[0:3]) # ignore more than 2 places
	y = float(b[0:3]) # ignore more than 2 places
	if x > y:
		return -1
	if x < y:
		return 1
	return 0

# this will return the version of the iOS SDK that we have installed
def check_iphone_sdk(s):
	found = []
	output = run.run(["xcodebuild","-showsdks"],True,False)
	#print output
	if output:
		for line in output.split("\n"):
			if line[0:1] == '\t':
				line = line.strip()
				i = line.find('-sdk')
				if i < 0: continue
				type = line[0:i]
				cmd = line[i+5:]
				if cmd.find("iphoneos")==0:
					ver = cmd[8:]
					found.append(ver)
	# The sanity check doesn't have to be as thorough as prereq.
	if s in found:
		return s
	# Sanity check failed. Let's find something close.
	return sorted(found,version_sort)[0]

def dequote(s):
	if s[0:1] == '"':
		return s[1:-1]
	return s

# force kill the simulator if running
def kill_simulator():
	run.run(['/usr/bin/killall',"iPhone Simulator"],True)

def write_project_property(f,prop,val):
	existing_val = read_project_property(f,prop)
	if existing_val!=val:
		fx = open(f,'w')
		fx.write("%s=%s\n"%(prop,val))
		fx.close()
	
def read_config(f):
	props = {}
	if os.path.exists(f):
		contents = open(f).read()
		for line in contents.splitlines(False):
			if line[0:1]=='#': continue
			(k,v) = line.split("=")
			props[k]=v
	return props
			
def read_project_property(f,prop):
	if os.path.exists(f):
		contents = open(f).read()
		for line in contents.splitlines(False):
			(k,v) = line.split("=")
			if k == prop:
				return v
	return None

def read_project_appid(f):
	return read_project_property(f,'TI_APPID')
	
def read_project_version(f):
	return read_project_property(f,'TI_VERSION')
			
def infoplist_has_appid(f,appid):
	if os.path.exists(f):
		contents = codecs.open(f,encoding='utf-8').read()
		return contents.find(appid)>0
	return False
		
def copy_module_resources(source, target, copy_all=False, force=False):
	if not os.path.exists(os.path.expanduser(target)):
		os.makedirs(os.path.expanduser(target))
	for root, dirs, files in os.walk(source):
		for name in ignoreDirs:
			if name in dirs:
				dirs.remove(name)	# don't visit ignored directories			  
		for file in files:
			if copy_all==False and splitext(file)[-1] in ('.html', '.js', '.css', '.a', '.m', '.c', '.cpp', '.h', '.mm'):
				continue
			if file in ignoreFiles:
				continue
			from_ = os.path.join(root, file)			  
			to_ = os.path.expanduser(from_.replace(source, target, 1))
			to_directory = os.path.expanduser(split(to_)[0])
			if not exists(to_directory):
				os.makedirs(to_directory)
			# only copy if different filesize or doesn't exist
			if not os.path.exists(to_) or os.path.getsize(from_)!=os.path.getsize(to_) or force:
				if os.path.exists(to_): os.remove(to_)
				shutil.copyfile(from_, to_)

def make_app_name(s):
	r = re.compile('[0-9a-zA-Z_]')
	buf = ''
	for i in s:
		if i=='-':
			buf+='_'
			continue
		if r.match(i)!=None:
			buf+=i
	# if name starts with number, we simply append a k to it
	if re.match('^[0-9]+',buf):
		buf = 'k%s' % buf
	return buf

def getText(nodelist):
	rc = ""
	for node in nodelist:
		if node.nodeType == node.TEXT_NODE:
			rc+=node.data
		elif node.nodeType == node.ELEMENT_NODE:
			rc+=getText(node.childNodes)
	return rc

def make_map(dict):
	props = {}
	curkey = None

	for i in dict.childNodes:
		if i.nodeType == 1:
			if i.nodeName == 'key':
				curkey = str(getText(i.childNodes)).strip()
			elif i.nodeName == 'dict':
				props[curkey] = make_map(i)
				curkey = None
			elif i.nodeName == 'array':
				s = i.getElementsByTagName('string')
				if len(s):
					txt = ''
					for t in s:
						txt+=getText(t.childNodes)
					props[curkey]=txt
				else:
					props[curkey]=None
				curkey = None
			else:
				if i.childNodes.length > 0:
					props[curkey] = getText(i.childNodes)
				else:
					props[curkey] = i.nodeName
				curkey = None

	return props

def dump_resources_listing(rootdir,out):
	out.write("\nFile listing for %s\n\n" % rootdir)
	total = 0
	for root, subFolders, files in os.walk(rootdir):
		for file in files:
			p = os.path.join(root,file)
			s = os.path.getsize(p)
			total+=s
			s = "[%.0f]" % s
			p = p[len(rootdir)+1:]
			if p.startswith('build/android'): continue
			out.write("  %s %s\n" % (string.ljust(p,120),string.ljust(s,8)))
	out.write("-" * 130)
	out.write("\nTotal files: %.1f MB\n" % ((total/1024)/1024))
	out.write("\n")

def dump_infoplist(infoplist,out):
	plist = codecs.open(infoplist, encoding='utf-8').read()
	out.write("Contents of Info.plist\n\n")
	out.write(plist)
	out.write("\n")
	out.write("=" * 130)
	out.write("\n\n")
		
def read_provisioning_profile(f,o):
	f = open(f,'rb').read()
	b = f.index('<?xml')
	e = f.index('</plist>')
	xml_content = f[b:e+8]
	o.write("Reading provisioning profile:\n\n%s\n" % xml_content)
	dom = parseString(xml_content)
	dict = dom.getElementsByTagName('dict')[0]
	props = make_map(dict)
	return props
	
def get_task_allow(provisioning_profile):
	entitlements = provisioning_profile['Entitlements']
	return entitlements['get-task-allow']
	
def get_app_prefix(provisioning_profile):
	appid_prefix = provisioning_profile['ApplicationIdentifierPrefix']
	return appid_prefix
	
def get_profile_uuid(provisioning_profile):
	return provisioning_profile['UUID']
	
def generate_customized_entitlements(provisioning_profile,appid,uuid,command,out):
	
	get_task_value = get_task_allow(provisioning_profile)
	
	buffer = """<?xml version="1.0" encoding="UTF-8"?> 	
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
	<dict>
"""		
	
	app_prefix = None
	
	if command=='distribute':
		app_prefix = get_app_prefix(provisioning_profile)
		out.write("Using app_prefix = %s\n\n" % (app_prefix))
		buffer+="""
		<key>application-identifier</key>
		<string>%s.%s</string>
		""" % (app_prefix,appid)
	
	buffer+="<key>get-task-allow</key>\n		<%s/>" % get_task_value
	
	if command=='distribute':
		buffer+="""
		<key>keychain-access-groups</key>
		<array>
			<string>%s.%s</string>
		</array>
		""" % (app_prefix,appid)

	buffer+="""
	</dict>
</plist>"""
	
	return buffer

#
# this script is invoked from our tooling but you can run from command line too if 
# you know the arguments
#
# the current pattern is <command> [arguments]
#
# where the arguments are dependent on the command being passed
#	
def main(args):
	global script_ok
	argc = len(args)
	if argc < 2 or argc==2 and (args[1]=='--help' or args[1]=='-h'):
		print "%s <command> <version> <project_dir> <appid> <name> [options]" % os.path.basename(args[0])
		print
		print "available commands: "
		print
		print "  install       install the app to itunes for testing on iphone"
		print "  simulator     build and run on the iphone simulator"
		print "  distribute    build final distribution bundle"
		print "  xcode         build from within xcode"
		print "  run           build and run app from project folder"
	
		sys.exit(1)

	print "[INFO] One moment, building ..."
	sys.stdout.flush()
	start_time = time.time()
	command = args[1].decode("utf-8")
	
	target = 'Debug'
	deploytype = 'development'
	devicefamily = 'iphone'
	debug = False
	simulator = False
	xcode_build = False
	force_xcode = False

	# when you run from xcode, we'll pass xcode as the command and the 
	# xcode script will simply pass some additional args as well as xcode
	# will add some additional useful stuff to the ENVIRONMENT and we pull
	# those values out here
	if command == 'xcode':
		xcode_build = True
		src_root = os.environ['SOURCE_ROOT']
		project_dir = os.path.abspath(os.path.join(src_root,'../','../'))
		name = os.environ['PROJECT_NAME']
		target = os.environ['CONFIGURATION']
		appid = os.environ['TI_APPID']
		arch = os.environ['CURRENT_ARCH']
		sdk_name = os.environ['SDK_NAME']
		iphone_version = sdk_name.replace('iphoneos','').replace('iphonesimulator','')
		# SUPPORTED_DEVICE_FAMILIES 1 or 2 or both
		# TARGETED_DEVICE_FAMILY 1 or 2
		target_device = os.environ['TARGETED_DEVICE_FAMILY']
		if target_device == '1':
			devicefamily = 'iphone'
		elif target_device == '2':
			devicefamily = 'ipad'
		if arch == 'i386': 
			# simulator always indicates simulator
			deploytype = 'development'
		else:
			# if arch!=i386 indicates a build for device
			if target=='Debug':
				# non-simulator + debug build indicates test on device
				deploytype = 'test'
			else:
				# non-simulator + release build indicates package for distribution
				deploytype = 'production'
		compiler = Compiler(project_dir,appid,name,deploytype,xcode_build,devicefamily,iphone_version)
		script_ok = True
		sys.exit(0)
	else:
		# the run command is when you run from titanium using the run command
		# and it will run the project in the current directory immediately in the simulator
		# from the command line
		if command == 'run':
			if argc < 3:
				print "Usage: %s run <project_dir> [ios_version]" % os.path.basename(args[0])
				sys.exit(1)
			if argc == 3:
				iphone_version = check_iphone_sdk('4.0')
			else:
				iphone_version = dequote(args[3].decode("utf-8"))
			project_dir = os.path.expanduser(dequote(args[2].decode("utf-8")))
			iphonesim = os.path.abspath(os.path.join(template_dir,'iphonesim'))
			iphone_dir = os.path.abspath(os.path.join(project_dir,'build','iphone'))
			tiapp_xml = os.path.join(project_dir,'tiapp.xml')
			ti = TiAppXML(tiapp_xml)
			appid = ti.properties['id']
			name = ti.properties['name']
			command = 'simulator' # switch it so that the rest of the stuff works
		else:
			iphone_version = dequote(args[2].decode("utf-8"))
			iphonesim = os.path.abspath(os.path.join(template_dir,'iphonesim'))
			project_dir = os.path.expanduser(dequote(args[3].decode("utf-8")))
			appid = dequote(args[4].decode("utf-8"))
			name = dequote(args[5].decode("utf-8"))
			tiapp_xml = os.path.join(project_dir,'tiapp.xml')
			ti = TiAppXML(tiapp_xml)
			
		app_name = make_app_name(name)
		iphone_dir = os.path.abspath(os.path.join(project_dir,'build','iphone'))
		project_xcconfig = os.path.join(iphone_dir,'project.xcconfig')
		target = 'Release'
		ostype = 'os'
		version_file = None
		log_id = None
		provisioning_profile = None
		
		# starting in 1.4, you don't need to actually keep the build/iphone directory
		# if we don't find it, we'll just simply re-generate it
		if not os.path.exists(iphone_dir):
			from iphone import IPhone
			print "[INFO] Detected missing project but that's OK. re-creating it..."
			iphone_creator = IPhone(name,appid)
			iphone_creator.create(iphone_dir,True)
			sys.stdout.flush()
			
		# we use different arguments dependent on the command
		# pluck those out here
		if command == 'distribute':
			iphone_version = check_iphone_sdk(iphone_version)
			appuuid = dequote(args[6].decode("utf-8"))
			dist_name = dequote(args[7].decode("utf-8"))
			output_dir = os.path.expanduser(dequote(args[8].decode("utf-8")))
			if argc > 9:
				devicefamily = dequote(args[9].decode("utf-8"))
			deploytype = 'production'
		elif command == 'simulator':
			deploytype = 'development'
			debug = True
			simulator = True
			target = 'Debug'
			ostype = 'simulator'
			if argc > 6:
				devicefamily = dequote(args[6].decode("utf-8"))
		elif command == 'install':
			iphone_version = check_iphone_sdk(iphone_version)
			appuuid = dequote(args[6].decode("utf-8"))
			dist_name = dequote(args[7].decode("utf-8"))
			if argc > 8:
				devicefamily = dequote(args[8].decode("utf-8"))
			deploytype = 'test'
		
		# setup up the useful directories we need in the script
		build_out_dir = os.path.abspath(os.path.join(iphone_dir,'build'))
		build_dir = os.path.abspath(os.path.join(build_out_dir,'%s-iphone%s'%(target,ostype)))
		app_dir = os.path.abspath(os.path.join(build_dir,name+'.app'))
		binary = os.path.join(app_dir,name)
		sdk_version = os.path.basename(os.path.abspath(os.path.join(template_dir,'../')))
		iphone_resources_dir = os.path.join(iphone_dir,'Resources')
		version_file = os.path.join(iphone_resources_dir,'.version')
		force_rebuild = read_project_version(project_xcconfig)!=sdk_version or not os.path.exists(version_file)
		infoplist = os.path.join(iphone_dir,'Info.plist')
		githash = None
		custom_fonts = []

		# if we're not running in the simulator we want to clean out the build directory
		if command!='simulator' and os.path.exists(build_out_dir):
			shutil.rmtree(build_out_dir)
		if not os.path.exists(build_out_dir): 
			os.makedirs(build_out_dir)
		# write out the build log, useful for debugging
		o = codecs.open(os.path.join(build_out_dir,'build.log'),'w',encoding='utf-8')
		try:
			buildtime = datetime.datetime.now()
			o.write("%s\n" % ("="*80))
			o.write("Appcelerator Titanium Diagnostics Build Log\n")
			o.write("The contents of this file are useful to send to Appcelerator Support if\n")
			o.write("reporting an issue to help us understand your environment, build settings\n")
			o.write("and aid in debugging. Please attach this log to any issue that you report.\n")
			o.write("%s\n\n" % ("="*80))
			o.write("Starting build at %s\n\n" % buildtime.strftime("%m/%d/%y %H:%M"))
			
			# write out the build versions info
			versions_txt = read_config(os.path.join(template_dir,'..','version.txt'))
			o.write("Build details:\n\n")
			for key in versions_txt:
				o.write("   %s=%s\n" % (key,versions_txt[key]))
			o.write("\n\n")
			
			if versions_txt.has_key('githash'): 
				githash = versions_txt['githash']
				
			o.write("Script arguments:\n")
			for arg in args:
				o.write(unicode("   %s\n" % arg, 'utf-8'))
			o.write("\n")
			o.write("Building from: %s\n" % template_dir)
			o.write("Platform: %s\n\n" % platform.version())

			# print out path to debug
			xcode_path=run.run(["/usr/bin/xcode-select","-print-path"],True,False)
			if xcode_path:
				o.write("Xcode path is: %s\n" % xcode_path)
			else:
				o.write("Xcode path undetermined\n")

			# find the module directory relative to the root of the SDK	
			titanium_dir = os.path.abspath(os.path.join(template_dir,'..','..','..','..'))
			tp_module_dir = os.path.abspath(os.path.join(titanium_dir,'modules','iphone'))
			tp_modules = []
			tp_depends = []
			
			force_destroy_build = command!='simulator'

			def find_depends(config,depends):
				for line in open(config).readlines():
					if line.find(':')!=-1:
						(token,value)=line.split(':')
						for entry in value.join(','):
							entry = entry.strip()
							try:
								depends.index(entry)
							except:
								depends.append(entry)

			# check to see if we have any uninstalled modules/plugins
			# if we detect any zips, unzip them
			if ti.properties.has_key('modules') or ti.properties.has_key('plugins'):
				cwd = os.getcwd()
				os.chdir(titanium_dir)
				for entry in glob.glob('%s/*.zip' % titanium_dir):
					filename = os.path.basename(entry)
					if filename.startswith('mobilesdk-'): continue
					print "[INFO] installing %s" % entry
					run.run(['/usr/bin/unzip','-o',entry])
					os.remove(entry)
				os.chdir(cwd)

			tp_lib_search_path = []
			tp_module_asset_dirs = []
			
			# search for modules that the project is using
			# and make sure we add them to the compile
			for module in ti.properties['modules']:
				tp_name = module['name'].lower()
				tp_version = module['version']
				libname = 'lib%s.a' % tp_name
				# check first in the local project
				local_tp = os.path.join(project_dir,'modules','iphone',libname)
				local = False
				tp_dir = None
				if os.path.exists(local_tp):
					tp_modules.append(local_tp)
					tp_lib_search_path.append([libname,local_tp])
					local = True
					print "[INFO] Detected third-party module: %s" % (local_tp)
					o.write("Detected third-party module: %s\n" % (local_tp))
				else:
					tp_dir = os.path.join(tp_module_dir,tp_name,tp_version)
					if not os.path.exists(tp_dir):
						print "[ERROR] Third-party module: %s/%s detected in tiapp.xml but not found at %s" % (tp_name,tp_version,tp_dir)
						o.write("[ERROR] Third-party module: %s/%s detected in tiapp.xml but not found at %s\n" % (tp_name,tp_version,tp_dir))
						sys.exit(1)
					tp_module = os.path.join(tp_dir,libname)
					if not os.path.exists(tp_module):
						print "[ERROR] Third-party module: %s/%s missing library at %s" % (tp_name,tp_version,tp_module)
						o.write("[ERROR] Third-party module: %s/%s missing library at %s\n" % (tp_name,tp_version,tp_module))
						sys.exit(1)
					tp_config = os.path.join(tp_dir,'manifest')
					if not os.path.exists(tp_config):
						print "[ERROR] Third-party module: %s/%s missing manifest at %s" % (tp_name,tp_version,tp_config)
						o.write("[ERROR] Third-party module: %s/%s missing manifest at %s\n" % (tp_name,tp_version,tp_config))
						sys.exit(1)
					find_depends(tp_config,tp_depends)	
					tp_modules.append(tp_module)
					tp_lib_search_path.append([libname,os.path.abspath(tp_module)])	
					print "[INFO] Detected third-party module: %s/%s" % (tp_name,tp_version)
					o.write("Detected third-party module: %s/%s\n" % (tp_name,tp_version))
				force_xcode = True

				if not local:
					# copy module resources
					img_dir = os.path.join(tp_dir,'assets','images')
					if os.path.exists(img_dir):
						dest_img_dir = os.path.join(app_dir,'modules',tp_name,'images')
						if not os.path.exists(dest_img_dir):
							os.makedirs(dest_img_dir)
						tp_module_asset_dirs.append([img_dir,dest_img_dir])

					# copy in any module assets
					tp_assets_dir = os.path.join(tp_dir,'assets')
					if os.path.exists(tp_assets_dir): 
						module_dir = os.path.join(app_dir,'modules',tp_name)
						tp_module_asset_dirs.append([tp_assets_dir,module_dir])


			print "[INFO] Titanium SDK version: %s" % sdk_version
			print "[INFO] iPhone Device family: %s" % devicefamily
			print "[INFO] iPhone SDK version: %s" % iphone_version
			
			if simulator:
				# during simulator we need to copy in standard built-in module files
				# since we might not run the compiler on subsequent launches
				for module_name in ('facebook','ui'):
					img_dir = os.path.join(template_dir,'modules',module_name,'images')
					dest_img_dir = os.path.join(app_dir,'modules',module_name,'images')
					if not os.path.exists(dest_img_dir):
						os.makedirs(dest_img_dir)
					tp_module_asset_dirs.append([img_dir,dest_img_dir])

				# when in simulator since we point to the resources directory, we need
				# to explicitly copy over any files
				ird = os.path.join(project_dir,'Resources','iphone')
				if os.path.exists(ird): 
					tp_module_asset_dirs.append([ird,app_dir])
				
				for ext in ('ttf','otf'):
					for f in glob.glob('%s/*.%s' % (os.path.join(project_dir,'Resources'),ext)):
						custom_fonts.append(f)
					

			if not simulator:
				version = ti.properties['version']
				# we want to make sure in debug mode the version always changes
				version = "%s.%d" % (version,time.time())
				ti.properties['version']=version
				pp = os.path.expanduser("~/Library/MobileDevice/Provisioning Profiles/%s.mobileprovision" % appuuid)
				provisioning_profile = read_provisioning_profile(pp,o)
					
# TODO:				
# This code is used elsewhere, as well.  We should move stuff like this to
# a common file.
			def write_info_plist(infoplist_tmpl):
				plist = codecs.open(infoplist_tmpl, encoding='utf-8').read()
				plist = plist.replace('__PROJECT_NAME__',name)
				plist = plist.replace('__PROJECT_ID__',appid)
				plist = plist.replace('__URL__',appid)
				urlscheme = name.replace('.','_').replace(' ','').lower()
				plist = plist.replace('__URLSCHEME__',urlscheme)
				pf = codecs.open(infoplist,'w', encoding='utf-8')
				pf.write(plist)
				pf.close()			

			# if the user has a Info.plist in their project directory, consider
			# that a custom override
			infoplist_tmpl = os.path.join(project_dir,'Info.plist')
			if os.path.exists(infoplist_tmpl):
				shutil.copy(infoplist_tmpl,infoplist)
			else:
				infoplist_tmpl = os.path.join(template_dir,'Info.plist')
				write_info_plist(infoplist_tmpl)

			applogo = None
			clean_build = False

			# check to see if the appid is different (or not specified) - we need to re-generate
			if read_project_appid(project_xcconfig)!=appid or not infoplist_has_appid(infoplist,appid):
				clean_build = True
				force_xcode = True


			new_lib_hash = None
			lib_hash = None	
			existing_git_hash = None

			# this code simply tries and detect if we're building a different
			# version of the project (or same version but built from different git hash)
			# and if so, make sure we force rebuild so to propograte any code changes in
			# source code (either upgrade or downgrade)
			if os.path.exists(app_dir):
				if os.path.exists(version_file):
					line = open(version_file).read().strip()
					lines = line.split(",")
					v = lines[0]
					log_id = lines[1]
					if len(lines) > 2:
						lib_hash = lines[2]
						existing_git_hash = lines[3]
					if lib_hash==None:
						force_rebuild = True
					else:
						if template_dir==v and force_rebuild==False:
							force_rebuild = False
						else:
							log_id = None
				else:
					force_rebuild = True

			else:
				force_rebuild = True

			o.write("\ngithash=%s, existing_git_hash=%s\n" %(githash,existing_git_hash))
				
			if githash!=existing_git_hash:
				force_rebuild = True

			# we want to read the md5 of the libTiCore.a library since it must match
			# the current one we're building and if not, we need to force a rebuild since
			# that means we've copied in a different version of the library and we need
			# to rebuild clean to avoid linking errors
			source_lib=os.path.join(template_dir,'libTiCore.a')
			fd = open(source_lib,'rb')
			m = hashlib.md5()
			m.update(fd.read(1024)) # just read 1K, it's binary
			new_lib_hash = m.hexdigest()
			fd.close()
			
			if new_lib_hash!=lib_hash:
				force_rebuild=True
				o.write("forcing rebuild since libhash (%s) not matching (%s)\n" % (lib_hash,new_lib_hash))

			lib_hash=new_lib_hash

			# when we force rebuild, we need to re-compile and re-copy source, libs etc
			if force_rebuild:
				o.write("Performing full rebuild\n")
				print "[INFO] Performing full rebuild. This will take a little bit. Hold tight..."
				sys.stdout.flush()
				project = Projector(name,sdk_version,template_dir,project_dir,appid)
				project.create(template_dir,iphone_dir)	
				force_xcode = True
				if os.path.exists(app_dir): shutil.rmtree(app_dir)
				# we have to re-copy if we have a custom version
				write_info_plist(infoplist_tmpl)
				# since compiler will generate the module dependencies, we need to 
				# attempt to compile to get it correct for the first time.
				compiler = Compiler(project_dir,appid,name,deploytype,xcode_build,devicefamily,iphone_version,True)
			else:
				contents="TI_VERSION=%s\n"% sdk_version
				contents+="TI_SDK_DIR=%s\n" % template_dir.replace(sdk_version,'$(TI_VERSION)')
				contents+="TI_APPID=%s\n" % appid
				contents+="OTHER_LDFLAGS[sdk=iphoneos4*]=$(inherited) -weak_framework iAd\n"
				contents+="OTHER_LDFLAGS[sdk=iphonesimulator4*]=$(inherited) -weak_framework iAd\n"
				contents+="#include \"module\"\n"
				xcconfig = open(project_xcconfig,'w+')
				xccontents = xcconfig.read()
				if contents!=xccontents:
					o.write("writing contents of %s:\n\n%s\n" % (project_xcconfig,contents))
					o.write("old contents\n\n%s\n" % (xccontents))
					xcconfig.write(contents)
					xcconfig.close()
				else:
					o.write("Skipping writing contents of xcconfig %s\n" % project_xcconfig)

			# write out any modules into the xcode project
			# this must be done after project create above or this will be overriden
			if len(tp_lib_search_path)>0:
				proj = PBXProj()
				xcode_proj = os.path.join(iphone_dir,'%s.xcodeproj'%name,'project.pbxproj')
				current_xcode = open(xcode_proj).read()
				for tp in tp_lib_search_path:
					proj.add_static_library(tp[0],tp[1])
				out = proj.parse(xcode_proj)
				# since xcode changes can be destructive, only write as necessary (if changed)
				if current_xcode!=out:
					xo = open(xcode_proj,'w')
					xo.write(out)
					xo.close()

			cwd = os.getcwd()

			# check to see if the symlink exists and that it points to the
			# right version of the library
			libticore = os.path.join(template_dir,'libTiCore.a')
			make_link = True
			symlink = os.path.join(iphone_dir,'lib','libTiCore.a')
			if os.path.islink(symlink):
				path = os.path.realpath(symlink)
				if path.find(sdk_version) > 0:
					make_link = False
			if make_link:
				libdir = os.path.join(iphone_dir,'lib')
				if not os.path.exists(libdir): os.makedirs(libdir)
				os.chdir(libdir)
				# a broken link will not return true on os.path.exists
				# so we need to use brute force
				try:
					os.unlink("libTiCore.a")
				except:
					pass
				try:
					os.symlink(libticore,"libTiCore.a")
				except:
					pass
				os.chdir(cwd)

			# if the lib doesn't exist, force a rebuild since it's a new build
			if not os.path.exists(os.path.join(iphone_dir,'lib','libtiverify.a')):
				shutil.copy(os.path.join(template_dir,'libtiverify.a'),os.path.join(iphone_dir,'lib','libtiverify.a'))

			# compile JSS files
			cssc = csscompiler.CSSCompiler(os.path.join(project_dir,'Resources'),devicefamily,appid)
			app_stylesheet = os.path.join(iphone_dir,'Resources','stylesheet.plist')
			asf = codecs.open(app_stylesheet,'w','utf-8')
			asf.write(cssc.code)
			asf.close()
			
			if command!='simulator':
				# compile plist into binary format so it's faster to load
				# we can be slow on simulator
				os.system("/usr/bin/plutil -convert binary1 \"%s\"" % app_stylesheet)
			
			o.write("Generated the following stylecode code:\n\n")
			o.write(cssc.code)
			o.write("\n")

			# generate the Info.plist file with the appropriate device family
			if devicefamily!=None:
				applogo = ti.generate_infoplist(infoplist,appid,devicefamily,project_dir,iphone_version)
			else:
				applogo = ti.generate_infoplist(infoplist,appid,'iphone',project_dir,iphone_version)

			# copy over the appicon
			if applogo==None and ti.properties.has_key('icon'):
				applogo = ti.properties['icon']
				
			# attempt to load any compiler plugins
			if len(ti.properties['plugins']) > 0:
				local_compiler_dir = os.path.abspath(os.path.join(project_dir,'plugins'))
				tp_compiler_dir = os.path.abspath(os.path.join(titanium_dir,'plugins'))
				if not os.path.exists(tp_compiler_dir) and not os.path.exists(local_compiler_dir):
					o.write("+ Missing plugins directory at %s\n" % tp_compiler_dir)
					print "[ERROR] Build Failed (Missing plugins directory). Please see output for more details"
					sys.stdout.flush()
					sys.exit(1)
				compiler_config = {
					'platform':'ios',
					'devicefamily':devicefamily,
					'tiapp':ti,
					'project_dir':project_dir,
					'titanium_dir':titanium_dir,
					'appid':appid,
					'iphone_version':iphone_version,
					'template_dir':template_dir,
					'project_name':name,
					'command':command,
					'deploytype':deploytype,
					'build_dir':build_dir,
					'app_name':app_name,
					'app_dir':app_dir,
					'iphone_dir':iphone_dir
				}
				for plugin in ti.properties['plugins']:
					local_plugin_file = os.path.join(local_compiler_dir,plugin['name'],'plugin.py')
					plugin_file = os.path.join(tp_compiler_dir,plugin['name'],plugin['version'],'plugin.py')
					if not os.path.exists(local_plugin_file) and not os.path.exists(plugin_file):
						o.write("+ Missing plugin at %s (checked %s also)\n" % (plugin_file,local_plugin_file))
						print "[ERROR] Build Failed (Missing plugin for %s). Please see output for more details" % plugin['name']
						sys.stdout.flush()
						sys.exit(1)
					o.write("+ Detected plugin: %s/%s\n" % (plugin['name'],plugin['version']))
					print "[INFO] Detected compiler plugin: %s/%s" % (plugin['name'],plugin['version'])
					code_path = plugin_file
					if os.path.exists(local_plugin_file):	
						code_path = local_plugin_file
					o.write("+ Loading compiler plugin at %s\n" % code_path)
					compiler_config['plugin']=plugin
					fin = open(code_path, 'rb')
					m = hashlib.md5()
					m.update(open(code_path,'rb').read()) 
					code_hash = m.hexdigest()
					p = imp.load_source(code_hash, code_path, fin)
					p.compile(compiler_config)
					fin.close()
					
			try:		
				os.chdir(iphone_dir)

				# we always target backwards to 3.1 even when we use a later
				# version iOS SDK. this ensures our code will run on old devices
				# no matter which SDK we compile with
				deploy_target = "IPHONEOS_DEPLOYMENT_TARGET=3.1"
				device_target = 'TARGETED_DEVICE_FAMILY=1'  # this is non-sensical, but you can't pass empty string

				# clean means we need to nuke the build 
				if clean_build or force_destroy_build: 
					print "[INFO] Performing clean build"
					o.write("Performing clean build...\n")
					if os.path.exists(app_dir):
						shutil.rmtree(app_dir)

				if not os.path.exists(app_dir): os.makedirs(app_dir)

				# compile localization files
				localecompiler.LocaleCompiler(app_name,project_dir,devicefamily,command).compile()
				
				# copy any module resources
				if len(tp_module_asset_dirs)>0:
					for e in tp_module_asset_dirs:
						copy_module_resources(e[0],e[1],True)
				
				# copy any custom fonts in (only runs in simulator)
				# since we need to make them live in the bundle in simulator
				if len(custom_fonts)>0:
					for f in custom_fonts:
						print "[INFO] Detected custom font: %s" % os.path.basename(f)
						shutil.copy(f,app_dir)

				# dump out project file info
				if command!='simulator':
					dump_resources_listing(project_dir,o)
					dump_infoplist(infoplist,o)

				# copy Default.png and appicon each time so if they're 
				# changed they'll stick get picked up	
				app_icon_path = os.path.join(project_dir,'Resources','iphone',applogo)
				if not os.path.exists(app_icon_path):
					app_icon_path = os.path.join(project_dir,'Resources',applogo)
				if os.path.exists(app_icon_path):
					shutil.copy(app_icon_path,app_dir)
				defaultpng_path = os.path.join(project_dir,'Resources','iphone','Default.png')
				if not os.path.exists(defaultpng_path):
					defaultpng_path = os.path.join(project_dir,'Resources','Default.png')
				if os.path.exists(defaultpng_path):
					shutil.copy(defaultpng_path,app_dir)

				extra_args = None

				if devicefamily!=None:
					if devicefamily == 'ipad':
						device_target="TARGETED_DEVICE_FAMILY=2"
						# iPad requires at a minimum 3.2 (not 3.1 default)
						deploy_target = "IPHONEOS_DEPLOYMENT_TARGET=3.2"
						# NOTE: this is very important to run on device -- i dunno why
						# xcode warns that 3.2 needs only armv7, but if we don't pass in 
						# armv6 we get crashes on device
						extra_args = ["VALID_ARCHS=armv6 armv7 i386"]

				def execute_xcode(sdk,extras,print_output=True):

					config = name
					if devicefamily=='ipad':
						config = "%s-iPad" % config

					# these are the arguments for running a command line xcode build
					args = ["xcodebuild","-target",config,"-configuration",target,"-sdk",sdk]
					if extras!=None and len(extras)>0: 
						args += extras
					args += [deploy_target,device_target]
					if extra_args!=None and len(extra_args)>0:
						args += extra_args

					o.write("Starting Xcode compile with the following arguments:\n\n")
					for arg in args: o.write("    %s\n" % arg)
					o.write("\napp_id = %s\n" % appid)
					o.write("\n\n")
					o.flush()

					if print_output:
						print "[DEBUG] compile checkpoint: %0.2f seconds" % (time.time()-start_time)
						print "[INFO] Executing XCode build..."
						print "[BEGIN_VERBOSE] Executing XCode Compiler  <span>[toggle output]</span>"

					output = run.run(args,False,False,o)

					if print_output:
						print output
						print "[END_VERBOSE]"
						sys.stdout.flush()

					o.write(output)

					# check to make sure the user doesn't have a custom build location 
					# configured in Xcode which currently causes issues with titanium
					idx = output.find("TARGET_BUILD_DIR ")
					if idx > 0:
						endidx = output.find("\n",idx)
						if endidx > 0:
							target_build_dir = dequote(output[idx+17:endidx].strip())
							if target_build_dir!=build_dir:
								o.write("+ TARGET_BUILD_DIR = %s\n" % target_build_dir)
								print "[ERROR] Your TARGET_BUILD_DIR is incorrectly set. Most likely you have configured in Xcode a customized build location. Titanium does not currently support this configuration."
								print "[ERROR] Expected dir %s, was: %s" % (build_dir,target_build_dir)
								sys.stdout.flush()
								sys.exit(1)

					# look for build error
					if output.find("** BUILD FAILED **")!=-1 or output.find("ld returned 1")!=-1 or output.find("The following build commands failed:")!=-1:
						o.write("+ Detected build failure\n")
						print "[ERROR] Build Failed. Please see output for more details"
						sys.stdout.flush()
						sys.exit(1)

					o.write("+ Looking for application binary at %s\n" % binary)

					# make sure binary exists
					if not os.path.exists(binary):
						o.write("+ Missing application binary at %s\n" % binary)
						print "[ERROR] Build Failed (Missing app at %s). Please see output for more details" % binary
						sys.stdout.flush()
						sys.exit(1)

					# look for a code signing error
					error = re.findall(r'Code Sign error:(.*)',output)
					if len(error) > 0:
						o.write("+ Detected code sign error: %s\n" % error[0])
						print "[ERROR] Code sign error: %s" % error[0].strip()
						sys.stdout.flush()
						sys.exit(1)

				# build the final release distribution
				args = []

				if command!='simulator':		
					# allow the project to have its own custom entitlements
					custom_entitlements = os.path.join(project_dir,"Entitlements.plist")
					entitlements_contents = None
					if os.path.exists(custom_entitlements):
						entitlements_contents = open(custom_entitlements).read()
						o.write("Found custom entitlements: %s\n" % custom_entitlements)
					else:
						# attempt to customize it by reading prov profile
						entitlements_contents = generate_customized_entitlements(provisioning_profile,appid,appuuid,command,o)
					o.write("Generated the following entitlements:\n\n%s\n\n" % entitlements_contents)
					f=open(os.path.join(iphone_resources_dir,'Entitlements.plist'),'w+')
					f.write(entitlements_contents)
					f.close()
					args+=["CODE_SIGN_ENTITLEMENTS = Resources/Entitlements.plist"]

				# only build if force rebuild (different version) or 
				# the app hasn't yet been built initially
				if ti.properties['guid']!=log_id or force_xcode:
					log_id = ti.properties['guid']
					f = open(version_file,'w+')
					f.write("%s,%s,%s,%s" % (template_dir,log_id,lib_hash,githash))
					f.close()

				# this is a simulator build
				if command == 'simulator':

					if force_rebuild or force_xcode or not os.path.exists(binary):
						execute_xcode("iphonesimulator%s" % iphone_version,["GCC_PREPROCESSOR_DEFINITIONS=__LOG__ID__=%s DEPLOYTYPE=development TI_DEVELOPMENT=1 DEBUG=1 TI_VERSION=%s" % (log_id,sdk_version)],False)

					# first make sure it's not running
					kill_simulator()

					o.write("Finishing build\n")

					# sometimes the simulator doesn't remove old log files
					# in which case we get our logging jacked - we need to remove
					# them before running the simulator
					def cleanup_app_logfiles():
						print "[DEBUG] finding old log files"
						sys.stdout.flush()
						# on OSX Snow Leopard, we can use spotlight for faster searching of log files
						results = run.run(['mdfind',
								'-onlyin',
								os.path.expanduser('~/Library/Application Support/iPhone Simulator/%s'%iphone_version),
								'-name',
								'%s.log'%log_id],True)
						if results == None: # probably not Snow Leopard
							def find_all_log_files(folder, fname):
								results = []
								for root, dirs, files in os.walk(os.path.expanduser(folder)):
									for file in files:
										if fname==file:
											fullpath = os.path.join(root, file)
											results.append(fullpath)
								return results
							for f in find_all_log_files("~/Library/Application Support/iPhone Simulator/%s"%iphone_version,'%s.log' % log_id):
								print "[DEBUG] removing old log file: %s" % f
								sys.stdout.flush()
								os.remove(f)
						else:
							for i in results.splitlines(False):
								print "[DEBUG] removing old log file: %s" % i
								os.remove(i)	

					cleanup_app_logfiles()

					sim = None

					# this handler will simply catch when the simulator exits
					# so we can exit this script
					def handler(signum, frame):
						global script_ok
						print "[INFO] Simulator is exiting"
						sys.stdout.flush()
						if not log == None:
							try:
								os.system("kill -2 %s" % str(log.pid))
							except:
								pass
						if not sim == None and signum!=3:
							try:
								os.system("kill -3 %s" % str(sim.pid))
							except:
								pass

						kill_simulator()
						script_ok = True
						sys.exit(0)

					# make sure we're going to stop this script whenever 
					# the simulator exits
					signal.signal(signal.SIGHUP, handler)
					signal.signal(signal.SIGINT, handler)
					signal.signal(signal.SIGQUIT, handler)
					signal.signal(signal.SIGABRT, handler)
					signal.signal(signal.SIGTERM, handler)

					print "[INFO] Launching application in Simulator"

					sys.stdout.flush()
					sys.stderr.flush()

					# launch the simulator
					if devicefamily==None:
						sim = subprocess.Popen("\"%s\" launch \"%s\" %s iphone" % (iphonesim,app_dir,iphone_version),shell=True)
					else:
						sim = subprocess.Popen("\"%s\" launch \"%s\" %s %s" % (iphonesim,app_dir,iphone_version,devicefamily),shell=True)

					# activate the simulator window - we use a OSA script to 
					# cause the simulator window to come into the foreground (otherwise
					# it will be behind Titanium Developer window)
					ass = os.path.join(template_dir,'iphone_sim_activate.scpt')
					cmd = "osascript \"%s\" 2>/dev/null" % ass
					os.system(cmd)

					end_time = time.time()-start_time

					print "[INFO] Launched application in Simulator (%0.2f seconds)" % end_time
					sys.stdout.flush()
					sys.stderr.flush()

					# give the simulator a bit to get started and up and running before 
					# starting the logger
					time.sleep(2)

					logger = os.path.realpath(os.path.join(template_dir,'logger.py'))

					# start the logger tail process. this will simply read the output
					# from the logs and stream them back to Titanium Developer on the console
					log = subprocess.Popen([
					  	logger,
						str(log_id)+'.log',
						iphone_version
					])	

					# wait (blocking this script) until the simulator exits
					os.waitpid(sim.pid,0)

					print "[INFO] Application has exited from Simulator"

					# in this case, the user has exited the simulator itself
					# and not clicked Stop Emulator from within Developer so we kill
					# our tail log process but let simulator keep running
					if not log == None:
						try:
							os.system("kill -2 %s" % str(log.pid))
						except:
							pass

					script_ok = True
					
				###########################################################################	
				# END OF SIMULATOR COMMAND	
				###########################################################################	
				
				
				#
				# this command is run for installing an app on device
				#
				elif command == 'install':

					args += [
						"GCC_PREPROCESSOR_DEFINITIONS=DEPLOYTYPE=test TI_TEST=1",
						"PROVISIONING_PROFILE[sdk=iphoneos*]=%s" % appuuid,
						"CODE_SIGN_IDENTITY[sdk=iphoneos*]=iPhone Developer: %s" % dist_name,
						"DEPLOYMENT_POSTPROCESSING=YES"
					]
					execute_xcode("iphoneos%s" % iphone_version,args,False)

					print "[INFO] Installing application in iTunes ... one moment"
					sys.stdout.flush()

					if os.path.exists("/Developer/Platforms/iPhoneOS.platform/Developer/usr/bin/PackageApplication"):
						o.write("+ Preparing to run /Developer/Platforms/iPhoneOS.platform/Developer/usr/bin/PackageApplication\n")
						output = run.run(["/Developer/Platforms/iPhoneOS.platform/Developer/usr/bin/PackageApplication",app_dir],True)
						o.write("+ Finished running /Developer/Platforms/iPhoneOS.platform/Developer/usr/bin/PackageApplication\n")
						if output: o.write(output)

					# for install, launch itunes with the app
					ipa = os.path.join(os.path.dirname(app_dir),"%s.ipa" % name)
					o.write("+ IPA file should be at %s\n" % ipa);

					# it appears that sometimes this command above fails on certain installs
					# or is missing. let's just open if we have it otherwise, open the app 
					# directory
					if not os.path.exists(ipa):
						# just open the app dir itself
						o.write("+ IPA didn't exist at %s\n" % ipa)
						o.write("+ Will try and open %s\n" % app_dir)
						ipa = app_dir

					# to force iTunes to install our app, we simply open the IPA
					# file in itunes
					cmd = "open -b com.apple.itunes \"%s\"" % ipa
					o.write("+ Executing the command: %s\n" % cmd)
					os.system(cmd)
					o.write("+ After executing the command: %s\n" % cmd)

					# now run our applescript to tell itunes to sync to get
					# the application on the phone
					ass = os.path.join(template_dir,'itunes_sync.scpt')
					cmd = "osascript \"%s\"" % ass
					o.write("+ Executing the command: %s\n" % cmd)
					os.system(cmd)
					o.write("+ After executing the command: %s\n" % cmd)

					print "[INFO] iTunes sync initiated"

					o.write("Finishing build\n")
					sys.stdout.flush()
					script_ok = True
					
				###########################################################################	
				# END OF INSTALL COMMAND	
				###########################################################################	

				#
				# this command is run for packaging an app for distribution
				#
				elif command == 'distribute':

					deploytype = "production"

					args += [
						"GCC_PREPROCESSOR_DEFINITIONS=DEPLOYTYPE=%s TI_PRODUCTION=1" % deploytype,
						"PROVISIONING_PROFILE[sdk=iphoneos*]=%s" % appuuid,
						"CODE_SIGN_IDENTITY[sdk=iphoneos*]=iPhone Distribution: %s" % dist_name,
						"DEPLOYMENT_POSTPROCESSING=YES"
					]
					execute_xcode("iphoneos%s" % iphone_version,args,False)

					# switch to app_bundle for zip
					os.chdir(build_dir)

					# starting in 4.0, apple now requires submission through XCode
					# this code mimics what xcode does on its own to package the 
					# application for the app uploader process
					archive_uuid = str(uuid.uuid4()).upper()
					archive_dir = os.path.join(os.path.expanduser("~/Library/MobileDevice/Archived Applications"),archive_uuid)
					archive_app_dir = os.path.join(archive_dir,"%s.app" % name)
					archive_appdsym_dir = os.path.join(archive_dir,"%s.app.dSYM" % name)
					os.makedirs(archive_app_dir)
					os.makedirs(archive_appdsym_dir)
	
					os.system('ditto "%s.app" "%s"' % (name,archive_app_dir))
					os.system('ditto "%s.app.dSYM" "%s"' % (name,archive_appdsym_dir))
					
					archive_plist = os.path.join(archive_dir,'ArchiveInfo.plist')
					o.write("Writing archive plist to: %s\n\n" % archive_plist)
					
					profile_uuid = get_profile_uuid(provisioning_profile)

					os.system("/usr/bin/plutil -convert xml1 -o \"%s\" \"%s\"" % (os.path.join(archive_dir,'Info.xml.plist'),os.path.join(archive_app_dir,'Info.plist')))
					p = plistlib.readPlist(os.path.join(archive_dir,'Info.xml.plist'))
					archive_metadata = {
						'CFBundleIdentifier':p['CFBundleIdentifier'],
						'CFBundleVersion':p['CFBundleVersion'],
						'XCApplicationFilename':'%s.app' %name,
						'XCApplicationName':name,
						'XCArchivedDate': time.time() - 978307200.0,
						'XCArchiveUUID':archive_uuid,
						'XCInfoPlist' : p,
						'XCProfileUUID': profile_uuid
					}
					o.write("%s\n\n" % archive_metadata)
					plistlib.writePlist(archive_metadata,archive_plist)
					os.remove(os.path.join(archive_dir,'Info.xml.plist'))

					# open xcode + organizer after packaging
					ass = os.path.join(template_dir,'xcode_organizer.scpt')
					cmd = "osascript \"%s\"" % ass
					os.system(cmd)
					
					o.write("Finishing build\n")
					script_ok = True

				###########################################################################	
				# END OF DISTRIBUTE COMMAND	
				###########################################################################	

			finally:
				os.chdir(cwd)
		except:
			print "[ERROR] Error: %s" % traceback.format_exc()
			if not script_ok:
				o.write("\nException detected in script:\n")
				traceback.print_exc(file=o)
				o.close()
				sys.exit(1)
			else:
				o.close()

if __name__ == "__main__":
	main(sys.argv)
	sys.exit(0)
