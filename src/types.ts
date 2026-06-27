export interface Issue {
  id: string;
  title: string;
  description: string;
  category: 'Infrastructure' | 'Waste Management' | 'Safety & Hazard' | 'Utilities' | 'Parks & Recreation' | 'Traffic & Transit' | 'General';
  status: 'Pending' | 'Verified' | 'In Progress' | 'Resolved' | 'Disputed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  locationName: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  videoUrl?: string;
  reportedBy: string; // User Name
  reportedByEmail: string;
  createdAt: number;
  votes: number;
  upvotedBy: string[]; // List of user emails
  validationCount: number;
  disputeCount: number;
  validations: { [email: string]: 'validate' | 'dispute' };
  officialResponse?: string;
  resolvedAt?: number;
  aiSuggestedSolution?: string;
}

export interface Comment {
  id: string;
  issueId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: number;
  isOfficial?: boolean;
}

export interface UserCivicProfile {
  name: string;
  email: string;
  points: number;
  rank: number;
  reportsSubmitted: number;
  validationsDone: number;
  resolvedHelpCount: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string; // e.g. "Shield", "Eye", "CheckCircle"
  color: string; // Tailwind class
  unlockedAt: number;
}

export interface CivicQuest {
  id: string;
  title: string;
  description: string;
  pointsReward: number;
  progress: number;
  target: number;
  category: string;
  isCompleted: boolean;
}
