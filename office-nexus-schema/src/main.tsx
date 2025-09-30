import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create the root React element and render the App component
// This is where the React application starts
createRoot(document.getElementById("root")!).render(<App />);
