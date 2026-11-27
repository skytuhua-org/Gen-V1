"""Regression checks for the bounded M16 command evidence runner."""
import importlib.util
import io
import json
import subprocess
import sys
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location(
    'run_m16_bounded', Path(__file__).resolve().parents[1] / 'scripts/run_m16_bounded.py'
)
runner = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(runner)


class BoundedTimeoutEvidence(unittest.TestCase):
    def test_timeout_writes_a_bounded_log_and_json_receipt(self):
        def run_with_short_timeout(argv, **kwargs):
            kwargs['timeout'] = 1
            return real_run(argv, **kwargs)

        real_run = subprocess.run
        argv = [sys.executable, '-c',
                "import sys,time; print('discarded', flush=True); print('started', flush=True); print('waiting', file=sys.stderr, flush=True); time.sleep(10)"]
        with tempfile.TemporaryDirectory() as directory:
            log = Path(directory) / 'timeout.log'
            output = io.StringIO()
            with patch.object(runner, 'CWD', directory), \
                 patch.object(runner.subprocess, 'run', side_effect=run_with_short_timeout), redirect_stdout(output):
                self.assertEqual(runner.run(argv, str(log), cap=17), 124)
            receipt = json.loads(output.getvalue())
            self.assertEqual(receipt['exitCode'], 124)
            self.assertEqual(receipt['termination'], 'TIMEOUT')
            contents = log.read_text(encoding='utf-8')
            self.assertIn('exitCode: 124\ntermination: TIMEOUT', contents)
            body = contents.split('\n\n', maxsplit=1)[1]
            self.assertLessEqual(len(body), 17)
            self.assertNotIn('discarded', body)
            self.assertIn('started', body)
            self.assertIn('waiting', body)


if __name__ == '__main__':
    unittest.main()
