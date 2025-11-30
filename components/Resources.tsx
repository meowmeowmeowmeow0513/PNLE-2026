import React from 'react';
import { ExternalLink, Video, FileText, Layers, Folder, Plus } from 'lucide-react';
import { ResourceLink } from '../types';

const Resources: React.FC = () => {
  const resources: ResourceLink[] = [
    {
      id: '1',
      title: 'Google Drive Folder',
      description: 'Access reviewers, PDFs, and shared class folders from previous batches.',
      url: '#',
      iconName: 'drive'
    },
    {
      id: '2',
      title: 'Video Lectures',
      description: 'High-yield lectures and rationalization videos on YouTube.',
      url: 'https://youtube.com',
      iconName: 'video'
    },
    {
      id: '3',
      title: 'Nurseslabs',
      description: 'Nursing care plans, practice quizzes, and study guides.',
      url: 'https://nurseslabs.com',
      iconName: 'file'
    },
    {
      id: '4',
      title: 'RNPedia',
      description: 'Comprehensive nursing notes and drug study references.',
      url: 'https://rnpedia.com',
      iconName: 'book'
    },
    {
      id: '5',
      title: 'AnkiWeb Decks',
      description: 'Shared flashcard decks for spaced repetition review.',
      url: 'https://ankiweb.net',
      iconName: 'layers'
    }
  ];

  const getIcon = (name: string) => {
    switch (name) {
      case 'drive': return <Folder size={32} className="text-blue-500" />;
      case 'video': return <Video size={32} className="text-red-500" />;
      case 'file': return <FileText size={32} className="text-pink-500" />;
      case 'book': return <FileText size={32} className="text-orange-500" />; // Fallback icon
      case 'layers': return <Layers size={32} className="text-slate-700 dark:text-slate-200" />;
      default: return <ExternalLink size={32} className="text-slate-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">Resource Hub</h2>
        <p className="text-slate-500 dark:text-slate-400 transition-colors">Curated links and tools for your review.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <a
            key={resource.id}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-start gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-pink-100 dark:hover:border-pink-800/50 group"
          >
            <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg group-hover:bg-pink-50 dark:group-hover:bg-pink-500/10 transition-colors">
              {getIcon(resource.iconName)}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1 flex items-center gap-2 transition-colors">
                {resource.title}
                <ExternalLink size={14} className="text-slate-300 group-hover:text-pink-400 transition-colors" />
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed transition-colors">
                {resource.description}
              </p>
            </div>
          </a>
        ))}

        {/* Add New Placeholder */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-3 min-h-[200px] opacity-70 cursor-not-allowed transition-colors">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm transition-colors">
            <Plus size={24} className="text-slate-400 dark:text-slate-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-500 dark:text-slate-400 text-lg transition-colors">Add Custom Resource</h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 transition-colors">Feature coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;
