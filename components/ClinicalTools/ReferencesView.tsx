
import React from 'react';
import { BookOpen, FileText, FlaskConical, HeartPulse } from 'lucide-react';
import { ClinicalToolCard } from './ClinicalToolCard';

const ReferenceCard: React.FC<{ title: string; subtitle: string; icon: React.ReactNode }> = ({ title, subtitle, icon }) => {
    return (
        <ClinicalToolCard
            title={title}
            subtitle={subtitle}
            icon={icon}
            badge="Reference"
        >
            <div className="h-40 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
                <FileText size={32} className="text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Static Reference</p>
                <p className="text-[10px] text-slate-400 mt-1">Interactive tables coming soon</p>
            </div>
        </ClinicalToolCard>
    );
};

const ReferencesView: React.FC = () => {
    return (
        <div className="space-y-8 animate-fade-in">
             <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 rounded-[2rem] p-6 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-2xl text-blue-600 dark:text-blue-300">
                        <BookOpen size={28} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Normal Values & Reference</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
                            Quick access to lab values, vital signs, and standard measurements.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                <ReferenceCard 
                    title="Lab Values" 
                    subtitle="CBC, Electrolytes, ABGs" 
                    icon={<FlaskConical size={24} className="text-emerald-500" />} 
                />
                
                <ReferenceCard 
                    title="Vital Signs" 
                    subtitle="Pediatric & Adult Normals" 
                    icon={<HeartPulse size={24} className="text-red-500" />} 
                />
            </div>
        </div>
    );
};

export default ReferencesView;
