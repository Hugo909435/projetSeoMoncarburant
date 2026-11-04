"""Real lftp transfers against a temporary FTP server bound to loopback only."""
import logging
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import threading
import unittest

from pyftpdlib.authorizers import DummyAuthorizer
from pyftpdlib.handlers import FTPHandler
from pyftpdlib.servers import FTPServer

SCRIPT = Path(__file__).with_name('deploy-hostinger.sh').resolve()
logging.getLogger('pyftpdlib').setLevel(logging.CRITICAL)


class FTPIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.remote = self.root / 'remote'
        self.remote.mkdir()
        self.local = self.root / 'dist'
        for directory in ['_astro', 'data', 'prix-carburants/station/test']:
            (self.local / directory).mkdir(parents=True)
            (self.remote / directory).mkdir(parents=True)
        self.write(self.local, 'index.html', 'new homepage')
        self.write(self.local, '_astro/new.hash.js', 'new resource')
        self.write(self.local, 'data/meta.json', 'older build metadata')
        self.write(self.local, 'data/stations-light.json', 'older build prices')
        self.write(self.local, 'prix-carburants/station/test/index.html', 'new station')
        self.write(self.remote, 'index.html', 'old homepage')
        self.write(self.remote, '_astro/previous.hash.js', 'resource for previous HTML')
        self.write(self.remote, 'data/meta.json', 'fresh hourly metadata')
        self.write(self.remote, 'data/stations-light.json', 'fresh hourly prices')
        self.write(self.remote, 'prix-carburants/station/test/index.html', 'old station')
        self.write(self.remote, 'obsolete.html', 'retired page')
        self.username = 'test:user,commas'
        self.password = 'test;password$with"quotes-and-comma,'
        authorizer = DummyAuthorizer()
        authorizer.add_user(self.username, self.password, str(self.remote), perm='elradfmwMT')
        class Handler(FTPHandler):
            pass
        Handler.authorizer = authorizer
        self.server = FTPServer(('127.0.0.1', 0), Handler)
        self.port = self.server.socket.getsockname()[1]
        self.thread = threading.Thread(target=self.server.serve_forever,
                                       kwargs={'timeout': 0.05, 'handle_exit': False}, daemon=True)
        self.thread.start()
        self.addCleanup(self.stop_server)

    def stop_server(self):
        self.server.close_all()
        self.thread.join(timeout=3)

    @staticmethod
    def write(root, relative, text):
        (root / relative).write_text(text, encoding='utf-8')

    def deploy(self, phase):
        env = dict(os.environ, FTP_HOST='127.0.0.1', FTP_PORT=str(self.port),
                   FTP_USER=self.username, FTP_PASSWORD=self.password)
        env.pop('BASH_ENV', None)
        result = subprocess.run(['bash', str(SCRIPT), phase], cwd=self.root, env=env,
                                capture_output=True, text=True, timeout=20)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertNotIn(self.password, result.stdout + result.stderr)

    def test_core_transfer_preserves_stations_live_prices_and_old_assets(self):
        self.deploy('core')
        self.assertEqual((self.remote / 'index.html').read_text(), 'new homepage')
        self.assertEqual((self.remote / '_astro/new.hash.js').read_text(), 'new resource')
        self.assertTrue((self.remote / '_astro/previous.hash.js').exists())
        self.assertEqual((self.remote / 'data/meta.json').read_text(), 'fresh hourly metadata')
        self.assertEqual((self.remote / 'data/stations-light.json').read_text(), 'fresh hourly prices')
        self.assertEqual((self.remote / 'prix-carburants/station/test/index.html').read_text(), 'old station')
        self.assertFalse((self.remote / 'obsolete.html').exists())

    def test_station_transfer_updates_only_station_tree(self):
        self.deploy('stations')
        self.assertEqual((self.remote / 'prix-carburants/station/test/index.html').read_text(), 'new station')
        self.assertEqual((self.remote / 'index.html').read_text(), 'old homepage')
        self.assertEqual((self.remote / 'data/meta.json').read_text(), 'fresh hourly metadata')
        self.assertTrue((self.remote / 'obsolete.html').exists())


if __name__ == '__main__':
    if not shutil.which('lftp'):
        raise SystemExit('Real integration tests require lftp.')
    unittest.main()
