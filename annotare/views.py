"""
==========================================================
Annotare Views Functions
==========================================================
Defines the main view functions and assciated routing
information using bottle.py as a microframework
==========================================================
"""

import bottle
import os
import simplejson
import markdown

import settings

bottle.TEMPLATE_PATH.append(settings.TEMPLATES_ROOT)

"""
==========================================================
 API Views
==========================================================
"""

@bottle.route('/json/:key', method="POST")
def store_json(key):
    filename = "%s.json" % key
    json = bottle.request.body.read()
    json_file = open(os.path.join(settings.DOCUMENT_ROOT, filename), 'w')
    json_file.write(json)
    json_file.close()
    
@bottle.route('/json/:key', method="GET")
def get_json(key):
    filename = "%s.json" % key
    try:
        json_file = open(os.path.join(settings.DOCUMENT_ROOT, filename), 'rU')
    except IOError, e:
        return bottle.abort(404, e)
    json = json_file.read()
    json_file.close()
    return json
    
@bottle.route('/json/exists/:key', method="GET")
def json_exists(key):
    filename = "%s.json" % key
    filename = os.path.join(settings.DOCUMENT_ROOT, filename)
    return simplejson.dumps({'exists': os.path.exists(filename)})
        
@bottle.route('/json/list/', method="GET")
def list_documents():
    documents = os.listdir(settings.DOCUMENT_ROOT)
    documents = filter(lambda item: item.endswith('.json'), documents)
    documents = map(lambda item: '.'.join(item.split('.')[:-1]), documents)
    return simplejson.dumps(documents)
    

"""
==========================================================
 Web Views
==========================================================
"""

@bottle.route('/')
def app():
	return bottle.template('index.html')
	
@bottle.route('/:filename#.*#')
def send_static(filename):
    # Sanitize
    filename = filename.replace('..', '')
    return bottle.static_file(filename, root=settings.ASSETS_ROOT)
    
    
    
    
    
    
    
    
    