import type { Program } from '../../engine/types';
import { visitPrograms } from './visit';
import { studyPrograms } from './study';
import { workPrograms } from './work';
import { expressEntryPrograms } from './expressEntry';
import { economicPrograms } from './economic';
import { provincialPrograms } from './provincial';
import { familyPrograms } from './family';
import { refugeePrograms } from './refugee';
import { humanitarianPrograms } from './humanitarian';
import { citizenshipPrograms } from './citizenship';
import { germanyPrograms } from './germany';
import { usaPrograms } from './usa';

export const canadaPrograms: Program[] = [
  ...citizenshipPrograms,
  ...expressEntryPrograms,
  ...provincialPrograms,
  ...economicPrograms,
  ...familyPrograms,
  ...refugeePrograms,
  ...humanitarianPrograms,
  ...workPrograms,
  ...studyPrograms,
  ...visitPrograms,
].map((p) => ({ ...p, country: p.country ?? 'CA' }));

export const ALL_PROGRAMS: Program[] = [
  ...canadaPrograms,
  ...germanyPrograms,
  ...usaPrograms,
];

export { germanyPrograms, usaPrograms };

