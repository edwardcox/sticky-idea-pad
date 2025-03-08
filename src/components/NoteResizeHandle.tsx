
import React from 'react';

interface NoteResizeHandleProps {
  onResizeStart: (e: React.MouseEvent) => void;
}

export function NoteResizeHandle({ onResizeStart }: NoteResizeHandleProps) {
  return (
    <div 
      className="resize-handle"
      onMouseDown={onResizeStart}
    ></div>
  );
}
