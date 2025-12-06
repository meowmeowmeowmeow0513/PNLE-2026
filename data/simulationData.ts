
import { HeartPulse, Activity, Zap, Droplets, Wind, ShieldAlert, Filter, AlertTriangle, Skull, Thermometer, Syringe, Brain, Baby, Users } from 'lucide-react';

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

export interface QuizQuestion {
    id: string;
    category: string; // NP1-5 or ACLS
    question: string;
    options: string[];
    correctAnswer: number; // Index
    explanation: string;
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
    title: "Skills Lab: Basic Training",
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
        title: "Code Blue: ER",
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
        title: "Code Blue: Dialysis Unit",
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
        title: "Code Blue: Ward 3",
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
        title: "Code Blue: Trauma Room",
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

// --- SLE QUIZZES (10 High-Yield Items) ---
export const SIDE_QUEST_QUIZZES: QuizQuestion[] = [
    {
        id: 'q1',
        category: 'ACLS - Pharmacology',
        question: "During a code, the team leader orders Adenosine 6mg IV push. What is the PRIORITY nursing action during administration?",
        options: ["Dilute with 10mL saline", "Administer via slow IV push", "Follow immediately with 20mL saline flush", "Check BP before administration"],
        correctAnswer: 2,
        explanation: "Adenosine has an extremely short half-life (<10s). It must be slammed (rapid push) and followed immediately by a flush to reach the heart."
    },
    {
        id: 'q2',
        category: 'ACLS - Rhythm',
        question: "You identify Ventricular Fibrillation (VFib) on the monitor. There is no pulse. You have just delivered the first shock. What is the IMMEDIATE next step?",
        options: ["Check for a pulse", "Check the rhythm", "Administer Epinephrine", "Resume high-quality CPR"],
        correctAnswer: 3,
        explanation: "After a shock, ALWAYS resume CPR immediately for 2 minutes. Do not check rhythm or pulse until the cycle ends to maximize perfusion."
    },
    {
        id: 'q3',
        category: 'Emergency - Electrolytes',
        question: "A dialysis patient arrives in cardiac arrest. The ECG shows a 'Sine Wave' pattern (wide QRS merging with T). What is the suspected cause and treatment?",
        options: ["Hypokalemia / Potassium", "Hyperkalemia / Calcium Gluconate", "Hypocalcemia / Magnesium", "Hypercalcemia / Fluids"],
        correctAnswer: 1,
        explanation: "Sine waves indicate severe Hyperkalemia. Calcium Gluconate is the priority to stabilize the cardiac membrane, followed by Insulin/Glucose."
    },
    {
        id: 'q4',
        category: 'Emergency - Trauma',
        question: "A trauma patient has distended neck veins, tracheal deviation to the left, and absent breath sounds on the right. What is the indicated intervention?",
        options: ["Intubation", "Needle Decompression", "Chest Tube Insertion", "Pericardiocentesis"],
        correctAnswer: 1,
        explanation: "Signs of Tension Pneumothorax. Immediate Needle Decompression (thoracostomy) is required to relieve pressure before a chest tube."
    },
    {
        id: 'q5',
        category: 'ACLS - Pharmacology',
        question: "What is the maximum single dose of Atropine allowed for symptomatic bradycardia?",
        options: ["0.5 mg", "1.0 mg", "3.0 mg", "0.04 mg/kg"],
        correctAnswer: 2,
        explanation: "Current guidelines state Atropine 1mg bolus, repeat every 3-5 mins, up to a maximum total dose of 3mg."
    },
    {
        id: 'q6',
        category: 'Critical Care - Neuro',
        question: "A post-ROSC patient is comatose. Targeted Temperature Management (TTM) is ordered. What is the target temperature range?",
        options: ["30°C - 32°C", "32°C - 36°C", "36°C - 37.5°C", "37°C - 39°C"],
        correctAnswer: 1,
        explanation: "TTM targets 32°C to 36°C for at least 24 hours to improve neurological outcomes (neuroprotection) after cardiac arrest."
    },
    {
        id: 'q7',
        category: 'Emergency - DKA',
        question: "A DKA patient is receiving Insulin IV. Their Potassium is 3.3 mEq/L. What is the nurse's priority?",
        options: ["Increase Insulin rate", "Hold Insulin and notify MD", "Continue Insulin and give K+", "Give Dextrose 50%"],
        correctAnswer: 1,
        explanation: "Insulin drives Potassium into cells, worsening hypokalemia. If K < 3.3, hold insulin and replace K+ to prevent fatal arrhythmias."
    },
    {
        id: 'q8',
        category: 'ACLS - Rhythm',
        question: "A patient is in Torsades de Pointes. They have a pulse but are unstable. Apart from cardioversion, what medication is first-line?",
        options: ["Amiodarone", "Lidocaine", "Magnesium Sulfate", "Adenosine"],
        correctAnswer: 2,
        explanation: "Magnesium Sulfate (1-2g IV) is the specific treatment for Torsades de Pointes (Polymorphic VT), usually caused by low Magnesium."
    },
    {
        id: 'q9',
        category: 'Emergency - Stroke',
        question: "A patient presents with signs of stroke starting 2 hours ago. CT scan is negative for bleed. What is the priority intervention?",
        options: ["Heparin Infusion", "Aspirin 325mg", "tPA (Alteplase)", "Mannitol"],
        correctAnswer: 2,
        explanation: "Ischemic stroke within the 3-4.5 hour window is eligible for tPA (thrombolytics) to dissolve the clot. This is the priority after ruling out bleed."
    },
    {
        id: 'q10',
        category: 'Emergency - Shock',
        question: "In Septic Shock, what is the 'Hour-1 Bundle' priority for hypotension refractory to fluids?",
        options: ["Dobutamine", "Norepinephrine", "Epinephrine", "Milrinone"],
        correctAnswer: 1,
        explanation: "Norepinephrine (Levophed) is the first-line vasopressor for Septic Shock to maintain MAP > 65mmHg."
    }
];
