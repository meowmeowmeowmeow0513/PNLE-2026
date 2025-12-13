
import React from 'react';
import { Brain, Baby, Activity } from 'lucide-react';
import { ClinicalToolCard } from './ClinicalToolCard';

// Placeholder Card to indicate upcoming features
const ComingSoonCard: React.FC<{ title: string; subtitle: string; icon: React.ReactNode }> = ({ title, subtitle, icon }) => {
    return (
        <ClinicalToolCard
            title={title}
            subtitle={subtitle}
            icon={icon}
            badge="Coming Soon"
        >
            <div className="h-40 flex flex-col items-center justify-center text-center p-4 opacity-60">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                    <Activity size={24} className="text-slate-400" />
                </div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Tool under development</p>
                <p className="text-xs text-slate-400 mt-1">Check back in the next update.</p>
            </div>
        </ClinicalToolCard>
    );
};

const AssessmentView: React.FC = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Intro / Filter (Optional, keeping simple for now) */}
            <div className="bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-500/20 rounded-[2rem] p-6 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-2xl text-purple-600 dark:text-purple-300">
                        <Activity size={28} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Assessment Scoring</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
                            Standardized scales for rapid clinical evaluation.
                        </p>
                    </div>
                </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                
                {/* GCS Placeholder */}
                <ComingSoonCard 
                    title="Glasgow Coma Scale" 
                    subtitle="Neurological Assessment" 
                    icon={<Brain size={24} className="text-pink-500" />} 
                />

                {/* APGAR Placeholder */}
                <ComingSoonCard 
                    title="APGAR Score" 
                    subtitle="Newborn Assessment" 
                    icon={<Baby size={24} className="text-blue-500" />} 
                />

                {/* Braden Scale Placeholder */}
                <ComingSoonCard 
                    title="Braden Scale" 
                    subtitle="Pressure Ulcer Risk" 
                    icon={<Activity size={24} className="text-orange-500" />} 
                />

            </div>
        </div>
    );
};

export default AssessmentView;
