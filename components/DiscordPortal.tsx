import React, { useEffect, useState } from 'react';
import { Users, ExternalLink, MessageCircle } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface DiscordData {
  name: string;
  presence_count: number;
  instant_invite: string;
}

const DiscordPortal = () => {
  const { themeMode } = useTheme();
  const [data, setData] = useState<DiscordData | null>(null);
  const [loading, setLoading] = useState(true);

  // REPLACE THIS WITH YOUR ACTUAL SERVER ID
  const SERVER_ID = 'YOUR_SERVER_ID_HERE'; 

  useEffect(() => {
    const fetchDiscord = async () => {
      try {
        const res = await fetch(`https://discord.com/api/guilds/${SERVER_ID}/widget.json`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to load Discord stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscord();
    // Refresh count every 60 seconds
    const interval = setInterval(fetchDiscord, 60000);
    return () => clearInterval(interval);
  }, []);

  const isDark = themeMode === 'dark';

  if (!data && !loading) return null; // Hide if error

  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 group
      ${isDark 
        ? 'bg-slate-900/50 border-indigo-500/30 hover:border-indigo-500/60' 
        : 'bg-white/80 border-indigo-200 hover:border-indigo-400'
      }
    `}>
      {/* Background Glow */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full group-hover:bg-indigo-500/30 transition-all`} />

      <div className="relative z-10 flex flex-col h-full justify-between gap-4">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
            <MessageCircle size={24} />
          </div>
          {data?.presence_count && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {data.presence_count} Online
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Batch Crescere '26
          </h3>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Join the Clinical Ward for live study sessions and updates.
          </p>
        </div>

        {/* Action Button */}
        <a 
          href={data?.instant_invite || '#'} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white transition-all active:scale-95 shadow-lg shadow-indigo-500/25"
        >
          <Users size={16} />
          Enter Server
          <ExternalLink size={14} className="opacity-70" />
        </a>
      </div>
    </div>
  );
};

export default DiscordPortal;