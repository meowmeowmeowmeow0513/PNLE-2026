
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useStreakSystem } from './hooks/useStreakSystem';
import { Task, TaskCategory, TaskPriority } from './types';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (title: string, date: string, category: TaskCategory, priority: TaskPriority) => Promise<void>;
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
  const { completeDailyTask } = useStreakSystem();
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
      const fetchedTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(fetchedTasks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const addTask = async (title: string, date: string, category: TaskCategory, priority: TaskPriority) => {
    if (!currentUser) return;

    try {
      await addDoc(collection(db, 'users', currentUser.uid, 'tasks'), {
        title,
        completed: false,
        date,
        category,
        priority,
        userId: currentUser.uid,
        createdAt: Date.now()
      });
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const toggleTask = async (id: string, currentStatus: boolean) => {
    if (!currentUser) return;
    
    const newStatus = !currentStatus;

    try {
      const taskRef = doc(db, 'users', currentUser.uid, 'tasks', id);
      await updateDoc(taskRef, {
        completed: newStatus
      });

      // CRITICAL: Update Streak if completed
      if (newStatus === true) {
        await completeDailyTask();
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
    <TaskContext.Provider value={{ tasks, loading, addTask, toggleTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};
