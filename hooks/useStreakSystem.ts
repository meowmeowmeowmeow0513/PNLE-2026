
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { UserGamificationStats } from '../types';

export const useStreakSystem = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<UserGamificationStats>({
    currentStreak: 0,
    bestStreak: 0,
    lastStudyDate: '',
    streakFreezes: 1, // Start with 1 free pass
    lastFreezeUsedDate: null,
    totalSessions: 0
  });
  const [loading, setLoading] = useState(true);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [pendingLostStreak, setPendingLostStreak] = useState(0); // Store lost streak in case of resuscitation

  // Helper: Get local date string YYYY-MM-DD
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

  useEffect(() => {
    if (!currentUser) return;

    const checkStreak = async () => {
      setLoading(true);
      const userRef = doc(db, 'users', currentUser.uid, 'stats', 'gamification');
      const docSnap = await getDoc(userRef);
      const today = getTodayString();
      const yesterday = getYesterdayString();

      if (docSnap.exists()) {
        const data = docSnap.data() as UserGamificationStats;
        let newStats = { ...data };
        let needsUpdate = false;

        // Logic: Check for broken streak
        if (data.lastStudyDate !== today && data.lastStudyDate !== yesterday) {
          // Streak is potentially broken
          const lastDate = new Date(data.lastStudyDate || '2000-01-01');
          const diffTime = Math.abs(new Date(today).getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

          // If missed exactly 1 day (gap is 2 days in calculation logic depending on time, but simplified: lastStudyDate < yesterday)
          if (data.lastStudyDate < yesterday) {
             // Try to use a Freeze (Duty Leave)
             if (data.streakFreezes > 0) {
               newStats.streakFreezes -= 1;
               newStats.lastFreezeUsedDate = today;
               newStats.lastStudyDate = yesterday; // Bridge the gap
               needsUpdate = true;
               console.log("Duty Leave applied. Streak saved.");
             } else {
               // Streak Lost
               if (data.currentStreak > 0) {
                 setPendingLostStreak(data.currentStreak);
                 setShowRecoveryModal(true); // Trigger Code Blue
                 newStats.currentStreak = 0;
                 needsUpdate = true;
               }
             }
          }
        }

        if (needsUpdate) {
            await updateDoc(userRef, { ...newStats });
        }
        setStats(newStats);
      } else {
        // Init stats for new user
        const initialStats: UserGamificationStats = {
          currentStreak: 0,
          bestStreak: 0,
          lastStudyDate: '',
          streakFreezes: 1, // Welcome gift
          lastFreezeUsedDate: null,
          totalSessions: 0
        };
        await setDoc(userRef, initialStats);
        setStats(initialStats);
      }
      setLoading(false);
    };

    checkStreak();
  }, [currentUser]);

  const completeDailyTask = async () => {
    if (!currentUser) return;
    
    const today = getTodayString();
    
    // Optimistic Update
    const prevStats = { ...stats };
    
    if (stats.lastStudyDate === today) {
       // Already studied today, just increment session count maybe?
       const newStats = { ...stats, totalSessions: stats.totalSessions + 1 };
       setStats(newStats);
       await updateDoc(doc(db, 'users', currentUser.uid, 'stats', 'gamification'), {
           totalSessions: newStats.totalSessions
       });
       return;
    }

    // First task of the day!
    let newStreak = stats.currentStreak + 1;
    let newFreezes = stats.streakFreezes;
    
    // Reward: +1 Freeze every 7 days
    if (newStreak % 7 === 0) {
        newFreezes += 1;
    }

    const newStats: UserGamificationStats = {
        ...stats,
        currentStreak: newStreak,
        bestStreak: Math.max(newStreak, stats.bestStreak),
        lastStudyDate: today,
        streakFreezes: newFreezes,
        totalSessions: stats.totalSessions + 1
    };

    setStats(newStats);
    await setDoc(doc(db, 'users', currentUser.uid, 'stats', 'gamification'), newStats);
  };

  const resuscitateStreak = async () => {
      if (!currentUser || pendingLostStreak === 0) return;
      
      const newStats = {
          ...stats,
          currentStreak: pendingLostStreak, // Restore
          lastStudyDate: getYesterdayString(), // Pretend we did it yesterday
      };
      
      setStats(newStats);
      await updateDoc(doc(db, 'users', currentUser.uid, 'stats', 'gamification'), newStats);
      setShowRecoveryModal(false);
  };

  return {
    stats,
    loading,
    showRecoveryModal,
    completeDailyTask,
    resuscitateStreak,
    closeRecovery: () => setShowRecoveryModal(false)
  };
};
