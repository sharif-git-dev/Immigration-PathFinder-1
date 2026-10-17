import type { Profile } from '../engine/types';

export type SectionId =
  | 'about'
  | 'goals'
  | 'family'
  | 'education'
  | 'work'
  | 'language'
  | 'money'
  | 'background'
  | 'protection'
  | 'special';

export interface Option {
  value: string | number;
  label: string;
  /** Small grey hint under the label. */
  hint?: string;
}

export type QuestionType =
  | 'single' // one choice (chips)
  | 'multi' // several choices (chips)
  | 'number' // small numeric input
  | 'country' // one country (searchable)
  | 'countries' // several countries (searchable)
  | 'province' // one Canadian province
  | 'provinces'; // several Canadian provinces

export interface Question {
  /**
   * Where the answer is stored:
   *  - a Profile key, e.g. "age", "goals"
   *  - "extra.<name>" for program-specific questions, e.g. "extra.hkGraduate"
   */
  id: string;
  section: SectionId;
  title: string;
  help?: string;
  type: QuestionType;
  options?: Option[];
  /** For 'multi': values that clear all other selections (e.g. "none"). */
  exclusive?: (string | number)[];
  min?: number;
  max?: number;
  /** Only show when this returns true (based on answers so far). */
  showIf?: (p: Profile) => boolean;
}
