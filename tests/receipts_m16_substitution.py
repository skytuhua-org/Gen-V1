"""Synthetic, local-only tests for M16 command receipt substitution."""
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/gen_m16_evidence.py'


class ReceiptSubstitution(unittest.TestCase):
    def run_fixture(self, supplied):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            git = lambda *args: subprocess.check_output(['git', '-C', directory, *args], text=True).strip()
            git('init', '-q')
            git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid',
                '-c', 'commit.gpgsign=false', 'commit', '--allow-empty', '-qm', 'base')
            base = git('rev-parse', 'HEAD')
            target = root / 'docs/implementation/v3/M16-verification.json'
            target.parent.mkdir(parents=True)
            (target.parent / 'M16-source-lock.json').write_text('{}')
            for name in ('fresh.log', 'spelling-drift.log'):
                (root / name).write_text('new run')
            original = json.dumps({'baseSha': base, 'phases': [
                {'commands': [{'boundedLogRef': 'fresh.log', 'exitCode': 1}]},
                {'commands': [{'boundedLogRef': 'fresh.log', 'exitCode': 1}]}
            ], 'changedFiles': [], 'reviewerApproval': False, 'flags': []})
            target.write_text(original)
            fixture = root / 'fixture.py'
            source = re.sub(r'^ROOT = .+$', lambda _: f'ROOT = {directory!r}', SCRIPT.read_text(), flags=re.M)
            source = re.sub(r'^BASE = .+$', lambda _: f'BASE = {base!r}', source, flags=re.M)
            fixture.write_text(source)
            records = root / 'records.json'
            records.write_text(json.dumps([{'boundedLogRef': ref, 'exitCode': 0} for ref in supplied]))
            run = subprocess.run([sys.executable, str(fixture), str(records)], capture_output=True, text=True, timeout=10)
            return run, original, target.read_text()

    def test_rejects_unmatched_and_duplicate_references_without_rewriting(self):
        for supplied in (['fresh.log', 'spelling-drift.log'], ['fresh.log', 'fresh.log']):
            with self.subTest(supplied=supplied):
                run, original, target = self.run_fixture(supplied)
                self.assertNotEqual(run.returncode, 0)
                self.assertEqual(original, target)

    def test_updates_both_phases_that_share_one_valid_reference(self):
        run, _, result = self.run_fixture(['fresh.log'])
        self.assertEqual(run.returncode, 0, run.stderr)
        self.assertEqual([p['commands'][0]['exitCode'] for p in json.loads(result)['phases']], [0, 0])


if __name__ == '__main__':
    unittest.main()
