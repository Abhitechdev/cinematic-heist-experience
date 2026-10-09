import type { BlueprintNode, HeistPhase } from '../types/heist';

export const BLUEPRINT_NODES: BlueprintNode[] = [
  {
    id: 'entry',
    label: 'PERIMETER ENTRY',
    code: 'SEC-01',
    x: 18,
    y: 75,
    phase: 1,
    description: 'Subterranean sewage conduit directly underneath the eastern loading dock.',
    securityRisk: 'MEDIUM',
    details: [
      'Dual pressure motion sensors bypassed via frequency emitter',
      'Hydraulic hatch silent-cut entry time: 02m 40s',
      'Zero acoustic resonance with street level'
    ]
  },
  {
    id: 'security',
    label: 'SECURITY HUB',
    code: 'SEC-02',
    x: 35,
    y: 35,
    phase: 2,
    description: 'Central surveillance station and panic button multiplexer.',
    securityRisk: 'CRITICAL',
    details: [
      '14 CCTV cameras feeding closed-loop video switcher',
      'Biometric fingerprint override module deployed',
      'Guards neutralized without weapon discharge'
    ]
  },
  {
    id: 'control',
    label: 'COMMUNICATION CONTROL',
    code: 'SEC-03',
    x: 58,
    y: 60,
    phase: 3,
    description: 'Telecom trunk line and microwave relay tower switch.',
    securityRisk: 'HIGH' as any,
    details: [
      'Cellular scrambler activated in a 500m radius',
      'Direct hardline established with federal negotiation team',
      'False distress frequency broadcast to western district'
    ]
  },
  {
    id: 'vault',
    label: 'INNER SUB-VAULT',
    code: 'SEC-04',
    x: 75,
    y: 30,
    phase: 4,
    description: 'Reinforced 40-ton steel alloy door with hydrostatic pressure lock.',
    securityRisk: 'OMEGA',
    details: [
      'Thermal lance drill required: 18 minutes sustained burn',
      'Electronic combination dial with 6-stage electromagnetic pins',
      'Estimated payload: 2.4 Billion unindexed bearer bonds'
    ]
  },
  {
    id: 'exit',
    label: 'SUBTERRANEAN EXTRACTION',
    code: 'SEC-05',
    x: 90,
    y: 78,
    phase: 5,
    description: 'Abandoned subway maintenance shaft leading to storm sewer basin.',
    securityRisk: 'CRITICAL',
    details: [
      'Extraction van positioned at storm drain gate 07',
      'Inflatable diversion decoys deployed in decoy vehicle',
      'Zero trace left at scene of operation'
    ]
  }
];

export const HEIST_STEPS: HeistPhase[] = [
  {
    step: 'PHASE 01',
    title: 'INFILTRATE',
    subtitle: 'SHADOW THE GRID',
    objective: 'Breach the subterranean perimeter at 03:00 hours. Neutralize sensor nodes without triggering alarms.',
    timerOffset: 'T-MINUS 00:59:59',
    contingency: 'If detected, deploy smoke aerosols and reroute through maintenance shaft B.'
  },
  {
    step: 'PHASE 02',
    title: 'CONTROL',
    subtitle: 'DOMINATE THE PERIMETER',
    objective: 'Secure central security dispatch. Establish dummy camera loop and lock down perimeter access doors.',
    timerOffset: 'T-MINUS 00:44:12',
    contingency: 'Enforce standard red jumpsuit dress protocol on all occupants to nullify tactical sniper targeting.'
  },
  {
    step: 'PHASE 03',
    title: 'EXECUTE',
    subtitle: 'PENETRATE THE VAULT',
    objective: 'Spin the primary mechanical tumblers, calibrate thermal lances, and crack the inner titanium lock core.',
    timerOffset: 'T-MINUS 00:23:45',
    contingency: 'Maintain public audio feed negotiation to hold tactical breach teams at standoff distance.'
  },
  {
    step: 'PHASE 04',
    title: 'ESCAPE',
    subtitle: 'DISSOLVE INTO NOTHING',
    objective: 'Pack unindexed assets into sealed tactical canisters. Evacuate via the subterranean stormwater tunnel.',
    timerOffset: 'T-MINUS 00:00:00',
    contingency: 'Detonate diversion flash charges at northern exit while extraction team departs south.'
  }
];

export const HEIST_RULES = [
  {
    number: '01',
    title: 'NO PANIC.',
    statement: 'Panic is a choice. Precision is a discipline. When the sirens howl, your heart rate must drop, not spike.'
  },
  {
    number: '02',
    title: 'NO UNPLANNED MOVES.',
    statement: 'Every step has been simulated ten thousand times. Improvisation is the first symptom of failure.'
  },
  {
    number: '03',
    title: 'EVERY EXIT HAS A BACKUP.',
    statement: 'If the primary gate is sealed, the second is already hot. If the tunnel collapses, the river is five minutes away.'
  },
  {
    number: '04',
    title: 'TRUST THE PLAN.',
    statement: 'The mastermind does not guess. The clock does not negotiate. When all hell breaks loose, stick to the timeline.'
  }
];
