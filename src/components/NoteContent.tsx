
import React from 'react';

interface NoteContentProps {
  content: string;
}

export function NoteContent({ content }: NoteContentProps) {
  const formatContent = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div 
      className="note-content flex-grow mb-4 overflow-hidden"
      dangerouslySetInnerHTML={{ __html: formatContent(content) }}
    />
  );
}
