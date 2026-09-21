"""Run privately; paste the resulting hash into AI_HALL_PASSWORD_HASH, never Git."""
from getpass import getpass
from hall import password_hash
if __name__ == '__main__':
    password = getpass('New Hall password (at least 14 characters): ')
    if password != getpass('Confirm password: '):
        raise SystemExit('Passwords did not match.')
    print(password_hash(password))
