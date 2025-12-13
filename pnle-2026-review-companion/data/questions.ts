
export interface QuestionCard {
  day: number;
  category: string; // e.g. "NP1", "NP2"
  topic: string;    // e.g. "Community Health", "Maternal"
  question: string;
  answer: string;
}

export const decemberQuestions: QuestionCard[] = [
  { day: 1, category: "NP1", topic: "Community Health", question: "What is the \"Magna Carta of Public Health Workers\"?", answer: "RA 7305" },
  { day: 2, category: "NP2", topic: "Maternal", question: "Naegele's Rule formula?", answer: "+7 Days, -3 Months, +1 Year" },
  { day: 3, category: "NP3", topic: "Med-Surg", question: "Normal Potassium range?", answer: "3.5 - 5.0 mEq/L" },
  { day: 4, category: "NP4", topic: "Med-Surg", question: "Chest tube continuous bubbling in water seal indicates?", answer: "Air Leak" },
  { day: 5, category: "NP5", topic: "Psych", question: "Drug of choice for Bipolar Disorder?", answer: "Lithium Carbonate" },
  { day: 6, category: "NP1", topic: "Community Health", question: "Dengue vector mosquito?", answer: "Aedes aegypti" },
  { day: 7, category: "NP2", topic: "Maternal", question: "Bluish discoloration of cervix?", answer: "Chadwick's Sign" },
  { day: 8, category: "NP3", topic: "Med-Surg", question: "Classic sign of SLE?", answer: "Butterfly Rash" },
  { day: 9, category: "NP4", topic: "Med-Surg", question: "Position for Autonomic Dysreflexia?", answer: "High Fowler's / Sit up" },
  { day: 10, category: "NP5", topic: "Psych", question: "Therapeutic range for Lithium?", answer: "0.6 - 1.2 mEq/L" },
  { day: 11, category: "NP1", topic: "Community Health", question: "Immunity passed via placenta?", answer: "Natural Passive" },
  { day: 12, category: "NP2", topic: "Maternal", question: "Antidote for Magnesium Sulfate?", answer: "Calcium Gluconate" },
  { day: 13, category: "NP3", topic: "Med-Surg", question: "Cushing's Triad: Bradycardia, Widening Pulse Pressure, and ___?", answer: "Irregular Respirations" },
  { day: 14, category: "NP4", topic: "Med-Surg", question: "Most specific enzyme for MI?", answer: "Troponin I" },
  { day: 15, category: "NP5", topic: "Psych", question: "\"I am the King of England\" is what delusion?", answer: "Grandeur" },
  { day: 16, category: "NP1", topic: "Community Health", question: "4S Strategy is for what disease?", answer: "Dengue" },
  { day: 17, category: "NP2", topic: "Maternal", question: "First stool of newborn?", answer: "Meconium" },
  { day: 18, category: "NP3", topic: "Med-Surg", question: "pH is Low, PaCO2 is High. Interpretation?", answer: "Respiratory Acidosis" },
  { day: 19, category: "NP4", topic: "Med-Surg", question: "Position after liver biopsy?", answer: "Right side lying" },
  { day: 20, category: "NP5", topic: "Psych", question: "Priority assessment for depression?", answer: "Suicide Risk" },
  { day: 21, category: "NP1", topic: "Community Health", question: "Generic name of BCG?", answer: "Bacillus Calmette-Guerin" },
  { day: 22, category: "NP2", topic: "Maternal", question: "Painless bright red bleeding in 3rd trimester?", answer: "Placenta Previa" },
  { day: 23, category: "NP3", topic: "Med-Surg", question: "Chvostek's sign indicates which electrolyte imbalance?", answer: "Hypocalcemia" },
  { day: 24, category: "NP4", topic: "Med-Surg", question: "Chart for distant vision?", answer: "Snellen" },
  { day: 25, category: "NP5", topic: "Psych", question: "Fear of open spaces?", answer: "Agoraphobia" },
  { day: 26, category: "NP1", topic: "Community Health", question: "Vitamin A deficiency causes?", answer: "Night Blindness / Xerophthalmia" },
  { day: 27, category: "NP2", topic: "Maternal", question: "Anterior fontanelle closes at?", answer: "12-18 months" },
  { day: 28, category: "NP3", topic: "Med-Surg", question: "\"Universal Donor\" blood type?", answer: "Type O Negative" },
  { day: 29, category: "NP4", topic: "Med-Surg", question: "\"Mask-like face\" and pill-rolling tremor?", answer: "Parkinson's Disease" },
  { day: 30, category: "NP5", topic: "Psych", question: "Alcohol withdrawal peaks at?", answer: "48-72 hours" },
  { day: 31, category: "NP1", topic: "Community Health", question: "DOTS stands for?", answer: "Directly Observed Treatment Short-course" },
];
