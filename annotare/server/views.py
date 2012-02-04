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

@bottle.route('/api/:rtype', method="POST")
def store_json(rtype):
    mkdir(rtype)
    json = bottle.request.body.read()
    doc = simplejson.loads(json)
    if doc.has_key('id'):
        filename = "%s.json" % doc['id']
        json_file = open(os.path.join(settings.DOCUMENT_ROOT, rtype, filename), 'w')
        json_file.write(json)
        json_file.close()
    return json
    
@bottle.route('/api/:rtype', method="GET")
def get_json(rtype):
    mkdir(rtype)
    documents = os.listdir(os.path.join(settings.DOCUMENT_ROOT, rtype))
    documents = filter(lambda item: item.endswith('.json'), documents)
    docs = []
    for document in documents:
        json_file = open(os.path.join(settings.DOCUMENT_ROOT, rtype, document), 'rU')
        json = json_file.read()
        json_file.close()
        docs.append(simplejson.loads(json))
    return simplejson.dumps(docs)
    
@bottle.route('/api/:rtype/:uid', method="DELETE")
def del_json(rtype, uid):
    mkdir(rtype)
    filename = "%s.json" % uid
    filename = os.path.join(settings.DOCUMENT_ROOT, rtype, filename)
    if os.path.exists(filename):
        os.remove(filename)
        return simplejson.dumps({'success':True})
    return simplejson.dumps({'success':False})
    
@bottle.route('/api/:rtype/:uid', method="PUT")
def put_json(rtype, uid):
    mkdir(rtype)
    filename = "%s.json" % uid
    filename = os.path.join(settings.DOCUMENT_ROOT, rtype, filename)
    json = bottle.request.body.read()
    if os.path.exists(filename):
        json_file = open(os.path.join(settings.DOCUMENT_ROOT, rtype, filename), 'w')
        json_file.write(json)
        json_file.close()
    return simplejson.dumps({'success':False})
    
def mkdir(path):
    try:
        os.makedirs(path)
    except:
        pass

    

"""
==========================================================
 Web Views
==========================================================
"""

@bottle.route('/')
def app():
	return bottle.template('index.html')
	
@bottle.route('/manifest.appcache')
def cache():
    cache = []
    # Append Public Files to appcache
    startDir = 'public/'
    directories = [startDir]
    no_cache_ext = ('html', 'appcache')
    while len(directories)>0:
        directory = directories.pop()
        for name in os.listdir(directory):
            fullpath = os.path.join(directory,name)
            if os.path.isfile(fullpath):
                path = fullpath.replace(startDir, '')
                if not path.startswith('.'):
                    if not path.split('.')[::-1][0] in no_cache_ext:
                        path = '/' + path
                        cache.append(path)
            elif os.path.isdir(fullpath):
                directories.append(fullpath)
    return bottle.template('manifest.appcache', filenames=cache, mimetype="text/cache-manifest")
	
@bottle.route('/:filename#.*#')
def send_static(filename):
    # Sanitize
    filename = filename.replace('..', '')
    return bottle.static_file(filename, root=settings.ASSETS_ROOT)
    
    
    
    
    
    
    
    
    