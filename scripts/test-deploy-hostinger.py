"""Exercise the FTP deployment boundary without credentials or network access."""
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).with_name('deploy-hostinger.sh').resolve()


class DeploymentTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        (self.root / 'dist/_astro').mkdir(parents=True)
        (self.root / 'dist/prix-carburants/station').mkdir(parents=True)
        self.log = self.root / 'calls.jsonl'
        # BASH_ENV supplies test doubles even when Git Bash prepends /usr/bin.
        shell_env = self.root / 'test-env.sh'
        shell_env.write_text('''lftp() {
  printf '%s\\n' "$*" >> "$TEST_FTP_LOG"
  return "${TEST_FTP_EXIT:-0}"
}
sleep() { return 0; }
''', encoding='utf-8', newline='\n')
        self.bash = os.environ.get('TEST_BASH') or shutil.which('bash')
        self.env = dict(os.environ, FTP_USER='test-user', FTP_PASSWORD='test-password',
                        FTP_HOST='test.invalid', TEST_FTP_LOG=str(self.log),
                        BASH_ENV=shell_env.as_posix())

    def run_phase(self, phase):
        return subprocess.run([self.bash, str(SCRIPT), phase], cwd=self.root,
                              env=self.env, capture_output=True, text=True, timeout=10)

    def test_core_publishes_assets_first_and_preserves_live_prices(self):
        result = self.run_phase('core')
        self.assertEqual(result.returncode, 0, result.stderr)
        calls = self.log.read_text()
        self.assertLess(calls.index('--ignore-time'), calls.index('--delete'))
        for pattern in ['--exclude ^_astro/', '--exclude ^prix-carburants/station/',
                        '--exclude ^data/meta[.]json$', '--exclude ^data/stations-light[.]json$']:
            self.assertIn(pattern, calls)
        self.assertIn('set cmd:fail-exit yes', calls)
        self.assertNotIn('rm -r', calls)

    def test_stations_are_a_separate_transfer(self):
        result = self.run_phase('stations')
        self.assertEqual(result.returncode, 0, result.stderr)
        calls = self.log.read_text()
        self.assertIn('prix-carburants/station prix-carburants/station', calls)
        self.assertNotIn('--ignore-time', calls)

    def test_failure_retries_three_times_and_stays_failed(self):
        self.env['TEST_FTP_EXIT'] = '1'
        result = self.run_phase('stations')
        self.assertEqual(result.returncode, 1)
        self.assertEqual(self.log.read_text().count('set cmd:fail-exit yes'), 3)

    def test_invalid_phase_never_connects(self):
        self.assertEqual(self.run_phase('wrong').returncode, 2)
        self.assertFalse(self.log.exists())

    def test_missing_credentials_never_connect(self):
        self.env.pop('FTP_PASSWORD')
        self.assertNotEqual(self.run_phase('core').returncode, 0)
        self.assertFalse(self.log.exists())

    def test_missing_station_directory_is_a_noop(self):
        (self.root / 'dist/prix-carburants/station').rmdir()
        self.assertEqual(self.run_phase('stations').returncode, 0)
        self.assertFalse(self.log.exists())


if __name__ == '__main__':
    unittest.main()
