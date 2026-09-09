import React, { useMemo, useState } from 'react';
import { HistoryRecord } from '../types';

interface HistoryListProps {
  records: HistoryRecord[];
  onSelectRecord: (record: HistoryRecord) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ records, onSelectRecord }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState<'ALL' | 'REAL' | 'FAKE'>('ALL');

  const formatDate = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Filter by Result
      if (filterResult !== 'ALL' && rec.result !== filterResult) {
        return false;
      }
      // Filter by Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesType = rec.documentType.toLowerCase().includes(query);
        const matchesName = rec.fields.fullName.toLowerCase().includes(query);
        const matchesDocNum = (rec.fields.documentNumber || '').toLowerCase().includes(query);
        const matchesFileName = rec.fileName.toLowerCase().includes(query);
        return matchesType || matchesName || matchesDocNum || matchesFileName;
      }
      return true;
    });
  }, [records, searchTerm, filterResult]);

  return (
    <div className="w-full space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <input
            id="search-documents-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents..."
            className="w-full px-3.5 py-2 text-sm bg-white border border-neutral-300 rounded focus:outline-none focus:border-neutral-900 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-1.5 self-start sm:self-auto">
          {(['ALL', 'REAL', 'FAKE'] as const).map((filter) => {
            const isActive = filterResult === filter;
            return (
              <button
                key={filter}
                id={`filter-btn-${filter.toLowerCase()}`}
                type="button"
                onClick={() => setFilterResult(filter)}
                className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                {filter === 'ALL' ? 'All' : filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* History Items List */}
      {filteredRecords.length === 0 ? (
        <div className="p-12 text-center border border-neutral-200 rounded-lg bg-neutral-50/50">
          <p className="text-sm text-neutral-500 font-medium">No verification records found.</p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg bg-white overflow-hidden">
          {filteredRecords.map((record) => {
            const isReal = record.result === 'REAL';
            return (
              <div
                key={record.id}
                id={`history-item-${record.id}`}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/60 transition-colors"
              >
                <div className="flex items-start sm:items-center space-x-4">
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900">
                      {record.documentType || 'Official Document'}
                    </h3>
                    <div className="flex items-center space-x-3 text-xs text-neutral-500 mt-0.5">
                      <span>{formatDate(record.createdAt)}</span>
                      {record.fields.fullName && record.fields.fullName !== 'Not detected' && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[150px]">{record.fields.fullName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded border uppercase tracking-wide ${
                      isReal
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-red-50 text-red-800 border-red-300'
                    }`}
                  >
                    {record.result}
                  </span>

                  <button
                    id={`btn-view-record-${record.id}`}
                    type="button"
                    onClick={() => onSelectRecord(record)}
                    className="px-3 py-1.5 text-xs font-medium text-neutral-800 bg-white border border-neutral-300 rounded hover:bg-neutral-100 hover:border-neutral-400 transition-colors cursor-pointer"
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
