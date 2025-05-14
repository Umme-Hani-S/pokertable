import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setLocation('/auth');
  };

  if (!user) return null;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Poker Table Management</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="mr-4 text-sm font-medium">
            <User className="h-4 w-4 inline-block mr-2" />
            {user.username} ({user.role})
          </div>
          
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}