import sys

import settings
import models

COMMANDS = {}

# Decorator for registering functions as commands 
def task(help, *args, **kwargs):
    help_text = help
    def decorate(fn, *args, **kwargs):
        name = fn.__name__
        COMMANDS[name] = (fn, help_text)
        return fn
    return decorate

@task("Starts a development server on http://%s:%s" % (settings.TARGET_HOST, settings.PORT))
def startserver():
    import views
    from bottle import run
    run(host=settings.TARGET_HOST, port=settings.PORT)
    
@task("Says howdy like a good friend should.")
def sayhi():
    print "Guten Tag!"
    
def route(command=None, *args, **kwargs):
    if not command and len(sys.argv) >= 2:
        command = sys.argv[1]
        
    if command and command in COMMANDS.keys():
        fn = COMMANDS[command][0]
        return fn(*args, **kwargs)
    
    print "\n\n=============================================================================="
    print "Annotare! The great and powerful brain dumping tool from Pioneering Labs."
    print "==============================================================================\n"
    print "Please use a command from this list:"
    for name, command in COMMANDS.iteritems():
        print "  %s - %s" % (name, command[1])
    print "\n\n"    
            
if __name__ == "__main__":
    route()
    