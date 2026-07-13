import * as vscode from 'vscode';

interface TemporarySetting {
  section: string;
  key: string;
  suppressValue: any;
  originalValue?: any;
}

export class AISuggestionSuppressor {
  private settings: TemporarySetting[] = [
    { section: 'github.copilot', key: 'enable', suppressValue: { '*': false } },
    { section: 'tabnine', key: 'experimental.inline', suppressValue: false },
    { section: 'codeium', key: 'enable', suppressValue: { '*': false } },
    { section: 'continue', key: 'enable', suppressValue: false },
    { section: 'supermaven', key: 'enable', suppressValue: false },

    { section: 'editor', key: 'autoClosingBrackets', suppressValue: 'never' },
    { section: 'editor', key: 'autoClosingQuotes', suppressValue: 'never' },
    { section: 'editor', key: 'autoClosingDelete', suppressValue: 'never' },
    { section: 'editor', key: 'autoClosingOvertype', suppressValue: 'never' },
    { section: 'editor', key: 'autoSurround', suppressValue: 'never' },
    { section: 'editor', key: 'acceptSuggestionOnEnter', suppressValue: 'off' },
    { section: 'editor', key: 'acceptSuggestionOnCommitCharacter', suppressValue: false },
    { section: 'editor', key: 'quickSuggestions', suppressValue: { other: 'off', comments: 'off', strings: 'off' } },
    { section: 'editor', key: 'suggestOnTriggerCharacters', suppressValue: false },
    { section: 'editor', key: 'wordBasedSuggestions', suppressValue: 'off' },
    { section: 'editor', key: 'inlayHints.enabled', suppressValue: 'off' },
    { section: 'editor', key: 'parameterHints.enabled', suppressValue: false },
    { section: 'editor', key: 'hover.enabled', suppressValue: false },
    { section: 'editor', key: 'cursorSmoothCaretAnimation', suppressValue: 'off' },
    { section: 'editor', key: 'smoothScrolling', suppressValue: false },
    { section: 'javascript', key: 'validate.enable', suppressValue: false },
    { section: 'typescript', key: 'validate.enable', suppressValue: false }
  ];

  async suppress(): Promise<void> {
    for (const setting of this.settings) {
      const config = vscode.workspace.getConfiguration(setting.section);
      const inspect = config.inspect(setting.key);
      
      setting.originalValue = inspect?.globalValue !== undefined ? inspect.globalValue : inspect?.workspaceValue;
      
      try {
        await config.update(setting.key, setting.suppressValue, vscode.ConfigurationTarget.Global);
      } catch (err) {
      }
    }
  }

  async restore(): Promise<void> {
    for (const setting of this.settings) {
      const config = vscode.workspace.getConfiguration(setting.section);
      try {
        const valueToSet = setting.originalValue === undefined ? undefined : setting.originalValue;
        await config.update(setting.key, valueToSet, vscode.ConfigurationTarget.Global);
      } catch (err) {
      }
    }
  }
}
