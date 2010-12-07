#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# tiapp parser
# 
import os, types, uuid
import codecs, time, sys
from xml.dom.minidom import parseString
from StringIO import StringIO

def getText(nodelist):
	rc = ""
	for node in nodelist:
		if node.nodeType == node.TEXT_NODE:
			rc = rc + node.data
	return rc

class TiWindow(object):
	def __init__(self,properties):
		self.properties = properties

	def __repr__(self):
		i = None
		if self.properties.has_key('id'): i = self.properties['id']
		return '<TiWindow:%s>' % self.properties
		
	def get(self, key, defvalue=None):
		if self.properties.has_key(key):
			return self.properties[key]
		return defvalue
			

def get_window_properties(node):
	wp = None
	for w in node.childNodes:
		if w.nodeType == 1:
			if wp == None: wp = {}
			wp[w.nodeName]=getText(w.childNodes)
	return wp

			
class TiAppXML(object):
	def __init__(self, file, parse_only=False):
		self.file = file
		if isinstance(self.file, StringIO):
			data = self.file
		else:
			data = codecs.open(self.file,'r','utf-8','replace')
		
		self.dom = parseString(data.read().encode('utf-8'))
		self.properties = {
			'id':None,
			'name':None,
			'version':'1.0',
			'copyright':'not specified',
			'publisher':'not specified',
			'description':'not specified',
			'url':'not specified',
			'icon':None,
			'analytics':'true',
			'modules' : [],
			'plugins' : []
		}
		self.app_properties = {}
		self.android = {}
		self.android_manifest = {}
		self.iphone = {}
		
		root = self.dom.documentElement
		children = root.childNodes
		self.windows = []
		for child in children:
			if child.nodeType == 1:
				# single window at the root <window>
				if child.nodeName == 'window':
					print "[WARN] window in tiapp.xml no longer supported. this will be ignored"
				# multiple windows rooted by <windows>
				elif child.nodeName == 'windows':
					print "[WARN] windows in tiapp.xml no longer supported. this will be ignored"
				# handle modules		
				elif child.nodeName == 'modules':
					for module in child.childNodes:
						if module.nodeType == 1:
							ver = module.getAttribute('version')
							name = getText(module.childNodes)
							self.properties['modules'].append({'name':name,'version':ver})
				# handle modules		
				elif child.nodeName == 'plugins':
					for plugin in child.childNodes:
						if plugin.nodeType == 1:
							ver = plugin.getAttribute('version')
							name = getText(plugin.childNodes)
							self.properties['plugins'].append({'name':name,'version':ver})
				elif child.nodeName == 'android':
					self.parse_android(child)
				elif child.nodeName == 'iphone':
					self.parse_iphone(child)
				elif child.nodeName == 'property':
					name = child.getAttribute('name')
					value = getText(child.childNodes)
					print "[TRACE] app property, %s : %s" % (name, value)
					self.app_properties[name] = value
					
				# properties of the app
				else:
					self.properties[child.nodeName]=getText(child.childNodes)
		
		# ensure we create a guid if the project doesn't already have one
		if not parse_only and not self.properties.has_key('guid'):
			guid = uuid.uuid4().hex
			self.properties['guid'] = guid
			n = self.dom.createElement("guid")
			n.appendChild(self.dom.createTextNode(guid))
			root.appendChild(n)
			root.appendChild(self.dom.createTextNode("\n"))
			self.dom.writexml(codecs.open(self.file, 'w+','utf-8','replace'), encoding="UTF-8")

	def parse_android(self, node):
		def get_text(node): return getText(node.childNodes)
		
		def lazy_init(name, value, map=self.android, set_name=False):
			if not name in map: map[name] = value
			if set_name: map[name]['name'] = name
			return map[name]
		
		def add_attrs(map, element, fn=None):
			for attr in element.attributes.keys():
				value = element.getAttribute(attr)
				if fn != None: value = fn(value)
				map[attr] = value
		
		def parse_manifest(node):
			# android:manifest XML gets copied to the AndroidManifest.xml under the top level <manifest>
			# anything under <application> will also get copied into the manifest's <application>
			for child in node.childNodes:
				if child.nodeType != child.ELEMENT_NODE: continue
				if child.nodeName == 'application':
					if 'application' not in self.android_manifest:
						self.android_manifest['application'] = []
					application = self.android_manifest['application']
					application.extend([n for n in child.childNodes if n.nodeType == n.ELEMENT_NODE])
					self.android_manifest['application-attributes'] = child.attributes
					continue
				
				if 'manifest' not in self.android_manifest:
					self.android_manifest['manifest'] = []
				manifest = self.android_manifest['manifest']
				manifest.append(child)
				self.android_manifest['manifest-attributes'] = node.attributes

		def get_url_based_classname(url, appendage):
			parts = url.split('/')
			if len(parts) == 0: return None
			
			start = 0
			if parts[0] == "app:" and len(parts) >= 3:
				start = 2
			
			classname = '_'.join(parts[start:])
			if classname.endswith('.js'):
				classname = classname[:-3]
			
			if len(classname) > 1:
				classname = classname[0:1].upper() + classname[1:]
			else: classname = classname.upper()
			
			escape_chars = ['\\', '/', ' ', '.', '$', '&', '@']
			for escape_char in escape_chars:
				classname = classname.replace(escape_char, '_')
			return classname+appendage

		def get_activity_classname(url):
			return get_url_based_classname(url, 'Activity')

		def get_service_classname(url):
			return get_url_based_classname(url, 'Service')

		def parse_activities(node):
			activities = lazy_init('activities', {})
			for activity_el in node.getElementsByTagName('activity'):
				if activity_el.hasAttribute('url'):
					url = activity_el.getAttribute('url')
				else:
					url = get_text(activity_el)
				activity = lazy_init(url, {}, activities)
				activity['url'] = url
				add_attrs(activity, activity_el)
				activity['classname'] = get_activity_classname(url)
				for child in activity_el.childNodes:
					if child.nodeType != child.ELEMENT_NODE:
						continue
					if 'nodes' not in activity:
						activity['nodes'] = []
					nodes = activity['nodes']
					nodes.append(child)

		def parse_services(node):
			services = lazy_init('services', {})
			for service_el in node.getElementsByTagName('service'):
				if service_el.hasAttribute('url'):
					url = service_el.getAttribute('url')
				else:
					url = get_text(service_el)
				service_type = 'standard'
				if service_el.hasAttribute('type'):
					service_type = service_el.getAttribute('type')
				service = lazy_init(url, {}, services)
				service['url'] = url
				service['service_type'] = service_type
				add_attrs(service, service_el)
				service['classname'] = get_service_classname(url)
				for child in service_el.childNodes:
					if child.nodeType != child.ELEMENT_NODE:
						continue
					if 'nodes' not in service:
						service['nodes'] = []
					nodes = service['nodes']
					nodes.append(child)

		def parse_tool_api_level(node):
			lazy_init('tool-api-level', get_text(node))


		local_objects = locals()
		parse_tags = ['services', 'activities', 'manifest', 'tool-api-level']
		for child in node.childNodes:
			if child.nodeName in parse_tags:
				local_objects['parse_'+child.nodeName.replace('-', '_')](child)

	def parse_iphone(self, node):
		def translate_orientation(orientation):
			info = orientation.split('.')
			tokenMap = {'PORTRAIT':'UIInterfaceOrientationPortrait',
						'UPSIDE_PORTRAIT':'UIInterfaceOrientationPortraitUpsideDown',
						'LANDSCAPE_LEFT':'UIInterfaceOrientationLandscapeLeft',
						'LANDSCAPE_RIGHT':'UIInterfaceOrientationLandscapeRight'}
			
			for token in tokenMap:
				if token in info:
					return tokenMap[token]
			return None

		def parse_orientations(node):
			device = node.getAttribute('device').lower()
			orientations = []
			if (device == None):
				print "[WARN] Orientations for unspecified device; assuming iphone"
				device = 'iphone'
			if device != 'iphone' and device != 'ipad':
				print "[WARN] Unrecognized device %s for iphone, ignoring" % device
				return
			for child in node.childNodes:
				if (child.nodeName == 'orientation'):
					orientation = translate_orientation(getText(child.childNodes))
					if orientation == None:
						print "[WARN] Unrecognized orientation %s: Ignoring" % getText(node.childNodes)
					else:
						orientations.append(orientation)
			self.iphone['orientations_'+device] = orientations
			
		local_objects = locals()
		parse_tags = ['orientations']
		for child in node.childNodes:
			if child.nodeName in parse_tags:
				local_objects['parse_'+child.nodeName](child)

	def has_app_property(self, property):
		return property in self.app_properties
	
	def get_app_property(self, property):
		return self.app_properties[property]
	
	def to_bool(self, value):
		return value in ['true', 'True', 'TRUE', 'yes', 'Yes', 'YES', 'y', 't', '1']
	
	def setDeployType(self, deploy_type):
		found = False
		children = self.dom.documentElement.childNodes
		for child in children:
			if child.nodeType == 1 and child.nodeName == 'property' :
				if child.getAttributeNode('name').nodeValue == 'ti.deploytype' :
					child.firstChild.nodeValue = deploy_type
					found = True
					break

		if not found :
			root = self.dom.documentElement
			n = self.dom.createElement("property")
			n.setAttribute('name','ti.deploytype')
			n.appendChild(self.dom.createTextNode(deploy_type))
			root.appendChild(n)
			
		self.dom.writexml(codecs.open(self.file, 'w+','utf-8','replace'), encoding="UTF-8")

	def generate_infoplist(self,file,appid,family,project_dir,iphone_version):
		icon = 'appicon.png'
		if self.properties.has_key('icon'):
			icon = self.properties['icon']
	
		# we want the icon without the extension for the plist
		icon = os.path.splitext(icon)[0]
			
		self.infoplist_properties = {}	
		for p in self.properties:
			value = self.properties[p]
			if p=='persistent-wifi' and value=='true':
				self.infoplist_properties['UIRequiresPersistentWiFi']='<true/>'
			if p=='prerendered-icon' and value=='true':
				self.infoplist_properties['UIPrerenderedIcon']='<true/>'
			if p=='statusbar-hidden' and value=='true':
				self.infoplist_properties['UIStatusBarHidden']='<true/>'
			if p=='statusbar-style':
				if value == 'default' or value=='grey':
					status_bar_style = '<string>UIStatusBarStyleDefault</string>'
				elif value == 'opaque_black' or value == 'opaque' or value == 'black':
					status_bar_style = '<string>UIStatusBarStyleBlackOpaque</string>'
				elif value == 'translucent_black' or value == 'transparent' or value == 'translucent':
					status_bar_style = '<string>UIStatusBarStyleBlackTranslucent</string>'
				else:	
					status_bar_style = '<string>UIStatusBarStyleDefault</string>'
				self.infoplist_properties['UIStatusBarStyle']=status_bar_style

		for prop in self.iphone:
			if prop == 'orientations_iphone' or prop == 'orientations_ipad':
				propertyName = 'UISupportedInterfaceOrientations'
				if prop == 'orientations_ipad':
					propertyName += '~ipad'
				propertyValue = '<array>\n'
				for orientation in self.iphone[prop]:
					propertyValue += "                <string>%s</string>\n" % orientation
				propertyValue += '        </array>'
				self.infoplist_properties[propertyName]=propertyValue
		
		plist = codecs.open(file,'r','utf-8','replace').read()
		plist = plist.replace('__APPICON__',icon)

		# replace the bundle id with the app id 
		# in case it's changed
		i = plist.index('CFBundleIdentifier')
		if i:
			i = plist.index('<string>',i+1)
			e = plist.index('</string>',i+1)
			st = plist[0:i+8]
			fn = plist[e:]
			plist = st + appid + fn


		# replace the version in case it's changed
		i = plist.index('CFBundleVersion')
		if i:
			i = plist.index('<string>',i+1)
			e = plist.index('</string>',i+1)
			st = plist[0:i+8]
			fn = plist[e:]
			version = self.properties['version']
			plist = st + version + fn

		i = plist.rindex('</dict>')	
		if i:
			before = plist[0:i]
			after = plist[i:]
			newcontent = ''
			for p in self.infoplist_properties:
				v = self.infoplist_properties[p]
				newcontent += '        <key>%s</key>\n        %s\n' %(p,v)
			plist = before + newcontent + after

		f = codecs.open(file,'w+','utf-8','replace')
		f.write(plist)
		f.close()
		
		return icon




