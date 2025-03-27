'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { InterviewWithFeedback, Job, Candidate } from '@/types';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Check, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<InterviewWithFeedback[]>([]);
  const [candidates, setCandidates] = useState<Record<number, Candidate>>({});
  const [jobs, setJobs] = useState<Record<number, Job>>({});
  const [loading, setLoading] = useState(true);
  const { isRecruiter } = useAuth();

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const [interviewsRes, candidatesRes, jobsRes] = await Promise.all([
          api.get('/interviews/'),
          api.get('/candidates/'),
          api.get('/jobs/')
        ]);

        setInterviews(interviewsRes.data);
        
        // Create lookup maps for candidates and jobs
        const candidatesMap: Record<number, Candidate> = {};
        candidatesRes.data.forEach((candidate: Candidate) => {
          candidatesMap[candidate.id] = candidate;
        });
        setCandidates(candidatesMap);
        
        const jobsMap: Record<number, Job> = {};
        jobsRes.data.forEach((job: Job) => {
          jobsMap[job.id] = job;
        });
        setJobs(jobsMap);
        
      } catch (error) {
        console.error('Error fetching interviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const getInterviewStatus = (interview: InterviewWithFeedback) => {
    const interviewDate = new Date(interview.scheduled_date);
    const now = new Date();
    
    if (interview.completed) {
      return { label: 'Completed', variant: 'outline' as const };
    } else if (interviewDate < now) {
      return { label: 'Pending Feedback', variant: 'destructive' as const };
    } else {
      return { label: 'Upcoming', variant: 'default' as const };
    }
  };

  if (loading) {
    return <div>Loading interviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Interviews</h1>
        {isRecruiter() && (
          <Link href="/dashboard/interviews/schedule">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Schedule Interview
            </Button>
          </Link>
        )}
      </div>

      {interviews.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No interviews scheduled yet.</p>
          {isRecruiter() && (
            <Link href="/dashboard/interviews/schedule">
              <Button variant="outline" className="mt-4">
                Schedule Your First Interview
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Job Position</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Interviewer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interviews.map((interview) => {
                const candidate = candidates[interview.candidate_id];
                const job = jobs[interview.job_id];
                const status = getInterviewStatus(interview);
                
                return (
                  <TableRow key={interview.id}>
                    <TableCell>
                      {candidate ? (
                        <Link href={`/candidates/${candidate.id}`} className="hover:underline">
                          {candidate.name}
                        </Link>
                      ) : (
                        'Unknown Candidate'
                      )}
                    </TableCell>
                    <TableCell>
                      {job ? job.title : 'Unknown Position'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(interview.scheduled_date), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell>{interview.interviewer_name}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {interview.feedback ? (
                        <span className="inline-flex items-center">
                          <Check className="h-4 w-4 mr-1 text-green-600" />
                          Provided
                        </span>
                      ) : (
                        <span className="inline-flex items-center">
                          <XCircle className="h-4 w-4 mr-1 text-red-600" />
                          Missing
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/interviews/${interview.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}