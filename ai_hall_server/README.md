# Private AI Hall — Scrap Radar Family

Independent WSGI service in the scrap_radar_family repository. Do not install or mount this service in Board_Sense. GitHub Pages provides the Island entrance only. All notebook content lives in the private server database, never GitHub Issues or public note files.

Deployment prerequisites:

1. Create an independent AI Hall service using this repository, root directory /ai_hall_server, one replica. Use ai_hall_server/railway.toml for configuration.
2. Attach a persistent Railway volume at /data. Railway supplies RAILWAY_VOLUME_MOUNT_PATH. Keep the volume outside all static web roots and enable volume backups. No note content is served as a file.
3. Generate an HTTPS service domain and set AI_HALL_ORIGIN to its exact origin with no trailing slash.
4. Run python set_password.py privately. Choose a unique password of at least 14 characters, then put its generated hash into the service's AI_HALL_PASSWORD_HASH variable. Never commit the password or hash. Share the actual password with authorized people separately. Password changes invalidate existing sessions after deployment.
5. Deploy this service, confirm an anonymous visitor cannot view notes, and complete login/write/reply/logout testing. Then replace the setup-only ai_hall.html entrance with a link to the confirmed HTTPS /ai-hall/ URL. Do not point it at Board Sense.

Missing password/origin/volume configuration returns 503 and denies all access. /health reports process readiness only, not successful private notebook configuration. A shared password admits all password holders; displayed author names are self-reported and grant no special approval rights. AI connections remain manual.

Protections: scrypt password hashing, eight-hour random server-side sessions, hashed session identifiers at rest, Secure/HttpOnly/SameSite=Strict cookies, CSRF token plus exact Origin checks, no-store responses, escaped text, SQLite parameter binding, bounded forms, and ten login attempts globally per fifteen minutes. A global limiter intentionally favors privacy over availability; someone can temporarily exhaust it. Sessions and notes survive process restarts on the volume. Reaction counts are per sign-in, not verified person counts.

Run tests from this directory: python -m unittest test_hall.py -v. Tests use temporary storage and passwords, never production secrets. Real deployment and browser QA are still required.
