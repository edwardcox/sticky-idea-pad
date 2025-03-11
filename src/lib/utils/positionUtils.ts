
// Utilities for handling note positions

// Helper to generate a random position within the expanded viewport
export const generateRandomPosition = () => {
  // Get window dimensions with multipliers to create a larger workspace
  const maxX = typeof window !== 'undefined' ? Math.max(window.innerWidth * 1.8, 1800) : 1800;
  const maxY = typeof window !== 'undefined' ? Math.max(window.innerHeight * 3.5, 3500) : 3500;
  
  return {
    x: Math.floor(Math.random() * maxX) + 50,
    y: Math.floor(Math.random() * maxY) + 50
  };
};

// Validate and fix position if needed
export const ensureValidPosition = (position: any, fallbackIndex: number = 0) => {
  if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
    return { 
      x: 100 + (fallbackIndex * 50), 
      y: 100 + (fallbackIndex * 150) 
    };
  }
  return position;
};
