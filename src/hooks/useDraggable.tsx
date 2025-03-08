import { useState, useEffect, useCallback, useRef } from 'react';

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
  const positionRef = useRef(position);
  
  // Keep the ref in sync with the state
  useEffect(() => {
    positionRef.current = position;
  }, [position]);
  
  // Update position when initialPosition prop changes
  useEffect(() => {
    if (!isDragging && initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition, isDragging]);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Prevent default to stop text selection during drag
    e.preventDefault();
    
    // Ignore if clicking on buttons or form elements
    if ((e.target as HTMLElement).closest('button') || 
        (e.target as HTMLElement).closest('input') ||
        (e.target as HTMLElement).closest('textarea') ||
        (e.target as HTMLElement).closest('.resize-handle') ||
        (e.target as any).contentEditable === 'true') {
      return;
    }
    
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    
    // Add event listeners to window to handle dragging
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    // Prevent default browser behavior during drag
    e.preventDefault();
    
    const newPosition = {
      x: Math.max(0, e.clientX - startPos.x),
      y: Math.max(0, e.clientY - startPos.y)
    };
    
    setPosition(newPosition);
  }, [isDragging, startPos]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (isDragging) {
      // Prevent any default browser behavior
      e.preventDefault();
      e.stopPropagation();
      
      setIsDragging(false);
      
      // Notify about position change if callback provided
      if (onPositionChange) {
        onPositionChange(positionRef.current);
      }
      
      // Remove event listeners - use document instead of window for better reliability
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging, onPositionChange, handleMouseMove]);

  // Clean up event listeners when component unmounts
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Handle touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Ignore if touching on buttons or form elements
    if ((e.target as HTMLElement).closest('button') || 
        (e.target as HTMLElement).closest('input') ||
        (e.target as HTMLElement).closest('textarea') ||
        (e.target as HTMLElement).closest('.resize-handle') ||
        (e.target as any).contentEditable === 'true') {
      return;
    }
    
    const touch = e.touches[0];
    setIsDragging(true);
    setStartPos({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    
    // Add event listeners to document for better reliability
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }, [position]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    
    // Prevent scrolling while dragging
    e.preventDefault();
    
    const touch = e.touches[0];
    const newPosition = {
      x: Math.max(0, touch.clientX - startPos.x),
      y: Math.max(0, touch.clientY - startPos.y)
    };
    
    setPosition(newPosition);
  }, [isDragging, startPos]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (isDragging) {
      setIsDragging(false);
      
      // Notify about position change if callback provided
      if (onPositionChange) {
        onPositionChange(positionRef.current);
      }
      
      // Remove event listeners
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    }
  }, [isDragging, onPositionChange, handleTouchMove]);

  // Clean up touch event listeners when component unmounts
  useEffect(() => {
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchMove, handleTouchEnd]);

  return {
    position,
    isDragging,
    handleMouseDown,
    handleTouchStart
  };
}
