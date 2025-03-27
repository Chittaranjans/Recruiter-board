'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
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
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { User , Candidate , Job  } from '@/types';

interface FormDataType {
    candidate_id: string;
    job_id: string;
    interviewer: string;
    interviewer_user_id: string;
    scheduled_date: string;
    time: string;
    duration_minutes: string;
    completed: boolean;
    }

export default function ScheduleInterviewPage() {
  const { isRecruiter, isInterviewer } = useAuth();
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [interviewers, setInterviewers] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  const [formData, setFormData] = useState<FormDataType>({
    candidate_id: '',
    job_id: '',
    interviewer: '',
    interviewer_user_id: '',
    scheduled_date: '',
    time: '10:00',
    duration_minutes: '60',
    completed: false,
  });

  useEffect(() => {
    // Allow both recruiters and interviewers to access this page
    if (!isRecruiter() && !isInterviewer()) {
      toast.error("You don't have permission to schedule interviews");
      router.push('/dashboard/interviews');
      return;
    }

    // Fetch necessary data
    const fetchData = async () => {
      try {
        // Split the Promise.all to handle each request separately
        const candidatesPromise = api.get('/candidates');
        const jobsPromise = api.get('/jobs');
        
        // First get the essential data
        const [candidatesRes, jobsRes] = await Promise.all([
          candidatesPromise,
          jobsPromise
        ]);
        
        setCandidates(candidatesRes.data);
        setJobs(jobsRes.data);
        
        // Then try to get interviewers, but don't block if it fails
        try {
          const interviewersRes = await api.get('/users?role=interviewer');
          if (interviewersRes.data) {
            setInterviewers(interviewersRes.data);
          }
        } catch (interviewerError) {
          console.warn('Failed to fetch interviewers:', interviewerError);
          // Just continue without interviewers data
          setInterviewers([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load necessary data');
      }
    };

    fetchData();
  }, [isRecruiter, isInterviewer, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const timeStr = formData.time;
      setFormData((prev) => ({
        ...prev,
        scheduled_date: `${dateStr}T${timeStr}:00`,
      }));
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeStr = e.target.value;
    setFormData((prev) => ({
      ...prev,
      time: timeStr,
      scheduled_date: date ? `${format(date, 'yyyy-MM-dd')}T${timeStr}:00` : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.candidate_id || !formData.job_id || !formData.interviewer || !formData.scheduled_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      // Format the data for your API
      const dataToSubmit = {
        candidate_id: parseInt(formData.candidate_id),
        job_id: parseInt(formData.job_id),
        interviewer: formData.interviewer,
        interviewer_user_id: formData.interviewer_user_id ? parseInt(formData.interviewer_user_id) : null,
        scheduled_date: formData.scheduled_date,
        duration_minutes: parseInt(formData.duration_minutes),
        completed: formData.completed,
      };

      const response = await api.post('/interviews/', dataToSubmit);
      
      toast.success('Interview scheduled successfully');
      router.push('/dashboard/interviews');
    } catch (error: any) {
      console.error('Error scheduling interview:', error);
      toast.error(error.response?.data?.detail || 'Failed to schedule interview');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Schedule New Interview</h1>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Interview Details</CardTitle>
            <CardDescription>Fill out the details for the interview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Candidate *</label>
              <Select 
                value={formData.candidate_id} 
                onValueChange={(value) => handleSelectChange('candidate_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a candidate" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((candidate) => (
                    <SelectItem key={candidate.id} value={candidate.id.toString()}>
                      {candidate.name} - {candidate.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Job Position *</label>
              <Select 
                value={formData.job_id} 
                onValueChange={(value) => handleSelectChange('job_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a job position" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id.toString()}>
                      {job.title} - {job.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Interviewer Name *</label>
              <Input
                name="interviewer"
                value={formData.interviewer}
                onChange={handleInputChange}
                placeholder="Enter interviewer name"
              />
            </div>

            {interviewers.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Interviewer User (Optional)</label>
                <Select 
                  value={formData.interviewer_user_id} 
                  onValueChange={(value) => handleSelectChange('interviewer_user_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {interviewers.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.username} - {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Time *</label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleTimeChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (minutes) *</label>
              <Select 
                value={formData.duration_minutes} 
                onValueChange={(value) => handleSelectChange('duration_minutes', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push('/dashboard/interviews')}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Scheduling...' : 'Schedule Interview'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}