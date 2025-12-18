export interface ReferenceValue {
  id: string;
  name: string;
  range: string;
  unit: string;
  category: 'Hematology' | 'Electrolytes' | 'Metabolic' | 'ABG' | 'Vital Signs' | 'Renal' | 'Coagulation';
  significance?: string;
  tags?: string[];
}

export const MEDICAL_REFERENCES: ReferenceValue[] = [
  // --- HEMATOLOGY ---
  { id: 'hgb-m', name: 'Hemoglobin (Male)', range: '14 - 18', unit: 'g/dL', category: 'Hematology', significance: 'Oxygen carrying capacity' },
  { id: 'hgb-f', name: 'Hemoglobin (Female)', range: '12 - 16', unit: 'g/dL', category: 'Hematology', significance: 'Oxygen carrying capacity' },
  { id: 'hct-m', name: 'Hematocrit (Male)', range: '42 - 52', unit: '%', category: 'Hematology' },
  { id: 'hct-f', name: 'Hematocrit (Female)', range: '37 - 47', unit: '%', category: 'Hematology' },
  { id: 'wbc', name: 'WBC Count', range: '5,000 - 10,000', unit: '/mm³', category: 'Hematology', tags: ['Infection'] },
  { id: 'plt', name: 'Platelets', range: '150,000 - 400,000', unit: '/mm³', category: 'Hematology', tags: ['Clotting'] },

  // --- ELECTROLYTES ---
  { id: 'na', name: 'Sodium (Na+)', range: '135 - 145', unit: 'mEq/L', category: 'Electrolytes', significance: 'Fluid balance, CNS function', tags: ['High Yield'] },
  { id: 'k', name: 'Potassium (K+)', range: '3.5 - 5.0', unit: 'mEq/L', category: 'Electrolytes', significance: 'Cardiac & Muscle function', tags: ['High Yield', 'Critical'] },
  { id: 'cl', name: 'Chloride (Cl-)', range: '98 - 106', unit: 'mEq/L', category: 'Electrolytes' },
  { id: 'ca', name: 'Calcium (Ca+)', range: '9.0 - 10.5', unit: 'mg/dL', category: 'Electrolytes', tags: ['Chvostek', 'Trousseau'] },
  { id: 'mg', name: 'Magnesium (Mg+)', range: '1.3 - 2.1', unit: 'mEq/L', category: 'Electrolytes', tags: ['DTRs', 'ACLS'] },
  { id: 'po4', name: 'Phosphorus', range: '3.0 - 4.5', unit: 'mg/dL', category: 'Electrolytes' },

  // --- METABOLIC / RENAL ---
  { id: 'glu-f', name: 'Glucose (Fasting)', range: '70 - 110', unit: 'mg/dL', category: 'Metabolic', tags: ['Diabetes'] },
  { id: 'hba1c', name: 'HbA1c', range: '< 7', unit: '%', category: 'Metabolic', significance: '3-month average glucose' },
  { id: 'bun', name: 'BUN', range: '10 - 20', unit: 'mg/dL', category: 'Renal', tags: ['Dehydration'] },
  { id: 'cr', name: 'Creatinine', range: '0.6 - 1.2', unit: 'mg/dL', category: 'Renal', significance: 'Best indicator of renal function', tags: ['Critical'] },

  // --- COAGULATION ---
  { id: 'pt', name: 'PT (Prothrombin Time)', range: '11 - 12.5', unit: 'sec', category: 'Coagulation', tags: ['Warfarin'] },
  { id: 'inr', name: 'INR (Normal)', range: '0.8 - 1.1', unit: 'ratio', category: 'Coagulation', tags: ['Warfarin'] },
  { id: 'apt_t', name: 'aPTT', range: '30 - 40', unit: 'sec', category: 'Coagulation', tags: ['Heparin'] },

  // --- ABGs ---
  { id: 'ph', name: 'pH', range: '7.35 - 7.45', unit: ' ', category: 'ABG', tags: ['High Yield', 'Critical'] },
  { id: 'paco2', name: 'PaCO2', range: '35 - 45', unit: 'mmHg', category: 'ABG', significance: 'Respiratory component' },
  { id: 'hco3', name: 'HCO3', range: '22 - 26', unit: 'mEq/L', category: 'ABG', significance: 'Metabolic component' },
  { id: 'pao2', name: 'PaO2', range: '80 - 100', unit: 'mmHg', category: 'ABG' },

  // --- VITAL SIGNS (ADULT) ---
  { id: 'bp-a', name: 'Blood Pressure (Adult)', range: '< 120 / 80', unit: 'mmHg', category: 'Vital Signs' },
  { id: 'hr-a', name: 'Heart Rate (Adult)', range: '60 - 100', unit: 'bpm', category: 'Vital Signs' },
  { id: 'rr-a', name: 'Resp Rate (Adult)', range: '12 - 20', unit: 'bpm', category: 'Vital Signs' },
  { id: 'temp-a', name: 'Temperature (Adult)', range: '36.5 - 37.5', unit: '°C', category: 'Vital Signs' },
];

export const VITAL_SIGNS_PEDIATRIC = [
  { age: 'Newborn', hr: '100-160', rr: '30-60', sbp: '60-90' },
  { age: 'Infant (1-12m)', hr: '100-120', rr: '25-30', sbp: '80-100' },
  { age: 'Toddler (1-3y)', hr: '80-120', rr: '20-25', sbp: '80-110' },
  { age: 'Preschool (3-6y)', hr: '70-110', rr: '20-25', sbp: '80-110' },
  { age: 'School Age (6-12y)', hr: '60-100', rr: '16-20', sbp: '80-120' },
  { age: 'Adolescent (12-18y)', hr: '60-90', rr: '12-16', sbp: '94-130' },
];
