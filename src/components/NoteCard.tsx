
import React, { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { Note } from '@/lib/data';
import { PriorityBadge } from './PriorityBadge';
import { NoteForm } from './NoteForm';
import { Button } from '@/components/ui/button';
import { NoteDeleteDialog } from './NoteDeleteDialog';
import { NoteResizeHandle } from './NoteResizeHandle';
import { NoteContent } from './NoteContent';
import { useDraggable } from '@/hooks/useDraggable';
import { useResizable } from '@/hooks/useResizable';

interface NoteCardProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
  index: number;
}

export function NoteCard({ note, onUpdate, onDelete, index }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);
  
  const rotationClasses = ['note-rotate-1', 'note-rotate-2', 'note-rotate-3', 'note-rotate-4', ''];
  const rotationClass = rotationClasses[note.id.charCodeAt(0) % rotationClasses.length];
  
  // Set up draggable functionality
  const { position, isDragging, handleMouseDown, handleTouchStart } = useDraggable({
    initialPosition: note.position || { x: 0, y: 0 },
    onPositionChange: (newPosition) => {
      if (newPosition.x !== note.position?.x || newPosition.y !== note.position?.y) {
        onUpdate(note.id, { position: newPosition });
      }
    }
  });
  
  // Set up resizable functionality
  const { size, isResizing, handleResizeStart } = useResizable({
    initialWidth: note.width || 280,
    initialHeight: note.height || 'auto',
    onSizeChange: (newSize) => {
      if (newSize.width !== note.width) {
        onUpdate(note.id, { 
          width: newSize.width as number,
          height: newSize.height === 'auto' ? undefined : newSize.height as number
        });
      }
    }
  });

  // Update the component when note position changes from props
  useEffect(() => {
    if (note.position && (position.x !== note.position.x || position.y !== note.position.y)) {
      // This ensures positions are synchronized when they come from localStorage
    }
  }, [note.position]);

  const handleUpdatePriority = () => {
    const priorities = ['normal', 'action', 'urgent'] as const;
    const currentIndex = priorities.indexOf(note.priority);
    const nextIndex = (currentIndex + 1) % priorities.length;
    onUpdate(note.id, { priority: priorities[nextIndex] });
  };

  const handleCardInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    // Don't initiate drag when clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('input') || 
      target.closest('textarea') ||
      target.closest('.resize-handle')
    ) {
      return;
    }
    
    // Prevent text selection during drag
    e.preventDefault();
    
    if ('touches' in e) {
      handleTouchStart(e);
    } else {
      handleMouseDown(e);
    }
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
      className={`note-card bg-note-${note.color} p-4 animate-float-in ${rotationClass} ${isDragging ? 'dragging cursor-grabbing' : ''}`}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: size.height === 'auto' ? 'auto' : `${size.height}px`,
        zIndex: isDragging ? 100 : 10 + index,
        animationDelay: `${(parseInt(note.id) % 5) * 0.1}s`,
        transition: isDragging || isResizing ? 'none' : 'box-shadow 0.2s ease, transform 0.2s ease',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleCardInteraction}
      onTouchStart={handleCardInteraction}
    >
      <div className="flex flex-col h-full">
        <div className="mb-1 flex justify-between items-start">
          <h3 className="font-bold text-lg pr-6 break-words">{note.title}</h3>
          <PriorityBadge 
            priority={note.priority} 
            onClick={handleUpdatePriority} 
          />
        </div>
        
        <NoteContent content={note.content} />
        
        <div className="flex justify-end space-x-2 mt-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => setIsEditing(true)}
          >
            <Pencil size={16} />
          </Button>
          
          <NoteDeleteDialog onDelete={() => onDelete(note.id)} />
        </div>
      </div>
      
      <NoteResizeHandle onResizeStart={handleResizeStart} />
    </div>
  );
}
