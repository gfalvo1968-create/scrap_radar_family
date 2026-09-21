import io
import re
import tempfile
import unittest
from urllib.parse import urlencode
from hall import Hall, password_hash, configured_hall, COOKIE

class HallTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = self.tmp.name + '/hall.sqlite3'
        self.password = 'test-password-long-enough'
        self.hash = password_hash(self.password)
        self.app = Hall(self.path,self.hash,'https://hall.test')
        self.cookie = ''
    def tearDown(self):
        self.tmp.cleanup()
    def request(self,path='/',data=None,origin='https://hall.test'):
        raw=urlencode(data or {}).encode()
        env={'PATH_INFO':path,'REQUEST_METHOD':'POST' if data is not None else 'GET','HTTP_ORIGIN':origin,'HTTP_COOKIE':self.cookie,'CONTENT_LENGTH':str(len(raw)),'CONTENT_TYPE':'application/x-www-form-urlencoded','wsgi.input':io.BytesIO(raw)}
        result={}
        def start(status,headers):
            result.update(status=int(status.split()[0]),headers=dict(headers))
        result['body']=b''.join(self.app(env,start)).decode()
        return result
    def login(self):
        r=self.request('/login',{'password':self.password})
        self.assertEqual(r['status'],303)
        self.cookie=r['headers']['Set-Cookie'].split(';')[0]
        self.assertIn('HttpOnly',r['headers']['Set-Cookie'])
        self.assertIn('Secure',r['headers']['Set-Cookie'])
        self.assertIn('SameSite=Strict',r['headers']['Set-Cookie'])
        return re.search('name="csrf" value="([^"]+)"',self.request()['body'])[1]
    def test_auth_notes_replies_logout_and_persistence(self):
        self.assertNotIn('Write a note',self.request()['body'])
        self.assertEqual(self.request('/notes',{'body':'secret'})['status'],401)
        self.assertEqual(self.request('/login',{'password':'wrong'})['status'],401)
        csrf=self.login()
        note={'csrf':csrf,'room':'Board Sense','title':'Private finding','body':'<script>secret()</script>','author':'Casey copied by Jerry'}
        self.assertEqual(self.request('/notes',note)['status'],303)
        self.assertEqual(self.request('/reply',{'csrf':csrf,'note':'1','body':'Reply saved','author':'Jerry'})['status'],303)
        self.assertEqual(self.request('/react',{'csrf':csrf,'note':'1'})['status'],303)
        self.app=Hall(self.path,self.hash,'https://hall.test')
        content=self.request()['body']
        self.assertIn('Private finding',content)
        self.assertIn('&lt;script&gt;',content)
        self.assertNotIn('<script>',content)
        self.assertIn('Reply saved',content)
        self.assertIn('Toggle support (1)',content)
        cookie=self.cookie
        self.assertEqual(self.request('/logout',{'csrf':csrf})['status'],303)
        self.cookie=cookie
        self.assertNotIn('Private finding',self.request()['body'])
    def test_csrf_and_rotation(self):
        csrf=self.login()
        self.assertEqual(self.request('/logout',{'csrf':csrf},origin='https://evil.test')['status'],403)
        self.assertEqual(self.request('/logout',{'csrf':'bad'})['status'],403)
        self.app=Hall(self.path,password_hash('different-password-long'),'https://hall.test')
        self.assertNotIn('Write a note',self.request()['body'])
    def test_throttle(self):
        for i in range(10):self.assertEqual(self.request('/login',{'password':'wrong'})['status'],401)
        self.assertEqual(self.request('/login',{'password':self.password})['status'],429)
    def test_missing_configuration_fails_closed(self):
        from unittest.mock import patch
        with patch.dict('os.environ',{},clear=True):
            self.app=configured_hall
            self.assertEqual(self.request()['status'],503)
    def test_expired_session_and_invalid_inputs(self):
        csrf=self.login()
        self.assertEqual(self.request('/notes',{'csrf':csrf,'room':'invalid'})['status'],400)
        with self.app.db() as db:db.execute('UPDATE sessions SET expires=0')
        self.assertNotIn('Write a note',self.request()['body'])

if __name__=='__main__':unittest.main()

class FileTests(HallTests):
    def test_private_files_and_packet(self):
        import zipfile
        self.assertEqual(self.request('/files/1')['status'],401)
        self.assertEqual(self.request('/packet.zip')['status'],401)
        csrf=self.login()
        self.assertIn('01-START-HERE.md',self.request()['body'])
        payload={'csrf':csrf,'name':'review.md','body':'Reviewer evidence','author':'Gemini — copied by Jerry'}
        self.assertEqual(self.request('/documents',payload)['status'],303)
        self.assertEqual(self.request('/documents',payload)['status'],409)
        self.assertEqual(self.request('/documents',{**payload,'name':'../bad.md'})['status'],400)
        self.assertEqual(self.request('/documents',{**payload,'name':'next.md','csrf':'bad'})['status'],403)
        self.app=Hall(self.path,self.hash,'https://hall.test')
        self.assertIn('review.md',self.request()['body'])
        self.assertEqual(self.request('/files/6')['body'],'Reviewer evidence')
        result={}
        raw=b''.join(self.app({'PATH_INFO':'/packet.zip','REQUEST_METHOD':'GET','HTTP_COOKIE':self.cookie},lambda status,headers:result.update(status=status,headers=dict(headers))))
        self.assertEqual(result['status'],'200 OK')
        with zipfile.ZipFile(io.BytesIO(raw)) as packet:
            self.assertEqual(packet.read('files/review.md').decode(),'Reviewer evidence')
            self.assertNotIn('sessions',packet.namelist())
            self.assertNotIn(self.password, str([packet.read(n) for n in packet.namelist()]))
