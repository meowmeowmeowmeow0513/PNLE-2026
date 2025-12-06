
export interface SLEQuestion {
  id: number;
  level: number; // 1-7
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
  rationale: string;
}

export const SLE_QUESTIONS: SLEQuestion[] = [
  // --- LEVEL 1: FOUNDATIONS OF ACLS ---
  {
    id: 1,
    level: 1,
    category: "ACLS - Basic",
    question: "You arrive at the scene. The patient is unresponsive. You shout for help. What is your immediate next action?",
    options: ["Check for pulse and breathing simultaneously", "Start Chest Compressions", "Attach the defibrillator", "Open the airway"],
    correctAnswer: 0,
    rationale: "According to 2025 AHA Guidelines, checking pulse (carotid) and breathing (chest rise) should be done simultaneously in less than 10 seconds to minimize delay."
  },
  {
    id: 2,
    level: 1,
    category: "ACLS - CPR",
    question: "What is the correct depth of chest compressions for an average adult?",
    options: ["At least 1.5 inches", "At least 2 inches (5 cm)", "Exactly 2.5 inches", "1/3 depth of chest"],
    correctAnswer: 1,
    rationale: "Compressions should be at least 2 inches (5 cm) but not greater than 2.4 inches (6 cm) to ensure adequate perfusion without causing injury."
  },
  {
    id: 3,
    level: 1,
    category: "ACLS - Rhythm",
    question: "Which of the following rhythms is SHOCKABLE?",
    options: ["Asystole", "Pulseless Electrical Activity (PEA)", "Pulseless Ventricular Tachycardia (pVT)", "Sinus Bradycardia"],
    correctAnswer: 2,
    rationale: "VFib and Pulseless VT are the ONLY shockable rhythms. Asystole and PEA are treated with CPR and Epinephrine."
  },
  {
    id: 4,
    level: 1,
    category: "ACLS - Airway",
    question: "After inserting an advanced airway (ET Tube) during CPR, what is the ventilation rate?",
    options: ["2 breaths every 30 compressions", "1 breath every 6 seconds", "1 breath every 3 seconds", "Hyperventilate continuously"],
    correctAnswer: 1,
    rationale: "With an advanced airway, compressions are continuous (100-120/min) and breaths are given 1 every 6 seconds (10 breaths/min). Do not hyperventilate."
  },
  {
    id: 5,
    level: 1,
    category: "ACLS - Defibrillation",
    question: "You are using a Biphasic Defibrillator. What is the recommended initial energy dose?",
    options: ["360 Joules", "200 Joules (or manufacturer rec)", "100 Joules", "50 Joules"],
    correctAnswer: 1,
    rationale: "For biphasic defibrillators, use the manufacturer dose (usually 120-200J). If unknown, use the maximum available."
  },
  {
    id: 6,
    level: 1,
    category: "ACLS - Meds",
    question: "What is the first-line vasopressor for Cardiac Arrest?",
    options: ["Atropine 1mg", "Amiodarone 300mg", "Epinephrine 1mg", "Lidocaine 1.5mg/kg"],
    correctAnswer: 2,
    rationale: "Epinephrine 1mg IV/IO is given every 3-5 minutes for all pulseless arrest rhythms to increase coronary perfusion pressure."
  },
  {
    id: 7,
    level: 1,
    category: "ACLS - Meds",
    question: "A patient is in refractory VFib after 3 shocks. Which antiarrhythmic is indicated?",
    options: ["Adenosine 6mg", "Amiodarone 300mg", "Magnesium Sulfate 2g", "Diltiazem 20mg"],
    correctAnswer: 1,
    rationale: "Amiodarone (300mg bolus, then 150mg) or Lidocaine is indicated for VF/pVT unresponsive to shock, CPR, and a vasopressor."
  },
  {
    id: 8,
    level: 1,
    category: "ACLS - Dynamics",
    question: "How often should compressors switch roles to prevent fatigue?",
    options: ["Every 1 minute", "Every 2 minutes (5 cycles)", "Every 5 minutes", "Only when tired"],
    correctAnswer: 1,
    rationale: "Switch compressors every 2 minutes (or sooner if fatigued) to maintain high-quality CPR quality. The switch should take <5 seconds."
  },
  {
    id: 9,
    level: 1,
    category: "ACLS - Team",
    question: "The Team Leader orders 'Give Amiodarone 150mg'. You repeat back 'Giving Amiodarone 150mg'. This is an example of:",
    options: ["Mutual Respect", "Closed-Loop Communication", "Constructive Intervention", "Knowledge Sharing"],
    correctAnswer: 1,
    rationale: "Closed-loop communication confirms the order was heard and understood correctly before execution."
  },
  {
    id: 10,
    level: 1,
    category: "ACLS - ROSC",
    question: "Post-ROSC, the patient is comatose. What intervention is critical for neuroprotection?",
    options: ["Hyperventilation", "Targeted Temperature Management (TTM)", "Immediate Dialysis", "High-dose Steroids"],
    correctAnswer: 1,
    rationale: "TTM (32-36°C) for at least 24 hours is the only intervention proven to improve neurological recovery in comatose post-arrest patients."
  },

  // --- LEVEL 2: H's and T's & EMERGENCY ---
  {
    id: 11,
    level: 2,
    category: "H's & T's",
    question: "A trauma patient has distended neck veins, tracheal deviation, and hypotension. You suspect:",
    options: ["Cardiac Tamponade", "Tension Pneumothorax", "Hypovolemia", "Massive PE"],
    correctAnswer: 1,
    rationale: "Tracheal deviation is the hallmark differentiator for Tension Pneumothorax vs Tamponade. Treatment is needle decompression."
  },
  {
    id: 12,
    level: 2,
    category: "H's & T's",
    question: "ECG shows peaked T-waves and widened QRS in a renal failure patient. What is the priority treatment?",
    options: ["Defibrillation", "Calcium Gluconate", "Magnesium Sulfate", "Amiodarone"],
    correctAnswer: 1,
    rationale: "Signs of severe Hyperkalemia. Calcium Gluconate stabilizes the cardiac membrane. Insulin/Dextrose shifts K+ into cells."
  },
  {
    id: 13,
    level: 2,
    category: "H's & T's",
    question: "A patient arrives with pinpoint pupils and respiratory depression. A code ensues. What antidote should be considered?",
    options: ["Flumazenil", "Naloxone", "Acetylcysteine", "Atropine"],
    correctAnswer: 1,
    rationale: "Opioid overdose (Toxins) causes respiratory arrest. Naloxone is the specific antidote."
  },
  {
    id: 14,
    level: 2,
    category: "Clinical Case",
    question: "In DKA, what electrolyte must be checked BEFORE starting an insulin drip?",
    options: ["Sodium", "Calcium", "Potassium", "Magnesium"],
    correctAnswer: 2,
    rationale: "Insulin shifts Potassium into cells. If K+ is <3.3, insulin will cause fatal hypokalemia. Replenish K+ first."
  },
  {
    id: 15,
    level: 2,
    category: "H's & T's",
    question: "Beck's Triad (Hypotension, JVD, Muffled Heart Sounds) indicates:",
    options: ["Tension Pneumothorax", "Cardiac Tamponade", "Acute MI", "Pulmonary Embolism"],
    correctAnswer: 1,
    rationale: "These are classic signs of fluid in the pericardial sac compressing the heart. Tx: Pericardiocentesis."
  },
  {
    id: 16,
    level: 2,
    category: "Emergency",
    question: "What is the target O2 saturation for a post-ROSC patient?",
    options: ["100%", "92-98%", ">85%", "Whatever keeps them pink"],
    correctAnswer: 1,
    rationale: "Avoid hyperoxia. Oxygen toxicity can worsen reperfusion injury. Target 92-98%."
  },
  {
    id: 17,
    level: 2,
    category: "ACLS - Bradycardia",
    question: "Symptomatic Bradycardia refractory to Atropine. What is the next step?",
    options: ["Epinephrine 1mg IV Push", "Transcutaneous Pacing", "Amiodarone Infusion", "Defibrillation"],
    correctAnswer: 1,
    rationale: "If Atropine fails, move to Pacing (TCP) or Dopamine/Epinephrine infusion. Epi IV Push is for cardiac arrest, not pulses bradycardia."
  },
  {
    id: 18,
    level: 2,
    category: "ACLS - Tachycardia",
    question: "A patient has SVT (HR 180) and is hypotensive/unstable. What is the priority?",
    options: ["Vagal Maneuvers", "Adenosine 6mg", "Synchronized Cardioversion", "Defibrillation"],
    correctAnswer: 2,
    rationale: "Unstable Tachycardia = Electricity. Use Synchronized Cardioversion. Adenosine is for STABLE SVT."
  },
  {
    id: 19,
    level: 2,
    category: "Pharmacology",
    question: "How is Adenosine administered?",
    options: ["Slow IV push over 2 mins", "Rapid IV push + 20ml flush", "IV infusion", "IM injection"],
    correctAnswer: 1,
    rationale: "Adenosine has a half-life of <10 seconds. It must be slammed (rapid push) and flushed to reach the heart."
  },
  {
    id: 20,
    level: 2,
    category: "H's & T's",
    question: "Hypovolemia in a trauma code is best treated initially with:",
    options: ["Vasopressors", "Isotonic Crystalloids / Blood", "Albumin", "Dextrose 50%"],
    correctAnswer: 1,
    rationale: "Fill the tank first. Pressors won't work on an empty vasculature. Give fluids or blood products."
  },

  // --- LEVEL 3: CARDIAC & RESPIRATORY ---
  {
    id: 21,
    level: 3,
    category: "ECG",
    question: "A 'Sawtooth' pattern on ECG is characteristic of:",
    options: ["Atrial Fibrillation", "Atrial Flutter", "Ventricular Tachycardia", "Torsades de Pointes"],
    correctAnswer: 1,
    rationale: "Atrial Flutter presents with classic F-waves (sawtooth pattern) between QRS complexes."
  },
  {
    id: 22,
    level: 3,
    category: "Emergency",
    question: "First-line treatment for Torsades de Pointes?",
    options: ["Amiodarone", "Magnesium Sulfate", "Adenosine", "Calcium Chloride"],
    correctAnswer: 1,
    rationale: "Magnesium Sulfate (1-2g IV) is the specific antidote for polymorphic VT (Torsades), often caused by low Mg."
  },
  {
    id: 23,
    level: 3,
    category: "Stroke",
    question: "What is the critical time window for fibrinolytic therapy in ischemic stroke?",
    options: ["Within 24 hours", "Within 1 hour", "Within 3 to 4.5 hours", "Within 12 hours"],
    correctAnswer: 2,
    rationale: "tPA (Alteplase) is generally effective and approved if given within 3 hours (extended to 4.5 in some cases) of symptom onset."
  },
  {
    id: 24,
    level: 3,
    category: "ACS",
    question: "A patient with STEMI has ST elevation in leads II, III, and aVF. Which wall is affected?",
    options: ["Anterior", "Lateral", "Inferior", "Septal"],
    correctAnswer: 2,
    rationale: "II, III, aVF look at the Inferior wall (RCA territory). Caution with Nitroglycerin/Morphine due to preload dependence."
  },
  {
    id: 25,
    level: 3,
    category: "ACS",
    question: "What is the only medication proven to reduce mortality in suspected MI if given early?",
    options: ["Nitroglycerin", "Morphine", "Aspirin", "Oxygen"],
    correctAnswer: 2,
    rationale: "Aspirin (160-325mg chewable) prevents further platelet aggregation and reduces mortality."
  },
  {
    id: 26,
    level: 3,
    category: "Respiratory",
    question: "In a Code Blue, Quantitative Waveform Capnography (ETCO2) < 10 mmHg indicates:",
    options: ["Good CPR Quality", "ROSC Achieved", "Poor Chest Compressions", "Hyperventilation"],
    correctAnswer: 2,
    rationale: "Low ETCO2 (<10) means low cardiac output generated by compressions. Push harder/faster. Sudden rise >40 indicates ROSC."
  },
  {
    id: 27,
    level: 3,
    category: "Pharmacology",
    question: "Maximum total dose of Atropine for Bradycardia?",
    options: ["1 mg", "2 mg", "3 mg", "0.04 mg/kg"],
    correctAnswer: 2,
    rationale: "1mg every 3-5 mins, up to a maximum of 3mg. After that, it is unlikely to work."
  },
  {
    id: 28,
    level: 3,
    category: "Emergency",
    question: "A patient is in status epilepticus. First-line med?",
    options: ["Phenytoin", "Propofol", "Benzodiazepine (Lorazepam/Midazolam)", "Phenobarbital"],
    correctAnswer: 2,
    rationale: "Benzos are first-line to stop the seizure activity immediately."
  },
  {
    id: 29,
    level: 3,
    category: "ACLS - Shock",
    question: "Cardioversion for Atrial Fibrillation should be synchronized to which part of the ECG?",
    options: ["P wave", "R wave", "T wave", "U wave"],
    correctAnswer: 1,
    rationale: "Sync to the R wave to avoid shocking during the relative refractory period (T wave), which could cause R-on-T and induce VFib."
  },
  {
    id: 30,
    level: 3,
    category: "Sepsis",
    question: "In the Sepsis Hour-1 Bundle, what is the initial fluid bolus for hypotension?",
    options: ["10 ml/kg", "20 ml/kg", "30 ml/kg", "500 ml fixed"],
    correctAnswer: 2,
    rationale: "30 ml/kg of crystalloid fluids is the standard rapid resuscitation volume for septic shock."
  },
  
  // --- PLACEHOLDER FOR LEVELS 4-7 (Would normally be populated fully) ---
  // Adding just one per level to show structure working, logic handles the rest.
  {
    id: 31, level: 4, category: "Adv. Pharm", question: "Dopamine infusion rate for Bradycardia?", options: ["2-10 mcg/kg/min", "10-20 mcg/kg/min", "1 mg/min", "50 mcg/min"], correctAnswer: 0, rationale: "2-10 mcg/kg/min is the beta-adrenergic range for heart rate/contractility support."
  },
  {
    id: 41, level: 5, category: "Trauma", question: "Fluid of choice for burn resuscitation (Parkland)?", options: ["Normal Saline", "Lactated Ringer's", "D5W", "Colloids"], correctAnswer: 1, rationale: "LR is preferred to avoid hyperchloremic acidosis associated with massive NS infusion."
  },
  {
    id: 51, level: 6, category: "Peds ACLS", question: "Compression depth for an infant?", options: ["1 inch", "1.5 inches (4cm)", "2 inches", "2.5 inches"], correctAnswer: 1, rationale: "About 1.5 inches (4cm), or 1/3 AP diameter of the chest."
  },
  {
    id: 61, level: 7, category: "Ethics", question: "Family asks to watch the Code Blue. Best action?", options: ["Escort them out immediately", "Allow them to stay with a support person", "Tell them it is illegal", "Ignore them"], correctAnswer: 1, rationale: "Family presence during resuscitation is supported by evidence to help with grieving and understanding efforts made."
  },
  {
    id: 70, level: 7, category: "Final Boss", question: "Congratulations. You survived. What is the most important rule?", options: ["Know it all", "Be perfect", "Don't panic", "Treat the monitor"], correctAnswer: 2, rationale: "Panic kills. Calmness saves. Treat the patient, not the monitor."
  }
];
