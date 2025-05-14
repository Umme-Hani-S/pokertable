import React from 'react';
import PokerTableComponent from '@/components/PokerTable';
import { Helmet } from 'react-helmet';

const PokerTablePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Poker Table Management</title>
        <meta name="description" content="Manage poker tables, track player time, and handle seat assignments" />
      </Helmet>
      <PokerTableComponent />
    </>
  );
};

export default PokerTablePage;