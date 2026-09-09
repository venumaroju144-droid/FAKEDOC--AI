import React, { useEffect, useState } from 'react';
import { HistoryDetails } from '../components/HistoryDetails';
import { HistoryList } from '../components/HistoryList';
import { getUserHistory } from '../services/storage';
import { HistoryRecord, User } from '../types';

interface HistoryProps {
  currentUser: User;
}

export const History: React.FC<HistoryProps> = ({ currentUser }) => {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);

  useEffect(() => {
    if (currentUser?.id) {
      const userRecords = getUserHistory(currentUser.id);
      setRecords(userRecords);
    }
  }, [currentUser]);

  return (
    <div className="w-full">
      {selectedRecord ? (
        <HistoryDetails
          record={selectedRecord}
          onBack={() => setSelectedRecord(null)}
        />
      ) : (
        <div className="space-y-6">
          <div>
            <h1 id="history-page-title" className="text-2xl font-semibold text-neutral-900 tracking-tight">
              Verification History
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Review previous verification results, document extractions, and analyses
            </p>
          </div>

          <HistoryList
            records={records}
            onSelectRecord={(rec) => setSelectedRecord(rec)}
          />
        </div>
      )}
    </div>
  );
};
