'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { Job, Candidate, Interview } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user, isRecruiter } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCandidates: 0,
    upcomingInterviews: 0,
    pendingFeedback: 0
  });
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<Interview[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [jobsRes, candidatesRes, interviewsRes] = await Promise.all([
          api.get('/jobs/'),
          api.get('/candidates/'),
          api.get('/interviews/')
        ]);
        
        const jobs: Job[] = jobsRes.data;
        const candidates: Candidate[] = candidatesRes.data;
        const interviews: Interview[] = interviewsRes.data;
        
        // Store interviews for displaying in the table
        setInterviews(interviews);
        
        const now = new Date();
        const upcomingInterviews = interviews.filter(interview => {
          const interviewDate = new Date(interview.scheduled_date);
          return !interview.completed && interviewDate > now;
        });
        
        const pendingFeedback = interviews.filter(interview => {
          return interview.completed === false && new Date(interview.scheduled_date) < now;
        });
        
        setStats({
          totalJobs: jobs.length,
          totalCandidates: candidates.length,
          upcomingInterviews: upcomingInterviews.length,
          pendingFeedback: pendingFeedback.length
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div>Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.username}! Here's an overview of your recruitment activities.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              Open positions across departments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCandidates}</div>
            <p className="text-xs text-muted-foreground">
              Total candidates in pipeline
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingInterviews}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled for the next days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingFeedback}</div>
            <p className="text-xs text-muted-foreground">
              Interviews awaiting feedback
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Interviews Pending Feedback</h2>
        
        {stats.pendingFeedback > 0 ? (
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-3 text-left font-medium">Candidate</th>
                  <th className="p-3 text-left font-medium">Position</th>
                  <th className="p-3 text-left font-medium">Date</th>
                  <th className="p-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {interviews
                  .filter(interview => interview.completed === false && new Date(interview.scheduled_date) < new Date())
                  .map(interview => (
                    <tr key={interview.id} className="border-t">
                      <td className="p-3">{interview.candidate?.name || 'Unknown'}</td>
                      <td className="p-3">{interview.job?.title || 'Unknown'}</td>
                      <td className="p-3">{new Date(interview.scheduled_date).toLocaleDateString()}</td>
                      <td className="p-3">
                        <Link href={`/dashboard/interviews/${interview.id}`}>
                          <Button size="sm" variant="outline">Provide Feedback</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground">No interviews are pending feedback.</p>
        )}
      </div>
    </div>
  );
}