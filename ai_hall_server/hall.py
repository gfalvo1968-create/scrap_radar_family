"""Private, server-rendered AI Hall. Mount only at /ai-hall using WSGIMiddleware."""
from contextlib import contextmanager
import hashlib
import hmac
import html
import os
import secrets
import sqlite3
import time
from http.cookies import SimpleCookie
from pathlib import Path
from urllib.parse import parse_qs

PREFIX = '/ai-hall'
COOKIE = '__Secure-ai_hall'
ROOMS = ('Board Sense', 'Scrap Radar', 'AI Hall', 'Future Ideas')
TTL = 8 * 3600


def password_hash(password):
    if len(password) < 14:
        raise ValueError('Use at least 14 characters.')
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=16384, r=8, p=1)
    return salt.hex() + ':' + digest.hex()


def check_password(password, encoded):
    salt, expected = encoded.split(':')
    actual = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=16384, r=8, p=1).hex()
    return hmac.compare_digest(actual, expected)


def esc(text):
    return html.escape(str(text), quote=True)


def fingerprint(value):
    return hashlib.sha256(value.encode()).hexdigest()


STYLE = '''body{margin:0;background:#122832;color:#fff1d4;font:18px/1.55 system-ui,sans-serif}main{max-width:960px;margin:auto;padding:24px}h1{font-size:44px}a{color:#ffdc98}article,section{background:#1b3540;border:1px solid #657b80;border-radius:14px;padding:22px;margin:20px 0}label{display:block;margin-top:14px}input,textarea,select,button{box-sizing:border-box;font:inherit;padding:12px;border-radius:8px;max-width:100%}input,textarea,select{display:block;width:100%;background:#10202a;color:#fff;border:1px solid #8ba0a7}textarea{min-height:140px}button{background:#ffdc98;color:#232a2b;border:0;cursor:pointer;margin-top:14px;min-height:48px}small{color:#c6d4d8}.text{white-space:pre-wrap;overflow-wrap:anywhere}.reply{border-top:1px solid #657b80;padding-top:12px}form.inline{display:inline-block;margin-right:12px}:focus-visible{outline:3px solid #8bdbff;outline-offset:4px}@media(max-width:600px){main{padding:14px}article,section{padding:16px}h1{font-size:34px}}'''


def page(content):
    return ('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Private AI Hall</title><style>' + STYLE + '</style><main><a href="https://gfalvo1968-create.github.io/scrap_radar_family/island_portal.html">← Back to the Island</a><h1>🏔️ AI Hall</h1>' + content + '</main></html>').encode()


def hidden(csrf):
    return '<input type="hidden" name="csrf" value="' + esc(csrf) + '">'


def form(action, csrf, body, inline=False):
    return '<form method="post" action="' + PREFIX + action + '"' + (' class="inline"' if inline else '') + '>' + hidden(csrf) + body + '</form>'


class Hall:
    def __init__(self, db_path, encoded, origin):
        self.path, self.encoded, self.origin = db_path, encoded, origin
        with self.db() as db:
            db.executescript('''
            CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, csrf TEXT NOT NULL, expires INTEGER NOT NULL, epoch TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS attempts(at INTEGER NOT NULL);
            CREATE TABLE IF NOT EXISTS notes(id INTEGER PRIMARY KEY, room TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, author TEXT NOT NULL, created INTEGER NOT NULL);
            CREATE TABLE IF NOT EXISTS replies(id INTEGER PRIMARY KEY, note INTEGER NOT NULL REFERENCES notes(id), body TEXT NOT NULL, author TEXT NOT NULL, created INTEGER NOT NULL);
            CREATE TABLE IF NOT EXISTS reactions(note INTEGER NOT NULL REFERENCES notes(id), session TEXT NOT NULL, PRIMARY KEY(note,session));
            ''')

    @contextmanager
    def db(self):
        db = sqlite3.connect(self.path, timeout=10)
        db.row_factory = sqlite3.Row
        db.execute('PRAGMA foreign_keys=ON')
        try:
            with db:
                yield db
        finally:
            db.close()

    def __call__(self, env, start):
        def respond(code, content=b'', headers=()):
            start(code, [('Content-Type', 'text/html; charset=utf-8'), ('Cache-Control', 'no-store, private'), ('Pragma', 'no-cache'), ('X-Content-Type-Options', 'nosniff'), ('Referrer-Policy', 'no-referrer'), ('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"), *headers])
            return [content]
        def redirect(headers=()):
            return respond('303 See Other', headers=[('Location', PREFIX + '/'), *headers])
        method, path = env.get('REQUEST_METHOD'), env.get('PATH_INFO', '/')
        if method not in ('GET', 'POST'):
            return respond('405 Method Not Allowed', page('Method not allowed.'))
        cookie = SimpleCookie()
        try:
            cookie.load(env.get('HTTP_COOKIE', ''))
            token = cookie[COOKIE].value if COOKIE in cookie else ''
        except Exception:
            token = ''
        now = int(time.time())
        with self.db() as db:
            db.execute('DELETE FROM sessions WHERE expires < ? OR epoch != ?', (now, fingerprint(self.encoded)))
            session = db.execute('SELECT * FROM sessions WHERE token=?', (fingerprint(token),)).fetchone() if token else None
        if method == 'GET':
            if path != '/':
                return respond('404 Not Found', page('Not found.'))
            if not session:
                return respond('200 OK', page('<section><h2>Enter our private meeting room</h2><form method="post" action="/ai-hall/login"><label for="password">Hall password</label><input id="password" name="password" type="password" autocomplete="current-password" maxlength="256" required><button>Unlock AI Hall</button></form><p><small>Only password holders can read or write the notebook. AI services are not automatically connected.</small></p></section>'))
            return respond('200 OK', page(self.notebook(session, env)))
        # Browser-origin check also protects login against login CSRF. No CORS writes.
        if env.get('HTTP_ORIGIN') != self.origin:
            return respond('403 Forbidden', page('This request did not come from the Hall.'))
        try:
            size = int(env.get('CONTENT_LENGTH', '0'))
        except ValueError:
            size = -1
        if not 0 < size <= 24000 or env.get('CONTENT_TYPE', '').split(';')[0] != 'application/x-www-form-urlencoded':
            return respond('413 Payload Too Large', page('Invalid or oversized form.'))
        try:
            data = parse_qs(env['wsgi.input'].read(size).decode('utf-8', errors='replace'), max_num_fields=12)
        except ValueError:
            return respond('400 Bad Request', page('Too many form fields.'))
        def field(name, limit):
            value = data.get(name, [''])[0]
            if name != 'password':
                value = value.strip()
            if not value or len(value) > limit:
                raise ValueError('Please check the form fields.')
            return value
        try:
            if path == '/login':
                password = field('password', 256)
                with self.db() as db:
                    db.execute('BEGIN IMMEDIATE')
                    db.execute('DELETE FROM attempts WHERE at < ?', (now - 900,))
                    if db.execute('SELECT COUNT(*) FROM attempts').fetchone()[0] >= 10:
                        return respond('429 Too Many Requests', page('Too many sign-in attempts. Try again in 15 minutes.'), [('Retry-After', '900')])
                    db.execute('INSERT INTO attempts VALUES(?)', (now,))
                if not check_password(password, self.encoded):
                    return respond('401 Unauthorized', page('<p>Password not recognized.</p><a href="/ai-hall/">Try again</a>'))
                raw, csrf = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
                with self.db() as db:
                    if token:
                        db.execute('DELETE FROM sessions WHERE token=?', (fingerprint(token),))
                    db.execute('INSERT INTO sessions VALUES(?,?,?,?)', (fingerprint(raw), csrf, now + TTL, fingerprint(self.encoded)))
                return redirect([('Set-Cookie', f'{COOKIE}={raw}; Path=/ai-hall; Max-Age={TTL}; Secure; HttpOnly; SameSite=Strict')])
            if not session:
                return respond('401 Unauthorized', page('Unlock the Hall first.'))
            if not hmac.compare_digest(data.get('csrf', [''])[0], session['csrf']):
                return respond('403 Forbidden', page('This form expired. Reload the Hall and try again.'))
            with self.db() as db:
                if path == '/logout':
                    db.execute('DELETE FROM sessions WHERE token=?', (session['token'],))
                    return redirect([('Set-Cookie', f'{COOKIE}=; Path=/ai-hall; Max-Age=0; Secure; HttpOnly; SameSite=Strict')])
                if path == '/notes':
                    room = field('room', 40)
                    if room not in ROOMS:
                        raise ValueError('Choose a project room.')
                    db.execute('INSERT INTO notes(room,title,body,author,created) VALUES(?,?,?,?,?)', (room, field('title', 120), field('body', 6000), field('author', 80), now))
                elif path in ('/reply', '/react'):
                    note = int(field('note', 20))
                    if not db.execute('SELECT id FROM notes WHERE id=?', (note,)).fetchone():
                        return respond('404 Not Found', page('Note not found.'))
                    if path == '/reply':
                        db.execute('INSERT INTO replies(note,body,author,created) VALUES(?,?,?,?)', (note, field('body', 3000), field('author', 80), now))
                    else:
                        existing = db.execute('SELECT 1 FROM reactions WHERE note=? AND session=?', (note, session['token'])).fetchone()
                        if existing:
                            db.execute('DELETE FROM reactions WHERE note=? AND session=?', (note, session['token']))
                        else:
                            db.execute('INSERT INTO reactions VALUES(?,?)', (note, session['token']))
                else:
                    return respond('404 Not Found', page('Not found.'))
            return redirect()
        except (ValueError, OverflowError):
            return respond('400 Bad Request', page('Please check the form fields and try again.'))

    def notebook(self, session, env):
        csrf = session['csrf']
        out = '<p>Private team notebook · Jerry has final say · Maya coordinates · Casey reviews.</p><p><small>Names are self-reported with this shared password. Mark copied AI contributions clearly. Reactions are per sign-in, not verified votes.</small></p>'
        out += form('/logout', csrf, '<button>Lock the Hall</button>')
        rooms = ''.join('<option>' + esc(r) + '</option>' for r in ROOMS)
        out += '<section><h2>Write a note or assignment</h2>' + form('/notes', csrf, '<label>Project room<select name="room">' + rooms + '</select></label><label>Contribution from<input name="author" maxlength="80" placeholder="Jerry, or Casey — copied by Jerry" required></label><label>Title<input name="title" maxlength="120" required></label><label>Note<textarea name="body" maxlength="6000" required></textarea></label><button>Save private note</button>') + '</section>'
        try:
            before = max(0, int(parse_qs(env.get('QUERY_STRING', '')).get('before', ['9223372036854775807'])[0]))
        except ValueError:
            before = 9223372036854775807
        with self.db() as db:
            notes = db.execute('SELECT * FROM notes WHERE id < ? ORDER BY id DESC LIMIT 31', (min(before,9223372036854775807),)).fetchall()
            if not notes:
                out += '<p>No notes here yet.</p>'
            for n in notes[:30]:
                out += '<article><small>' + esc(n['room']) + ' · ' + esc(n['author']) + ' · ' + time.strftime('%Y-%m-%d %H:%M UTC',time.gmtime(n['created'])) + '</small><h2>' + esc(n['title']) + '</h2><div class="text">' + esc(n['body']) + '</div>'
                note = '<input type="hidden" name="note" value="' + str(n['id']) + '">'
                count = db.execute('SELECT COUNT(*) FROM reactions WHERE note=?',(n['id'],)).fetchone()[0]
                out += form('/react', csrf, note + '<button>👍 Toggle support (' + str(count) + ')</button>', True)
                for r in db.execute('SELECT * FROM replies WHERE note=? ORDER BY id', (n['id'],)):
                    out += '<div class="reply"><small>' + esc(r['author']) + '</small><p class="text">' + esc(r['body']) + '</p></div>'
                out += '<details><summary>Reply</summary>' + form('/reply',csrf,note + '<label>Contribution from<input name="author" maxlength="80" required></label><label>Reply<textarea name="body" maxlength="3000" required></textarea></label><button>Save reply</button>') + '</details></article>'
            if len(notes) > 30:
                out += '<a href="/ai-hall/?before=' + str(notes[29]['id']) + '">Older notes →</a>'
        return out


def configured_hall(env, start):
    """Fail closed. Store DB outside every public static directory, on a mounted volume."""
    encoded = os.getenv('AI_HALL_PASSWORD_HASH', '')
    volume = os.getenv('RAILWAY_VOLUME_MOUNT_PATH', '')
    origin = os.getenv('AI_HALL_ORIGIN', '')
    try:
        salt, digest = encoded.split(':')
        assert len(bytes.fromhex(salt)) == 16 and len(bytes.fromhex(digest)) == 64
        root = Path(volume).resolve()
        assert volume and root.is_dir() and origin.startswith('https://') and origin.rstrip('/') == origin
        assert root != Path('/') and not any(p.lower() in ('static', 'blueprints', 'images') for p in root.parts)
    except (ValueError, AssertionError):
        start('503 Service Unavailable', [('Content-Type','text/html; charset=utf-8'),('Cache-Control','no-store')])
        return [page('<p>The private Hall is locked while its password and durable storage are being configured.</p>')]
    return Hall(str(root / 'ai_hall.sqlite3'), encoded, origin)(env, start)
