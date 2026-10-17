/**
 * Recent Express Entry rounds of invitations benchmarks.
 * Source: IRCC Official Express Entry Rounds of Invitations
 * https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html
 */

export interface EeDraw {
  roundNumber: number;
  date: string;
  stream: string;
  invitations: number;
  crsCutoff: number;
}

export const EE_DRAWS: EeDraw[] = [
  { roundNumber: 318, date: '2024-10-22', stream: 'Canadian Experience Class (CEC)', invitations: 400, crsCutoff: 539 },
  { roundNumber: 317, date: '2024-10-21', stream: 'Trade occupations', invitations: 1800, crsCutoff: 433 },
  { roundNumber: 316, date: '2024-10-10', stream: 'French language proficiency', invitations: 1000, crsCutoff: 444 },
  { roundNumber: 315, date: '2024-10-09', stream: 'Canadian Experience Class (CEC)', invitations: 500, crsCutoff: 539 },
  { roundNumber: 314, date: '2024-09-19', stream: 'Canadian Experience Class (CEC)', invitations: 4000, crsCutoff: 509 },
  { roundNumber: 313, date: '2024-09-13', stream: 'French language proficiency', invitations: 1000, crsCutoff: 446 },
  { roundNumber: 312, date: '2024-09-12', stream: 'Healthcare occupations', invitations: 1250, crsCutoff: 445 },
  { roundNumber: 311, date: '2024-08-27', stream: 'Canadian Experience Class (CEC)', invitations: 3300, crsCutoff: 507 },
  { roundNumber: 310, date: '2024-08-15', stream: 'French language proficiency', invitations: 2000, crsCutoff: 394 },
  { roundNumber: 309, date: '2024-08-14', stream: 'General (All programs / FSW)', invitations: 3200, crsCutoff: 524 },
  { roundNumber: 308, date: '2024-07-31', stream: 'Canadian Experience Class (CEC)', invitations: 5000, crsCutoff: 510 },
  { roundNumber: 307, date: '2024-07-08', stream: 'French language proficiency', invitations: 3200, crsCutoff: 420 },
  { roundNumber: 306, date: '2024-07-05', stream: 'Healthcare occupations', invitations: 3750, crsCutoff: 445 },
  { roundNumber: 305, date: '2024-07-04', stream: 'Trade occupations', invitations: 1800, crsCutoff: 436 },
];

export const EE_LAST_CHECKED = '2026-10-15';
