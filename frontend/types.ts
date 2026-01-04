
export type View = "Dashboard" | "Topics" | "Community" | "LeetCode Sync" | "Profile";

export interface UserProfile {
  name: string;
  avatar: string;
  reputation: number;
  expertise: "Beginner" | "Intermediate" | "Expert";
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  isGenerating?: boolean;
  statusText?: string;
}

export interface Topic {
  id: string;
  title: string;
  status: "Weak" | "Mastered" | "In Progress";
  progress: number;
  total: number;
  icon: string;
}

export interface RecommendedProblem {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  reason: string;
  topic: string;
}

export interface CommunityPost {
  id: string;
  topicId: string;
  author: {
    name: string;
    avatar: string;
    expertise: "Beginner" | "Intermediate" | "Expert";
  };
  title: string;
  code: string;
  language: string;
  aiRelevance: number; // 0-100
  weightedScore: number;
  aiWarning?: string; // If present, show alert
  timestamp: string;
}

export interface LeetCodeStats {
  username: string;
  totalSolved: number;
  ranking: number;
  topicSkills: {
    category: string;
    topics: {
      name: string;
      solved: number;
      level: 0 | 1 | 2 | 3 | 4; // 0=none, 4=expert
    }[];
  }[];
}
