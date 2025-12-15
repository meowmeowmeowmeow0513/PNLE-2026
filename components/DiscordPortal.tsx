
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
  const [error, setError] = useState(false);

  // Safely get Server ID
  const getServerId = () => {
    try {
        // @ts-ignore
        return import.meta?.env?.VITE_DISCORD_SERVER_ID || "";
    } catch {
        return "";
    }
  };

  const SERVER_ID = getServerId();

  useEffect(() => {
    if (!SERVER_ID) {
        setLoading(false);
        return;
    }

    const fetchDiscord = async () => {
      try {
        const res = await fetch(`https://discord.com/api/guilds/${SERVER_ID}/widget.json`);
        if (!res.ok) throw new Error("Widget disabled or invalid ID");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to load Discord stats", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscord();
    // Refresh count every 60 seconds
    const interval = setInterval(fetchDiscord, 60000);
    return () => clearInterval(interval);
  }, [SERVER_ID]);

  const isDark = themeMode === 'dark';

  if (loading) return <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>;

  // DEFAULT / FALLBACK DATA if API fails or ID missing
  // This ensures the component is never "white/invisible"
  const displayData = data || {
      name: "Study Community",
      presence_count: 0,
      instant_invite: "#"
  };

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
          {/* Only show live count if real data exists */}
          {data && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {displayData.presence_count} Online
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <h3 className={`text-lg font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {displayData.name}
          </h3>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Join the Clinical Ward for live study sessions and updates.
          </p>
        </div>

        {/* Action Button */}
        <a 
          href={displayData.instant_invite} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white transition-all active:scale-95 shadow-lg shadow-indigo-500/25"
        >
          <Users size={16} />
          {data ? "Enter Server" : "Join Discord"}
          <ExternalLink size={14} className="opacity-70" />
        </a>
      </div>
    </div>
  );
};

export default DiscordPortal;
