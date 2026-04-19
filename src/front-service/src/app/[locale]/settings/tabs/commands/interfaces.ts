export type CommandFormMode = 'add' | 'edit';

export type CommandConfigSummary = {
  id: string;
  commandName: string;
  active: boolean;
  userTypes: string[];
  actionsJson?: string | null;
  parametersOverrideJson?: string | null;
  descriptionI18nJson?: string | null;
};

export type CommandUpsertInput = {
  commandName: string;
  active: boolean;
  userTypes: string[];
  actionsJson?: string;
  parametersOverrideJson?: string;
  descriptionI18nJson?: string;
};
