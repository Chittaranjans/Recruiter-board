'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Interview } from '@/types';

export default function PendingFeedbackPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isRecruiter, isInterviewer } = useAuth();

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await api.get('/interviews/');
        const allInterviews: Interview[] = response.data;
        
        // Filter for interviews that need feedback
        const pendingFeedback = allInterviews.filter(interview => {
          const isPastInterview = new Date(interview.scheduled_date) < new Date();
          const needsFeedback = !interview.completed;
          
          // For interviewers, only show their assigned interviews unless they're also recruiters
          if (isInterviewer() && !isRecruiter()) {
            return isPastInterview && needsFeedback && interview.interviewer_user_id === user?.id;
          }
          
          // For recruiters, admins, show all
          return isPastInterview && needsFeedback;
        });
        
        setInterviews(pendingFeedback);
      } catch (error) {
        console.error('Error fetching interviews:', error);
        toast.error('Failed to load interviews');
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [user, isInterviewer, isRecruiter]);

  if (loading) {
    return <div>Loading pending feedback interviews...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Pending Feedback</h1>
      
      {interviews.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground">No interviews require feedback at this time.</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Interview Date</TableHead>
                <TableHead>Days Overdue</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interviews.map(interview => {
                const interviewDate = new Date(interview.scheduled_date);
                const daysOverdue = Math.floor((new Date().getTime() - interviewDate.getTime()) / (1000 * 3600 * 24));
                
                return (
                  <TableRow key={interview.id}>
                    <TableCell>{interview.candidate?.name || 'Unknown'}</TableCell>
                    <TableCell>{interview.job?.title || 'Unknown'}</TableCell>
                    <TableCell>{interviewDate.toLocaleDateString()}</TableCell>
                    <TableCell>{daysOverdue} days</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/interviews/${interview.id}`}>
                        <Button size="sm">Provide Feedback</Button>
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