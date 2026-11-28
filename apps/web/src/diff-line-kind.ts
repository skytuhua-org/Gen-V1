type DiffLineKind = 'context' | 'add' | 'remove' | 'header' | 'hunk';

export function splitDiffLines(text: string): {text: string; kind: DiffLineKind}[] {
  const lines = text.split(/\r?\n/);
  let fileMetadata = false;
  let oldLines = 0;
  let newLines = 0;
  let newFileHeaderAt = -1;

  const classify = (line: string, index: number): DiffLineKind => {
    if (line.startsWith('diff --git ')) {
      oldLines = 0;
      newLines = 0;
      fileMetadata = true;
      return 'header';
    }
    if (line.startsWith('@@')) {
      const header = /^@@ -\d+(?:,(\d+))? \+\d+(?:,(\d+))? @@/.exec(line);
      oldLines = header ? Number(header[1] ?? 1) : 0;
      newLines = header ? Number(header[2] ?? 1) : 0;
      fileMetadata = false;
      return 'hunk';
    }
    if (line === '\\ No newline at end of file') return 'hunk';

    // Prefixes can resemble headers inside a hunk. Counts establish when the
    // next header pair can begin, even in patches without a diff --git line.
    if (oldLines > 0 || newLines > 0) {
      if (line.startsWith('-')) { oldLines--; return 'remove'; }
      if (line.startsWith('+')) { newLines--; return 'add'; }
      if (line.startsWith(' ')) { oldLines--; newLines--; }
      return 'context';
    }
    if (line.startsWith('--- ') && lines[index + 1]?.startsWith('+++ ')) {
      newFileHeaderAt = index + 1;
      return 'header';
    }
    if (index === newFileHeaderAt) return 'header';
    if (fileMetadata && /^(?:index |(?:old|new) mode |(?:new|deleted) file mode |(?:dis)?similarity index |(?:rename|copy) (?:from|to) )/.test(line)) return 'header';
    if (line.startsWith('+')) return 'add';
    if (line.startsWith('-')) return 'remove';
    return 'context';
  };
  return lines.map((line, index) => ({text: line, kind: classify(line, index)}));
}
