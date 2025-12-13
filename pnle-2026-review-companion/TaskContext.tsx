
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useGamification } from './hooks/useGamification';
import { Task, TaskCategory, TaskPriority } from './types';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'completed'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  toggleTask: (id: string, currentStatus: boolean) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { trackAction } = useGamification();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Tasks Real-time
  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', currentUser.uid, 'tasks'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => {
        const data = doc.data();
        const hasIso = data.start && data.end;
        const fallbackStart = !hasIso && data.date ? `${data.date}T09:00:00` : new Date().toISOString();
        const fallbackEnd = !hasIso && data.date ? `${data.date}T10:00:00` : new Date().toISOString();

        return {
          id: doc.id,
          ...data,
          start: data.start || fallbackStart,
          end: data.end || fallbackEnd,
          allDay: data.allDay ?? false,
          date: data.start ? data.start.split('T')[0] : data.date,
          details: data.details || ''
        };
      }) as Task[];
      setTasks(fetchedTasks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const addTask = async (newTask: Omit<Task, 'id' | 'userId' | 'createdAt' | 'completed'>) => {
    if (!currentUser) return;

    try {
      const legacyDate = newTask.start.split('T')[0];
      await addDoc(collection(db, 'users', currentUser.uid, 'tasks'), {
        ...newTask,
        details: newTask.details || '', // Ensure details is saved
        completed: false,
        userId: currentUser.uid,
        createdAt: Date.now(),
        date: legacyDate 
      });
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!currentUser) return;
    try {
      const taskRef = doc(db, 'users', currentUser.uid, 'tasks', id);
      let finalUpdates: any = { ...updates };
      if (updates.start) {
        finalUpdates.date = updates.start.split('T')[0];
      }
      await updateDoc(taskRef, finalUpdates);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const toggleTask = async (id: string, currentStatus: boolean) => {
    if (!currentUser) return;
    const newStatus = !currentStatus;
    try {
      const taskRef = doc(db, 'users', currentUser.uid, 'tasks', id);
      await updateDoc(taskRef, { completed: newStatus });
      // GAMIFICATION TRIGGER
      if (newStatus === true) {
        await trackAction('complete_task');
      }
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const deleteTask = async (id: string) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'tasks', id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, loading, addTask, updateTask, toggleTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};