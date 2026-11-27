type DiffLineClass = '' | 'added' | 'removed' | 'diff-header' | 'diff-hunk';

export function classifyArtifactDiff(text: string): {text: string; className: DiffLineClass}[] {
  const lines = text.split(/\r?\n/);
  let fileMetadata = false;
  let oldLines = 0;
  let newLines = 0;
  let newFileHeaderAt = -1;

  const classify = (line: string, index: number): DiffLineClass => {
    if (line.startsWith('diff --git ')) {
      oldLines = 0;
      newLines = 0;
      fileMetadata = true;
      return 'diff-header';
    }
    if (line.startsWith('@@')) {
      const header = /^@@ -\d+(?:,(\d+))? \+\d+(?:,(\d+))? @@/.exec(line);
      oldLines = header ? Number(header[1] ?? 1) : 0;
      newLines = header ? Number(header[2] ?? 1) : 0;
      fileMetadata = false;
      return 'diff-hunk';
    }
    if (line === '\\ No newline at end of file') return 'diff-hunk';

    // Prefixes can resemble headers inside a hunk. Counts establish when the
    // next header pair can begin, even in patches without a diff --git line.
    if (oldLines > 0 || newLines > 0) {
      if (line.startsWith('-')) { oldLines--; return 'removed'; }
      if (line.startsWith('+')) { newLines--; return 'added'; }
      if (line.startsWith(' ')) { oldLines--; newLines--; }
      return '';
    }
    if (line.startsWith('--- ') && lines[index + 1]?.startsWith('+++ ')) {
      newFileHeaderAt = index + 1;
      return 'diff-header';
    }
    if (index === newFileHeaderAt) return 'diff-header';
    if (fileMetadata && /^(?:index |(?:old|new) mode |(?:new|deleted) file mode |(?:dis)?similarity index |(?:rename|copy) (?:from|to) )/.test(line)) return 'diff-header';
    if (line.startsWith('+')) return 'added';
    if (line.startsWith('-')) return 'removed';
    return '';
  };
  return lines.map((line, index) => ({text: line, className: classify(line, index)}));
}
