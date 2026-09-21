"""Standalone Scrap Radar Family service; no Board Sense dependencies."""
from hall import configured_hall


def application(environ, start_response):
    path = environ.get('PATH_INFO', '/')
    if path == '/health':
        start_response('200 OK', [('Content-Type','text/plain'), ('Cache-Control','no-store')])
        return [b'AI Hall process ready']
    if path in ('/', '/ai-hall'):
        start_response('303 See Other', [('Location','/ai-hall/'), ('Cache-Control','no-store')])
        return [b'']
    if not path.startswith('/ai-hall/'):
        start_response('404 Not Found', [('Content-Type','text/plain')])
        return [b'Not found']
    private = dict(environ)
    private['SCRIPT_NAME'] = '/ai-hall'
    private['PATH_INFO'] = path[len('/ai-hall'):]
    return configured_hall(private, start_response)
