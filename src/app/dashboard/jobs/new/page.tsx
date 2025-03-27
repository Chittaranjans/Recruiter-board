'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Temporary',
  'Internship',
];

export default function NewJobPage() {
  const { isRecruiter } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '',
    required_skills: '',
    employment_type: 'Full-time',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isRecruiter()) {
      toast.error('You do not have permission to create job postings');
      return;
    }

    setSubmitting(true);
    
    try {
      await api.post('/jobs/', formData);
      toast.success('Job posting created successfully');
      router.push('/dashboard/jobs');
    } catch (error) {
      console.error('Error creating job posting:', error);
      toast.error('Failed to create job posting');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Create New Job Posting</h1>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Create a new job posting to start attracting candidates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Job Title *</label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Senior Frontend Developer"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="department" className="text-sm font-medium">Department *</label>
              <Input
                id="department"
                name="department"
                placeholder="e.g., Engineering"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="employment_type" className="text-sm font-medium">Employment Type *</label>
              <Select
                value={formData.employment_type}
                onValueChange={(value) => handleSelectChange('employment_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Job Description *</label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the role, responsibilities, and qualifications..."
                value={formData.description}
                onChange={handleChange}
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="required_skills" className="text-sm font-medium">Required Skills *</label>
              <Textarea
                id="required_skills"
                name="required_skills"
                placeholder="List the skills required for this position..."
                value={formData.required_skills}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/jobs')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Job Posting'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}