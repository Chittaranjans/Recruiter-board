'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { Candidate, Job } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserPlus, Edit, Trash, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Record<number, Job>>({});
  const [loading, setLoading] = useState(true);
  const { isRecruiter } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const [candidatesRes, jobsRes] = await Promise.all([
          api.get('/candidates'),
          api.get('/jobs')
        ]);
        
        setCandidates(candidatesRes.data);
        
        // Create jobs lookup map
        const jobsMap: Record<number, Job> = {};
        jobsRes.data.forEach((job: Job) => {
          jobsMap[job.id] = job;
        });
        setJobs(jobsMap);
      } catch (error) {
        console.error('Error fetching candidates:', error);
        toast.error('Failed to load candidates');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const handleDelete = async (id: number) => {
    if (!isRecruiter()) {
      toast.error("You don't have permission to delete candidates");
      return;
    }
    
    if (confirm('Are you sure you want to delete this candidate?')) {
      try {
        await api.delete(`/candidates/${id}`);
        setCandidates(candidates.filter(candidate => candidate.id !== id));
        toast.success('Candidate deleted successfully');
      } catch (error) {
        console.error('Error deleting candidate:', error);
        toast.error('Failed to delete candidate');
      }
    }
  };

  if (loading) {
    return <div>Loading candidates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
        {isRecruiter() && (
          <Link href="/dashboard/candidates/new">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Candidate
            </Button>
          </Link>
        )}
      </div>

      {candidates.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No candidates yet.</p>
          {isRecruiter() && (
            <Link href="/dashboard/candidates/new">
              <Button variant="outline" className="mt-4">
                Add Your First Candidate
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Job Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell className="font-medium">{candidate.name}</TableCell>
                  <TableCell>{candidate.email}</TableCell>
                  <TableCell>{jobs[candidate.job_id]?.title || 'Unknown'}</TableCell>
                  <TableCell>
                    <div className={`px-2 py-1 rounded-full text-xs inline-block 
                      ${candidate.status === 'Hired' ? 'bg-green-100 text-green-800' : ''}
                      ${candidate.status === 'Applied' ? 'bg-blue-100 text-blue-800' : ''}
                      ${candidate.status === 'Interview Scheduled' ? 'bg-purple-100 text-purple-800' : ''}
                      ${candidate.status === 'Offer Extended' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${candidate.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
                      ${candidate.status === 'Screening' ? 'bg-gray-100 text-gray-800' : ''}
                    `}>
                      {candidate.status}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/candidates/${candidate.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {isRecruiter() && (
                        <Button variant="outline" size="sm" onClick={() => handleDelete(candidate.id)}>
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}