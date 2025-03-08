
import React, { useState, useRef, useEffect } from 'react';
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
  index: number; // Add index for z-index calculation
}

export function NoteCard({ note, onUpdate, onDelete, index }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [position, setPosition] = useState({ x: note.position?.x || 0, y: note.position?.y || 0 });
  const [size, setSize] = useState({ width: note.width || 280, height: note.height || 'auto' });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const noteRef = useRef<HTMLDivElement>(null);
  
  const rotationClasses = ['note-rotate-1', 'note-rotate-2', 'note-rotate-3', 'note-rotate-4', ''];
  const rotationClass = rotationClasses[note.id.charCodeAt(0) % rotationClasses.length];

  // Update position in state when prop changes
  useEffect(() => {
    if (note.position) {
      setPosition(note.position);
    }
  }, [note.position]);
  
  // Update size in state when prop changes
  useEffect(() => {
    setSize({
      width: note.width || 280,
      height: note.height || 'auto'
    });
  }, [note.width, note.height]);

  // Save position and size to the note when changed
  useEffect(() => {
    if (!isDragging && !isResizing && 
       (position.x !== note.position?.x || 
        position.y !== note.position?.y ||
        size.width !== note.width)) {
      onUpdate(note.id, { 
        position: position,
        width: size.width as number,
        height: size.height === 'auto' ? undefined : size.height as number
      });
    }
  }, [isDragging, isResizing]);

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

  const handleMouseDown = (e: React.MouseEvent) => {
    // Ignore if clicking on buttons or form elements
    if ((e.target as HTMLElement).closest('button') || 
        (e.target as HTMLElement).closest('input') ||
        (e.target as HTMLElement).closest('.resize-handle')) {
      return;
    }
    
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    
    // Add event listeners to window to handle dragging
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      
      // Remove event listeners
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    
    if (isResizing) {
      setIsResizing(false);
      
      // Remove resize event listeners
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleMouseUp);
    }
  };
  
  // Resize functionality
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ width: size.width as number, height: size.height === 'auto' ? 200 : size.height as number });
    
    window.addEventListener('mousemove', handleResize);
    window.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleResize = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const newWidth = Math.max(startSize.width + (e.clientX - startPos.x), 200);
    const newHeight = Math.max(startSize.height + (e.clientY - startPos.y), 150);
    
    setSize({
      width: newWidth,
      height: newHeight
    });
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
      ref={noteRef}
      className={`note-card bg-note-${note.color} p-4 animate-float-in ${rotationClass} ${isDragging ? 'dragging cursor-grabbing' : 'cursor-grab'}`}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: size.height === 'auto' ? 'auto' : `${size.height}px`,
        zIndex: isDragging ? 100 : 10 + index,
        animationDelay: `${(parseInt(note.id) % 5) * 0.1}s`,
        transition: isDragging || isResizing ? 'none' : 'box-shadow 0.2s ease, transform 0.2s ease'
      }}
      onMouseDown={handleMouseDown}
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
      
      {/* Resize handle */}
      <div 
        className="resize-handle"
        onMouseDown={handleResizeStart}
      ></div>
    </div>
  );
}
