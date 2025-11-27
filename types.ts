
export type NavigationItem = 'Dashboard' | 'Pomodoro Timer' | 'Resource Hub' | 'Exam TOS';

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
