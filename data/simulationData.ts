
import { HeartPulse, Activity, Zap, Droplets, Wind, ShieldAlert, Filter, AlertTriangle, Skull, Thermometer, Syringe, Brain, Baby, Users, FileText } from 'lucide-react';

export type Rhythm = 'NSR' | 'VFIB' | 'ASYSTOLE' | 'PEA' | 'VT' | 'TORSADES' | 'BRADYCARDIA';

export const OFFICIAL_PDF_PATHS = [
    { title: "ACLS Algorithm", path: "gs://pnle-review-companion.firebasestorage.app/SLE/Algorithm ACLS Cardiac Arrest.pdf" },
    { title: "ACLS Scenario 2025", path: "gs://pnle-review-companion.firebasestorage.app/SLE/SLE ACLS Scenario - 2025a.pdf" },
    { title: "Clinical Cases 2025", path: "gs://pnle-review-companion.firebasestorage.app/SLE/SLE Case Scenarios - 2025.pdf" },
    { title: "SLE Rubrics 2025", path: "gs://pnle-review-companion.firebasestorage.app/SLE/SLE Rubrics 2025 (Updated).pdf" }
];

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
    category: string;
}

export interface OfficialChart {
    initials: string;
    ageSex: string;
    chiefComplaint: string;
    history: string;
    vitals: {
        bp: string;
        hr: string;
        rr: string;
        temp: string;
        spo2: string;
    };
    diagnosis: string;
    statOrders: string[];
    labs?: string[]; // Specific lab values from PDF
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

export const TUTORIAL_STEPS = [
    'pulse_check', 'cpr_btn', 'airway_btn', 'attach_pads_btn', 'analyze_btn', 
    'charge', 'shock_btn', 'cpr_btn', 'iv_btn', 'cycle_btn', 
    'charge', 'shock_btn', 'cpr_btn', 'epi_btn', 'airway_btn', 
    'cycle_btn', 'charge', 'shock_btn', 'cpr_btn', 'amio_btn', 'cycle_btn'
];

// --- CORE ACLS MISSIONS (Based on 2025 PDF) ---
export const SCENARIOS: ScenarioData[] = [
    { 
        id: 1, 
        title: "Official SLE Scenario",
        patient: "66M, Post-Stress Test", 
        history: "Felt 'woozy' 6 mins into treadmill test. BP 186/112, HR 174 before collapse. Alarm sounded in room.", 
        startRhythm: 'VFIB',
        clue: "SHOCKABLE. Witnessed Arrest. High Quality CPR & Defibrillation Priority.",
        correctCauses: ['thrombosis_c'], // Coronary Thrombosis likely due to stress test
        requiredMeds: ['epi', 'amio'], 
        algorithm: 'shockable',
        successCondition: 'ROSC after 3 shocks + antiarrhythmic',
        minCycles: 4, 
        initialPulse: false,
        focus: "Official 2025 Scenario"
    },
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

// --- CLINICAL ROULETTE CASES (2025 PDF MAPPED) ---
export const SIM_CASES: ClinicalCase[] = [
    { id: 'mi', title: 'Acute MI', short: 'Acute MI (S.H.)', icon: HeartPulse, color: 'red', description: 'Chest pain 10/10, radiating to left arm. Troponin 14 ng/L.', category: 'Cardiovascular' },
    { id: 'chf', title: 'Congestive Heart Failure', short: 'CHF Exacerbation (T.J.)', icon: Activity, color: 'blue', description: 'Orthopnea, +3 Edema, weight gain. EF 28%. Non-compliant.', category: 'Cardiovascular' },
    { id: 'hypo', title: 'Hypoglycemia', short: 'Severe Hypoglycemia (E.J.)', icon: Zap, color: 'amber', description: 'T1DM, Basketball player. LOC. CBG 48. Needs D50.', category: 'Endocrine' },
    { id: 'dka', title: 'Diabetic Ketoacidosis', short: 'DKA (B.D.)', icon: Droplets, color: 'purple', description: 'Confusion, fruity breath, Kussmaul. CBG 530. pH 7.25.', category: 'Endocrine' },
    { id: 'asthma', title: 'Asthma Attack', short: 'Status Asthmaticus (M.H.)', icon: Wind, color: 'cyan', description: 'Wheezing, forgot inhaler. RR 30, O2 88%. Needs Bronchodilators.', category: 'Respiratory' },
    { id: 'copd', title: 'COPD Exacerbation', short: 'COPD (A.L.)', icon: Wind, color: 'orange', description: 'Smoker. Respiratory distress. Target SpO2 88-92%.', category: 'Respiratory' },
    { id: 'ckd', title: 'Chronic Kidney Disease', short: 'CKD (E.D.)', icon: Filter, color: 'yellow', description: 'Edema, K+ 6.0, peaked T waves. Needs Lasix/Kayexalate.', category: 'Renal' },
    { id: 'sepsis', title: 'Sepsis/Septic Shock', short: 'Septic Shock (J.S.)', icon: ShieldAlert, color: 'emerald', description: 'MVA wound infection. BP 88/62. Lactate, Antibiotics, Pressors.', category: 'Infectious' },
];

// --- OFFICIAL CHART DATA (From PDF) ---
export const OFFICIAL_CHARTS: Record<string, OfficialChart> = {
    'mi': {
        initials: "S.H.", ageSex: "65F", chiefComplaint: "Mid sternal chest pain (10/10)",
        history: "Direct admission CCU. Pain radiates to left arm. Smoking 1pk/day x10yrs. HTN x8yrs. High Cholesterol.",
        vitals: { bp: "160/96", hr: "104", rr: "20", temp: "37", spo2: "96" },
        diagnosis: "Acute Myocardial Infarction",
        labs: ["Troponin: 14 ng/L", "Cholesterol: Elevated"],
        statOrders: ["Oxygen (Nasal Prongs)", "Nitroglycerin 0.4mg SL", "Morphine IVP", "Aspirin 160-325mg (Chewable)", "12-Lead ECG"]
    },
    'chf': {
        initials: "T.J.", ageSex: "52M", chiefComplaint: "Orthopnea, Dyspnea, Palpitations",
        history: "Filipino. +3 Bipedal edema x7 days. Hx Mitral Valve Regurg x12yrs, Chronic A-Fib. Non-compliant with low salt diet/meds. 5kg weight gain.",
        vitals: { bp: "168/90", hr: "116 (Irr)", rr: "24", temp: "37", spo2: "87" },
        diagnosis: "CHF Exacerbation",
        labs: ["EF: 28%", "CXR: LV Hypertrophy/Hazy bases"],
        statOrders: ["IV Lasix STAT", "Dobutamine Drip", "Foley Catheter (Strict I&O)", "Elevate Head of Bed"]
    },
    'hypo': {
        initials: "E.J.", ageSex: "22M", chiefComplaint: "Loss of Consciousness",
        history: "T1DM x5yrs. Played basketball, missed meals. NPH Insulin 28u taken at 7AM. Found unconscious.",
        vitals: { bp: "110/70", hr: "105", rr: "18", temp: "36.5", spo2: "98" },
        diagnosis: "Severe Hypoglycemia",
        labs: ["CBG: 48 mg/dL"],
        statOrders: ["D50W IV Push", "Recheck CBG q15mins", "Neuro Assessment", "Carbohydrate Snack upon waking"]
    },
    'dka': {
        initials: "B.D.", ageSex: "58F", chiefComplaint: "Confusion, Blurry Vision",
        history: "Muslim female. Polyuria, severe headache x3 days. Kussmaul breathing, fruity breath. Missed follow-ups.",
        vitals: { bp: "88/58", hr: "110", rr: "32", temp: "37", spo2: "88" },
        diagnosis: "Diabetic Ketoacidosis",
        labs: ["CBG: 530", "pH: 7.25", "HCO3: 12", "K+: 5.8", "Na: 129"],
        statOrders: ["Regular Insulin Drip (0.1 u/kg/hr)", "IV Fluids (NSS)", "Foley Catheter", "Hourly CBG Monitoring"]
    },
    'asthma': {
        initials: "M.H.", ageSex: "19F", chiefComplaint: "Shortness of Breath, Wheezing",
        history: "Playing volleyball, forgot inhaler. Anxious, diaphoretic, accessory muscle use. Hx Asthma since age 12. Allergy: Sulfa/NSAIDS.",
        vitals: { bp: "130/85", hr: "120", rr: "30", temp: "37", spo2: "88" },
        diagnosis: "Acute Asthma Attack",
        labs: ["ABG: Respiratory Alkalosis (Early)", "O2 Sat: 88%"],
        statOrders: ["Oxygen @ 2L/min", "Albuterol Nebulizer q20mins", "IV Methylprednisolone", "Atrovent Nebulizer"]
    },
    'copd': {
        initials: "A.L.", ageSex: "72M", chiefComplaint: "Respiratory Distress",
        history: "Chinese. Smoker x30yrs. Restless, frequent urination at night. Coughing changes.",
        vitals: { bp: "140/84", hr: "98", rr: "26", temp: "38", spo2: "88" },
        diagnosis: "COPD Exacerbation",
        labs: ["SpO2: 88%", "Temp: 38C (Possible Infection)"],
        statOrders: ["Oxygen (Target 88-92%)", "Albuterol Nebulizer", "Prednisone 60mg PO", "Sputum Culture"]
    },
    'ckd': {
        initials: "E.D.", ageSex: "49F", chiefComplaint: "Dyspnea, Orthopnea, Edema",
        history: "DM x8yrs, HTN x5yrs. Consulted 'albularyo'. Decreased urine output x3 days. Nausea. Walking difficulty.",
        vitals: { bp: "180/90", hr: "98", rr: "30", temp: "37", spo2: "88" },
        diagnosis: "Chronic Kidney Disease",
        labs: ["K+: 6.0 (High)", "Cr: 5.6", "BUN: 68", "Hgb: 8"],
        statOrders: ["Lasix 40mg IVP", "Kayexalate Enema", "Limit Fluids (1L/day)", "Prepare for Dialysis"]
    },
    'sepsis': {
        initials: "J.S.", ageSex: "38M", chiefComplaint: "Fever, Palpitations, Lightheaded",
        history: "MVA wound 48hrs ago (infected). T1DM. Purulent drainage. Hypotensive.",
        vitals: { bp: "88/62", hr: "124", rr: "28", temp: "38.5", spo2: "94" },
        diagnosis: "Sepsis / Septic Shock",
        labs: ["Lactate: >2", "WBC: Elevated", "Blood Glucose: 288"],
        statOrders: ["Blood Cultures x2", "IV Antibiotics (Broad Spectrum)", "IV Fluid Bolus (30ml/kg)", "Norepinephrine (if refractory)"]
    }
};

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
