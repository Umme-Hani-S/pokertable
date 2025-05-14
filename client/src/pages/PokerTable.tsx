import React, { useEffect, useState } from 'react';
import PokerTableComponent from '@/components/PokerTable';
import { Helmet } from 'react-helmet';
import { useLocation, useParams } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

const PokerTablePage: React.FC = () => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [tableId, setTableId] = useState<number>(1);
  const [clubId, setClubId] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extract clubId and tableId from the URL or use defaults from user context
    if (user) {
      // Parse URL for IDs first (format: /poker-table/clubId/tableId)
      const pathParts = location.split('/').filter(Boolean);
      if (pathParts.length >= 3) {
        // URL format is /poker-table/:clubId/:tableId
        const urlClubId = parseInt(pathParts[1]);
        const urlTableId = parseInt(pathParts[2]);
        
        if (!isNaN(urlClubId)) setClubId(urlClubId);
        if (!isNaN(urlTableId)) setTableId(urlTableId);
      } else {
        // Use defaults from user context or API
        // This would be a good place to fetch the dealer's assigned table
        // For now, we use defaults
        setClubId(1);
        setTableId(1);
      }
      setIsLoading(false);
    }
  }, [user, location]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  }

  return (
    <>
      <Helmet>
        <title>Poker Table Management</title>
        <meta name="description" content="Manage poker tables, track player time, and handle seat assignments" />
      </Helmet>
      <PokerTableComponent tableId={tableId} clubId={clubId} />
    </>
  );
};

export default PokerTablePage;