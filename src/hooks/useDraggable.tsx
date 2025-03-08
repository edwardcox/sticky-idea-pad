
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
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Update position when initialPosition prop changes and not dragging
  useEffect(() => {
    if (!isDragging && initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition, isDragging]);

  // Handle mouse and touch events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    setOffset({
      x: clientX - position.x,
      y: clientY - position.y
    });
    
    setIsDragging(true);
    
    // Use document-level event listeners for better tracking outside the element
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const x = Math.max(0, moveEvent.clientX - offset.x);
      const y = Math.max(0, moveEvent.clientY - offset.y);
      setPosition({ x, y });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      if (onPositionChange) {
        onPositionChange(position);
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [position, offset, onPositionChange]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const clientX = touch.clientX;
    const clientY = touch.clientY;
    
    setOffset({
      x: clientX - position.x,
      y: clientY - position.y
    });
    
    setIsDragging(true);
    
    // Use document-level event listeners for better tracking outside the element
    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length !== 1) return;
      
      moveEvent.preventDefault(); // Prevent scrolling while dragging
      
      const touch = moveEvent.touches[0];
      const x = Math.max(0, touch.clientX - offset.x);
      const y = Math.max(0, touch.clientY - offset.y);
      setPosition({ x, y });
    };
    
    const handleTouchEnd = () => {
      setIsDragging(false);
      if (onPositionChange) {
        onPositionChange(position);
      }
      
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);
  }, [position, offset, onPositionChange]);

  // Clean up event listeners when component unmounts
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', () => {});
      document.removeEventListener('mouseup', () => {});
      document.removeEventListener('touchmove', () => {});
      document.removeEventListener('touchend', () => {});
      document.removeEventListener('touchcancel', () => {});
    };
  }, []);

  return {
    position,
    isDragging,
    handleMouseDown,
    handleTouchStart
  };
}
