export type Priority = 'urgent' | 'action' | 'normal';

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
  position?: { x: number, y: number };
  width?: number;
  height?: number;
}

// Default notes for initial state
export const defaultNotes: Note[] = [
  {
    id: '1',
    title: 'Welcome to Sticky Notes',
    content: 'This is your new notes app! Click the + button to add a new note.',
    color: 'yellow',
    priority: 'normal',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    title: 'Format Your Notes',
    content: 'You can make text **bold**, *italic*, or __underlined__. Try the formatting options!',
    color: 'blue',
    priority: 'action',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    title: 'Set Priority Levels',
    content: 'Notes can be set to Urgent, Action Required, or Normal priority. Click the priority icon to change it.',
    color: 'pink',
    priority: 'urgent',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const noteColors = [
  { value: 'yellow', label: 'Yellow', className: 'bg-note-yellow' },
  { value: 'blue', label: 'Blue', className: 'bg-note-blue' },
  { value: 'green', label: 'Green', className: 'bg-note-green' },
  { value: 'pink', label: 'Pink', className: 'bg-note-pink' },
  { value: 'orange', label: 'Orange', className: 'bg-note-orange' },
];

export const priorities = [
  { value: 'urgent', label: 'Urgent', color: 'priority-urgent', icon: 'circle-alert' },
  { value: 'action', label: 'Action Required', color: 'priority-action', icon: 'circle-alert' },
  { value: 'normal', label: 'Normal', color: 'priority-normal', icon: 'circle-check' },
];
