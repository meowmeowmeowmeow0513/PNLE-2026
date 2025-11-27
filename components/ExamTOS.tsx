
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Book, Info } from 'lucide-react';
import { ExamTopic } from '../types';

const ExamTOS: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('NP1');

  const topics: ExamTopic[] = [
    {
      id: 'NP1',
      title: 'Nursing Practice I',
      description: 'Community Health Nursing: Care of Individuals, Families, Population Groups and Community.',
      parts: [
        {
          title: 'Part A (80%, 80 items)',
          description: 'Application of program outcomes (1 and 2) will be embedded/ integrated in situations in community setting where the examinee can perform patient care competencies focusing on providing safe quality care to individuals, families, population groups and the community.',
          rows: [
            {
              topic: 'I. Care of Individuals in Community Setting',
              content: [
                'A. Care of Clients with Non-Communicable Diseases (Risks factors; Prevention and control)',
                'B. Care of Clients with Communicable Diseases (CDs) Control, Eradication and Elimination Of Communicable Diseases'
              ],
              weight: '20%',
              itemCount: 20
            },
            {
              topic: 'II. Care of families in the community',
              content: [
                'A. Care of Normal Families',
                'B. Care of families at risk'
              ],
              weight: '20%',
              itemCount: 20
            },
            {
              topic: 'III. Care of Population groups in community setting',
              content: [
                'A. Care of population groups with other health priorities'
              ],
              weight: '20%',
              itemCount: 20
            },
            {
              topic: 'IV. Care of the community',
              content: [
                'A. Philippine health care delivery system, Department of health',
                'B. Universal Health Care, Sustainable Development goals',
                'C. Primary Health care, Primary care',
                'D. Community Assessment, Community diagnosis, planning, intervention and evaluation',
                'E. Epidemiology, Vital Statistics, Demography',
                'F. Care of Community during Disaster',
                'G. School Nursing, Occupational Health and safety Nursing',
                'H. Community Organizing- Participatory Action research',
                'I. Recording and Reporting and Information Technology',
                'J. Referral system'
              ],
              weight: '20%',
              itemCount: 20
            }
          ]
        },
        {
          title: 'Part B (20%, 20 items)',
          description: 'Application of the following Program Outcomes (3-10) will be embedded/ integrated into the clinical situations on the 3 major subject areas where deemed most appropriate (focus on Health Education and Research).',
          rows: [
            {
              topic: 'Apply guidelines and principles of evidence-based practice in the delivery of care.',
              content: [
                'A. Health education in the care of individuals, families, population groups and community'
              ],
              weight: '10%',
              itemCount: 10
            },
            {
              topic: 'Practice nursing in accordance with existing laws, legal, ethical, and moral principles.',
              content: [
                'B. Utilization of Research in the care of individuals, families, population groups and community'
              ],
              weight: '10%',
              itemCount: 10
            }
          ]
        }
      ]
    },
    {
      id: 'NP2',
      title: 'Nursing Practice II',
      description: 'Maternal & Child Health: Care of Mother, Adolescent, and Human Growth & Development.',
      parts: [
        {
          title: 'Part A (50%, 50 items)',
          description: 'Care of Mother, Adolescent (Well-Clients), at Risk or with Problems (Acute or Chronic)',
          rows: [
            {
              topic: 'Care of Mother Before Birth',
              content: [
                'Normal Pregnancy',
                'Prenatal Management',
                'Discomfort of Pregnancy and Relief Measures'
              ],
              weight: '8%',
              itemCount: 8
            },
            {
              topic: 'Care of Mother During Labor and Birth',
              content: [
                'Theories of Labor',
                'Stages and Duration of Labor',
                'Essential Newborn Care'
              ],
              weight: '8%',
              itemCount: 8
            },
            {
              topic: 'Care of Mother Following Birth',
              content: [
                'Normal Puerperium',
                'Nursing Care in Early Puerperal Period'
              ],
              weight: '8%',
              itemCount: 8
            },
            {
              topic: 'Care of Mother with Complications of Childbearing',
              content: [
                'High Risk Conditions (Gestational Diabetes, Hypertension, etc.)',
                'Labor Complications (Dystocia, Preterm, etc.)',
                'Postpartum Complications (Hemorrhage, Sepsis, etc.)'
              ],
              weight: '8%',
              itemCount: 8
            },
            {
              topic: 'Care of Male and Female with Problems on Reproductive Health',
              content: [
                'Fertility Assessment',
                'Alternative to Childbirth'
              ],
              weight: '8%',
              itemCount: 8
            },
            {
              topic: 'Ethico-moral & Management',
              content: [
                'Management of Resources'
              ],
              weight: '10%',
              itemCount: 10
            }
          ]
        },
        {
          title: 'Part B (50%, 50 items)',
          description: 'Human Growth and Development & Care of the Child',
          rows: [
            {
              topic: 'Human Growth and Development',
              content: [
                'Theories of Growth and Development (Freud, Piaget, Bandura, Erikson, Bowlby)'
              ],
              weight: '10%',
              itemCount: 10
            },
            {
              topic: 'Care of Neonate, Infant, Toddler, Pre-school, School-age, Child and Adolescent (Well-Clients)',
              content: [
                'Health Promotion, Disease Prevention, Immunization'
              ],
              weight: '15%',
              itemCount: 15
            },
            {
              topic: 'Care of At-Risk Neonate, Infant, Toddler... with Alterations in Health Status',
              content: [
                'Neonatal Conditions (Sepsis, Congenital Anomalies)',
                'Toddler/Preschool/School-age/Adolescent Diseases'
              ],
              weight: '15%',
              itemCount: 15
            },
            {
              topic: 'Legal, Collaboration and Teamwork, Management',
              content: [
                'Legal',
                'Collaboration and Teamwork',
                'Practice beginning management and leadership skills'
              ],
              weight: '10%',
              itemCount: 10
            }
          ]
        }
      ]
    },
    {
      id: 'NP3',
      title: 'Nursing Practice III',
      description: 'Medical-Surgical Nursing I: Perioperative, Oxygenation, Fluids, Infectious & Inflammatory.',
      parts: [
        {
          title: 'Part A (80%, 80 items)',
          description: 'Safe Patient Care Competencies',
          rows: [
            {
              topic: 'A. Care of patients undergoing Surgery',
              content: [
                '1. Pre-operative',
                '2. Intra-operative',
                '3. Post-operative'
              ],
              weight: '10%',
              itemCount: 10
            },
            {
              topic: 'B. Care of patients with problems in Oxygenation',
              content: [
                '1. Lower Airways (Ventilation, Gas-exchange, Perfusion disorders)',
                '2. Upper Airways',
                '3. Perfusion problems'
              ],
              weight: '20%',
              itemCount: 20
            },
            {
              topic: 'C. Care of patients with problems in Fluids and Electrolytes and Acid-Base Balance',
              content: [
                '1. Fluid and electrolyte imbalances',
                '2. Acid-base imbalances (ABG Analysis, Acidosis/Alkalosis)',
                '3. Urinary elimination imbalances'
              ],
              weight: '20%',
              itemCount: 20
            },
            {
              topic: 'D. Care of patients with infectious, inflammatory, and immunologic disorders',
              content: [
                '1. Infectious (Hepatitis, HIV-AIDS, Covid, STDs)',
                '2. Inflammatory (Guillain-Barre, Crohn\'s, etc.)',
                '3. Immunologic (Anaphylactic shock, SLE, etc.)'
              ],
              weight: '14%',
              itemCount: 14
            },
            {
              topic: 'E. Care of patients with cellular aberrations',
              content: [
                '1. Reproductive tract',
                '2. Blood (ALL, AML)',
                '3. Respiratory (Lungs)',
                '4. GIT (Liver, Colon)'
              ],
              weight: '16%',
              itemCount: 16
            }
          ]
        },
        {
          title: 'Part B (20%, 20 items)',
          description: 'Enhancing, Empowering, Enabling Concepts',
          rows: [
            {
              topic: 'Apply guidelines and principles of evidence-based practice',
              content: [
                'A. Health Education (Disease process, Diet, Meds)'
              ],
              weight: '10%',
              itemCount: 10
            },
            {
              topic: 'Uphold the nursing core values in the practice of the profession',
              content: [
                'A. Quality Improvement (Medications, Staffing, Falls, Research)'
              ],
              weight: '10%',
              itemCount: 10
            }
          ]
        }
      ]
    },
    {
      id: 'NP4',
      title: 'Nursing Practice IV',
      description: 'Medical-Surgical Nursing II: Nutrition, GI, Metabolism, Endocrine, Perception & Coordination.',
      parts: [
        {
          title: 'Part A (80%, 80 items)',
          description: 'Care of Client with Problems in Nutrition, GI, Metabolism, Endocrine, Perception & Coordination',
          rows: [
            {
              topic: 'A. Nutrition and Gastro-Intestinal Disturbances',
              content: [
                '1. Malnutrition (Obesity, etc.)',
                '2. Oral and Esophageal Disorder',
                '3. Absorption and Elimination (Intestinal Mobility, Malabsorption, Obstruction)'
              ],
              weight: '25%',
              itemCount: 25
            },
            {
              topic: 'B. Metabolism and Endocrine Disorders',
              content: [
                '1. Metabolic Disorders (Liver, Biliary, Pancreas/Diabetes)',
                '2. Endocrine Disorders (Hypo/Hyper-function of Thyroid, Adrenal, Pituitary)'
              ],
              weight: '25%',
              itemCount: 25
            },
            {
              topic: 'C. Perception and Coordination Disturbances',
              content: [
                '1. Neurologic (Degenerative, CVD, Trauma)',
                '2. Musculo-skeletal dysfunction (Trauma, Infection)',
                '3. Vision Disorders',
                '4. Hearing and Balance Disorders'
              ],
              weight: '30%',
              itemCount: 30
            }
          ]
        },
        {
          title: 'Part B (20%, 20 items)',
          description: 'Program Outcomes',
          rows: [
            {
              topic: 'D. Program Outcomes No. 3-10',
              content: [
                'A. Health Education (5 items)',
                'B. Collaboration and Teamwork (5 items)',
                'C. Reporting and Recording (5 items)',
                'D. Personal and Professional Development (5 items)'
              ],
              weight: '20%',
              itemCount: 20
            }
          ]
        }
      ]
    },
    {
      id: 'NP5',
      title: 'Nursing Practice V',
      description: 'Psychiatric Nursing & Acute/Emergency Care.',
      parts: [
        {
          title: 'Part A (80%, 80 items)',
          description: 'Care of Clients with Maladaptive Patterns of Behavior & Acute Biological Crisis',
          rows: [
            {
              topic: 'Concepts of Mental Health and Mental Illness',
              content: [
                'A. State of Mental Health',
                'B. Psychobiologic Bases of Behavior (Neuroscience)',
                'C. Therapeutic Models',
                'D. Understanding Stress'
              ],
              weight: '20%',
              itemCount: 20
            },
            {
              topic: 'Psychopathology: Etiology and Psychodynamics',
              content: [
                'Schizophrenia, Anxiety, Mood, Personality, Cognitive Disorders',
                'Substance Related, Domestic Violence'
              ],
              weight: '10%',
              itemCount: 10
            },
            {
              topic: 'Nursing Process in Psychiatric - Mental Health Care',
              content: [
                'A. Assessment',
                'B. Nursing Diagnosis',
                'C. Planning',
                'D. Treatment Modalities',
                'E. Evaluation'
              ],
              weight: '30%',
              itemCount: 30
            },
            {
              topic: 'Concepts on Acute Biologic Crisis',
              content: [
                'A. Altered Ventilatory Function',
                'B. Altered Tissue Perfusion (Shock, Heart Failure)',
                'C. Altered Elimination (Renal Failure)',
                'D. Altered Perception (Stroke, Seizures)',
                'E. Multi-System Problems (SIRS, MODS)',
                'F. High Acuity & Emergency Situations'
              ],
              weight: '30%',
              itemCount: 30
            }
          ]
        },
        {
          title: 'Part B (20%, 20 items)',
          description: 'Enhancing, Empowering, Enabling Concepts',
          rows: [
            {
              topic: 'Communication, Documentation, Collaboration, Equipment',
              content: [
                'A. Nurse Client Communication',
                'B. Documentation in Psychiatric Nursing',
                'C. Concepts on Collaboration and Teamwork',
                'D. Equipment used for acute, high acuity and emergency cases'
              ],
              weight: '20%',
              itemCount: 20
            }
          ]
        }
      ]
    }
  ];

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Enhanced Table of Specifications</h2>
          <p className="text-slate-500 mt-1">Comprehensive breakdown of key competencies for the August 2026 PNLE.</p>
        </div>
        <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-500 shadow-sm flex items-center gap-2">
          <Info size={14} />
          PQF Level: 6
        </div>
      </div>

      <div className="space-y-6">
        {topics.map((topic) => (
          <div 
            key={topic.id} 
            className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${openId === topic.id ? 'border-teal-400 ring-1 ring-teal-100 shadow-md' : 'border-slate-200 shadow-sm hover:border-teal-200'}`}
          >
            <button
              onClick={() => toggle(topic.id)}
              className="w-full flex items-center justify-between p-5 text-left focus:outline-none bg-white hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg transition-colors ${openId === topic.id ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-500'}`}>
                  <Book size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{topic.title}</h3>
                  <p className="text-sm text-slate-500">{topic.description}</p>
                </div>
              </div>
              <div className={`transform transition-transform duration-300 ${openId === topic.id ? 'rotate-180 text-teal-500' : 'text-slate-400'}`}>
                <ChevronDown />
              </div>
            </button>

            <div 
              className={`transition-all duration-300 ease-in-out ${
                openId === topic.id ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-6 pt-0 border-t border-slate-100">
                {topic.parts.map((part, pIdx) => (
                  <div key={pIdx} className="mt-6">
                    <div className="flex items-center gap-3 mb-3 pl-2 border-l-4 border-teal-400">
                      <h4 className="font-bold text-slate-800 text-lg">{part.title}</h4>
                    </div>
                    {part.description && (
                       <p className="text-sm text-slate-500 italic mb-4 pl-3">{part.description}</p>
                    )}

                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs">
                          <tr>
                            <th className="px-6 py-3 w-1/3">Topics & Competencies</th>
                            <th className="px-6 py-3 w-1/3">Content</th>
                            <th className="px-6 py-3 text-center whitespace-nowrap">Weight</th>
                            <th className="px-6 py-3 text-center whitespace-nowrap">No. of Items</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {part.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 align-top font-semibold text-slate-700">
                                {row.topic}
                              </td>
                              <td className="px-6 py-4 align-top text-slate-600">
                                <ul className="list-disc list-outside ml-4 space-y-1">
                                  {row.content.map((item, i) => (
                                    <li key={i}>{item}</li>
                                  ))}
                                </ul>
                              </td>
                              <td className="px-6 py-4 align-top text-center font-medium text-slate-700">
                                {row.weight}
                              </td>
                              <td className="px-6 py-4 align-top text-center font-bold text-teal-600">
                                {row.itemCount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamTOS;
