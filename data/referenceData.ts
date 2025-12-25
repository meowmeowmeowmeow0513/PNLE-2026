
export interface AbnormalityDetail {
  title: string;
  causes: string[];
  symptoms: string[];
  interventions: string[];
}

export interface ReferenceValue {
  id: string;
  name: string;
  range: string;
  unit: string;
  category: 'Hematology' | 'Electrolytes' | 'Metabolic' | 'ABG' | 'Vital Signs' | 'Renal' | 'Coagulation';
  significance?: string;
  tags?: string[];
  abnormalities?: {
    low?: AbnormalityDetail;
    high?: AbnormalityDetail;
  };
}

export const MEDICAL_REFERENCES: ReferenceValue[] = [
  // --- HEMATOLOGY ---
  { 
    id: 'hgb-m', name: 'Hemoglobin (Male)', range: '14 - 18', unit: 'g/dL', category: 'Hematology', significance: 'Oxygen carrying capacity',
    abnormalities: {
        low: {
            title: 'Anemia',
            causes: ['Iron deficiency', 'Blood loss (Hemorrhage)', 'Renal disease (low EPO)', 'Bone marrow suppression'],
            symptoms: ['Pallor', 'Fatigue', 'Dyspnea on exertion', 'Tachycardia'],
            interventions: ['Monitor O2 sats', 'Administer blood products if critical', 'Cluster care to conserve energy', 'Iron supplements/Diet']
        },
        high: {
            title: 'Polycythemia',
            causes: ['Chronic hypoxia (COPD)', 'High altitude', 'Dehydration (Hemoconcentration)', 'Polycythemia Vera'],
            symptoms: ['Flushed face', 'Dizziness', 'Headache', 'Risk of clotting/DVT'],
            interventions: ['Hydration', 'Monitor for clots', 'Phlebotomy (therapeutic)']
        }
    }
  },
  { 
    id: 'hgb-f', name: 'Hemoglobin (Female)', range: '12 - 16', unit: 'g/dL', category: 'Hematology', significance: 'Oxygen carrying capacity',
    abnormalities: {
        low: {
            title: 'Anemia',
            causes: ['Menstruation', 'Pregnancy (Dilutional)', 'Nutritional deficiency', 'Blood loss'],
            symptoms: ['Pallor', 'Fatigue', 'Weakness', 'Cold intolerance'],
            interventions: ['Dietary education (Green leafy veg, Red meat)', 'Monitor bleeding', 'Fall precautions']
        },
        high: {
            title: 'Polycythemia',
            causes: ['Dehydration', 'Chronic lung disease', 'Smoking'],
            symptoms: ['Headache', 'Blurred vision', 'Hypertension'],
            interventions: ['Hydration', 'Monitor BP', 'Assess circulation']
        }
    }
  },
  { 
    id: 'hct-m', name: 'Hematocrit (Male)', range: '42 - 52', unit: '%', category: 'Hematology',
    abnormalities: {
        low: {
            title: 'Hemodilution / Anemia',
            causes: ['Fluid overload', 'Blood loss', 'Cirrhosis', 'Malnutrition'],
            symptoms: ['Fatigue', 'Weakness', 'Shortness of breath'],
            interventions: ['Assess fluid status', 'Transfuse PRBCs if symptomatic/critical', 'Monitor VS']
        },
        high: {
            title: 'Hemoconcentration',
            causes: ['Dehydration (Hypovolemia)', 'Burns', 'Severe diarrhea'],
            symptoms: ['Dry mucous membranes', 'Thirst', 'Poor skin turgor', 'Tachycardia'],
            interventions: ['IV Fluids', 'Monitor I&O', 'Oral rehydration']
        }
    }
  },
  { 
    id: 'hct-f', name: 'Hematocrit (Female)', range: '37 - 47', unit: '%', category: 'Hematology',
    abnormalities: {
        low: {
            title: 'Hemodilution / Anemia',
            causes: ['Pregnancy', 'Fluid overload', 'Acute blood loss'],
            symptoms: ['Dizziness', 'Pale skin', 'Fatigue'],
            interventions: ['Safety precautions', 'Iron rich diet', 'Monitor CBC']
        },
        high: {
            title: 'Hemoconcentration',
            causes: ['Dehydration', 'Shock', 'Trauma'],
            symptoms: ['Hypotension (late)', 'Thirst', 'Weak pulse'],
            interventions: ['Rapid fluid replacement', 'Monitor urine output']
        }
    }
  },
  { 
    id: 'wbc', name: 'WBC Count', range: '5,000 - 10,000', unit: '/mm³', category: 'Hematology', tags: ['Infection'], 
    abnormalities: {
        low: {
            title: 'Leukopenia',
            causes: ['Viral infections', 'Chemotherapy', 'Bone marrow depression', 'Autoimmune disease'],
            symptoms: ['Fever', 'Chills', 'Fatigue', 'Recurrent infections'],
            interventions: ['Neutropenic precautions', 'Strict handwashing', 'Monitor temp q4h', 'No fresh flowers/fruit']
        },
        high: {
            title: 'Leukocytosis',
            causes: ['Bacterial Infection', 'Inflammation', 'Stress', 'Leukemia', 'Steroid use'],
            symptoms: ['Fever', 'Sweating', 'Localized inflammation', 'Pain'],
            interventions: ['Monitor for infection source', 'Antibiotics as ordered', 'Hydration', 'Trend WBC daily']
        }
    }
  },
  { 
    id: 'plt', name: 'Platelets', range: '150,000 - 400,000', unit: '/mm³', category: 'Hematology', tags: ['Clotting'],
    abnormalities: {
        low: {
            title: 'Thrombocytopenia',
            causes: ['Viral infections', 'Chemo', 'ITP', 'DIC', 'Heparin Induced Thrombocytopenia (HIT)'],
            symptoms: ['Petechiae', 'Ecchymosis', 'Bleeding gums', 'Epistaxis', 'Hematuria'],
            interventions: ['Bleeding precautions', 'Soft toothbrush', 'No IM injections', 'Avoid aspirin/NSAIDs']
        },
        high: {
            title: 'Thrombocytosis',
            causes: ['Polycythemia vera', 'Splenectomy', 'Chronic inflammation'],
            symptoms: ['Clotting (DVT/PE)', 'Headache', 'Dizziness', 'Tingling in hands/feet'],
            interventions: ['Hydration', 'Antiplatelet therapy', 'Monitor for signs of thrombosis (pain, swelling)']
        }
    }
  },

  // --- ELECTROLYTES ---
  { 
    id: 'na', name: 'Sodium (Na+)', range: '135 - 145', unit: 'mEq/L', category: 'Electrolytes', significance: 'Fluid balance, CNS function', tags: ['High Yield'],
    abnormalities: {
        low: {
            title: 'Hyponatremia',
            causes: ['Diuretics', 'Vomiting/Diarrhea', 'SIADH', 'Water Intoxication', 'Heart Failure'],
            symptoms: ['Confusion', 'Seizures', 'Muscle cramps', 'Nausea', 'Lethargy'],
            interventions: ['Seizure precautions', 'Fluid restriction (if SIADH)', 'Hypertonic saline (3% NaCl) for severe cases', 'Monitor neuro status']
        },
        high: {
            title: 'Hypernatremia',
            causes: ['Dehydration', 'Diabetes Insipidus', 'Excess IV saline', 'Heatstroke'],
            symptoms: ['Thirst', 'Dry mucous membranes', 'Restlessness', 'Lethargy', 'Swollen tongue'],
            interventions: ['Hypotonic fluids (0.45% NS)', 'Encourage oral fluids', 'Monitor neuro status', 'Daily weights']
        }
    }
  },
  { 
    id: 'k', name: 'Potassium (K+)', range: '3.5 - 5.0', unit: 'mEq/L', category: 'Electrolytes', significance: 'Cardiac & Muscle function', tags: ['High Yield', 'Critical'],
    abnormalities: {
        low: {
            title: 'Hypokalemia',
            causes: ['Diuretics (Lasix)', 'Vomiting/Diarrhea', 'NG Suction', 'Cushing\'s', 'Insulin therapy'],
            symptoms: ['Flat T waves', 'U waves', 'Muscle weakness', 'Cramps', 'Constipation'],
            interventions: ['K+ replacement (Never IV push)', 'Diet (Bananas, Spinach)', 'Cardiac monitor', 'Assess digitalis toxicity risk']
        },
        high: {
            title: 'Hyperkalemia',
            causes: ['Renal failure', 'K+ sparing diuretics', 'Cellular destruction (Burns/Trauma)', 'Acidosis'],
            symptoms: ['Peaked T waves', 'Widened QRS', 'Dysrhythmias', 'Muscle twitching then weakness'],
            interventions: ['Kayexalate', 'Insulin + Dextrose', 'Calcium Gluconate', 'Dialysis', 'Loop diuretics']
        }
    }
  },
  { 
    id: 'cl', name: 'Chloride (Cl-)', range: '98 - 106', unit: 'mEq/L', category: 'Electrolytes',
    abnormalities: {
        low: {
            title: 'Hypochloremia',
            causes: ['Vomiting', 'NG Suction', 'Diuretics', 'Burns', 'Metabolic Alkalosis'],
            symptoms: ['Tetany', 'Hyperactive DTRs', 'Muscle cramps', 'Irritability'],
            interventions: ['Replace fluids (NS)', 'Monitor LOC', 'Safety precautions']
        },
        high: {
            title: 'Hyperchloremia',
            causes: ['Excess NS infusion', 'Metabolic Acidosis', 'Dehydration'],
            symptoms: ['Deep rapid breathing', 'Weakness', 'Lethargy'],
            interventions: ['Hypotonic fluids', 'Bicarbonate (if acidosis)', 'Monitor ABGs']
        }
    }
  },
  { 
    id: 'ca', name: 'Calcium (Ca+)', range: '9.0 - 10.5', unit: 'mg/dL', category: 'Electrolytes', tags: ['Chvostek', 'Trousseau'],
    abnormalities: {
        low: {
            title: 'Hypocalcemia',
            causes: ['Hypoparathyroidism (Post-Thyroidectomy)', 'Renal failure', 'Malabsorption', 'Pancreatitis'],
            symptoms: ['Positive Trousseau & Chvostek', 'Tetany', 'Tingling lips/fingers', 'Laryngeal stridor'],
            interventions: ['Calcium gluconate IV', 'Seizure precautions', 'Vitamin D supplements', 'Trach kit at bedside (Post-Thyroidectomy)']
        },
        high: {
            title: 'Hypercalcemia',
            causes: ['Hyperparathyroidism', 'Bone cancer', 'Prolonged immobilization', 'Thiazide diuretics'],
            symptoms: ['Muscle weakness', 'Kidney stones', 'Constipation', 'Bone pain', 'Polyuria'],
            interventions: ['Hydration (NS)', 'Loop diuretics', 'Mobilization', 'Calcitonin', 'Increase fiber']
        }
    }
  },
  { 
    id: 'mg', name: 'Magnesium (Mg+)', range: '1.3 - 2.1', unit: 'mEq/L', category: 'Electrolytes', tags: ['DTRs', 'ACLS'],
    abnormalities: {
        low: {
            title: 'Hypomagnesemia',
            causes: ['Alcoholism', 'Diuretics', 'Malnutrition', 'Diarrhea'],
            symptoms: ['Torsades de Pointes', 'Hyperactive DTRs', 'Tremors', 'Seizures'],
            interventions: ['Magnesium sulfate IV/PO', 'Seizure precautions', 'Monitor ECG', 'Diet (Nuts, Greens)']
        },
        high: {
            title: 'Hypermagnesemia',
            causes: ['Renal failure', 'Antacids containing Mg', 'Pre-eclampsia Tx'],
            symptoms: ['Absent DTRs', 'Respiratory depression', 'Hypotension', 'Bradycardia', 'Cardiac arrest'],
            interventions: ['Calcium gluconate (Antidote)', 'Dialysis', 'Stop Mg infusions', 'Ventilatory support']
        }
    }
  },
  { 
    id: 'po4', name: 'Phosphorus', range: '3.0 - 4.5', unit: 'mg/dL', category: 'Electrolytes',
    abnormalities: {
        low: {
            title: 'Hypophosphatemia',
            causes: ['Malnutrition', 'Alcohol withdrawal', 'Hyperparathyroidism'],
            symptoms: ['Muscle weakness', 'Confusion', 'Bone pain'],
            interventions: ['Oral/IV phosphate', 'Monitor calcium levels (inverse relationship)']
        },
        high: {
            title: 'Hyperphosphatemia',
            causes: ['Renal failure', 'Chemotherapy (Tumor Lysis)', 'Hypoparathyroidism'],
            symptoms: ['Signs of Hypocalcemia (Tetany)', 'Calcifications'],
            interventions: ['Phosphate binders (Sevelamer)', 'Limit dairy/processed foods', 'Dialysis']
        }
    }
  },

  // --- METABOLIC / RENAL ---
  { 
    id: 'glu-f', name: 'Glucose (Fasting)', range: '70 - 110', unit: 'mg/dL', category: 'Metabolic', tags: ['Diabetes'],
    abnormalities: {
        low: {
            title: 'Hypoglycemia',
            causes: ['Excess insulin', 'Missed meals', 'Exercise', 'Alcohol'],
            symptoms: ['Tremors', 'Diaphoresis', 'Confusion', 'Cool/Clammy skin', 'Palpitations'],
            interventions: ['15g Carb rule', 'D50W IV (if unconscious)', 'Glucagon IM', 'Recheck BG in 15 mins']
        },
        high: {
            title: 'Hyperglycemia',
            causes: ['Diabetes', 'Stress/Infection', 'Steroids', 'TPN', 'Skipped insulin'],
            symptoms: ['Polyuria, Polydipsia, Polyphagia', 'Hot/Dry skin', 'Fruity breath (DKA)'],
            interventions: ['Insulin', 'Hydration', 'Monitor electrolytes', 'Check ketones']
        }
    }
  },
  { 
    id: 'hba1c', name: 'HbA1c', range: '< 5.7', unit: '%', category: 'Metabolic', significance: '3-month average glucose',
    abnormalities: {
        high: {
            title: 'Pre-Diabetes / Diabetes',
            causes: ['Uncontrolled blood glucose over 3 months'],
            symptoms: ['Long term complications (Neuropathy, Retinopathy, Nephropathy)'],
            interventions: ['Lifestyle modification', 'Diet/Exercise', 'Metformin', 'Insulin therapy']
        }
    }
  },
  { 
    id: 'bun', name: 'BUN', range: '10 - 20', unit: 'mg/dL', category: 'Renal', tags: ['Dehydration'],
    abnormalities: {
        low: {
            title: 'Low Urea Nitrogen',
            causes: ['Liver failure', 'Malnutrition', 'Overhydration'],
            symptoms: ['Confusion (if liver related)', 'Edema'],
            interventions: ['Assess nutritional status', 'Monitor fluid balance']
        },
        high: {
            title: 'Azotemia',
            causes: ['Dehydration', 'Renal failure', 'High protein diet', 'GI Bleed'],
            symptoms: ['Disorientation', 'Convulsions', 'Dehydration signs'],
            interventions: ['Hydration', 'Monitor I&O', 'Low protein diet (if renal)', 'Safety precautions']
        }
    }
  },
  { 
    id: 'cr', name: 'Creatinine', range: '0.6 - 1.2', unit: 'mg/dL', category: 'Renal', significance: 'Best indicator of renal function', tags: ['Critical'],
    abnormalities: {
        low: {
            title: 'Low Creatinine',
            causes: ['Low muscle mass', 'Malnutrition'],
            symptoms: ['Muscle atrophy'],
            interventions: ['Nutritional support']
        },
        high: {
            title: 'Renal Insufficiency/Failure',
            causes: ['Acute/Chronic Kidney Disease', 'Nephrotoxic drugs', 'Shock'],
            symptoms: ['Oliguria', 'Edema', 'Fatigue', 'Confusion'],
            interventions: ['Monitor Urine Output', 'Avoid nephrotoxic meds', 'Dialysis', 'Fluid restriction']
        }
    }
  },

  // --- COAGULATION ---
  { 
    id: 'pt', name: 'PT (Prothrombin Time)', range: '11 - 12.5', unit: 'sec', category: 'Coagulation', tags: ['Warfarin'],
    abnormalities: {
        high: {
            title: 'Prolonged PT',
            causes: ['Warfarin therapy', 'Liver disease', 'Vitamin K deficiency', 'DIC'],
            symptoms: ['Bleeding gums', 'Bruising', 'Hematuria', 'Melena'],
            interventions: ['Vitamin K (Antidote)', 'FFP', 'Bleeding precautions']
        }
    }
  },
  { 
    id: 'inr', name: 'INR (Normal)', range: '0.8 - 1.1', unit: 'ratio', category: 'Coagulation', tags: ['Warfarin'],
    abnormalities: {
        low: {
            title: 'Subtherapeutic',
            causes: ['Insufficient Warfarin dose', 'Vitamin K excess (leafy greens)'],
            symptoms: ['Risk of clots (DVT, PE, Stroke)'],
            interventions: ['Increase dosage', 'Bridge with Heparin', 'Dietary education']
        },
        high: {
            title: 'Supratherapeutic',
            causes: ['Excess Warfarin dose', 'Liver disease', 'Antibiotics'],
            symptoms: ['Bleeding', 'Bruising', 'Hematuria'],
            interventions: ['Vitamin K (Antidote)', 'FFP', 'Hold dose', 'Assess for internal bleeding']
        }
    }
  },
  { 
    id: 'apt_t', name: 'aPTT', range: '30 - 40', unit: 'sec', category: 'Coagulation', tags: ['Heparin'],
    abnormalities: {
        high: {
            title: 'Prolonged aPTT',
            causes: ['Heparin therapy', 'Hemophilia', 'DIC', 'Liver disease'],
            symptoms: ['Spontaneous bleeding', 'Bruising'],
            interventions: ['Protamine Sulfate (Heparin Antidote)', 'Stop Heparin', 'Bleeding precautions']
        }
    }
  },

  // --- ABGs ---
  { 
    id: 'ph', name: 'pH', range: '7.35 - 7.45', unit: ' ', category: 'ABG', tags: ['High Yield', 'Critical'],
    abnormalities: {
        low: {
            title: 'Acidosis',
            causes: ['Respiratory (Hypoventilation, COPD)', 'Metabolic (DKA, Diarrhea, Renal Failure)'],
            symptoms: ['Lethargy', 'Confusion', 'Kussmaul breathing (Metabolic)', 'Hypotension'],
            interventions: ['Treat cause', 'Ventilation support (Resp)', 'Insulin/Fluids (DKA)', 'Bicarb (rarely)']
        },
        high: {
            title: 'Alkalosis',
            causes: ['Respiratory (Hyperventilation)', 'Metabolic (Vomiting, Suctioning)'],
            symptoms: ['Tingling', 'Tetany', 'Tremors', 'Restlessness'],
            interventions: ['Treat cause', 'Paper bag (Resp)', 'Replace electrolytes (K+, Cl-)', 'Stop suctioning']
        }
    }
  },
  { 
    id: 'paco2', name: 'PaCO2', range: '35 - 45', unit: 'mmHg', category: 'ABG', significance: 'Respiratory component',
    abnormalities: {
        low: {
            title: 'Hypocapnia (Resp Alkalosis)',
            causes: ['Hyperventilation', 'Anxiety', 'Pain', 'High altitude'],
            symptoms: ['Lightheadedness', 'Numbness', 'Tingling'],
            interventions: ['Calm patient', 'Paper bag breathing', 'Pain management']
        },
        high: {
            title: 'Hypercapnia (Resp Acidosis)',
            causes: ['Hypoventilation', 'COPD', 'Opioid overdose', 'Pneumonia'],
            symptoms: ['Confusion', 'Drowsiness', 'Headache'],
            interventions: ['Improve ventilation', 'Narcan (if opioid)', 'BiPAP/Intubation', 'Bronchodilators']
        }
    }
  },
  { 
    id: 'hco3', name: 'HCO3', range: '22 - 26', unit: 'mEq/L', category: 'ABG', significance: 'Metabolic component',
    abnormalities: {
        low: {
            title: 'Metabolic Acidosis',
            causes: ['DKA', 'Diarrhea', 'Renal Failure', 'Lactic Acidosis'],
            symptoms: ['Kussmaul respirations', 'Confusion', 'Weakness'],
            interventions: ['Treat underlying cause', 'IV Fluids', 'Dialysis']
        },
        high: {
            title: 'Metabolic Alkalosis',
            causes: ['Vomiting', 'NG Suction', 'Diuretics', 'Excess Antacids'],
            symptoms: ['Muscle cramps', 'Tremors', 'Tetany'],
            interventions: ['Stop diuretics', 'IV Fluids', 'Replace Potassium']
        }
    }
  },
  { 
    id: 'pao2', name: 'PaO2', range: '80 - 100', unit: 'mmHg', category: 'ABG',
    abnormalities: {
        low: {
            title: 'Hypoxemia',
            causes: ['Pneumonia', 'ARDS', 'COPD', 'PE', 'Asthma'],
            symptoms: ['Cyanosis', 'Tachypnea', 'Tachycardia', 'Restlessness (Early sign)'],
            interventions: ['Oxygen therapy', 'Positioning (High Fowler\'s)', 'Treat lung pathology']
        }
    }
  },

  // --- VITAL SIGNS (ADULT) ---
  { 
    id: 'bp-a', name: 'Blood Pressure (Adult)', range: '< 120 / 80', unit: 'mmHg', category: 'Vital Signs',
    abnormalities: {
        low: {
            title: 'Hypotension',
            causes: ['Dehydration', 'Shock', 'Heart Failure', 'Meds'],
            symptoms: ['Dizziness', 'Fainting', 'Cold/Clammy skin'],
            interventions: ['Trendelenburg', 'Fluids', 'Vasopressors']
        },
        high: {
            title: 'Hypertension',
            causes: ['Stress', 'Pain', 'Fluid overload', 'Renal disease'],
            symptoms: ['Headache', 'Vision changes', 'Chest pain'],
            interventions: ['Antihypertensives', 'Diuretics', 'Lifestyle changes']
        }
    }
  },
  { 
    id: 'hr-a', name: 'Heart Rate (Adult)', range: '60 - 100', unit: 'bpm', category: 'Vital Signs',
    abnormalities: {
        low: {
            title: 'Bradycardia',
            causes: ['Athletic heart', 'Beta blockers', 'Hypothermia', 'Heart block'],
            symptoms: ['Dizziness', 'Fatigue', 'Syncope'],
            interventions: ['Atropine (if symptomatic)', 'Pacing', 'Check meds']
        },
        high: {
            title: 'Tachycardia',
            causes: ['Fever', 'Pain', 'Anxiety', 'Hypovolemia', 'Heart Failure'],
            symptoms: ['Palpitations', 'Shortness of breath', 'Chest pain'],
            interventions: ['Treat cause', 'Vagal maneuvers', 'Beta blockers']
        }
    }
  },
  { 
    id: 'rr-a', name: 'Resp Rate (Adult)', range: '12 - 20', unit: 'bpm', category: 'Vital Signs',
    abnormalities: {
        low: {
            title: 'Bradypnea',
            causes: ['Opioids', 'Brain injury', 'Sleep'],
            symptoms: ['Cyanosis', 'Confusion'],
            interventions: ['Narcan (if opioids)', 'Ventilatory support', 'Stimulate patient']
        },
        high: {
            title: 'Tachypnea',
            causes: ['Hypoxia', 'Fever', 'Pain', 'Anxiety', 'Acidosis'],
            symptoms: ['Dizziness', 'Tingling (Hyperventilation)'],
            interventions: ['Treat cause', 'Calm patient', 'Oxygen']
        }
    }
  },
  { 
    id: 'temp-a', name: 'Temperature (Adult)', range: '36.5 - 37.5', unit: '°C', category: 'Vital Signs',
    abnormalities: {
        low: {
            title: 'Hypothermia',
            causes: ['Exposure', 'Sepsis (late)', 'Hypothyroidism'],
            symptoms: ['Shivering', 'Confusion', 'Bradycardia'],
            interventions: ['Warm blankets', 'Warm fluids', 'Monitor cardiac rhythm']
        },
        high: {
            title: 'Hyperthermia / Fever',
            causes: ['Infection', 'Heat stroke', 'Trauma'],
            symptoms: ['Sweating', 'Flushed skin', 'Tachycardia', 'Seizures (children)'],
            interventions: ['Antipyretics', 'Cooling measures', 'Hydration', 'Antibiotics (if infection)']
        }
    }
  },
];

export const VITAL_SIGNS_PEDIATRIC = [
  { age: 'Newborn', hr: '100-160', rr: '30-60', sbp: '60-90' },
  { age: 'Infant (1-12m)', hr: '100-120', rr: '25-30', sbp: '80-100' },
  { age: 'Toddler (1-3y)', hr: '80-120', rr: '20-25', sbp: '80-110' },
  { age: 'Preschool (3-6y)', hr: '70-110', rr: '20-25', sbp: '80-110' },
  { age: 'School Age (6-12y)', hr: '60-100', rr: '16-20', sbp: '80-120' },
  { age: 'Adolescent (12-18y)', hr: '60-90', rr: '12-16', sbp: '94-130' },
];
