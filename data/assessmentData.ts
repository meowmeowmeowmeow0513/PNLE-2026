
import { Brain, Baby, Activity, AlertTriangle, Thermometer, Smile } from 'lucide-react';

export interface AssessmentOption {
    label: string;
    score: number;
    description?: string;
}

export interface AssessmentQuestion {
    id: string;
    title: string;
    subtitle?: string;
    options: AssessmentOption[];
}

export interface AssessmentToolDef {
    id: string;
    title: string;
    subtitle: string;
    iconName: 'brain' | 'baby' | 'activity' | 'alert' | 'smile';
    color: 'blue' | 'pink' | 'emerald' | 'orange' | 'violet';
    questions: AssessmentQuestion[];
    getInterpretation: (score: number) => { label: string; color: string; notes?: string };
}

export const ASSESSMENT_TOOLS: AssessmentToolDef[] = [
    {
        id: 'gcs',
        title: 'Glasgow Coma Scale',
        subtitle: 'Neurological Baseline',
        iconName: 'brain',
        color: 'blue',
        questions: [
            {
                id: 'eye',
                title: 'Eye Opening Response',
                options: [
                    { label: 'Spontaneously', score: 4 },
                    { label: 'To Speech', score: 3 },
                    { label: 'To Pain', score: 2 },
                    { label: 'No Response', score: 1 },
                ]
            },
            {
                id: 'verbal',
                title: 'Verbal Response',
                options: [
                    { label: 'Oriented', score: 5 },
                    { label: 'Confused', score: 4 },
                    { label: 'Inappropriate Words', score: 3 },
                    { label: 'Incomprehensible Sounds', score: 2 },
                    { label: 'No Response', score: 1 },
                ]
            },
            {
                id: 'motor',
                title: 'Motor Response',
                options: [
                    { label: 'Obeys Commands', score: 6 },
                    { label: 'Localizes to Pain', score: 5 },
                    { label: 'Withdraws from Pain', score: 4 },
                    { label: 'Flexion (Decorticate)', score: 3 },
                    { label: 'Extension (Decerebrate)', score: 2 },
                    { label: 'No Response', score: 1 },
                ]
            }
        ],
        getInterpretation: (score) => {
            if (score <= 8) return { label: 'Severe Head Injury', color: 'red', notes: 'Coma. Intubate usually indicated.' };
            if (score <= 12) return { label: 'Moderate Head Injury', color: 'orange', notes: 'Monitor closely for deterioration.' };
            return { label: 'Mild Head Injury', color: 'green', notes: 'Minor or no impairment.' };
        }
    },
    {
        id: 'apgar',
        title: 'APGAR Score',
        subtitle: 'Newborn Assessment',
        iconName: 'baby',
        color: 'pink',
        questions: [
            {
                id: 'appearance', title: 'Appearance (Skin Color)',
                options: [
                    { label: 'Pink body and extremities', score: 2 },
                    { label: 'Pink body, Blue extremities (Acrocyanosis)', score: 1 },
                    { label: 'Blue or Pale all over', score: 0 },
                ]
            },
            {
                id: 'pulse', title: 'Pulse (Heart Rate)',
                options: [
                    { label: '> 100 bpm', score: 2 },
                    { label: '< 100 bpm', score: 1 },
                    { label: 'Absent', score: 0 },
                ]
            },
            {
                id: 'grimace', title: 'Grimace (Reflex Irritability)',
                options: [
                    { label: 'Cry or Active Withdrawal', score: 2 },
                    { label: 'Grimace / Some flexion', score: 1 },
                    { label: 'No response', score: 0 },
                ]
            },
            {
                id: 'activity', title: 'Activity (Muscle Tone)',
                options: [
                    { label: 'Active Movement', score: 2 },
                    { label: 'Some flexion', score: 1 },
                    { label: 'Limp / Flaccid', score: 0 },
                ]
            },
            {
                id: 'respiration', title: 'Respiration',
                options: [
                    { label: 'Strong Cry', score: 2 },
                    { label: 'Slow / Irregular', score: 1 },
                    { label: 'Absent', score: 0 },
                ]
            }
        ],
        getInterpretation: (score) => {
            if (score >= 7) return { label: 'Reassuring', color: 'green', notes: 'Normal newborn status.' };
            if (score >= 4) return { label: 'Moderately Abnormal', color: 'orange', notes: 'May need suctioning/stimulation.' };
            return { label: 'Critical', color: 'red', notes: 'Needs immediate resuscitation.' };
        }
    },
    {
        id: 'braden',
        title: 'Braden Scale',
        subtitle: 'Pressure Ulcer Risk',
        iconName: 'activity',
        color: 'emerald',
        questions: [
            { id: 'sensory', title: 'Sensory Perception', options: [{ label: 'No Impairment', score: 4 }, { label: 'Slightly Limited', score: 3 }, { label: 'Very Limited', score: 2 }, { label: 'Completely Limited', score: 1 }] },
            { id: 'moisture', title: 'Moisture', options: [{ label: 'Rarely Moist', score: 4 }, { label: 'Occasionally Moist', score: 3 }, { label: 'Very Moist', score: 2 }, { label: 'Constantly Moist', score: 1 }] },
            { id: 'activity', title: 'Activity', options: [{ label: 'Walks Frequently', score: 4 }, { label: 'Walks Occasionally', score: 3 }, { label: 'Chairfast', score: 2 }, { label: 'Bedfast', score: 1 }] },
            { id: 'mobility', title: 'Mobility', options: [{ label: 'No Limitations', score: 4 }, { label: 'Slightly Limited', score: 3 }, { label: 'Very Limited', score: 2 }, { label: 'Completely Immobile', score: 1 }] },
            { id: 'nutrition', title: 'Nutrition', options: [{ label: 'Excellent', score: 4 }, { label: 'Adequate', score: 3 }, { label: 'Inadequate', score: 2 }, { label: 'Very Poor', score: 1 }] },
            { id: 'friction', title: 'Friction & Shear', options: [{ label: 'No Problem', score: 3 }, { label: 'Potential Problem', score: 2 }, { label: 'Problem', score: 1 }] },
        ],
        getInterpretation: (score) => {
            if (score >= 19) return { label: 'No Risk', color: 'green' };
            if (score >= 15) return { label: 'Mild Risk', color: 'blue' };
            if (score >= 13) return { label: 'Moderate Risk', color: 'orange', notes: 'Implement turning schedule.' };
            if (score >= 10) return { label: 'High Risk', color: 'red', notes: 'Aggressive prevention needed.' };
            return { label: 'Severe Risk', color: 'red', notes: 'Maximum intervention required.' };
        }
    },
    {
        id: 'flacc',
        title: 'FLACC Scale',
        subtitle: 'Pediatric Pain Assessment',
        iconName: 'smile',
        color: 'violet',
        questions: [
            { id: 'face', title: 'Face', options: [{ label: 'No expression/smile', score: 0 }, { label: 'Occasional grimace/frown', score: 1 }, { label: 'Frequent quivering chin/clenched jaw', score: 2 }] },
            { id: 'legs', title: 'Legs', options: [{ label: 'Normal position/relaxed', score: 0 }, { label: 'Uneasy/restless/tense', score: 1 }, { label: 'Kicking/legs drawn up', score: 2 }] },
            { id: 'activity', title: 'Activity', options: [{ label: 'Lying quietly', score: 0 }, { label: 'Squirming/shifting', score: 1 }, { label: 'Arched/rigid/jerking', score: 2 }] },
            { id: 'cry', title: 'Cry', options: [{ label: 'No cry', score: 0 }, { label: 'Moans/whimpers', score: 1 }, { label: 'Crying steadily/screaming', score: 2 }] },
            { id: 'consolability', title: 'Consolability', options: [{ label: 'Content/relaxed', score: 0 }, { label: 'Reassured by touching', score: 1 }, { label: 'Difficult to console', score: 2 }] },
        ],
        getInterpretation: (score) => {
            if (score === 0) return { label: 'Relaxed / Comfortable', color: 'green' };
            if (score <= 3) return { label: 'Mild Discomfort', color: 'blue' };
            if (score <= 6) return { label: 'Moderate Pain', color: 'orange' };
            return { label: 'Severe Discomfort', color: 'red' };
        }
    },
    {
        id: 'mews',
        title: 'MEWS',
        subtitle: 'Modified Early Warning Score',
        iconName: 'alert',
        color: 'orange',
        questions: [
            { id: 'rr', title: 'Respiratory Rate', options: [{ label: '9-14', score: 0 }, { label: '15-20', score: 1 }, { label: '21-29', score: 2 }, { label: '>29 or <9', score: 3 }] },
            { id: 'hr', title: 'Heart Rate', options: [{ label: '51-100', score: 0 }, { label: '41-50 or 101-110', score: 1 }, { label: '111-129', score: 2 }, { label: '>129 or <40', score: 3 }] },
            { id: 'sbp', title: 'Systolic BP', options: [{ label: '101-199', score: 0 }, { label: '81-100', score: 1 }, { label: '71-80 or >200', score: 2 }, { label: '<70', score: 3 }] },
            { id: 'temp', title: 'Temperature (°C)', options: [{ label: '35.0-38.4', score: 0 }, { label: '<35 or >38.5', score: 2 }] }, // Simplified for UI
            { id: 'avpu', title: 'Consciousness (AVPU)', options: [{ label: 'Alert', score: 0 }, { label: 'Voice', score: 1 }, { label: 'Pain', score: 2 }, { label: 'Unresponsive', score: 3 }] },
        ],
        getInterpretation: (score) => {
            if (score <= 1) return { label: 'Stable', color: 'green' };
            if (score <= 3) return { label: 'Unstable - Monitor', color: 'yellow' };
            if (score <= 4) return { label: 'Critical - Inform Doctor', color: 'orange', notes: 'Urgent ward review.' };
            return { label: 'Emergency - STAT Call', color: 'red', notes: 'Transfer to HDU/ICU likely.' };
        }
    }
];
