// Database types (matching Supabase schema)
export interface DatabaseUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface DatabasePoll {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  options: string[];
  settings: PollSettings;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseVote {
  id: string;
  poll_id: string;
  user_id?: string;
  option: string;
  created_at: string;
}

// Application types
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface PollSettings {
  allowMultipleVotes: boolean;
  requireAuthentication: boolean;
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  options: string[];
  settings: PollSettings;
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
  endDate?: Date;
  voteCount?: number;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface Vote {
  id: string;
  pollId: string;
  option: string;
  userId?: string;
  createdAt: Date;
}

// Form types
export interface CreatePollFormData {
  title: string;
  description?: string;
  options: string[];
  settings?: PollSettings;
  endDate?: string;
}

export interface UpdatePollFormData {
  title?: string;
  description?: string;
  options?: string[];
  settings?: PollSettings;
  endDate?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export interface VoteFormData {
  option: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

// Auth types
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
}

// Utility types
export type PollStatus = "active" | "ended" | "draft";

export interface PollWithVotes extends Poll {
  votes: Vote[];
  totalVotes: number;
  userVote?: string;
}
