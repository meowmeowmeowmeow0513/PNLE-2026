
import React from 'react';
import { Users, Baby, Stethoscope, Activity, Brain } from 'lucide-react';

export interface Topic {
  name: string;
  subtopics: string[];
  tags: string[]; // e.g., "High Yield", "Must Know"
}

export interface CompetencyArea {
  title: string; // e.g., "Part A: Care of Mother"
  weight: string; // e.g., "50 Items"
  weightPercentage: number; // e.g. 50
  description: string; // e.g., "Safe and Quality Nursing Care, Health Education"
  topics: Topic[];
}

export interface ExamBlueprint {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: 'emerald' | 'pink' | 'blue' | 'orange' | 'violet';
  totalItems: number;
  strategy: string;
  competencies: CompetencyArea[];
}

export type CompetencyStatus = 'none' | 'review' | 'mastered';

export interface CompetencyData {
    [topicId: string]: CompetencyStatus;
}

export const EXAM_BLUEPRINTS: ExamBlueprint[] = [
  {
    id: 'np1',
    code: 'NP I',
    title: 'Community Health Nursing',
    subtitle: 'Care of Individuals, Families, Population Groups & Community',
    icon: Users,
    color: 'emerald',
    totalItems: 100,
    strategy: "Master the 80/20 Rule. Part A is your core (80%) covering the 4 levels of clientele: Individual, Family, Population, and Community (20 items each). Focus heavily on Epidemiology (Vital Stats), COPAR, and the Universal Health Care Law. Part B (20%) is purely Health Ed & Research.",
    competencies: [
      {
        title: "Part A: Patient Care Competencies (80 Items)",
        weight: "80%",
        weightPercentage: 80,
        description: "Safe Quality Care: Individuals, Families, Populations, Community",
        topics: [
          {
            name: "I. Care of Individuals (20 items)",
            tags: ["CDs vs NCDs", "UHC"],
            subtopics: [
                "Non-Communicable Diseases (NCDs): Risk Factors, Prevention & Control",
                "Communicable Diseases (CDs): Control, Eradication & Elimination",
                "Universal Health Care (UHC) & Sustainable Development Goals (SDGs)"
            ]
          },
          {
            name: "II. Care of Families (20 items)",
            tags: ["Family Nursing Process"],
            subtopics: [
                "Care of Normal Families",
                "Care of Families at Risk",
                "Nursing Process: Assessment (1st/2nd Level), Diagnosis, Planning, Evaluation"
            ]
          },
          {
            name: "III. Care of Population Groups (20 items)",
            tags: ["Vulnerable Groups"],
            subtopics: [
                "Care of population groups with health priorities",
                "Specialized Interventions for Vulnerable Sectors"
            ]
          },
          {
            name: "IV. Care of the Community (20 items)",
            tags: ["High Yield", "Systems"],
            subtopics: [
                "PH Health Care Delivery System & DOH Programs",
                "Primary Health Care (PHC) & Primary Care",
                "Epidemiology, Vital Statistics, & Demography",
                "COPAR (Community Organizing Participatory Action Research)",
                "Disaster Nursing, School Nursing, Occupational Health",
                "FHSIS (Recording & Reporting) & Referral Systems"
            ]
          }
        ]
      },
      {
        title: "Part B: Empowering Competencies (20 Items)",
        weight: "20%",
        weightPercentage: 20,
        description: "Health Education & Research Application",
        topics: [
          {
            name: "Health Education",
            tags: ["10 items"],
            subtopics: ["Principles of Teaching & Learning", "Health Education Process in Community Setting"]
          },
          {
            name: "Utilization of Research",
            tags: ["10 items"],
            subtopics: ["Applying Research Findings to Community Practice", "Evidence-Based Practice in CHN"]
          }
        ]
      }
    ]
  },
  {
    id: 'np2',
    code: 'NP II',
    title: 'Maternal & Child Nursing',
    subtitle: 'Care of Mother, Child, and Family',
    icon: Baby,
    color: 'pink',
    totalItems: 100,
    strategy: "Split your focus evenly (50/50). Part A focuses on the Mother: deeply understand the physiological changes of pregnancy vs. complications (PIH, Bleeding). Part B focuses on the Child: master Growth & Development theories (Freud/Erikson) and specific age-group conditions (Congenital, Leukemia, IMCI).",
    competencies: [
      {
        title: "Part A: Maternal & Reproductive Health (50 Items)",
        weight: "50%",
        weightPercentage: 50,
        description: "Care of Mother, Adolescent, At Risk or With Problems",
        topics: [
          {
            name: "I. Care of Mother Before Birth (8 items)",
            tags: ["Assessment", "Adaptations"],
            subtopics: [
                "Normal Pregnancy Signs & Trimesters",
                "Physiologic & Psycho-Social Adaptations",
                "Prenatal Management & Assessment Goals",
                "Discomforts of Pregnancy & Relief Measures"
            ]
          },
          {
            name: "II. Care During Labor & Birth (8 items)",
            tags: ["Process", "Partograph"],
            subtopics: [
                "Signs (True vs False) & Stages of Labor (1-4)",
                "Partograph & Labor Concerns",
                "Cardinal Movements & Mechanisms",
                "Essential Intrapartum Newborn Care (EINC)"
            ]
          },
          {
            name: "III. Care Following Birth (8 items)",
            tags: ["Puerperium", "Family Planning"],
            subtopics: [
                "Normal Puerperium & Physiological Changes",
                "Nursing Care in Early Puerperal Period",
                "Family Planning: Natural, Temporary, Permanent"
            ]
          },
          {
            name: "IV. Complications of Childbearing (8 items)",
            tags: ["High Risk", "Critical"],
            subtopics: [
                "Pregnancy: PIH, GDM, Hyperemesis, Placenta Previa/Abruptio",
                "Labor: Preterm, Dystocia, PPROM, Uterine Rupture, Fetal Distress",
                "Postpartum: Hemorrhage, Sepsis, Mastitis, Psychosis"
            ]
          },
          {
            name: "V. Reproductive Health Problems (8 items)",
            tags: ["Fertility", "Genetics"],
            subtopics: [
                "Menstrual Cycle Physiology",
                "Fertility Assessment & Genetic Disorders",
                "Alternative to Childbirth & Reproductive Health Concepts"
            ]
          },
          {
            name: "VI. Ethico-moral Responsibilities (10 items)",
            tags: ["Management", "Ethics"],
            subtopics: [
                "Management of Resources",
                "Ethical principles in Maternal Care"
            ]
          }
        ]
      },
      {
        title: "Part B: Pediatric Nursing (50 Items)",
        weight: "50%",
        weightPercentage: 50,
        description: "Human Growth & Development, Care of Well & Sick Child",
        topics: [
          {
            name: "I. Human Growth & Development (10 items)",
            tags: ["Theorists", "Milestones"],
            subtopics: [
                "Freud (Psychosexual)",
                "Piaget (Cognitive)",
                "Erikson (Psychosocial)",
                "Bandura (Social Learning) & Bowlby (Attachment)"
            ]
          },
          {
            name: "II. Well-Client Care (15 items)",
            tags: ["Wellness", "Immunization"],
            subtopics: [
                "Care of Neonate to Adolescent (Well-Clients)",
                "Health Promotion & Disease Prevention",
                "Safety, Communication, and Immunization (EPI)"
            ]
          },
          {
            name: "III. Care of At-Risk/Sick Child (15 items)",
            tags: ["Pathophysiology", "Acute/Chronic"],
            subtopics: [
                "Neonatal: Prematurity, Sepsis, Hyperbilirubinemia, RDS",
                "Congenital: ASD/VSD/TOF, Cleft Lip/Palate, Hydrocephalus",
                "Toddler: Poisoning, Cerebral Palsy",
                "Preschool: Leukemia (ALL), Hemophilia, Wilms Tumor, Asthma",
                "School-Age: Diabetes Type 1, Rheumatic Fever, Dengue",
                "Adolescent: STDs, Anxiety, Depression"
            ]
          },
          {
            name: "IV. Legal & Collaboration (10 items)",
            tags: ["Teamwork", "Legal"],
            subtopics: [
                "Legal aspects of Pediatric Care",
                "Collaboration and Teamwork in Healthcare Settings"
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'np3',
    code: 'NP III',
    title: 'Med-Surg Nursing I',
    subtitle: 'Surgery, Oxygenation, Fluids, Immune & Cellular',
    icon: Stethoscope,
    color: 'blue',
    totalItems: 100,
    strategy: "High focus on Oxygenation and Fluids/Electrolytes (40 items total). Master ABG analysis and the distinction between ventilation/perfusion disorders. Don't neglect Pre/Intra/Post-op care basics.",
    competencies: [
      {
        title: "Part A: Safe Patient Care Competencies (80 Items)",
        weight: "80%",
        weightPercentage: 80,
        description: "Surgery, Respiratory, Fluids, Immunology, Oncology",
        topics: [
          {
            name: "I. Care of patients undergoing Surgery (10 items)",
            tags: ["Perioperative", "Safety"],
            subtopics: [
                "Pre-operative: Consent, Teaching, Preparation",
                "Intra-operative: Time-out, Safety, Anesthesia",
                "Post-operative: Monitoring, Complications (Dehiscence/Evisceration)"
            ]
          },
          {
            name: "II. Problems in Oxygenation (20 items)",
            tags: ["High Yield", "Airway"],
            subtopics: [
                "Lower Airways: Ventilation, Gas-exchange, & Perfusion disorders",
                "Upper Airways: Acute Rhinitis, Sinusitis, Pharyngitis",
                "Perfusion problems relative to Oxygenation"
            ]
          },
          {
            name: "III. Fluids, Electrolytes & Acid-Base (20 items)",
            tags: ["Must Know", "ABGs"],
            subtopics: [
                "Imbalances: Dehydration, Cellular dehydration, Sodium/Potassium imbalances",
                "Acid-Base: Analysis of ABGs (Resp/Metabolic Acidosis & Alkalosis)",
                "Urinary elimination imbalances related to fluid status"
            ]
          },
          {
            name: "IV. Infectious, Inflammatory, Immunologic (16 items)",
            tags: ["Infection Control", "Autoimmune"],
            subtopics: [
                "Infectious: Hepatitis, HIV-AIDS, Covid, STDs",
                "Inflammatory: Guillain-Barre, Crohn’s, Ulcerative Colitis",
                "Immunologic: Anaphylaxis, SLE, Multiple Sclerosis, AGN, Transplant Rejection"
            ]
          },
          {
            name: "V. Cellular Aberrations (14 items)",
            tags: ["Oncology", "Acute/Chronic"],
            subtopics: [
                "Reproductive tract (Breast, Uterus, Prostate)",
                "Blood Dyscrasias (ALL, AML)",
                "Respiratory (Lung Cancer)",
                "Gastrointestinal (Liver, Colon Cancer)"
            ]
          }
        ]
      },
      {
        title: "Part B: Enhancing Concepts (20 Items)",
        weight: "20%",
        weightPercentage: 20,
        description: "Health Education & Quality Improvement",
        topics: [
          {
            name: "Health Education (10 items)",
            tags: ["Teaching"],
            subtopics: ["Disease process education", "Diet & Exercise teaching", "Medication instruction"]
          },
          {
            name: "Quality Improvement (10 items)",
            tags: ["Safety", "Research"],
            subtopics: ["Medication safety", "Staffing & Falls prevention", "Research & Policy procedures"]
          }
        ]
      }
    ]
  },
  {
    id: 'np4',
    code: 'NP IV',
    title: 'Med-Surg Nursing II',
    subtitle: 'Nutrition, GI, Metabolism, Endocrine, Neuro',
    icon: Activity,
    color: 'orange',
    totalItems: 100,
    strategy: "The heavy hitters here are Metabolic & Endocrine (30 items). Master Diabetes (Types, DKA/HHS), Thyroid storms, and Adrenal crises. Neuro/Sensory is the next priority (25 items) involving GCS and safety.",
    competencies: [
      {
        title: "Part A: Safe Quality Care (80 Items)",
        weight: "80%",
        weightPercentage: 80,
        description: "Embedded Outcomes: Nutrition, Endocrine, Neuro/Sensory",
        topics: [
          {
            name: "I. Nutrition & Gastro-intestinal Disorders (25 items)",
            tags: ["Assessment", "Diet Therapy"],
            subtopics: [
                "Malnutrition (Obesity, Deficiencies)",
                "Oral and Esophageal Disorders",
                "Absorption/Elimination: Intestinal Mobility, Malabsorption Syndrome",
                "Structural & Obstructive Bowel Disorders"
            ]
          },
          {
            name: "II. Metabolic & Endocrine Disorders (30 items)",
            tags: ["High Yield", "Critical"],
            subtopics: [
                "Metabolic: Liver, Biliary tract, Pancreas (Diabetes Mellitus)",
                "Endocrine Hypo-function: Thyroid, Parathyroids, Adrenals, Pituitary",
                "Endocrine Hyper-function: Thyroid (Storm), Parathyroids, Adrenals, Pituitary"
            ]
          },
          {
            name: "III. Perception & Coordination (25 items)",
            tags: ["Neuro", "Musculo", "Sensory"],
            subtopics: [
                "Neuro: Degenerative (MS, Parkinson's, MG), CVA, Alzheimer's, Traumatic Lesions, Spinal Cord",
                "Musculoskeletal: Trauma, Metabolic Bone Disorders, Infections, Casts/Splints/Braces",
                "Vision: Cataract, Glaucoma, Retinal Detachment, Trauma",
                "Hearing & Balance: External, Middle, Inner Ear conditions"
            ]
          }
        ]
      },
      {
        title: "Part B: Program Outcomes (20 Items)",
        weight: "20%",
        weightPercentage: 20,
        description: "Professional Competencies & Development",
        topics: [
          {
            name: "Professional Responsibilities",
            tags: ["Outcomes 3-10"],
            subtopics: [
                "Health Education (5 items)",
                "Collaboration and Teamwork (5 items)",
                "Reporting and Recording (5 items)",
                "Personal and Professional Development (5 items)"
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'np5',
    code: 'NP V',
    title: 'Psych & Mental Health',
    subtitle: 'Care of Clients with Maladaptive Patterns of Behavior, Acute & Critical Care',
    icon: Brain,
    color: 'violet',
    totalItems: 100,
    strategy: "Master the split between Psychiatric Nursing (50 items) and Acute/Emergency Care (30 items). In Psych, focus heavily on Therapeutic Communication (never ask 'Why') and Psychopharmacology. In Emergency, master Triage, ABCs, and biological crises like ARDS, Shock, and DKA.",
    competencies: [
      {
        title: "Part A: Safe Patient Care Competencies (80 Items)",
        weight: "80%",
        weightPercentage: 80,
        description: "Mental Health Concepts, Nursing Process, Acute Biologic Crisis",
        topics: [
          {
            name: "I. Concepts of Mental Health and Illness (20 items)",
            tags: ["Models", "Psychopathology"],
            subtopics: [
                "State of Mental Health: Delivery System, Neuroanatomy, Patterns of Behavior",
                "Therapeutic Models: Psychoanalytic, Developmental (Erikson), Interpersonal (Sullivan, Peplau), Cognitive (Piaget, Beck), Stress (GAS)",
                "Psychopathology: Schizophrenia/Psychosis, Anxiety, Mood, Personality, Cognitive, Eating, Substance Disorders, Domestic Violence"
            ]
          },
          {
            name: "II. Nursing Process in Psych Care (30 items)",
            tags: ["mhGAP", "Treatment"],
            subtopics: [
                "Assessment & Diagnosis: Subjective/Objective Data, NANDA, DSM",
                "Planning/Implementation: Nurse-Client Relationship (Orientation, Working, Termination)",
                "mhGAP: Depression, PTSD, Psychosis, Epilepsy, Intellectual Disability, Suicide",
                "Treatment: ECT, Psychotherapies (CBT, Milieu), Art/Music Therapy",
                "Psychopharmacology: Antipsychotics, Anxiolytics, Antidepressants, Lithium (Mood Stabilizers)",
                "Evaluation: Outcome Based"
            ]
          },
          {
            name: "III. Acute Biologic Crisis (30 items)",
            tags: ["Critical Care", "Emergency"],
            subtopics: [
                "Altered Ventilatory: PE, ARDS, ALI, Pneumothorax, Respiratory Failure",
                "Altered Perfusion: IHD, Heart Failure, Cardiogenic Shock, Hypertensive Crisis, Arrhythmias",
                "Altered Elimination: GI Bleeding, Pancreatitis, DKA, HHS, Acute Renal Failure, Liver Failure",
                "Altered Perception: Acute Ischemic Stroke, Spinal Cord Injury, Seizures",
                "Multi-System: Shock, SIRS, MODS",
                "High Acuity/Emergency: ABCs, Trauma, Head Injury, Environmental (Heat, Poisoning, Drowning)"
            ]
          }
        ]
      },
      {
        title: "Part B: Enhancing Competencies (20 Items)",
        weight: "20%",
        weightPercentage: 20,
        description: "Communication, Documentation, Teamwork, Equipment",
        topics: [
          {
            name: "Communication & Documentation",
            tags: ["Therapeutic", "Legal"],
            subtopics: [
                "Nurse-Client Communication: Therapeutic components, modes, types",
                "Documentation: Elements and Methods of Charting in Psych"
            ]
          },
          {
            name: "Collaboration & Equipment",
            tags: ["Teamwork", "Tech"],
            subtopics: [
                "Concepts on Collaboration and Teamwork",
                "Acute Equipment: CPR Machine, Ventilator, Dialysis Machine, ABG Analysis Machine"
            ]
          }
        ]
      }
    ]
  }
];
