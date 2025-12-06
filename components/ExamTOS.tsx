
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, X, Download, 
  Stethoscope, Baby, Brain, Activity, 
  Users, Target, Layers, GraduationCap, ArrowRight,
  Sparkles, PieChart, Info, Circle, ChevronRight, BookOpen,
  ClipboardCheck, AlertCircle, CheckCircle2, BarChart3, GripHorizontal,
  Flame, ShieldAlert, Award
} from 'lucide-react';

// --- TYPES ---

interface Topic {
  name: string;
  subtopics: string[];
  tags: string[]; // e.g., "High Yield", "Must Know"
}

interface CompetencyArea {
  title: string; // e.g., "Part A: Care of Mother"
  weight: string; // e.g., "50 Items"
  weightPercentage: number; // e.g. 50
  description: string; // e.g., "Safe and Quality Nursing Care, Health Education"
  topics: Topic[];
}

interface ExamBlueprint {
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

// --- DATA: Based on PRC Annex A ---

const EXAM_BLUEPRINTS: ExamBlueprint[] = [
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

// --- THEME UTILS ---

const getTheme = (color: string) => {
  const themes: Record<string, any> = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/10',
      text: 'text-emerald-700 dark:text-emerald-300',
      textLight: 'text-emerald-600/80 dark:text-emerald-400/80',
      border: 'border-emerald-200 dark:border-emerald-800',
      shadow: 'shadow-emerald-500/10',
      accent: 'bg-emerald-500',
      gradient: 'from-emerald-500 to-teal-600',
      ring: 'ring-emerald-500/20',
      bar: 'bg-emerald-500',
    },
    pink: {
      bg: 'bg-pink-50 dark:bg-pink-900/10',
      text: 'text-pink-700 dark:text-pink-300',
      textLight: 'text-pink-600/80 dark:text-pink-400/80',
      border: 'border-pink-200 dark:border-pink-800',
      shadow: 'shadow-pink-500/10',
      accent: 'bg-pink-500',
      gradient: 'from-pink-500 to-rose-600',
      ring: 'ring-pink-500/20',
      bar: 'bg-pink-500',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/10',
      text: 'text-blue-700 dark:text-blue-300',
      textLight: 'text-blue-600/80 dark:text-blue-400/80',
      border: 'border-blue-200 dark:border-blue-800',
      shadow: 'shadow-blue-500/10',
      accent: 'bg-blue-500',
      gradient: 'from-blue-500 to-indigo-600',
      ring: 'ring-blue-500/20',
      bar: 'bg-blue-500',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/10',
      text: 'text-orange-700 dark:text-orange-300',
      textLight: 'text-orange-600/80 dark:text-orange-400/80',
      border: 'border-orange-200 dark:border-orange-800',
      shadow: 'shadow-orange-500/10',
      accent: 'bg-orange-500',
      gradient: 'from-orange-500 to-amber-600',
      ring: 'ring-orange-500/20',
      bar: 'bg-orange-500',
    },
    violet: {
      bg: 'bg-violet-50 dark:bg-violet-900/10',
      text: 'text-violet-700 dark:text-violet-300',
      textLight: 'text-violet-600/80 dark:text-violet-400/80',
      border: 'border-violet-200 dark:border-violet-800',
      shadow: 'shadow-violet-500/10',
      accent: 'bg-violet-500',
      gradient: 'from-violet-500 to-purple-600',
      ring: 'ring-violet-500/20',
      bar: 'bg-violet-500',
    },
  };
  return themes[color] || themes.emerald;
};

// --- COMPETENCY AUDIT TYPES ---
type CompetencyStatus = 'none' | 'review' | 'mastered';
interface CompetencyData {
    [topicId: string]: CompetencyStatus;
}

// --- BLUEPRINT MODAL COMPONENT ---

const BlueprintModal = ({ exam, onClose }: { exam: ExamBlueprint; onClose: () => void }) => {
  const theme = getTheme(exam.color);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-6 animate-fade-in">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-white/20 dark:bg-black/80 backdrop-blur-xl transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className="relative w-full h-full md:h-[90vh] md:max-w-5xl bg-white dark:bg-[#0f172a] rounded-none md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-none md:border border-slate-200 dark:border-white/5 animate-zoom-in duration-300"
        role="dialog"
      >
        
        {/* --- IMMERSIVE HEADER --- */}
        <div className={`shrink-0 relative overflow-hidden p-6 md:p-10 pb-16 transition-colors duration-500`}>
           {/* Dynamic Gradient Background */}
           <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-95`}></div>
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
           <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex items-start gap-5">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg border border-white/20 text-white shrink-0">
                      <exam.icon size={32} className="md:w-10 md:h-10" />
                  </div>
                  <div>
                      <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 rounded-full bg-white/20 border border-white/20 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest shadow-sm">
                              {exam.code}
                          </span>
                          <span className="flex items-center gap-1.5 text-white/90 text-xs font-bold uppercase tracking-wider">
                              <Layers size={14} /> PRC Annex A
                          </span>
                      </div>
                      <h2 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
                          {exam.title}
                      </h2>
                      <p className="text-white/80 font-medium text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
                          {exam.subtitle}
                      </p>
                  </div>
              </div>

              <div className="flex flex-col items-end gap-3 self-end md:self-auto w-full md:w-auto">
                  <button 
                      onClick={onClose}
                      className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md z-50 shadow-sm"
                  >
                      <X size={20} />
                  </button>
                  
                  {/* Strategy Pill - Hidden on small mobile to save space, visible on md+ */}
                  <div className="hidden md:block bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 max-w-sm hover:bg-white/15 transition-colors shadow-lg">
                      <div className="flex items-center gap-2 mb-2 text-amber-300">
                          <Sparkles size={16} className="fill-current animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Strategic Focus</span>
                      </div>
                      <p className="text-xs text-white/90 leading-relaxed font-medium">
                          {exam.strategy}
                      </p>
                  </div>
              </div>
           </div>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-[#0f172a] -mt-8 rounded-t-[2rem] relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            
            {/* Mobile Strategy (Visible only on mobile) */}
            <div className="md:hidden px-6 pt-8 pb-0">
                <div className={`p-4 rounded-2xl border ${theme.border} ${theme.bg} border-opacity-50`}>
                    <div className="flex items-center gap-2 mb-2 text-amber-500 dark:text-amber-400">
                        <Sparkles size={16} className="fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Strategic Focus</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {exam.strategy}
                    </p>
                </div>
            </div>

            <div className="p-6 md:p-10 grid grid-cols-1 xl:grid-cols-2 gap-8 md:gap-12">
                {exam.competencies.map((comp, idx) => (
                    <div key={idx} className="relative">
                        {/* Vertical Connector Line (Desktop) */}
                        <div className={`hidden xl:block absolute left-0 top-4 bottom-0 w-1 rounded-full ${theme.bg.replace('bg-', 'bg-opacity-50 bg-')}`}></div>
                        
                        <div className="xl:pl-8">
                            {/* Section Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                                <div>
                                    <h3 className="font-bold text-xl md:text-2xl text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                                        {comp.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-2">
                                        <Info size={14} /> {comp.description}
                                    </p>
                                </div>
                                <div className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border ${theme.border} shadow-sm shrink-0`}>
                                    <span className={`text-lg font-black ${theme.text}`}>{comp.weight}</span>
                                </div>
                            </div>

                            {/* Topics List */}
                            <div className="space-y-4">
                                {comp.topics.map((topic, tIdx) => (
                                    <div 
                                        key={tIdx} 
                                        className="group bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-lg dark:hover:shadow-black/50 transition-all duration-300 hover:scale-[1.01]"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base md:text-lg leading-snug">
                                                {topic.name}
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5 shrink-0">
                                                {topic.tags.map((tag, tagIdx) => (
                                                    <span key={tagIdx} className={`text-[10px] px-2 py-1 rounded-md uppercase font-bold tracking-wider border ${
                                                        tag.toLowerCase().includes('high') || tag.toLowerCase().includes('critical') || tag.toLowerCase().includes('must')
                                                        ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30' 
                                                        : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                                    }`}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <ul className="space-y-3">
                                            {topic.subtopics.map((sub, sIdx) => (
                                                <li key={sIdx} className="flex items-start gap-3 text-sm md:text-[15px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                                                    <span className={`mt-1.5 shrink-0 ${theme.text}`}>
                                                        <Circle size={6} fill="currentColor" />
                                                    </span>
                                                    <span>{sub}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] text-center shrink-0 z-30">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <Target size={12} />
                Based on PRC Nursing Board Resolution No. 2025-16 Annex A
            </p>
        </div>

      </div>
    </div>,
    document.body
  );
};

// --- COMPETENCY AUDIT MODAL (NEW FEATURE) ---

const CompetencyAuditModal = ({ onClose, data, onUpdate }: { onClose: () => void, data: CompetencyData, onUpdate: (id: string, status: CompetencyStatus) => void }) => {
    const [activeTab, setActiveTab] = useState(0); // Index of EXAM_BLUEPRINTS
    const activeExam = EXAM_BLUEPRINTS[activeTab];

    // Calculate completion for the active tab
    const tabStats = useMemo(() => {
        let total = 0;
        let mastered = 0;
        let review = 0;
        let gaps = 0;

        activeExam.competencies.forEach(c => {
            c.topics.forEach(t => {
                const id = `${activeExam.id}-${t.name}`; // Simple ID generation
                const status = data[id] || 'none';
                total++;
                if (status === 'mastered') mastered++;
                else if (status === 'review') review++;
                else gaps++;
            });
        });

        return { total, mastered, review, gaps, percentage: total === 0 ? 0 : Math.round((mastered / total) * 100) };
    }, [activeExam, data]);

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-6 animate-fade-in bg-slate-900/90 backdrop-blur-md">
            <div className="bg-white dark:bg-[#0f172a] w-full h-full md:h-[90vh] md:max-w-5xl md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden relative animate-zoom-in border border-slate-200 dark:border-white/5">
                
                {/* 1. Header (Command Center Style) */}
                <div className="relative bg-slate-900 dark:bg-black text-white p-6 md:p-8 shrink-0 overflow-hidden">
                    {/* Abstract Background FX */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-500/20 backdrop-blur-sm">
                                    Audit Mode
                                </span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none">
                                Competency <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Tracker</span>
                            </h2>
                            <p className="text-white/60 text-xs md:text-sm font-medium mt-1">Self-assess against the PRC Blueprint.</p>
                        </div>
                        
                        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Stats Dashboard Grid */}
                    <div className="grid grid-cols-4 gap-2 md:gap-4 mt-8">
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/10 flex flex-col items-center justify-center">
                            <span className="text-2xl md:text-3xl font-black text-white leading-none">{tabStats.mastered}</span>
                            <span className="text-[9px] md:text-[10px] font-bold text-emerald-400 uppercase tracking-wider mt-1">Mastered</span>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/10 flex flex-col items-center justify-center">
                            <span className="text-2xl md:text-3xl font-black text-white leading-none">{tabStats.review}</span>
                            <span className="text-[9px] md:text-[10px] font-bold text-amber-400 uppercase tracking-wider mt-1">Reviewing</span>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
                            <span className="text-2xl md:text-3xl font-black text-white leading-none relative z-10">{tabStats.gaps}</span>
                            <span className="text-[9px] md:text-[10px] font-bold text-red-400 uppercase tracking-wider mt-1 relative z-10">Critical Gaps</span>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/10 flex flex-col items-center justify-center">
                            <div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                    <path className="text-emerald-500 transition-all duration-1000 ease-out" strokeDasharray={`${tabStats.percentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                </svg>
                                <span className="absolute text-[9px] md:text-[10px] font-bold text-white">{tabStats.percentage}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Navigation Tabs (Pill Style) */}
                <div className="bg-slate-100 dark:bg-black/40 p-2 md:px-6 md:py-3 border-b border-slate-200 dark:border-white/5 overflow-x-auto no-scrollbar shrink-0">
                    <div className="flex gap-2 min-w-max">
                        {EXAM_BLUEPRINTS.map((exam, idx) => (
                            <button
                                key={exam.id}
                                onClick={() => setActiveTab(idx)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                    activeTab === idx 
                                    ? `bg-${exam.color}-500 text-white shadow-lg shadow-${exam.color}-500/30 scale-105` 
                                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-700'
                                }`}
                            >
                                {exam.code}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. The List (Scrollable) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-10 bg-slate-50 dark:bg-[#0B1121]">
                    {/* Competency Areas */}
                    {activeExam.competencies.map((comp, cIdx) => (
                        <div key={cIdx} className="space-y-4">
                            {/* Section Header */}
                            <div className="flex items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                                <div className={`p-1.5 rounded bg-${activeExam.color}-100 dark:bg-${activeExam.color}-500/20 text-${activeExam.color}-600 dark:text-${activeExam.color}-400`}>
                                    <Target size={16} />
                                </div>
                                <h3 className="text-sm font-black text-slate-700 dark:text-white uppercase tracking-widest">
                                    {comp.title}
                                </h3>
                            </div>
                            
                            {/* Topics Grid/List */}
                            <div className="grid grid-cols-1 gap-4">
                                {comp.topics.map((topic, tIdx) => {
                                    const id = `${activeExam.id}-${topic.name}`;
                                    const status = data[id] || 'none';

                                    return (
                                        <div key={tIdx} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex flex-col lg:flex-row gap-5 justify-between">
                                                
                                                {/* Content Side */}
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-slate-800 dark:text-white text-base leading-tight mb-2">
                                                            {topic.name}
                                                        </h4>
                                                        {/* Status Indicator for Mobile (Visual only) */}
                                                        <div className={`lg:hidden w-3 h-3 rounded-full shrink-0 ${
                                                            status === 'mastered' ? 'bg-emerald-500' : status === 'review' ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'
                                                        }`}></div>
                                                    </div>
                                                    
                                                    {/* SUBTOPICS PREVIEW (Pill Tags) */}
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {topic.subtopics.map((sub, sIdx) => (
                                                            <span key={sIdx} className="px-2 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-[10px] font-semibold rounded-md border border-slate-100 dark:border-slate-700/50">
                                                                {sub}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Action Side (Segmented Control) */}
                                                <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl shrink-0 self-start lg:self-center w-full lg:w-auto mt-2 lg:mt-0">
                                                    <button 
                                                        onClick={() => onUpdate(id, 'none')}
                                                        className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                                                            status === 'none' 
                                                            ? 'bg-white dark:bg-slate-800 text-red-500 shadow-sm ring-1 ring-red-500/20' 
                                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                                        }`}
                                                    >
                                                        <AlertCircle size={12} className={status === 'none' ? 'animate-pulse' : ''} /> Gap
                                                    </button>
                                                    <button 
                                                        onClick={() => onUpdate(id, 'review')}
                                                        className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                                                            status === 'review' 
                                                            ? 'bg-white dark:bg-slate-800 text-amber-500 shadow-sm ring-1 ring-amber-500/20' 
                                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                                        }`}
                                                    >
                                                        <BookOpen size={12} /> Review
                                                    </button>
                                                    <button 
                                                        onClick={() => onUpdate(id, 'mastered')}
                                                        className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                                                            status === 'mastered' 
                                                            ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm ring-1 ring-emerald-500/20' 
                                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                                        }`}
                                                    >
                                                        <CheckCircle2 size={12} /> Mastered
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>,
        document.body
    );
};

// --- MAIN COMPONENT ---

const ExamTOS: React.FC = () => {
  const [selectedExam, setSelectedExam] = useState<ExamBlueprint | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Competency Tracker State
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [competencyData, setCompetencyData] = useState<CompetencyData>({});

  // Load from Local Storage on Mount
  useEffect(() => {
      try {
          const saved = localStorage.getItem('pnle_competency_data');
          if (saved) {
              setCompetencyData(JSON.parse(saved));
          }
      } catch (e) {
          console.error("Failed to load competency data", e);
      }
  }, []);

  // Save to Local Storage on Change
  const updateCompetency = (id: string, status: CompetencyStatus) => {
      setCompetencyData(prev => {
          const newState = { ...prev, [id]: status };
          localStorage.setItem('pnle_competency_data', JSON.stringify(newState));
          return newState;
      });
  };

  // Calculate Overall Stats
  const overallStats = useMemo(() => {
      let totalTopics = 0;
      let gaps = 0;
      let mastered = 0;

      EXAM_BLUEPRINTS.forEach(ex => {
          ex.competencies.forEach(c => {
              c.topics.forEach(t => {
                  totalTopics++;
                  const id = `${ex.id}-${t.name}`;
                  const status = competencyData[id] || 'none';
                  if (status === 'none') gaps++;
                  if (status === 'mastered') mastered++;
              });
          });
      });

      const readiness = totalTopics === 0 ? 0 : Math.round((mastered / totalTopics) * 100);
      return { totalTopics, gaps, mastered, readiness };
  }, [competencyData]);

  // Enhanced Filter Logic
  const filteredExams = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return EXAM_BLUEPRINTS;

    return EXAM_BLUEPRINTS.filter(ex => {
        // Check Top Level
        if (ex.title.toLowerCase().includes(query) || ex.code.toLowerCase().includes(query) || ex.subtitle.toLowerCase().includes(query)) {
            return true;
        }
        // Check Competencies
        return ex.competencies.some(c => 
            c.title.toLowerCase().includes(query) || 
            c.description.toLowerCase().includes(query) ||
            c.topics.some(t => 
                t.name.toLowerCase().includes(query) || 
                t.subtopics.some(sub => sub.toLowerCase().includes(query))
            )
        );
    });
  }, [searchQuery]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-fade-in font-sans">
      
      {/* Header Section (Adaptive Light/Dark Mode) */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-[#0B1121] p-8 md:p-12 border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl transition-colors duration-500">
          
          {/* Light Mode Decorative Blurs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-100 dark:bg-pink-500/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none opacity-70 dark:opacity-100"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100 dark:bg-blue-500/10 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none opacity-70 dark:opacity-100"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
              <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/20 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest mb-4 text-slate-500 dark:text-slate-300">
                      <GraduationCap size={12} className="text-pink-500 dark:text-pink-400" />
                      Official 2026 Blueprint
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.9] mb-4 text-slate-900 dark:text-white">
                      Board Exam <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 dark:from-pink-400 dark:to-purple-400">Command Center</span>
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg font-medium leading-relaxed max-w-xl">
                      Your definitive map to the Philippine Nurse Licensure Examination. Based on the latest competencies and weight distributions.
                  </p>
              </div>

              <div className="w-full lg:w-auto flex flex-col gap-4">
                  {/* Enhanced Search Input */}
                  <div className="relative group w-full lg:w-80">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Search size={18} className="text-slate-400 group-focus-within:text-pink-500 transition-colors" />
                      </div>
                      <input 
                          type="text" 
                          placeholder="Search topics (e.g. 'IMCI')..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-12 pr-10 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/10 transition-all font-medium shadow-sm"
                      />
                      {searchQuery && (
                          <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                          >
                              <X size={16} />
                          </button>
                      )}
                  </div>
                  
                  <a 
                      href="https://www.prc.gov.ph/sites/default/files/2025-16%20annex%20A%20nurse.pdf" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors active:scale-95 shadow-lg shadow-slate-900/10 dark:shadow-white/10"
                  >
                      <Download size={18} />
                      Download Official PDF
                  </a>
              </div>
          </div>
      </div>

      {/* Empty State */}
      {filteredExams.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Search size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">No results found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Try searching for a different keyword like "COPAR" or "Diabetes".</p>
              <button 
                onClick={() => setSearchQuery('')} 
                className="mt-6 px-6 py-2 rounded-full bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold text-sm hover:bg-pink-100 dark:hover:bg-pink-500/20 transition-colors"
              >
                  Clear Filters
              </button>
          </div>
      )}

      {/* Blueprint Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredExams.map((exam) => {
              const theme = getTheme(exam.color);
              const parts = exam.competencies;
              
              return (
                  <button
                      key={exam.id}
                      onClick={() => setSelectedExam(exam)}
                      className={`group relative flex flex-col justify-between h-[380px] rounded-[2.5rem] p-8 border bg-white dark:bg-[#0f172a] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden text-left ${theme.border} shadow-sm hover:border-opacity-100 border-opacity-60 dark:border-opacity-40`}
                  >
                      {/* Gradient Hover Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`}></div>
                      
                      {/* Top Section */}
                      <div className="relative z-10 w-full">
                          <div className="flex justify-between items-start mb-6">
                              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-6 shadow-sm ${theme.bg} ${theme.text}`}>
                                  <exam.icon size={32} />
                              </div>
                              <div className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border flex items-center gap-1.5 ${theme.bg} ${theme.text} ${theme.border.replace('border', 'border-opacity-50')}`}>
                                  <Target size={12} /> {exam.code}
                              </div>
                          </div>

                          <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 dark:group-hover:from-white dark:group-hover:to-slate-300 transition-all">
                              {exam.title}
                          </h3>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {exam.subtitle}
                          </p>
                      </div>

                      {/* Bottom Section - Visual Weights */}
                      <div className="relative z-10 mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                                <PieChart size={12} /> Weight Distribution
                              </span>
                              <div className={`p-2 rounded-full ${theme.bg} ${theme.text} opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300`}>
                                  <ArrowRight size={16} />
                              </div>
                          </div>
                          
                          {/* Progress Bar Visualization */}
                          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                              {parts.map((part, pIdx) => (
                                  <div 
                                    key={pIdx}
                                    style={{ width: `${part.weightPercentage}%` }}
                                    className={`h-full ${pIdx === 0 ? theme.bar : 'bg-slate-300 dark:bg-slate-600'} transition-all duration-1000 relative group/bar`}
                                    title={part.title}
                                  >
                                      {/* Tooltip on hover of the specific bar segment */}
                                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                                          Part {pIdx === 0 ? 'A' : 'B'}: {part.weightPercentage}%
                                      </div>
                                  </div>
                              ))}
                          </div>
                          
                          <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400">
                              <span>Part A: {parts[0]?.weightPercentage}%</span>
                              <span>Part B: {parts[1]?.weightPercentage}%</span>
                          </div>
                      </div>
                  </button>
              );
          })}

          {/* --- COMPETENCY AUDIT CARD (6th Slot) --- */}
          {!searchQuery && (
              <button
                  onClick={() => setTrackerOpen(true)}
                  className="group relative flex flex-col justify-between h-[380px] rounded-[2.5rem] p-8 border bg-slate-900 text-white border-slate-700 shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden text-left"
              >
                  {/* Luxury Background */}
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                  <div className="absolute top-[-50%] right-[-50%] w-[100%] h-[100%] bg-gradient-to-b from-amber-400/10 to-transparent blur-3xl pointer-events-none"></div>

                  <div className="relative z-10 w-full">
                      <div className="flex justify-between items-start mb-6">
                          <div className="w-16 h-16 rounded-3xl flex items-center justify-center bg-slate-800 shadow-inner border border-slate-700 text-amber-400">
                              <ClipboardCheck size={32} />
                          </div>
                          <div className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border border-amber-500/30 bg-amber-500/10 text-amber-400 flex items-center gap-1.5 group-hover:bg-amber-500 group-hover:text-slate-900 transition-colors">
                              <GripHorizontal size={12} /> Audit Tool
                          </div>
                      </div>

                      <h3 className="text-2xl font-black text-white leading-tight mb-2">
                          Competency <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">Gap Analysis</span>
                      </h3>
                      <p className="text-sm font-medium text-slate-400 leading-relaxed">
                          Self-assess your readiness. Identify red flags and track your mastery of the blueprint.
                      </p>
                  </div>

                  <div className="relative z-10 mt-auto pt-6 border-t border-slate-800">
                      <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Overall Readiness</span>
                          <span className="text-lg font-black text-white">{overallStats.readiness}%</span>
                      </div>
                      
                      {/* Donut Chart Visualization (CSS Conic) */}
                      <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-full shrink-0 shadow-lg shadow-emerald-500/20" style={{ background: `conic-gradient(#10b981 ${overallStats.readiness}%, #334155 0)` }}>
                              <div className="absolute inset-1 bg-slate-900 rounded-full flex items-center justify-center">
                                  {overallStats.readiness === 100 ? (
                                      <CheckCircle2 size={16} className="text-emerald-500" />
                                  ) : (
                                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                  )}
                              </div>
                          </div>
                          <div className="flex-1 space-y-1">
                              <div className="flex justify-between text-[10px] font-medium text-slate-400">
                                  <span>Critical Gaps</span>
                                  <span className="text-white font-bold">{overallStats.gaps}</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${(overallStats.gaps / overallStats.totalTopics) * 100}%` }}></div>
                              </div>
                          </div>
                      </div>
                  </div>
              </button>
          )}
      </div>

      {/* Render Modals via Portal */}
      {selectedExam && (
          <BlueprintModal exam={selectedExam} onClose={() => setSelectedExam(null)} />
      )}

      {trackerOpen && (
          <CompetencyAuditModal 
              onClose={() => setTrackerOpen(false)} 
              data={competencyData} 
              onUpdate={updateCompetency} 
          />
      )}

    </div>
  );
};

export default ExamTOS;
