/**
 * DASHBOARD HEADER COMPONENT - DashboardHeader.tsx
 * 
 * This component displays the main page header with:
 * 1. Page title and description
 * 2. Notification center
 * 3. Optional breadcrumb navigation
 * 
 * USAGE:
 * - Used on the main dashboard page (Index.tsx)
 * - Can be customized for other pages by passing props
 * - Automatically adapts to different page contexts
 * 
 * TO CUSTOMIZE:
 * 1. Modify the title and description text
 * 2. Add more header elements (breadcrumbs, actions, etc.)
 * 3. Pass props for dynamic content
 * 4. Style using Tailwind CSS classes
 * 
 * STYLING:
 * - Uses Tailwind CSS for responsive design
 * - text-2xl for large, prominent title
 * - text-gray-900 for dark title text
 * - text-gray-600 for subtle description text
 * - flex layout for responsive positioning
 */

import { NotificationCenter } from "@/components/notifications/NotificationCenter";

export function DashboardHeader() {
  return (
    <div className="flex-1 flex items-center justify-between">
      {/* Left side - Page title and description */}
      <div>
        {/* Main page title - Large, bold text */}
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {/* Subtitle - Smaller, muted text for context */}
        <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
      </div>
      
      {/* Right side - Actions and notifications */}
      <div className="flex items-center gap-4">
        {/* Notification center for alerts and messages */}
        <NotificationCenter />
        {/* 
          You can add more header elements here:
          - Search bar
          - User profile dropdown
          - Action buttons
          - Breadcrumb navigation
        */}
      </div>
    </div>
  );
}
