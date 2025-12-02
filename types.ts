
export type NavigationItem = 'Dashboard' | 'Planner' | 'Pomodoro Timer' | 'Resource Hub' | 'Exam TOS' | 'Personal Folder';

export type TaskCategory = 'Review' | 'School' | 'Duty' | 'Personal';
export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  start: string; // ISO String (Date + Time)
  end: string;   // ISO String
  allDay: boolean;
  category: TaskCategory;
  priority: TaskPriority;
  userId: string;
  createdAt: number;
  // Legacy support for dashboard compatibility if needed, though we should transition to start/end
  date?: string; 
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
