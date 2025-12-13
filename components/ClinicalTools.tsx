
import React, { useState } from 'react';
import ClinicalHeader, { ClinicalTab } from './ClinicalTools/ClinicalHeader';
import CalculatorsView from './ClinicalTools/CalculatorsView';
import AssessmentView from './ClinicalTools/AssessmentView';
import ReferencesView from './ClinicalTools/ReferencesView';

const ClinicalTools: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ClinicalTab>('calculation');

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-24 px-4 md:px-0 font-sans">
            {/* Unified Header */}
            <ClinicalHeader activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Dynamic View Rendering */}
            <div className="min-h-[500px]">
                {activeTab === 'calculation' && <CalculatorsView />}
                {activeTab === 'assessment' && <AssessmentView />}
                {activeTab === 'references' && <ReferencesView />}
            </div>
        </div>
    );
};

export default ClinicalTools;
