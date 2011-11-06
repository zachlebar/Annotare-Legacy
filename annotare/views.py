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
 Web Views
==========================================================
"""

@bottle.route('/')
def app():
	return bottle.template('app.html')
	
@bottle.route('/assets/:filename#.*#')
def send_static(filename):
    # Sanitize
    filename = filename.replace('..', '')
    return bottle.static_file(filename, root=settings.ASSETS_ROOT)


"""
==========================================================
 API Views
==========================================================
"""	

@bottle.route('/document/:filename.:format')
def document(filename, format='md'):
    if format not in ['md', 'html']:
        return bottle.abort(400, "Sorry, I don't recognize that file format.")
    # Sanitize
    filename = filename.replace('/', '')
    filename = filename.replace('..', '')
    # Serve
    filename = "%s.md" % filename
    if format == 'md':
        try:
            return bottle.static_file(filename, root=settings.DOCUMENT_ROOT)
        except IOError, e:
            return bottle.abort(404, e)
    else:
        try:
            md = open(os.path.join(settings.DOCUMENT_ROOT, filename), 'rU')
        except IOError, e:
            return bottle.abort(404, e)
        html = markdown.markdown(md.read())
        md.close()
        return html
        
    
    
    
    
    
    
    
    
    
    