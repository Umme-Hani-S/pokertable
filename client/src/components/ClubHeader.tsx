import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ArrowLeft, Users, Table2, Clock, List } from 'lucide-react';

interface ClubHeaderProps {
  clubId: number;
  clubName: string;
  clubAddress?: string;
  activeTab?: string;
}

export function ClubHeader({ clubId, clubName, clubAddress, activeTab }: ClubHeaderProps) {
  const [_, setLocation] = useLocation();

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{clubName}</CardTitle>
            {clubAddress && (
              <CardDescription>{clubAddress}</CardDescription>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setLocation(clubId ? `/clubs/${clubId}` : '/clubs')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Club
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={activeTab === 'tables' ? 'default' : 'outline'}
            onClick={() => setLocation(`/clubs/${clubId}/tables`)}
          >
            <Table2 className="mr-2 h-4 w-4" />
            Tables
          </Button>
          <Button 
            variant={activeTab === 'players' ? 'default' : 'outline'}
            onClick={() => setLocation(`/clubs/${clubId}/players`)}
          >
            <Users className="mr-2 h-4 w-4" />
            Players
          </Button>
          <Button 
            variant={activeTab === 'player-management' ? 'default' : 'outline'}
            onClick={() => setLocation(`/clubs/${clubId}/player-management`)}
          >
            <List className="mr-2 h-4 w-4" />
            Queue Management
          </Button>
          <Button 
            variant={activeTab === 'sessions' ? 'default' : 'outline'}
            onClick={() => setLocation(`/clubs/${clubId}/sessions`)}
          >
            <Clock className="mr-2 h-4 w-4" />
            Sessions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}