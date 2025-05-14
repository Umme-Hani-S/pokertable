import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect based on user role
      if (user.role === 'admin') {
        setLocation('/admin');
      } else if (user.role === 'club_owner') {
        setLocation('/clubs');
      } else if (user.role === 'dealer') {
        setLocation('/tables');
      }
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Redirecting...</h1>
        <p className="text-muted-foreground">Taking you to your dashboard</p>
      </div>
    </div>
  );
}