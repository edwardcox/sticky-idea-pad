
import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Note, Priority } from '@/lib/data';
import { PriorityBadge } from './PriorityBadge';
import { NoteForm } from './NoteForm';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';

interface NoteCardProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onUpdate, onDelete }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const rotationClasses = ['note-rotate-1', 'note-rotate-2', 'note-rotate-3', 'note-rotate-4', ''];
  const rotationClass = rotationClasses[note.id.charCodeAt(0) % rotationClasses.length];

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/\n/g, '<br />');
  };

  const handleUpdatePriority = () => {
    const priorities: Priority[] = ['normal', 'action', 'urgent'];
    const currentIndex = priorities.indexOf(note.priority);
    const nextIndex = (currentIndex + 1) % priorities.length;
    onUpdate(note.id, { priority: priorities[nextIndex] });
  };

  if (isEditing) {
    return (
      <NoteForm 
        initialNote={note}
        onSubmit={(updatedNote) => {
          onUpdate(note.id, updatedNote);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
        isEdit={true}
      />
    );
  }

  return (
    <div 
      className={`note-card bg-note-${note.color} p-4 animate-float-in ${rotationClass}`}
      style={{animationDelay: `${(parseInt(note.id) % 5) * 0.1}s`}}
    >
      <div className="flex flex-col h-full">
        <div className="mb-1 flex justify-between items-start">
          <h3 className="font-bold text-lg pr-6 break-words">{note.title}</h3>
          <PriorityBadge 
            priority={note.priority} 
            onClick={handleUpdatePriority} 
          />
        </div>
        
        <div 
          className="note-content flex-grow mb-4 overflow-hidden"
          dangerouslySetInnerHTML={{ __html: formatContent(note.content) }}
        />
        
        <div className="flex justify-end space-x-2 mt-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => setIsEditing(true)}
          >
            <Pencil size={16} />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Trash2 size={16} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Note</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this note? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(note.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
