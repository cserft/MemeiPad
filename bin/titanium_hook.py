#!/usr/bin/env python
import sys

# This will make Titanium's output on Terminal very beautiful :)

class Color(object):
    PINK = '\033[35m'
    BLUE = '\033[34m'
    CYAN = '\033[36m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    RED = '\033[31m'
    END = '\033[0m'

class ColorPrinterHook(object):
    def start(self):
        sys.stdout = self
        self.original_out = sys.__stdout__
    
    def flush(self):
        self.original_out.flush()
        
    def write(self, text):
        color = None
        if text.startswith('[DEBUG]'):
            color = Color.PINK
        elif text.startswith('[INFO]'):
            color = Color.CYAN
        elif text.startswith('[ERROR]'):
            color = Color.RED
        
        if color:
            self.original_out.write("%s%s%s" % (color, text, Color.END))
        else:
            self.original_out.write(text)

if __name__ == '__main__':
    hook = ColorPrinterHook()
    hook.start()
    
    # execute Titanium's builder
    import builder as titanium_builder
    titanium_builder.main(sys.argv)
    sys.exit(0)