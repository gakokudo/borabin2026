export interface Feedback {
  id: string;
  author: string;
  content: string;
  date: string;
}

export interface UserProfile {
  name: string;
  email: string;
  age?: string;
  affiliation?: string;
  address?: string;
  agreedToTerms: boolean;
  registeredAt: string;
}

export interface UserActivityData extends UserProfile {
  stampCount: number;
  participationCount: number;
  lastActivityDate: string;
}

export interface VolunteerEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  content: string;
  requirements: string;
  imageUrl: string;
  category: string;
  organizationName: string;
  organizationAddress?: string;
  organizationUrl?: string;
  organizationDescription?: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  secretKey?: string;
  manageKey?: string;
  activityReport?: string;
  activityReportImage?: string;
  feedbacks?: Feedback[];
  bingoTasks?: string[];
}

export interface BingoGenerationResponse {
  tasks: string[];
}
