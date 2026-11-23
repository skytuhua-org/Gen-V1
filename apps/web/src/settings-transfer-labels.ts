import type {UiPreferences} from '../../../packages/contracts/preferences.ts';

// Visible labels for every portable key — matching the Settings row titles where a row exists.
const LABELS: Record<string, string> = {
  theme: 'Color scheme',
  density: 'Density', uiFontSize: 'UI size', chatFontSize: 'Chat size', codeFontSize: 'Code size',
  controlRadius: 'Control radius', customAccent: 'Custom accent', appearanceAccent: 'Interface accent',
  backgroundStyle: 'Background style', backgroundOpacity: 'Background opacity',
  interfaceFont: 'Interface font', promptFont: 'Composer font', codeFont: 'Code font',
  contrast: 'Contrast', chatWidth: 'Chat width', motion: 'Motion', motionSpeed: 'Motion speed',
  motionDuration: 'Motion duration', panelAnimations: 'Panel animations', timeFormat: 'Time format', wordWrap: 'Code line wrap',
  sendShortcut: 'Send shortcut', composerPredictions: 'Suggest my next message',
  showComposerContext: 'Composer context', showThreadDetails: 'Thread details',
  projectGrouping: 'Group threads by project', projectOrder: 'Project order', showWorkingSection: 'Working section',
  archiveConfirmation: 'Archive confirmation', deleteConfirmation: 'Delete confirmation', unpinConfirmation: 'Unpin confirmation',
  diffLayout: 'Diff layout', hideWhitespace: 'Hide whitespace changes', diffDefaultExpanded: 'Expand diffs', diffColors: 'Diff colors',
  threadNotifications: 'Task notifications', inAppNotifications: 'In-app notifications', notificationVolume: 'Notification volume',
  notificationPreview: 'Notification preview', notificationQuietHours: 'Quiet hours', showUsageFooter: 'Live usage',
  'keybindings.search': 'Search threads shortcut', 'keybindings.newThread': 'New thread shortcut',
  'keybindings.toggleSidebar': 'Toggle sidebar shortcut', 'keybindings.toggleRightPanel': 'Toggle workspace panel shortcut',
  'keybindings.openSettings': 'Open settings shortcut', 'keybindings.stop': 'Stop active run shortcut',
};

// Option labels as they appear in the Settings selects, keyed by preference key.
const OPTION_LABELS: Record<string, Record<string, string>> = {
  theme: {light: 'Light', dark: 'Dark', system: 'System'},
  density: {compact: 'Compact · 32 px', comfortable: 'Comfortable · 36 px', touch: 'Touch · 44 px'},
  controlRadius: {'0': 'Square · 0 px', '6': 'Rounded · 6 px', '10': 'Soft · 10 px'},
  interfaceFont: {system: 'System'}, promptFont: {system: 'System'}, codeFont: {monospace: 'System monospace'},
  chatWidth: {comfortable: '680 px', wide: '760 px', full: 'Full available width'},
  contrast: {normal: 'Standard', high: 'High'},
  motion: {system: 'System', reduced: 'Reduced', off: 'Off'},
  motionSpeed: {'0.75': '0.75×', '1': '1×', '1.25': '1.25×'},
  timeFormat: {system: 'System', '12h': '12 hour', '24h': '24 hour'},
  sendShortcut: {enter: 'Enter to send', 'mod-enter-multiline': 'Ctrl / ⌘ Enter; expandable input', 'mod-enter': 'Ctrl / ⌘ Enter to send'},
  projectOrder: {recent: 'Recent activity', created: 'Creation time', manual: 'Manual'},
  diffLayout: {stacked: 'Stacked', split: 'Side by side'},
  diffColors: {'red-green': 'Red and green', 'blue-orange': 'Blue and orange'},
  threadNotifications: {off: 'Off', notifications: 'Popups', sound: 'Sound', both: 'Popups and sound'},
  notificationPreview: {title: 'Title only', full: 'Message preview', none: 'No preview'},
  backgroundStyle: {solid: 'Solid', gradient: 'Gradient'},
  appearanceAccent: {blue: 'Blue', violet: 'Violet', cyan: 'Cyan', orange: 'Orange', rose: 'Rose', green: 'Green'},
};
const TITLE_CASE: Record<string, string> = {on: 'On', off: 'Off', both: 'Both', system: 'System'};

export function settingLabel(key: string): string {
  return LABELS[key] ?? key.split('.').pop()!.replaceAll(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, first => first.toUpperCase());
}

export function isColorValue(key: string, value: unknown): value is string {
  return (key === 'customAccent' || key === 'projectColor') && typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
}

export function formatSettingValue(key: string, value: unknown): string {
  if (key === 'customAccent' && value === null) return 'Default';
  if (typeof value === 'boolean') return value ? 'On' : 'Off';
  if (typeof value === 'number') {
    if (['uiFontSize', 'chatFontSize', 'codeFontSize', 'motionDuration'].includes(key)) return `${value} ${key === 'motionDuration' ? 'ms' : 'px'}`;
    if (['notificationVolume', 'backgroundOpacity'].includes(key)) return `${Math.round(value * 100)}%`;
    return String(value);
  }
  if (typeof value === 'string') return OPTION_LABELS[key]?.[value] ?? TITLE_CASE[value] ?? value;
  if (value && typeof value === 'object' && 'enabled' in value && 'start' in value) {
    const hours = value as UiPreferences['notificationQuietHours'];
    return `${hours.start}–${hours.end}, ${hours.enabled ? 'on' : 'off'}`;
  }
  return String(value);
}
