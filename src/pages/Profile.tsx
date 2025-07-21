import React from 'react';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your profile settings
            </p>
          </div>

          <Card className="text-center p-12">
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Profile Coming Soon
            </h3>
            <p className="text-muted-foreground mb-6">
              Profile management features will be available here.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;