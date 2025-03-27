'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { Candidate } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

// Define status columns for the Kanban board
const STATUSES = ["Applied", "Screening", "Interview Scheduled", "Offer Extended", "Rejected", "Hired"];

export default function KanbanPage() {
  const [candidatesByStatus, setCandidatesByStatus] = useState<Record<string, Candidate[]>>({});
  const [loading, setLoading] = useState(true);
  const { isRecruiter } = useAuth();

  useEffect(() => {
    const fetchKanbanData = async () => {
      try {
        const response = await api.get('/kanban');
        setCandidatesByStatus(response.data);
      } catch (error) {
        console.error('Error fetching kanban data:', error);
        toast.error('Error loading candidate data');
      } finally {
        setLoading(false);
      }
    };

    fetchKanbanData();
  }, []);

  const handleDragStart = (e: React.DragEvent, candidate: Candidate) => {
    e.dataTransfer.setData('candidateId', candidate.id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const candidateId = parseInt(e.dataTransfer.getData('candidateId'));
    
    // Find the candidate to move
    let candidateToMove: Candidate | undefined;
    for (const status in candidatesByStatus) {
      const foundCandidate = candidatesByStatus[status].find(c => c.id === candidateId);
      if (foundCandidate) {
        candidateToMove = foundCandidate;
        break;
      }
    }
    
    if (!candidateToMove || candidateToMove.status === newStatus) {
      return;
    }

    try {
      // Optimistically update the UI
      setCandidatesByStatus(prev => {
        // Remove candidate from previous status
        const updatedState = { ...prev };
        updatedState[candidateToMove!.status] = updatedState[candidateToMove!.status].filter(c => c.id !== candidateId);
        
        // Add candidate to new status
        const updatedCandidate = { ...candidateToMove!, status: newStatus };
        if (!updatedState[newStatus]) {
          updatedState[newStatus] = [];
        }
        updatedState[newStatus].push(updatedCandidate);
        
        return updatedState;
      });
      
      // Update the backend
      await api.put(`/kanban/move?candidate_id=${candidateId}&new_status=${newStatus}`);
      
      toast.success(`Moved candidate to ${newStatus}`);
    } catch (error) {
      console.error('Error moving candidate:', error);
      toast.error('Failed to update candidate status');
      
      // Revert the UI change on error by refreshing the data
      const response = await api.get('/kanban');
      setCandidatesByStatus(response.data);
    }
  };

  if (loading) {
    return <div>Loading kanban board...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Candidate Pipeline</h1>
        <Link href="/dashboard/candidates/new">
          <Button>Add New Candidate</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STATUSES.map(status => (
          <div
            key={status}
            className="bg-muted/50 rounded-md p-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <h3 className="font-medium mb-3">{status} ({candidatesByStatus[status]?.length || 0})</h3>
            <div className="space-y-2">
              {candidatesByStatus[status]?.map(candidate => (
                <Card 
                  key={candidate.id} 
                  className="cursor-move"
                  draggable={isRecruiter()}
                  onDragStart={(e) => handleDragStart(e, candidate)}
                >
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-sm">{candidate.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-xs text-muted-foreground truncate">{candidate.email}</p>
                    <Link href={`/dashboard/candidates/${candidate.id}`} className="text-xs text-blue-600 hover:underline block mt-1">
                      View details
                    </Link>
                  </CardContent>
                </Card>
              ))}
              {(!candidatesByStatus[status] || candidatesByStatus[status].length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No candidates
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {isRecruiter() && (
        <p className="text-sm text-muted-foreground">
          Drag and drop candidates to change their status.
        </p>
      )}
    </div>
  );
}