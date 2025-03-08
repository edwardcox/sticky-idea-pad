
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AddNoteButtonProps {
  onClick: () => void;
  className?: string;
}

export function AddNoteButton({ onClick, className }: AddNoteButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-10 text-white button-press",
        "bg-primary hover:bg-primary/90",
        className
      )}
    >
      <Plus size={24} />
    </Button>
  );
}
