
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Log some debugging information
console.log("Environment:", import.meta.env);
console.log("BASE_URL:", import.meta.env.BASE_URL);

createRoot(document.getElementById("root")!).render(<App />);
