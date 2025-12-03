
import { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '../firebase';
import { doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { UserGamificationStats, Mission, MissionActionType, BennerRank } from '../types';
import confetti from 'canvas-confetti';

// --- CONFIGURATION: BENNER'S CAREER LADDER ---
export const CAREER_LADDER = [
  { 
    id: 0, 
    title: 'Novice' as BennerRank, 
    minXP: 0, 
    maxXP: 499, 
    color: 'slate',
    description: 'The Foundation. Rigid adherence to rules and plans.' 
  },
  { 
    id: 1, 
    title: 'Advanced Beginner' as BennerRank, 
    minXP: 500, 
    maxXP: 1499, 
    color: 'blue',
    description: 'The Awakening. Recognizing recurring meaningful patterns.' 
  },
  { 
    id: 2, 
    title: 'Competent' as BennerRank, 
    minXP: 1500, 
    maxXP: 2999, 
    color: 'emerald',
    description: 'The Professional. Efficiency and long-term planning.' 
  },
  { 
    id: 3, 
    title: 'Proficient' as BennerRank, 
    minXP: 3000, 
    maxXP: 4999, 
    color: 'violet',
    description: 'The Specialist. Holistic understanding and decision making.' 
  },
  { 
    id: 4, 
    title: 'Expert' as BennerRank, 
    minXP: 5000, 
    maxXP: 999999, 
    color: 'amber',
    description: 'The Topnotcher. Intuitive grasp of complex situations.' 
  },
];

// --- MISSION TEMPLATES ---
const DAILY_TEMPLATES: Omit<Mission, 'current' | 'isCompleted' | 'isClaimed' | 'type' | 'lastReset'>[] = [
    { id: 'd1', label: 'Complete 3 Tasks', target: 3, xpReward: 15, actionType: 'complete_task', icon: 'check' },
    { id: 'd2', label: 'Finish 1 Focus Session', target: 1, xpReward: 20, actionType: 'finish_pomodoro', icon: 'clock' },
    { id: 'd3', label: 'Daily Login', target: 1, xpReward: 5, actionType: 'login', icon: 'login' },
];

const WEEKLY_TEMPLATES: Omit<Mission, 'current' | 'isCompleted' | 'isClaimed' | 'type' | 'lastReset'>[] = [
    { id: 'w1', label: 'Complete 30 Tasks', target: 30, xpReward: 100, actionType: 'complete_task', icon: 'list' },
    { id: 'w2', label: 'Complete 5 Focus Sessions', target: 5, xpReward: 75, actionType: 'finish_pomodoro', icon: 'brain' },
    { id: 'w3', label: 'Perfect Week (7 Logins)', target: 7, xpReward: 150, actionType: 'login', icon: 'calendar' },
];

export const useGamification = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<UserGamificationStats | null>(null);
  const [loading, setLoading] = useState(true);

  // --- HELPERS ---
  const getTodayString = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  };

  const getYesterdayString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  };

  const getWeekStartString = () => {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      const monday = new Date(d.setDate(diff));
      const offset = monday.getTimezoneOffset() * 60000;
      return new Date(monday.getTime() - offset).toISOString().split('T')[0];
  };

  // --- 1. REAL-TIME LISTENER & INTEGRITY CHECKS ---
  useEffect(() => {
    if (!currentUser) return;

    const userStatsRef = doc(db, 'users', currentUser.uid, 'stats', 'gamification');

    const unsubscribe = onSnapshot(userStatsRef, async (docSnap) => {
      const today = getTodayString();
      const yesterday = getYesterdayString();
      const thisWeek = getWeekStartString();

      // A. DEFAULT STATE
      let currentData: UserGamificationStats = {
          currentStreak: 0,
          bestStreak: 0,
          lastStudyDate: '',
          streakFreezes: 1,
          lastFreezeUsedDate: null,
          totalSessions: 0,
          totalXP: 0,
          dailyMissions: [],
          weeklyMissions: [],
          lastMissionReset: '',
          lastWeeklyReset: '',
      };

      if (docSnap.exists()) {
          const data = docSnap.data();
          currentData = { ...currentData, ...data };
      }

      // --- B. BUSINESS LOGIC CHECKS ---
      let needsUpdate = false;
      let updates: Partial<UserGamificationStats> = {};

      // 1. STREAK MAINTENANCE
      if (currentData.lastStudyDate !== today && currentData.lastStudyDate !== yesterday && currentData.currentStreak > 0) {
          if (currentData.streakFreezes > 0) {
              updates.streakFreezes = currentData.streakFreezes - 1;
              updates.lastFreezeUsedDate = today;
              updates.lastStudyDate = yesterday; 
              needsUpdate = true;
          } else {
              updates.currentStreak = 0;
              needsUpdate = true;
          }
      }

      // 2. MISSION RESETS (Daily)
      if (currentData.lastMissionReset !== today) {
          updates.dailyMissions = DAILY_TEMPLATES.map(t => ({
              ...t,
              current: 0,
              isCompleted: false,
              isClaimed: false,
              type: 'daily'
          }));
          updates.lastMissionReset = today;
          needsUpdate = true;
      }

      // 3. MISSION RESETS (Weekly)
      if (currentData.lastWeeklyReset !== thisWeek) {
          updates.weeklyMissions = WEEKLY_TEMPLATES.map(t => ({
              ...t,
              current: 0,
              isCompleted: false,
              isClaimed: false,
              type: 'weekly'
          }));
          updates.lastWeeklyReset = thisWeek;
          needsUpdate = true;
      }

      // 4. TEMPLATE SYNCHRONIZATION (Force Update if Code changes targets/labels)
      const syncMissions = (stored: Mission[], templates: typeof DAILY_TEMPLATES) => {
          let hasChanges = false;
          const synced = stored.map(s => {
              const t = templates.find(temp => temp.id === s.id);
              if (t) {
                  // If Target, Label, or Reward changed in code vs DB
                  if (s.target !== t.target || s.xpReward !== t.xpReward || s.label !== t.label) {
                      hasChanges = true;
                      const isNowCompleted = s.current >= t.target;
                      return { 
                          ...s, 
                          ...t, 
                          isCompleted: isNowCompleted,
                          isClaimed: s.isClaimed 
                      }; 
                  }
              }
              return s;
          });
          return { hasChanges, synced };
      };

      // Check Daily
      const dailySync = syncMissions(currentData.dailyMissions || [], DAILY_TEMPLATES);
      if (dailySync.hasChanges) {
          updates.dailyMissions = dailySync.synced;
          needsUpdate = true;
      }

      // Check Weekly
      const weeklySync = syncMissions(currentData.weeklyMissions || [], WEEKLY_TEMPLATES);
      if (weeklySync.hasChanges) {
          updates.weeklyMissions = weeklySync.synced;
          needsUpdate = true;
      }

      // --- C. SYNC ---
      if (needsUpdate || !docSnap.exists()) {
          const merged = { ...currentData, ...updates };
          setStats(merged);
          if (!docSnap.exists()) {
              await setDoc(userStatsRef, merged);
          } else {
              await updateDoc(userStatsRef, updates);
          }
      } else {
          setStats(currentData);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // --- 2. ACTION TRACKING ENGINE ---
  const trackAction = useCallback(async (action: MissionActionType) => {
    if (!currentUser) return;
    
    // --- XP BALANCING ---
    // Login = 0 Base XP (Reward comes from Mission Claim)
    // Task = 5 XP
    // Pomodoro = 15 XP
    let baseXP = 0;
    if (action === 'complete_task') baseXP = 5;
    if (action === 'finish_pomodoro') baseXP = 15;
    
    const userStatsRef = doc(db, 'users', currentUser.uid, 'stats', 'gamification');

    try {
        const today = getTodayString();
        // We do a transaction to ensure atomicity
        await import('firebase/firestore').then(async ({ runTransaction }) => {
            await runTransaction(db, async (transaction) => {
                const sfDoc = await transaction.get(userStatsRef);
                if (!sfDoc.exists()) return;

                const data = sfDoc.data() as UserGamificationStats;
                const updates: any = {};
                let shouldUpdate = false;

                // 1. ADD XP
                if (baseXP > 0) {
                    updates.totalXP = (data.totalXP || 0) + baseXP;
                    shouldUpdate = true;
                }

                // 2. UPDATE STREAK (If first action of day)
                if (data.lastStudyDate !== today && (action === 'complete_task' || action === 'finish_pomodoro' || action === 'login')) {
                    const newStreak = (data.currentStreak || 0) + 1;
                    updates.currentStreak = newStreak;
                    updates.bestStreak = Math.max(newStreak, data.bestStreak || 0);
                    updates.lastStudyDate = today;
                    updates.totalSessions = (data.totalSessions || 0) + 1;
                    
                    // Bonus: Every 7 days, get a freeze
                    if (newStreak % 7 === 0) {
                        updates.streakFreezes = (data.streakFreezes || 0) + 1;
                    }
                    shouldUpdate = true;
                }

                // 3. UPDATE MISSIONS
                const updateList = (list: Mission[]) => {
                    return list.map(m => {
                        if (m.actionType === action && !m.isCompleted) {
                            // CRITICAL FIX: Prevent Login Spamming
                            // Only allow 'login' mission increment if we haven't logged in today yet
                            // OR if we just updated the streak above (meaning it was the first action)
                            if (action === 'login' && data.lastStudyDate === today) {
                                // If the DB says we already studied today, we skip incrementing the login counter
                                return m; 
                            }

                            const newCurrent = m.current + 1;
                            shouldUpdate = true;
                            return { ...m, current: newCurrent, isCompleted: newCurrent >= m.target };
                        }
                        return m;
                    });
                };

                const newDaily = updateList(data.dailyMissions || []);
                const newWeekly = updateList(data.weeklyMissions || []);

                if (shouldUpdate) {
                    updates.dailyMissions = newDaily;
                    updates.weeklyMissions = newWeekly;
                    transaction.update(userStatsRef, updates);
                }
            });
        });
    } catch (e) {
        console.error("Transaction failed: ", e);
    }

  }, [currentUser]); 

  // --- 3. CLAIM REWARD SYSTEM ---
  const claimMission = useCallback(async (missionId: string, type: 'daily' | 'weekly') => {
      if (!currentUser || !stats) return;

      const list = type === 'daily' ? [...stats.dailyMissions] : [...stats.weeklyMissions];
      const missionIndex = list.findIndex(m => m.id === missionId);

      if (missionIndex !== -1) {
          const mission = list[missionIndex];
          if (mission.isCompleted && !mission.isClaimed) {
              mission.isClaimed = true;
              
              const newTotalXP = stats.totalXP + mission.xpReward;

              confetti({
                  particleCount: 150,
                  spread: 60,
                  origin: { y: 0.7 },
                  colors: ['#ec4899', '#a855f7', '#fbbf24']
              });

              const updates: Partial<UserGamificationStats> = {
                  totalXP: newTotalXP,
                  [type === 'daily' ? 'dailyMissions' : 'weeklyMissions']: list
              };

              await updateDoc(doc(db, 'users', currentUser.uid, 'stats', 'gamification'), updates);
          }
      }
  }, [currentUser, stats]);

  // --- 4. DERIVED DATA (RANKS) ---
  const rankData = useMemo(() => {
    const xp = stats?.totalXP || 0;
    const currentRank = CAREER_LADDER.find(r => xp >= r.minXP && xp <= r.maxXP) || CAREER_LADDER[CAREER_LADDER.length - 1];
    const nextRank = CAREER_LADDER.find(r => r.id === currentRank.id + 1) || null;
    
    let progress = 0;
    let xpToNext = 0;

    if (nextRank) {
        const range = currentRank.maxXP - currentRank.minXP; 
        const earned = xp - currentRank.minXP;
        progress = Math.min(100, Math.max(0, (earned / range) * 100));
        xpToNext = nextRank.minXP - xp;
    } else {
        progress = 100;
        xpToNext = 0;
    }

    return {
        currentRank,
        nextRank,
        progress,
        xpToNext
    };
  }, [stats?.totalXP]);

  return {
    stats,
    rankData,
    loading,
    trackAction,
    claimMission
  };
};
