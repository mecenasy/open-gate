export type PromptFormMode = 'add' | 'edit';

export type PromptSummary = {
  id: string;
  commandId?: string;
  commandName?: string;
  userType: string;
  descriptionI18n?: Record<string, string>;
  prompt: string;
};

export type CommandOption = {
  value: string;
  label: string;
};
