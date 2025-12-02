
export type NavigationItem = 'Dashboard' | 'Planner' | 'Pomodoro Timer' | 'Resource Hub' | 'Exam TOS' | 'Personal Folder';

export type TaskCategory = 'Review' | 'Duty' | 'School' | 'Personal';
export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
  category: TaskCategory;
  priority: TaskPriority;
  userId: string;
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  lastModified: number;
}

export interface ResourceLink {
  id: string;
  title: string;
  description: string;
  url: string;
  iconName: string;
}

export interface UserFolder {
  id: string;
  name: string;
  color: string;
  parentId: string | null;
  createdAt: string;
}

export interface UserFile {
  id: string;
  fileName: string;
  downloadUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  folderId?: string | null;
  userNotes?: string;
  aiSummary?: string;
}

export interface ExamRow {
  topic: string;
  content: string[]; // Bullet points
  weight: string;
  itemCount: number;
}

export interface ExamPart {
  title: string;
  description?: string;
  rows: ExamRow[];
}

export interface ExamTopic {
  id: string;
  title: string;
  description: string;
  parts: ExamPart[];
}

export interface UserGamificationStats {
  currentStreak: number;
  bestStreak: number;
  lastStudyDate: string; // YYYY-MM-DD
  streakFreezes: number; // "Duty Leaves"
  lastFreezeUsedDate: string | null;
  totalSessions: number;
}
