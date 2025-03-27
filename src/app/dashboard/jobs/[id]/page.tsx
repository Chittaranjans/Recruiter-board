'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { Job, Candidate } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2, User, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function JobDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const { isRecruiter } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const [jobRes, candidatesRes] = await Promise.all([
          api.get(`/jobs/${id}`),
          api.get(`/jobs/${id}/candidates`),
        ]);

        setJob(jobRes.data);
        setCandidates(candidatesRes.data);
      } catch (error) {
        console.error('Error fetching job details:', error);
        toast.error('Error loading job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job posting?')) {
      return;
    }
    
    try {
      await api.delete(`/jobs/${id}`);
      toast.success('Job deleted successfully');
      router.push('/dashboard/jobs');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  if (loading) {
    return <div>Loading job details...</div>;
  }

  if (!job) {
    return <div>Job not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
        {isRecruiter() && (
          <div className="flex space-x-2">
            <Link href={`/dashboard/jobs/${id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>
            Department: {job.department} | Employment Type: {job.employment_type}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Description</h3>
              <p className="whitespace-pre-line mt-1">{job.description}</p>
            </div>
            <div>
              <h3 className="font-medium">Required Skills</h3>
              <p className="whitespace-pre-line mt-1">{job.required_skills}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Candidates</h2>
        <Link href={`/dashboard/candidates/new?jobId=${id}`}>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        </Link>
      </div>

      {candidates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-6">
            <User className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No candidates yet for this position.</p>
            <Link href={`/dashboard/candidates/new?jobId=${id}`}>
              <Button variant="outline" className="mt-4">
                Add Your First Candidate
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell className="font-medium">{candidate.name}</TableCell>
                  <TableCell>{candidate.email}</TableCell>
                  <TableCell>{candidate.status}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/candidates/${candidate.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
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