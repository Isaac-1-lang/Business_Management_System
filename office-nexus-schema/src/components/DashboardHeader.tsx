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
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { LogOut, User, Settings, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DashboardHeader() {
  const { user, selectedCompany, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await logout();
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account.",
        });
      } catch (error) {
        toast({
          title: "Logout failed",
          description: "There was an error logging out. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="flex-1 flex items-center justify-between">
      {/* Left side - Page title and description */}
      <div>
        {/* Main page title - Large, bold text */}
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {/* Subtitle - Smaller, muted text for context */}
        <p className="text-gray-600">
          Welcome back, {user?.firstName}! Here's what's happening with your business.
        </p>
        {selectedCompany && (
          <p className="text-sm text-gray-500 mt-1">
            Company: {selectedCompany.name}
          </p>
        )}
      </div>
      
      {/* Right side - Actions and notifications */}
      <div className="flex items-center gap-4">
        {/* Notification center for alerts and messages */}
        <NotificationCenter />
        
        {/* User Profile Dropdown */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt={user.firstName} />
                  <AvatarFallback>
                    {getUserInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {user.role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Building className="mr-2 h-4 w-4" />
                <span>Companies</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
