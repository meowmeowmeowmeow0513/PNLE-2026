
export interface Mnemonic {
  id: number;
  code: string;
  title: string;
  meaning: string;
  category: "Maternal" | "MedSurg" | "Pedia" | "Pharma" | "Psych" | "Fundamentals";
  colorTheme: string; // Tailwind color name (e.g. "pink", "blue")
}

export const mnemonics: Mnemonic[] = [
  {
    id: 1,
    code: "VEAL CHOP",
    title: "Fetal Heart Rate Patterns",
    meaning: "V = Variable Decels  →  C = Cord Compression\nE = Early Decels  →  H = Head Compression\nA = Accelerations  →  O = Okay (Oxygenated)\nL = Late Decels  →  P = Placental Insufficiency",
    category: "Maternal",
    colorTheme: "pink"
  },
  {
    id: 2,
    code: "MONA",
    title: "Myocardial Infarction (Initial Tx)",
    meaning: "M = Morphine\nO = Oxygen\nN = Nitroglycerin\nA = Aspirin\n(Note: Order depends on protocols, usually ONAM)",
    category: "MedSurg",
    colorTheme: "red"
  },
  {
    id: 3,
    code: "BUBBLE HE",
    title: "Postpartum Assessment",
    meaning: "B = Breasts\nU = Uterus\nB = Bladder\nB = Bowels\nL = Lochia\nE = Episiotomy\nH = Homan's Sign (DVT)\nE = Emotional Status",
    category: "Maternal",
    colorTheme: "pink"
  },
  {
    id: 4,
    code: "RICE",
    title: "Soft Tissue Injury (Sprains)",
    meaning: "R = Rest\nI = Ice\nC = Compression\nE = Elevation",
    category: "Fundamentals",
    colorTheme: "emerald"
  },
  {
    id: 5,
    code: "APGAR",
    title: "Newborn Assessment (1 & 5 mins)",
    meaning: "A = Appearance (Skin Color)\nP = Pulse (Heart Rate)\nG = Grimace (Reflex Irritability)\nA = Activity (Muscle Tone)\nR = Respiration",
    category: "Pedia",
    colorTheme: "sky"
  },
  {
    id: 6,
    code: "SAD PERSONS",
    title: "Suicide Risk Factors",
    meaning: "S = Sex (Male)\nA = Age\nD = Depression\nP = Previous Attempt\nE = Ethanol Use\nR = Rational Thinking Loss\nS = Social Support Lacking\nO = Organized Plan\nN = No Spouse\nS = Sickness",
    category: "Psych",
    colorTheme: "violet"
  },
  {
    id: 7,
    code: "FAST",
    title: "Stroke Signs (CVA)",
    meaning: "F = Face Drooping\nA = Arm Weakness\nS = Speech Difficulty\nT = Time to call emergency",
    category: "MedSurg",
    colorTheme: "red"
  },
  {
    id: 8,
    code: "TORCH",
    title: "Infections Causing Fetal Abnormalities",
    meaning: "T = Toxoplasmosis\nO = Other (Syphilis, Varicella, Parvo)\nR = Rubella\nC = Cytomegalovirus (CMV)\nH = Herpes Simplex",
    category: "Maternal",
    colorTheme: "pink"
  },
  {
    id: 9,
    code: "AD PIE",
    title: "The Nursing Process",
    meaning: "A = Assessment\nD = Diagnosis\nP = Planning\nI = Implementation\nE = Evaluation",
    category: "Fundamentals",
    colorTheme: "emerald"
  },
  {
    id: 10,
    code: "SLUDGE",
    title: "Cholinergic Crisis (Wet)",
    meaning: "S = Salivation\nL = Lacrimation\nU = Urination\nD = Defecation\nG = GI Distress\nE = Emesis",
    category: "Pharma",
    colorTheme: "orange"
  },
  {
    id: 11,
    code: "COAL",
    title: "Cane Walking Technique",
    meaning: "C = Cane\nO = Opposite\nA = Affected\nL = Leg\n(Hold cane on the strong side!)",
    category: "Fundamentals",
    colorTheme: "emerald"
  },
  {
    id: 12,
    code: "HELLP",
    title: "Severe Preeclampsia Complication",
    meaning: "H = Hemolysis\nEL = Elevated Liver Enzymes\nLP = Low Platelets",
    category: "Maternal",
    colorTheme: "pink"
  },
  {
    id: 13,
    code: "DIG FAST",
    title: "Symptoms of Mania",
    meaning: "D = Distractibility\nI = Indiscretion\nG = Grandiosity\nF = Flight of Ideas\nA = Activity Increase\nS = Sleep Deficit\nT = Talkativeness",
    category: "Psych",
    colorTheme: "violet"
  },
  {
    id: 14,
    code: "4 Ds",
    title: "Epiglottitis Symptoms",
    meaning: "D = Drooling\nD = Dysphagia\nD = Dysphonia\nD = Distressed Respiratory Effort",
    category: "Pedia",
    colorTheme: "sky"
  },
  {
    id: 15,
    code: "PASS",
    title: "Fire Extinguisher Use",
    meaning: "P = Pull the pin\nA = Aim at base of fire\nS = Squeeze handle\nS = Sweep side to side",
    category: "Fundamentals",
    colorTheme: "emerald"
  },
  {
    id: 16,
    code: "RACE",
    title: "Fire Response Protocol",
    meaning: "R = Rescue clients\nA = Alarm (Activate it)\nC = Contain fire (Close doors)\nE = Extinguish",
    category: "Fundamentals",
    colorTheme: "emerald"
  },
  {
    id: 17,
    code: "5 Ps",
    title: "Compartment Syndrome Signs",
    meaning: "1. Pain (unrelieved by meds)\n2. Pallor\n3. Pulselessness\n4. Paresthesia\n5. Paralysis\n(6. Poikilothermia - cold)",
    category: "MedSurg",
    colorTheme: "red"
  },
  {
    id: 18,
    code: "GTPAL",
    title: "Obstetric History",
    meaning: "G = Gravida (Total pregnancies)\nT = Term births (37+ wks)\nP = Preterm births (20-36 wks)\nA = Abortions/Miscarriages\nL = Living children",
    category: "Maternal",
    colorTheme: "pink"
  },
  {
    id: 19,
    code: "OH OH OH TO TOUCH...",
    title: "Cranial Nerves (Names)",
    meaning: "Olfactory, Optic, Oculomotor\nTrochlear, Trigeminal, Abducens\nFacial, Auditory (Vestibulocochlear)\nGlossopharyngeal, Vagus\nSpinal Accessory, Hypoglossal",
    category: "MedSurg",
    colorTheme: "red"
  },
  {
    id: 20,
    code: "PERRLA",
    title: "Pupillary Assessment",
    meaning: "P = Pupils\nE = Equal\nR = Round\nR = Reactive to\nL = Light and\nA = Accommodation",
    category: "Fundamentals",
    colorTheme: "emerald"
  },
  {
    id: 21,
    code: "SIG E CAPS",
    title: "Major Depression Symptoms",
    meaning: "S = Sleep changes\nI = Interest loss (Anhedonia)\nG = Guilt\nE = Energy lack\nC = Concentration reduced\nA = Appetite change\nP = Psychomotor retard/agitation\nS = Suicidal ideation",
    category: "Psych",
    colorTheme: "violet"
  },
  {
    id: 22,
    code: "SPIDERMAN",
    title: "Droplet Precautions",
    meaning: "S = Sepsis, Scarlet Fever, Streptococcal\nP = Parvovirus, Pneumonia, Pertussis\nI = Influenza\nD = Diphtheria\nE = Epiglottitis\nR = Rubella\nM = Mumps, Meningitis, Mycoplasma\nAn = Adenovirus",
    category: "Fundamentals",
    colorTheme: "emerald"
  },
  {
    id: 23,
    code: "MTV",
    title: "Airborne Precautions",
    meaning: "M = Measles\nT = TB (Tuberculosis)\nV = Varicella (Chicken Pox/Herpes Zoster)\n(Require N95 Mask + Negative Pressure)",
    category: "Fundamentals",
    colorTheme: "emerald"
  },
  {
    id: 24,
    code: "REEDA",
    title: "Wound/Episiotomy Healing",
    meaning: "R = Redness\nE = Edema\nE = Ecchymosis (Bruising)\nD = Discharge/Drainage\nA = Approximation (Edges together)",
    category: "Maternal",
    colorTheme: "pink"
  },
  {
    id: 25,
    code: "PQRST",
    title: "Pain Assessment",
    meaning: "P = Provoking factors\nQ = Quality (Stabbing, dull)\nR = Radiation/Region\nS = Severity (0-10)\nT = Time/Timing",
    category: "Fundamentals",
    colorTheme: "emerald"
  },
  {
    id: 26,
    code: "ABCDE",
    title: "Melanoma Assessment",
    meaning: "A = Asymmetry\nB = Border irregularity\nC = Color variation\nD = Diameter (>6mm)\nE = Evolving",
    category: "MedSurg",
    colorTheme: "red"
  },
  {
    id: 27,
    code: "3 Ps",
    title: "Diabetes Hyperglycemia",
    meaning: "P = Polyuria (Excessive urination)\nP = Polydipsia (Excessive thirst)\nP = Polyphagia (Excessive hunger)",
    category: "MedSurg",
    colorTheme: "red"
  },
  {
    id: 28,
    code: "BRAT",
    title: "Diet for Mild Diarrhea (Pediatric)",
    meaning: "B = Bananas\nR = Rice\nA = Applesauce\nT = Toast\n(Note: Use cautiously; bland diet)",
    category: "Pedia",
    colorTheme: "sky"
  },
  {
    id: 29,
    code: "ABCD",
    title: "Antihypertensives (Classes)",
    meaning: "A = ACE Inhibitors / ARBs\nB = Beta Blockers\nC = Calcium Channel Blockers\nD = Diuretics",
    category: "Pharma",
    colorTheme: "orange"
  },
  {
    id: 30,
    code: "CAGE",
    title: "Alcoholism Screening",
    meaning: "C = Cut down (Have you felt need to?)\nA = Annoyed (by criticism)\nG = Guilty (Felt bad about drinking)\nE = Eye opener (Drink in morning)",
    category: "Psych",
    colorTheme: "violet"
  },
  {
    id: 31,
    code: "ABC",
    title: "Prioritization Strategy",
    meaning: "A = Airway\nB = Breathing\nC = Circulation\n(Always priority unless CPR starts with CAB)",
    category: "Fundamentals",
    colorTheme: "emerald"
  }
];
