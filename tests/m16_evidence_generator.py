"""The M16 generator must not publish an inventory when source Git fails."""
import json
import re
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/gen_m16_evidence.py'


class EvidenceInventory(unittest.TestCase):
    def test_missing_pinned_git_base_preserves_previous_evidence(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            subprocess.run(['git', 'init', '-q', str(root)], check=True)
            source = SCRIPT.read_text(encoding='utf-8')
            base = re.search(r"^BASE = '([0-9a-f]+)'$", source, re.MULTILINE).group(1)
            source, replacements = re.subn(r"^ROOT = .+$", lambda _: f'ROOT = {str(root)!r}', source, flags=re.MULTILINE)
            self.assertEqual(replacements, 1)
            fixture = root / 'fixture.py'
            fixture.write_text(source, encoding='utf-8')
            evidence = root / 'docs/implementation/v3/M16-verification.json'
            evidence.parent.mkdir(parents=True)
            original = json.dumps({'baseSha': base, 'phases': [], 'changedFiles': ['preserve.ts'],
                                   'reviewerApproval': False, 'flags': []})
            evidence.write_text(original, encoding='utf-8')
            evidence.with_name('M16-source-lock.json').write_text('{}', encoding='utf-8')
            records = root / 'records.json'
            records.write_text('[]', encoding='utf-8')
            run = subprocess.run([sys.executable, str(fixture), str(records)],
                                 capture_output=True, text=True, timeout=10)
            self.assertNotEqual(run.returncode, 0)
            self.assertIn('CalledProcessError', run.stderr)
            self.assertEqual(evidence.read_text(encoding='utf-8'), original)


if __name__ == '__main__':
    unittest.main()
