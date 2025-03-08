
import { useState, useEffect, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDraggableProps {
  initialPosition: Position;
  onPositionChange?: (position: Position) => void;
}

export function useDraggable({ initialPosition, onPositionChange }: UseDraggableProps) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  // Update position when initialPosition prop changes
  useEffect(() => {
    if (!isDragging && initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition, isDragging]);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
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
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newPosition = {
      x: Math.max(0, e.clientX - startPos.x),
      y: Math.max(0, e.clientY - startPos.y)
    };
    
    setPosition(newPosition);
  }, [isDragging, startPos]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      
      // Notify about position change if callback provided
      if (onPositionChange) {
        onPositionChange(position);
      }
      
      // Remove event listeners
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging, onPositionChange, position, handleMouseMove]);

  // Clean up event listeners when component unmounts
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return {
    position,
    isDragging,
    handleMouseDown
  };
}
