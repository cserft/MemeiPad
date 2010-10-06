//
//  Appcelerator Titanium Mobile
//  WARNING: this is a generated file and should not be modified
//

#import <UIKit/UIKit.h>
#define _QUOTEME(x) #x
#define STRING(x) _QUOTEME(x)

NSString * const TI_APPLICATION_DEPLOYTYPE = @"development";
NSString * const TI_APPLICATION_ID = @"com.acarlos.memeipad";
NSString * const TI_APPLICATION_PUBLISHER = @"Antonio Carlos Silveira";
NSString * const TI_APPLICATION_URL = @"http://me.me";
NSString * const TI_APPLICATION_NAME = @"MemeiPad";
NSString * const TI_APPLICATION_VERSION = @"0.1";
NSString * const TI_APPLICATION_DESCRIPTION = @"MemePad is a iPad app for Yahoo! Meme that allows you to view and navigate on Yahoo! Meme content";
NSString * const TI_APPLICATION_COPYRIGHT = @"2010 by @acarlos1000 @gneumann @mnovaes @ccoria";
NSString * const TI_APPLICATION_GUID = @"f33c2211-86ab-48a5-9bb2-710c9292da06";
BOOL const TI_APPLICATION_ANALYTICS = false;

#ifdef TARGET_IPHONE_SIMULATOR
NSString * const TI_APPLICATION_RESOURCE_DIR = @"/Users/gneumann/Desktop/Titanium/memeiPad/Resources";
#endif

int main(int argc, char *argv[]) {
    NSAutoreleasePool * pool = [[NSAutoreleasePool alloc] init];

#ifdef __LOG__ID__
	NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
	NSString *documentsDirectory = [paths objectAtIndex:0];
	NSString *logPath = [documentsDirectory stringByAppendingPathComponent:[NSString stringWithFormat:@"%s.log",STRING(__LOG__ID__)]];
	freopen([logPath cStringUsingEncoding:NSUTF8StringEncoding],"w+",stderr);
	fprintf(stderr,"[INFO] Application started\n");
#endif

	int retVal = UIApplicationMain(argc, argv, nil, @"TiApp");
    [pool release];
    return retVal;
}
