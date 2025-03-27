'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { Candidate, Job, Interview } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, BriefcaseIcon, FileTextIcon, TrashIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function CandidateDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const { isRecruiter } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchCandidateDetails = async () => {
      try {
        const candidateRes = await api.get(`/candidates/${id}`);
        setCandidate(candidateRes.data);
        
        // Fetch job details
        const jobRes = await api.get(`/jobs/${candidateRes.data.job_id}`);
        setJob(jobRes.data);
        
        // Try to fetch interviews
        try {
          const interviewsRes = await api.get(`/interviews?candidate_id=${id}`);
          setInterviews(interviewsRes.data || []);
        } catch (err) {
          console.log('No interviews or error fetching interviews');
          setInterviews([]);
        }
      } catch (error) {
        console.error('Error fetching candidate details:', error);
        toast.error('Error loading candidate details');
        router.push('/dashboard/candidates');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateDetails();
  }, [id, router]);

  const handleDelete = async () => {
    if (!isRecruiter()) {
      toast.error("You don't have permission to delete candidates");
      return;
    }
    
    if (confirm('Are you sure you want to delete this candidate?')) {
      try {
        await api.delete(`/candidates/${id}`);
        toast.success('Candidate deleted successfully');
        router.push('/dashboard/candidates');
      } catch (error) {
        console.error('Error deleting candidate:', error);
        toast.error('Failed to delete candidate');
      }
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!isRecruiter()) {
      toast.error("You don't have permission to change candidate status");
      return;
    }

    try {
      await api.put(`/candidates/${id}/status?status=${status}`, { status });
      setCandidate(prev => prev ? { ...prev, status } : null);
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <div>Loading candidate details...</div>;
  }

  if (!candidate) {
    return <div>Candidate not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{candidate.name}</h1>
          <p className="text-muted-foreground">{candidate.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/dashboard/candidates')}>
            Back to Candidates
          </Button>
          {isRecruiter() && (
            <Button variant="destructive" onClick={handleDelete}>
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center">
        <span className="mr-2 font-medium">Status:</span>
        <div className={`px-3 py-1 rounded-full text-sm 
          ${candidate.status === 'Hired' ? 'bg-green-100 text-green-800' : ''}
          ${candidate.status === 'Applied' ? 'bg-blue-100 text-blue-800' : ''}
          ${candidate.status === 'Interview Scheduled' ? 'bg-purple-100 text-purple-800' : ''}
          ${candidate.status === 'Offer Extended' ? 'bg-yellow-100 text-yellow-800' : ''}
          ${candidate.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
          ${candidate.status === 'Screening' ? 'bg-gray-100 text-gray-800' : ''}
        `}>
          {candidate.status}
        </div>
      </div>

      {/* Status change dropdown (for recruiters) */}
      {isRecruiter() && (
        <div className="flex items-center space-x-2">
          <span className="font-medium">Change status:</span>
          <select 
            className="border rounded px-2 py-1"
            value={candidate.status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="Applied">Applied</option>
            <option value="Screening">Screening</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Offer Extended">Offer Extended</option>
            <option value="Hired">Hired</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      )}

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">
            <FileTextIcon className="mr-2 h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="resume">
            <FileTextIcon className="mr-2 h-4 w-4" />
            Resume
          </TabsTrigger>
          <TabsTrigger value="job">
            <BriefcaseIcon className="mr-2 h-4 w-4" />
            Job
          </TabsTrigger>
          <TabsTrigger value="interviews">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Interviews
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Full Name</h3>
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
                <div>
                  <h3 className="text-sm font-medium">Job Position</h3>
                  <p>{job?.title || 'Unknown'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resume" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Resume/CV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono">{candidate.cv_text}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="job" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job ? (
                <>
                  <div>
                    <h3 className="text-sm font-medium">Position</h3>
                    <p>{job.title}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Department</h3>
                    <p>{job.department}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Employment Type</h3>
                    <p>{job.employment_type}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Description</h3>
                    <p>{job.description}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Required Skills</h3>
                    <p>{job.required_skills}</p>
                  </div>
                </>
              ) : (
                <p>Job details not available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="interviews" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Interviews</span>
                {isRecruiter() && (
                  <Link href={`/dashboard/interviews/new?candidateId=${candidate.id}&jobId=${candidate.job_id}`}>
                    <Button size="sm">Schedule Interview</Button>
                  </Link>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {interviews.length > 0 ? (
                <div className="space-y-4">
                  {interviews.map((interview) => (
                    <div key={interview.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            Interview with {interview.interviewer_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(interview.scheduled_date).toLocaleString()} 
                            ({interview.duration_minutes} minutes)
                          </p>
                          <p className="text-sm mt-1">
                            Status: {interview.completed ? 'Completed' : 'Scheduled'}
                          </p>
                        </div>
                        <Link href={`/dashboard/interviews/${interview.id}`}>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No interviews scheduled yet.</p>
                  {isRecruiter() && (
                    <Link href={`/dashboard/interviews/new?candidateId=${candidate.id}&jobId=${candidate.job_id}`}>
                      <Button variant="outline" className="mt-4">Schedule First Interview</Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}