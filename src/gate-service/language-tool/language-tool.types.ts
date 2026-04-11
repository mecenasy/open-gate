export interface LanguageToolSoftware {
  name: string;
  version: string;
  buildDate: string;
  apiVersion: number;
  premium: boolean;
  premiumHint: string;
  status: string;
}

export interface LanguageToolWarnings {
  incompleteResults: boolean;
}

export interface LanguageToolDetectedLanguage {
  name: string;
  code: string;
  confidence: number;
  source: string;
}

export interface LanguageToolLanguage {
  name: string;
  code: string;
  detectedLanguage: LanguageToolDetectedLanguage;
}

export interface LanguageToolReplacement {
  value: string;
}

export interface LanguageToolContext {
  text: string;
  offset: number;
  length: number;
}

export interface LanguageToolMatchType {
  typeName: string;
}

export interface LanguageToolRuleCategory {
  id: string;
  name: string;
}

export interface LanguageToolRule {
  id: string;
  description: string;
  issueType: string;
  category: LanguageToolRuleCategory;
  isPremium: boolean;
}

export interface LanguageToolMatch {
  message: string;
  shortMessage: string;
  replacements: LanguageToolReplacement[];
  offset: number;
  length: number;
  context: LanguageToolContext;
  sentence: string;
  type: LanguageToolMatchType;
  rule: LanguageToolRule;
  ignoreForIncompleteSentence: boolean;
  contextForSureMatch: number;
}

export interface LanguageToolDetectedLanguageRate {
  language: string;
  rate: number;
}

export interface LanguageToolExtendedSentenceRange {
  from: number;
  to: number;
  detectedLanguages: LanguageToolDetectedLanguageRate[];
}

export interface LanguageToolResponse {
  software: LanguageToolSoftware;
  warnings: LanguageToolWarnings;
  language: LanguageToolLanguage;
  matches: LanguageToolMatch[];
  sentenceRanges: [number, number][];
  extendedSentenceRanges: LanguageToolExtendedSentenceRange[];
}
