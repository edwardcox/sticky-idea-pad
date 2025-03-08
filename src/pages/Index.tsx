
import React, { useState } from 'react';
import { NoteCard } from '@/components/NoteCard';
import { AddNoteButton } from '@/components/AddNoteButton';
import { NoteForm } from '@/components/NoteForm';
import { useNotes } from '@/hooks/useNotes';
import { StickyNote } from 'lucide-react';

const Index = () => {
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const [isAddingNote, setIsAddingNote] = useState(false);

  return (
    <div className="min-h-screen bg-[#f9f9f9] pb-20">
      <header className="bg-white shadow-sm py-4 px-6 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StickyNote className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Sticky Notes</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notes.length === 0 && !isAddingNote ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-primary/5 p-12 rounded-full mb-6 animate-pulse-subtle">
              <StickyNote className="h-16 w-16 text-primary/70" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No notes yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first note by clicking the + button in the bottom right corner.
            </p>
            <button
              onClick={() => setIsAddingNote(true)}
              className="button-press text-primary underline font-medium"
            >
              Create my first note
            </button>
          </div>
        ) : (
          <div className="note-container">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onUpdate={updateNote}
                onDelete={deleteNote}
              />
            ))}
          </div>
        )}

        {isAddingNote && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <NoteForm
              onSubmit={(newNote) => {
                addNote(newNote);
                setIsAddingNote(false);
              }}
              onCancel={() => setIsAddingNote(false)}
            />
          </div>
        )}
      </main>

      <AddNoteButton onClick={() => setIsAddingNote(true)} />
    </div>
  );
};

export default Index;
