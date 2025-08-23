/**
 * MAIN ENTRY POINT - office-nexus-schema
 * 
 * This file is the entry point for the React application. It:
 * 1. Creates the root React element
 * 2. Renders the main App component into the DOM
 * 3. Initializes the application
 * 
 * TO START WORKING ON THE FRONTEND:
 * 1. Run 'npm install' or 'bun install' to install dependencies
 * 2. Run 'npm run dev' or 'bun dev' to start the development server
 * 3. The app will open in your browser at http://localhost:5173
 * 4. Make changes to components in the src/ folder and see live updates
 */

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create the root React element and render the App component
// This is where the React application starts
createRoot(document.getElementById("root")!).render(<App />);
