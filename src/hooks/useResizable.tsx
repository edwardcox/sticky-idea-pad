
import { useState, useEffect } from 'react';

interface Size {
  width: number | 'auto';
  height: number | 'auto';
}

interface UseResizableProps {
  initialWidth?: number;
  initialHeight?: number | 'auto';
  onSizeChange?: (size: Size) => void;
}

export function useResizable({ 
  initialWidth = 280, 
  initialHeight = 'auto',
  onSizeChange
}: UseResizableProps) {
  const [size, setSize] = useState<Size>({ 
    width: initialWidth, 
    height: initialHeight 
  });
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState<Size>({ width: 0, height: 0 });
  
  // Update size when props change
  useEffect(() => {
    setSize({
      width: initialWidth,
      height: initialHeight
    });
  }, [initialWidth, initialHeight]);
  
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ 
      width: size.width as number, 
      height: size.height === 'auto' ? 200 : size.height as number 
    });
    
    window.addEventListener('mousemove', handleResize);
    window.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleResize = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const newWidth = Math.max((startSize.width as number) + (e.clientX - startPos.x), 200);
    const newHeight = Math.max((startSize.height as number) + (e.clientY - startPos.y), 150);
    
    const newSize = {
      width: newWidth,
      height: newHeight
    };
    
    setSize(newSize);
  };
  
  const handleMouseUp = () => {
    if (isResizing) {
      setIsResizing(false);
      
      // Notify about size change if callback provided
      if (onSizeChange) {
        onSizeChange(size);
      }
      
      // Remove resize event listeners
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleMouseUp);
    }
  };
  
  return {
    size,
    isResizing,
    handleResizeStart
  };
}
