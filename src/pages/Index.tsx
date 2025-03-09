import React, { useState, useEffect, useRef } from 'react';
import { NoteCard } from '@/components/NoteCard';
import { AddNoteButton } from '@/components/AddNoteButton';
import { NoteForm } from '@/components/NoteForm';
import { useNotes } from '@/hooks/useNotes';
import { StickyNote } from 'lucide-react';

const Index = () => {
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const [isAddingNote, setIsAddingNote] = useState(false);
  const notesContainerRef = useRef<HTMLDivElement>(null);
  
  const handleAddNote = (newNote: any) => {
    let initialPosition = { x: 100, y: 100 };
    
    if (notesContainerRef.current) {
      const container = notesContainerRef.current;
      const rect = container.getBoundingClientRect();
      
      initialPosition = {
        x: Math.floor(Math.random() * (rect.width - 300)) + 50,
        y: Math.floor(Math.random() * (Math.min(500, rect.height - 300))) + 100
      };
    }
    
    const noteWithPosition = {
      ...newNote,
      position: initialPosition
    };
    
    addNote(noteWithPosition);
    setIsAddingNote(false);
  };

  useEffect(() => {
    console.log("Notes loaded in Index:", notes);
    console.log("Number of notes:", notes.length);
    notes.forEach((note, i) => {
      console.log(`Note ${i}: id=${note.id}, title=${note.title}, position=${note.position?.x},${note.position?.y}`);
    });
  }, [notes]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9f9] relative">
      <header className="bg-white shadow-sm py-4 px-6 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StickyNote className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Sticky Ideas</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </div>
        </div>
      </header>

      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-8 relative overflow-auto workspace-scroll">
        <div 
          ref={notesContainerRef} 
          className="notes-workspace relative"
          style={{ 
            position: 'relative', 
            width: '200%', 
            minHeight: '400vh', 
            height: '400vh',
            overflow: 'visible',
            border: '1px dashed rgba(0, 0, 0, 0.1)',
            margin: '0 auto'
          }}
        >
          {notes.length === 0 && !isAddingNote ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-primary/5 p-12 rounded-full mb-6 animate-pulse-subtle">
                <StickyNote className="h-16 w-16 text-primary/70" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No ideas yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Create your first idea by clicking the + button in the bottom right corner.
              </p>
              <button
                onClick={() => setIsAddingNote(true)}
                className="button-press text-primary underline font-medium"
              >
                Create my first idea
              </button>
            </div>
          ) : (
            <>
              {notes.map((note, index) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onUpdate={updateNote}
                  onDelete={deleteNote}
                  index={index}
                />
              ))}
            </>
          )}
        </div>

        {isAddingNote && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <NoteForm
              onSubmit={handleAddNote}
              onCancel={() => setIsAddingNote(false)}
            />
          </div>
        )}
      </main>

      <footer className="app-footer bg-white border-t py-4 text-center text-sm text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>©2025 Edward Cox • Version 1.0</p>
        </div>
      </footer>

      <AddNoteButton onClick={() => setIsAddingNote(true)} />
    </div>
  );
};

export default Index;
