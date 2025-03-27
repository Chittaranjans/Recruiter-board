'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { InterviewWithFeedback, Candidate, Job } from '@/types';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { PenSquare } from "lucide-react";

const RATING_OPTIONS = [
  { value: '1', label: '1 - Poor' },
  { value: '2', label: '2 - Below Average' },
  { value: '3', label: '3 - Average' },
  { value: '4', label: '4 - Good' },
  { value: '5', label: '5 - Excellent' },
];

const RECOMMENDATION_OPTIONS = [
  { value: 'Hire', label: 'Hire' },
  { value: 'Reject', label: 'Reject' },
  { value: 'Another Interview', label: 'Schedule Another Interview' },
];

export default function InterviewDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [interview, setInterview] = useState<InterviewWithFeedback | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  
  const [feedbackForm, setFeedbackForm] = useState({
    comments: '',
    rating: '3',
    strengths: '',
    weaknesses: '',
    recommendation: 'Another Interview',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const { user, isInterviewer, isRecruiter, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchInterviewDetails = async () => {
      try {
        const interviewRes = await api.get(`/interviews/${id}`);
        setInterview(interviewRes.data);

        // Fetch candidate and job details
        const [candidateRes, jobRes] = await Promise.all([
          api.get(`/candidates/${interviewRes.data.candidate_id}`),
          api.get(`/jobs/${interviewRes.data.job_id}`),
        ]);

        setCandidate(candidateRes.data);
        setJob(jobRes.data);
      } catch (error) {
        console.error('Error fetching interview details:', error);
        toast.error('Error loading interview details');
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewDetails();
  }, [id]);

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFeedbackForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFeedbackForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitFeedback = async () => {
    if (!interview) return;

    setSubmitting(true);

    try {
      const feedbackData = {
        interview_id: interview.id,
        comments: feedbackForm.comments,
        rating: parseInt(feedbackForm.rating),
        strengths: feedbackForm.strengths,
        weaknesses: feedbackForm.weaknesses,
        recommendation: feedbackForm.recommendation,
      };

      await api.post('/feedback/', feedbackData);

      const updatedInterview = await api.get(`/interviews/${id}`);
      setInterview(updatedInterview.data);

      toast.success('Feedback submitted successfully');
      setFeedbackDialogOpen(false);
    } catch (error) {
        console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading interview details...</div>;
  }

  if (!interview || !candidate || !job) {
    return <div>Interview not found.</div>;
  }

  const isInterviewInPast = new Date(interview.scheduled_date) < new Date();
  const canProvideFeedback = 
    isInterviewInPast && 
    !interview.feedback && 
    (
      isRecruiter() || 
      isAdmin() || 
      (isInterviewer() && interview.interviewer_name === user?.username)
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Interview Details</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push('/dashboard/interviews')}>
            Back to Interviews
          </Button>
          
            <Button variant="outline" onClick={() => setFeedbackDialogOpen(true)}>
              Provide Feedback
            </Button>
          
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
        <CardHeader>
            <CardTitle>Candidate Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Name</h3>
              <p>{candidate.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Email</h3>
              <p>{candidate.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Status</h3>
              <p>{candidate.status}</p>
            </div>
            <div className="pt-2">
              <Link href={`/dashboard/candidates/${candidate.id}`}>
                <Button variant="outline" size="sm">View Candidate Profile</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interview Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Job Position</h3>
              <p>{job.title}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Interviewer</h3>
              <p>{interview.interviewer_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Date & Time</h3>
              <p>{format(new Date(interview.scheduled_date), 'MMMM d, yyyy h:mm a')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Status</h3>
                <p>{interview.completed ? 'Completed' : 'Pending'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {interview.feedback && (
        <Card>
          <CardHeader>
            <CardTitle>Interview Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Rating</h3>
              <p>{interview.feedback.rating} / 5</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Recommendation</h3>
              <p>{interview.feedback.recommendation}</p>
            </div>
            {interview.feedback.comments && (
              <div>
                <h3 className="text-sm font-medium">Comments</h3>
                <p className="whitespace-pre-line">{interview.feedback.comments}</p>
              </div>
            )}
            {interview.feedback.strengths && (
              <div>
                <h3 className="text-sm font-medium">Strengths</h3>
                <p className="whitespace-pre-line">{interview.feedback.strengths}</p>
              </div>
            )}
            {interview.feedback.weaknesses && (
              <div>
                <h3 className="text-sm font-medium">Areas for Improvement</h3>
                <p className="whitespace-pre-line">{interview.feedback.weaknesses}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!interview.feedback && interview.completed === false && new Date(interview.scheduled_date) < new Date() && (
        <div className="mt-6">
          <Button 
            onClick={() => setFeedbackDialogOpen(true)}
            className="w-full md:w-auto"
          >
            <PenSquare className="mr-2 h-4 w-4" />
            Provide Feedback
          </Button>
          
          {/* Update the message to be inclusive of both roles */}
          {(isRecruiter() || isInterviewer()) && interview.interviewer_name !== user?.username && (
            <p className="mt-2 text-sm text-muted-foreground">
              As a {user?.role}, you can provide feedback for this interview.
            </p>
          )}
        </div>
      )}

      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
          <DialogTitle>
    {isRecruiter() && interview.interviewer_name !== user?.username 
      ? `Provide Feedback (on behalf of ${interview.interviewer_name})`
      : 'Provide Interview Feedback'
    }
  </DialogTitle>
            <DialogDescription>
              Share your assessment of the candidate's interview performance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <Select
                value={feedbackForm.rating}
                onValueChange={(value) => handleSelectChange('rating', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {RATING_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Recommendation</label>
              <Select
                value={feedbackForm.recommendation}
                onValueChange={(value) => handleSelectChange('recommendation', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recommendation" />
                </SelectTrigger>
                <SelectContent>
                  {RECOMMENDATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="comments" className="text-sm font-medium">Comments</label>
              <Textarea
                id="comments"
                name="comments"
                placeholder="Share your overall impression..."
                value={feedbackForm.comments}
                onChange={handleFeedbackChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="strengths" className="text-sm font-medium">Strengths</label>
              <Textarea
                id="strengths"
                name="strengths"
                placeholder="Candidate's strengths..."
                value={feedbackForm.strengths}
                onChange={handleFeedbackChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="weaknesses" className="text-sm font-medium">Areas for Improvement</label>
              <Textarea
                id="weaknesses"
                name="weaknesses"
                placeholder="Areas where the candidate could improve..."
                value={feedbackForm.weaknesses}
                onChange={handleFeedbackChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitFeedback} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

