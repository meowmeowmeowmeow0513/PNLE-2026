
import { HeartPulse, Activity, Zap, Droplets, Wind, ShieldAlert, Filter, AlertTriangle, Skull, Thermometer, Syringe, Brain } from 'lucide-react';

export type Rhythm = 'NSR' | 'VFIB' | 'ASYSTOLE' | 'PEA' | 'VT' | 'TORSADES' | 'BRADYCARDIA';

export interface ScenarioData {
    id: number;
    title: string;
    patient: string;
    history: string;
    startRhythm: Rhythm;
    clue: string;
    requiredMeds?: string[];
    correctCauses?: string[];
    isTutorial?: boolean;
    algorithm: 'shockable' | 'nonshockable';
    successCondition: string;
    minCycles: number;
    initialPulse: boolean;
    focus: string; // Replacement for difficulty
}

export interface ClinicalCase {
    id: string;
    title: string;
    short: string;
    icon: any;
    color: string;
    description: string;
    category: string; // Replacement for difficulty
}

export const H_AND_TS = [
    { id: 'hypovolemia', label: 'Hypovolemia', hint: 'Check fluid status/blood loss' },
    { id: 'hypoxia', label: 'Hypoxia', hint: 'Check airway/O2 sat' },
    { id: 'hion', label: 'Hydrogen Ion (Acidosis)', hint: 'Check ABGs/Diabetes' },
    { id: 'hyperkalemia', label: 'Hyper/Hypokalemia', hint: 'Check electrolytes/Renal' },
    { id: 'hypothermia', label: 'Hypothermia', hint: 'Check temperature' },
    { id: 'tension', label: 'Tension Pneumothorax', hint: 'Check lung sounds/trachea' },
    { id: 'tamponade', label: 'Tamponade (Cardiac)', hint: 'Check heart sounds/JVD' },
    { id: 'toxins', label: 'Toxins', hint: 'Check history/pill bottles' },
    { id: 'thrombosis_p', label: 'Thrombosis (Pulmonary)', hint: 'Check for PE signs' },
    { id: 'thrombosis_c', label: 'Thrombosis (Coronary)', hint: 'Check for MI signs' },
    { id: 'hypoglycemia', label: 'Hypoglycemia', hint: 'Check glucose levels' },
];

export const TUTORIAL_SCENARIO: ScenarioData = {
    id: 999,
    title: "Basic Training",
    patient: "Training Manikin",
    history: "Standard VFib Cardiac Arrest. Follow the guided steps to learn the Shock -> CPR -> Drug sequence.",
    startRhythm: 'VFIB',
    clue: "Training Mode Active. Click the highlighted buttons.",
    correctCauses: [],
    isTutorial: true,
    algorithm: 'shockable',
    successCondition: 'Complete Sequence',
    minCycles: 3, 
    initialPulse: false,
    focus: "Algorithm Sequence"
};

// Defined Step IDs for Tutorial Mode (Strict AHA Sequence)
export const TUTORIAL_STEPS = [
    'pulse_check',     // 0: Check Pulse
    'cpr_btn',         // 1: Start CPR
    'airway_btn',      // 2: Give Oxygen / BVM
    'attach_pads_btn', // 3: Attach Monitor/Defib
    'analyze_btn',     // 4: Analyze Rhythm (Manual Check - Initial)
    'charge',          // 5: Charge Defib
    'shock_btn',       // 6: Deliver Shock
    'cpr_btn',         // 7: Resume CPR Immediately
    'iv_btn',          // 8: Establish IV/IO Access (During CPR)
    'cycle_btn',       // 9: Complete 2 min cycle -> Triggers Analysis
    'charge',          // 10: Charge (Persistent VF) - Note: Updated logic prompts this
    'shock_btn',       // 11: Shock
    'cpr_btn',         // 12: Resume CPR
    'epi_btn',         // 13: Give Epi (Cycle 2 starts)
    'airway_btn',      // 14: Consider Advanced Airway
    'cycle_btn',       // 15: Complete Cycle -> Triggers Analysis
    'charge',          // 16: Charge
    'shock_btn',       // 17: Shock
    'cpr_btn',         // 18: Resume CPR
    'amio_btn',        // 19: Give Amio (Refractory VF - After 3rd Shock)
    'cycle_btn'        // 20: Complete Cycle
];

// --- CORE ACLS MISSIONS (Based on 2025 Guidelines) ---
export const SCENARIOS: ScenarioData[] = [
    // SHOCKABLE PATH
    { 
        id: 1, 
        title: "Refractory VFib",
        patient: "55M, Post-MI", 
        history: "Collapsed in waiting room. No pulse. Monitor shows chaotic VFib. Refractory to initial defib.", 
        startRhythm: 'VFIB',
        clue: "SHOCKABLE. Needs Amiodarone/Lidocaine if shocks fail.",
        correctCauses: ['thrombosis_c'],
        requiredMeds: ['epi', 'amio'], // Logic will also accept Lidocaine
        algorithm: 'shockable',
        successCondition: 'ROSC after 3 shocks + antiarrhythmic',
        minCycles: 4, 
        initialPulse: false,
        focus: "Antiarrhythmic Timing"
    },
    { 
        id: 2, 
        title: "Pulseless VT",
        patient: "42F, Renal Failure", 
        history: "Found unresponsive during dialysis. Monitor shows Wide Complex Tachycardia.", 
        startRhythm: 'VT',
        clue: "SHOCKABLE. Monomorphic Wide Complex. Suspect Hyperkalemia.",
        correctCauses: ['hyperkalemia'],
        requiredMeds: ['epi', 'amio'],
        algorithm: 'shockable',
        successCondition: 'ROSC after shock + meds',
        minCycles: 3,
        initialPulse: false,
        focus: "Rhythm Recognition"
    },

    // NON-SHOCKABLE PATH
    { 
        id: 3, 
        title: "Asystole (Flatline)",
        patient: "78M, Full Code", 
        history: "Unresponsive. Monitor shows flatline in 2 leads. No electrical activity.", 
        startRhythm: 'ASYSTOLE',
        clue: "NON-SHOCKABLE. Do not shock. Epi ASAP.",
        correctCauses: ['hypoxia', 'hypovolemia'],
        requiredMeds: ['epi'],
        algorithm: 'nonshockable',
        successCondition: 'ROSC after Epi loading',
        minCycles: 3,
        initialPulse: false,
        focus: "Epinephrine Urgency"
    },
    { 
        id: 4, 
        title: "PEA Arrest",
        patient: "25M, Trauma", 
        history: "Car accident. Monitor shows Sinus Rhythm, but patient has NO PULSE.", 
        startRhythm: 'PEA',
        clue: "NON-SHOCKABLE. Electrical activity present, mechanical failure. Check H's & T's.",
        correctCauses: ['hypovolemia', 'tension'],
        requiredMeds: ['epi'],
        algorithm: 'nonshockable',
        successCondition: 'ROSC after finding cause',
        minCycles: 3,
        initialPulse: false,
        focus: "Dissociation (Pulse vs Rhythm)"
    }
];

// --- CLINICAL ROULETTE CASES ---
export const SIM_CASES: ClinicalCase[] = [
    { 
        id: 'dka', 
        title: 'Diabetic Ketoacidosis', 
        short: 'DKA Protocol', 
        icon: Droplets, 
        color: 'purple',
        description: 'Manage hyperglycemic crisis, fluid resuscitation, and insulin drip titration.',
        category: 'Endocrine Emergency'
    },
    { 
        id: 'ckd', 
        title: 'Chronic Kidney Disease', 
        short: 'CKD Exacerbation', 
        icon: Filter, 
        color: 'yellow',
        description: 'Fluid overload management, emergent dialysis prep, and electrolyte balancing.',
        category: 'Renal / Electrolytes'
    },
    { 
        id: 'copd', 
        title: 'COPD Exacerbation', 
        short: 'Resp. Failure', 
        icon: Wind, 
        color: 'blue',
        description: 'Oxygenation strategies, steroid administration, and ABG interpretation.',
        category: 'Respiratory'
    },
    { 
        id: 'sepsis', 
        title: 'Septic Shock', 
        short: 'Sepsis Bundle', 
        icon: ShieldAlert, 
        color: 'emerald',
        description: 'Hour-1 Bundle execution: Lactate, Cultures, Broad-spectrum Antibiotics, Vasopressors.',
        category: 'Infectious / Shock'
    },
    { 
        id: 'asthma', 
        title: 'Status Asthmaticus', 
        short: 'Acute Asthma', 
        icon: Wind, 
        color: 'cyan',
        description: 'Aggressive bronchodilation, magnesium sulfate IV, and airway management.',
        category: 'Respiratory'
    },
    { 
        id: 'hypo', 
        title: 'Hypoglycemia', 
        short: 'Hypoglycemia', 
        icon: Zap, 
        color: 'amber',
        description: 'Rapid dextrose administration, seizure precautions, and root cause analysis.',
        category: 'Endocrine'
    },
    { 
        id: 'mi', 
        title: 'Acute Myocardial Infarction', 
        short: 'STEMI', 
        icon: HeartPulse, 
        color: 'red',
        description: 'MONA protocol, ECG interpretation, and Cath Lab coordination.',
        category: 'Cardiovascular'
    }
];