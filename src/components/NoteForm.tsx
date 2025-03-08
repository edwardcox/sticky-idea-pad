
import React, { useState } from 'react';
import { X, Bold, Italic, Underline } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Note, noteColors, priorities, Priority } from '@/lib/data';
import { PriorityBadge } from './PriorityBadge';

interface NoteFormProps {
  onSubmit: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialNote?: Partial<Note>;
  isEdit?: boolean;
}

export function NoteForm({ 
  onSubmit, 
  onCancel, 
  initialNote = {}, 
  isEdit = false 
}: NoteFormProps) {
  const [title, setTitle] = useState(initialNote.title || '');
  const [content, setContent] = useState(initialNote.content || '');
  const [color, setColor] = useState(initialNote.color || 'yellow');
  const [priority, setPriority] = useState<Priority>(initialNote.priority || 'normal');
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);

  const handleContentSelect = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    setSelectionStart(target.selectionStart);
    setSelectionEnd(target.selectionEnd);
  };

  const applyFormatting = (formatType: 'bold' | 'italic' | 'underline') => {
    if (selectionStart === null || selectionEnd === null || selectionStart === selectionEnd) {
      return;
    }

    const selectedText = content.substring(selectionStart, selectionEnd);
    let formattedText = '';
    let newCursorPosition = selectionStart;

    switch (formatType) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        newCursorPosition += 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        newCursorPosition += 1;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        newCursorPosition += 2;
        break;
    }

    const newContent = 
      content.substring(0, selectionStart) + 
      formattedText + 
      content.substring(selectionEnd);
    
    setContent(newContent);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a title for your note');
      return;
    }
    
    onSubmit({
      title,
      content,
      color: color as Note['color'],
      priority
    });
  };

  const cyclePriority = () => {
    const priorityOrder: Priority[] = ['normal', 'action', 'urgent'];
    const currentIndex = priorityOrder.indexOf(priority);
    const nextIndex = (currentIndex + 1) % priorityOrder.length;
    setPriority(priorityOrder[nextIndex]);
  };

  return (
    <div className={`glass-panel p-6 animate-float-in max-w-xl w-full mx-auto rounded-lg bg-note-${color} note-shadow`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {isEdit ? 'Edit Note' : 'Create New Note'}
        </h2>
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
          <X size={16} />
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              className="w-full px-3 py-2 border border-transparent bg-white/70 backdrop-blur-sm rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>

          <div className="relative">
            <div className="absolute right-2 top-2 z-10 flex space-x-1">
              <PriorityBadge 
                priority={priority} 
                onClick={cyclePriority}
                size={18}
              />
            </div>
            <div className="flex space-x-1 mb-2">
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                className="h-8 w-8 p-0 bg-white/70"
                onClick={() => applyFormatting('bold')}
              >
                <Bold size={14} />
              </Button>
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                className="h-8 w-8 p-0 bg-white/70"
                onClick={() => applyFormatting('italic')}
              >
                <Italic size={14} />
              </Button>
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                className="h-8 w-8 p-0 bg-white/70"
                onClick={() => applyFormatting('underline')}
              >
                <Underline size={14} />
              </Button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onMouseUp={handleContentSelect}
              placeholder="Write your note here..."
              className="w-full h-32 px-3 py-2 border border-transparent bg-white/70 backdrop-blur-sm rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Note Color</label>
            <div className="flex space-x-2">
              {noteColors.map((noteColor) => (
                <button
                  key={noteColor.value}
                  type="button"
                  onClick={() => setColor(noteColor.value as Note['color'])}
                  className={`w-6 h-6 rounded-full ${noteColor.className} ${
                    color === noteColor.value 
                      ? 'ring-2 ring-offset-2 ring-primary' 
                      : 'hover:ring-2 hover:ring-offset-1 hover:ring-primary/50'
                  }`}
                  aria-label={`Set color to ${noteColor.label}`}
                />
              ))}
            </div>
          </div>

          <div className="flex space-x-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="button-press bg-white/70"
            >
              Cancel
            </Button>
            <Button type="submit" className="button-press">
              {isEdit ? 'Update Note' : 'Save Note'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
