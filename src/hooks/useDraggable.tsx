
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
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const boundaryRef = useRef({
    width: typeof window !== 'undefined' ? window.innerWidth * 2 : 2000,
    height: typeof window !== 'undefined' ? window.innerHeight * 4 : 4000
  });

  // Update window dimensions on resize
  useEffect(() => {
    const updateBoundary = () => {
      boundaryRef.current = {
        width: window.innerWidth * 2, // Doubled the width
        height: window.innerHeight * 4 // Quadrupled the height for much more vertical space
      };
      console.log("Boundary updated:", boundaryRef.current);
    };

    updateBoundary();
    window.addEventListener('resize', updateBoundary);
    return () => window.removeEventListener('resize', updateBoundary);
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("useDraggable initialPosition:", initialPosition);
  }, [initialPosition]);

  // Update internal position when initialPosition changes and not dragging
  useEffect(() => {
    if (!isDragging) {
      console.log("Setting position from initialPosition:", initialPosition);
      setPosition(initialPosition);
    }
  }, [initialPosition, isDragging]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const clientX = e.clientX;
    const clientY = e.clientY;
    
    setOffset({
      x: clientX - position.x,
      y: clientY - position.y
    });
    
    setIsDragging(true);
    console.log("Mouse down - dragging started at", position);
    
    // Add class to body to indicate dragging (helps with cursor and preventing text selection)
    document.body.classList.add('dragging');
  }, [position]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    
    // Important: prevent default to avoid scrolling
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    const clientX = touch.clientX;
    const clientY = touch.clientY;
    
    setOffset({
      x: clientX - position.x,
      y: clientY - position.y
    });
    
    setIsDragging(true);
    console.log("Touch start - dragging started at", position);
    
    // Add class to body to indicate dragging
    document.body.classList.add('dragging');
  }, [position]);

  // Set up document-level event handlers when dragging starts
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      
      // Calculate new position with expanded boundary limits
      const newX = Math.max(0, Math.min(e.clientX - offset.x, boundaryRef.current.width - 100));
      const newY = Math.max(0, Math.min(e.clientY - offset.y, boundaryRef.current.height - 100));
      
      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      
      // Explicitly prevent default behavior to avoid scrolling
      e.preventDefault();
      
      const touch = e.touches[0];
      
      // Calculate new position with expanded boundary limits
      const newX = Math.max(0, Math.min(touch.clientX - offset.x, boundaryRef.current.width - 100));
      const newY = Math.max(0, Math.min(touch.clientY - offset.y, boundaryRef.current.height - 100));
      
      setPosition({ x: newX, y: newY });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      
      // Call the callback with the current position
      if (onPositionChange) {
        console.log("Drag ended - updating position to", position);
        onPositionChange(position);
      }
      
      // Remove dragging class
      document.body.classList.remove('dragging');
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
    document.addEventListener('touchcancel', handleDragEnd);

    console.log("Drag event listeners added");

    // Clean up
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleDragEnd);
      document.removeEventListener('touchcancel', handleDragEnd);
      document.body.classList.remove('dragging');
      console.log("Drag event listeners removed");
    };
  }, [isDragging, offset, position, onPositionChange]);

  return {
    position,
    isDragging,
    handleMouseDown,
    handleTouchStart
  };
}
