/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2010 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */
#import "TiBase.h"
#import "TopTiModule.h"
#import "KrollBridge.h"
#import "TiApp.h"
#import "TiUtils.h"

@implementation TopTiModule

-(id)version
{
	return @"1.5.0";
}

-(id)buildDate
{
	return @"10/20/10 12:54";
}

-(id)buildHash
{
	return @"845bde1";
}

-(id)userAgent
{
	return [[TiApp app] userAgent];
}

-(void)include:(NSArray*)jsfiles
{
	for (id file in jsfiles)
	{
		// only allow includes that are local to our execution context url
		// for security, refuse to load non-compiled in Javascript code
		NSString *rootPath = [[self _baseURL] path];
		NSURL *url = [[NSURL fileURLWithPath:[NSString stringWithFormat:@"%@/%@",rootPath,file]] standardizedURL];
#ifdef DEBUG
		NSLog(@"[DEBUG] include url: %@",[url absoluteString]);
#endif
		[[self executionContext] evalFile:[url absoluteString]];
	}
}

@end
