import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import CreateIncidentModal from '../incidents/CreateIncidentModal';

interface AppLayoutProps {
  children: React.ReactNode;
  activeIncidentCount?: number;
  onIncidentCreated?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeIncidentCount,
  onIncidentCreated,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleIncidentCreated = () => {
    setIsCreateModalOpen(false);
    if (onIncidentCreated) {
      onIncidentCreated();
    }
  };

  return (
    <div className="min-h-screen bg-[#050d1a]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar activeIncidentCount={activeIncidentCount} />
      <Header
        onNewIncidentClick={() => setIsCreateModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="ml-[240px] pt-[64px] min-h-screen">
        {children}
      </main>

      {/* Global Create Incident Modal */}
      {isCreateModalOpen && (
        <CreateIncidentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleIncidentCreated}
        />
      )}
    </div>
  );
};

export default AppLayout;
