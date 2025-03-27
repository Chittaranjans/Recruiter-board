export type User = {
    id: number;
    username: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
  };
  
  export type Job = {
    id: number;
    title: string;
    department: string;
    description: string;
    required_skills: string;
    employment_type: string;
  };
  
  export type Candidate = {
    id: number;
    name: string;
    email: string;
    cv_text: string;
    status: string;
    job_id: number;
    job?: Job;
  };
  
  export type Interview = {
    id: number;
    candidate_id: number;
    job_id: number;
    interviewer_name: string;
    interviewer_user_id?: number;
    scheduled_date: string;
    duration_minutes: number;
    completed: boolean;
    candidate?: Candidate;
    job?: Job;
  };
  
  export type Feedback = {
    id: number;
    interview_id: number;
    comments: string;
    rating: number;
    strengths?: string;
    weaknesses?: string;
    recommendation?: string;
    created_at: string;
  };
  
  export type InterviewWithFeedback = Interview & {
    feedback?: Feedback;
  };
  
  export type Notification = {
    id: number;
    candidate_id: number;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
  };