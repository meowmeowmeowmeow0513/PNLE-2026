

export type NavigationItem = 'Dashboard' | 'Planner' | 'Pomodoro Timer' | 'Resource Hub' | 'Exam TOS' | 'Personal Folder' | 'December Quest';

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
  date?: string; 
  details?: string; // New: For Patient Charts or Description
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
  path?: string; // Optional for flattened structures
}

export type ResourceType = 'drive' | 'youtube' | 'link' | 'notion' | 'note' | 'journal';

export interface UserFile {
  id: string;
  fileName: string; // Acts as "Title"
  downloadUrl: string; // Acts as "Target URL"
  fileType: ResourceType; // Acts as "Type"
  fileSize: number; // Legacy, set to 0
  createdAt: string;
  folderId?: string | null;
  userNotes?: string; // Acts as "Content" for sticky notes and journal body
  aiSummary?: string;
  color?: string; // For sticky notes (bg-color class or hex)
}

export interface ExamRow {
  topic: string;
  content: string[];
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

// --- GAMIFICATION / CAREER SIMULATION TYPES ---

export type BennerRank = 'Novice' | 'Advanced Beginner' | 'Competent' | 'Proficient' | 'Expert';

export type MissionActionType = 'complete_task' | 'finish_pomodoro' | 'login' | 'add_resource' | 'perfect_day';

export interface Mission {
  id: string;
  label: string;
  description?: string;
  target: number;
  current: number;
  xpReward: number; // "Clinical Hours"
  isCompleted: boolean;
  isClaimed: boolean;
  type: 'daily' | 'weekly';
  actionType: MissionActionType;
  icon?: string;
}

export interface UserGamificationStats {
  // Legacy Streak Data
  currentStreak: number;
  bestStreak: number;
  lastStudyDate: string; // YYYY-MM-DD
  streakFreezes: number;
  lastFreezeUsedDate: string | null;
  totalSessions: number;

  // New Career Simulation Data
  totalXP: number; // Represents "Clinical Hours"
  level?: number; 
  dailyMissions: Mission[];
  weeklyMissions: Mission[];
  lastMissionReset: string; // YYYY-MM-DD
  lastWeeklyReset: string; // YYYY-MM-DD (Start of week)
}