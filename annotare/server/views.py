"""
==========================================================
Annotare Views Functions
==========================================================
Defines the main view functions and assciated routing
information using bottle.py as a microframework
==========================================================
"""

from bottle import route, run, static_file, request, abort, template, TEMPLATE_PATH
import os
import simplejson

import settings

TEMPLATE_PATH.append(settings.TEMPLATES_ROOT)

directory = os.sep.join(os.path.abspath(__file__).split(os.sep)[:-1])
data_files = {
    'Document': os.path.join(directory, 'documents.json'),
    'Annotation': os.path.join(directory, 'annotations.json')
}


@route('/api/<model>', method="GET")
def list(model):
    if model not in data_files.keys():
        print 'bad model'
        abort(404)
    data_file = data_files[model]
    
    try:
        notes_file = open(data_file, 'rU')
    except:
        return simplejson.dumps([])
        
    notes = notes_file.read()
    notes_file.close()
    return notes
    
@route('/api/<model>/<guid>', method="GET")
def get(model, guid):
    if model not in data_files.keys():
        abort(404)
    data_file = data_files[model]
    
    try:
        notes_file = open(data_file, 'rU')
        notes = simplejson.loads(notes_file.read())
        notes_file.close()
    except:
        notes = []

    i = 0
    index = None
    for note in notes:
        if note['id'] == guid:
            index = i
        i += 1

    if index == None:
        abort(404)
    else:
        return simplejson.dumps(notes[index])
    
@route('/api/<model>/<guid>', method="POST")
def post(model, guid):
    if model not in data_files.keys():
        abort(404)
    data_file = data_files[model]
    
    try:
        notes_file = open(data_file, 'rU')
        notes = simplejson.loads(notes_file.read())
        notes_file.close()
    except:
        notes = []
    
    i = 0
    index = None
    for note in notes:
        if note['id'] == guid:
            index = i
        i += 1
    
    obj = {
        'versions': simplejson.loads(request.POST.versions),
        'id': guid
    }
    if index == None:
        notes.append(obj)
    else:
        notes[index] = obj
    
    notes_file = open(data_file, 'w')
    notes_file.write(simplejson.dumps(notes))
    notes_file.close()
    return simplejson.dumps(obj)
    
@route('/api/<model>/<guid>', method="DELETE")
def delete(model, guid):
    if model not in data_files.keys():
        abort(404)
    data_file = data_files[model]
    
    try:
        notes_file = open(data_file, 'rU')
        notes = simplejson.loads(notes_file.read())
        notes_file.close()
    except:
        notes = []
    
    i = 0
    index = None
    for note in notes:
        if note['id'] == guid:
            index = i
        i += 1
    
    deleted = {}
    if index != None:
        deleted = notes[index]
        del notes[index]
    
    notes_file = open(data_file, 'w')
    notes_file.write(simplejson.dumps(notes))
    notes_file.close()
    return simplejson.dumps(deleted)
    

"""
==========================================================
 Web Views
==========================================================
"""

@route('/')
def app():
	return template('index.html')
	
@route('/:filename#.*#')
def send_static(filename):
    # Sanitize
    filename = filename.replace('..', '')
    return static_file(filename, root=settings.ASSETS_ROOT)
    
    
    
    
    
    
    
    
    