export interface CrewMember {
  id: string;
  codeNumber: string;
  role: string;
  codename: string;
  quote: string;
  specialty: string;
  status: 'ACTIVE' | 'STANDBY' | 'INFILTRATED';
  clearanceLevel: string;
  stats: {
    stealth: number;
    tactics: number;
    intellect: number;
    speed: number;
  };
  description: string;
  audioFreq: string;
  portraitUrl?: string;
}

export interface BlueprintNode {
  id: string;
  label: string;
  code: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  phase: number;
  description: string;
  securityRisk: 'LOW' | 'MEDIUM' | 'CRITICAL' | 'OMEGA';
  details: string[];
}

export interface HeistPhase {
  step: string;
  title: string;
  subtitle: string;
  objective: string;
  timerOffset: string;
  contingency: string;
}

export type VaultState =
  | 'APPROACHING_VAULT'
  | 'AWAITING_PASSWORD'
  | 'ACCESS_DENIED'
  | 'UNLOCKING'
  | 'OPENING'
  | 'GOLD_REVEAL'
  | 'TREASURY'
  | 'COMPLETE';

export const DEFAULT_VAULT_CODE = '2807';
export const VALID_VAULT_CODES = ['2807', 'BERLIN', 'BELLA', 'HEIST'];
