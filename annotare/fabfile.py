import bottle
import views
import settings

def run_dev_server():
    bottle.debug(settings.DEBUG)
    bottle.run(host='0.0.0.0', port=8000, reloader=True)
    
if __name__ == "__main__":
    run_dev_server()