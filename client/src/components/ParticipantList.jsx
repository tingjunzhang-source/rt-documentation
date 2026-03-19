import { useState } from 'react';
import CSVUpload from './CSVUpload';
import DBSettings from './DBSettings';
import Avatar from './Avatar';

export default function ParticipantList({ participants, loading, error, selected, onSelect, onRefetch }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'undo' | 'in_progress' | 'done'
  const [showCSV, setShowCSV] = useState(false);
  const [showDB, setShowDB] = useState(false);

  const filtered = participants.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'done' && p.status === 'done') ||
      (filter === 'in_progress' && p.status === 'in_progress') ||
      (filter === 'undo' && p.status === 'pending');
    return matchesSearch && matchesFilter;
  });

  const pending = filtered.filter((p) => p.status === 'pending');
  const inProgress = filtered.filter((p) => p.status === 'in_progress');
  const done = filtered.filter((p) => p.status === 'done');

  const remainingCount = participants.filter((p) => p.status !== 'done').length;
  const doneCount = participants.filter((p) => p.status === 'done').length;

  return (
    <aside className="flex flex-col h-full bg-white border-r border-gray-200 w-full md:w-72 shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Participants</h2>
          {/* Filter tabs */}
          <div className="flex gap-1 flex-wrap justify-end">
            {[['all', 'All'], ['undo', 'Undo'], ['in_progress', 'In Progress'], ['done', 'Done']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className="px-2 py-0.5 text-xs rounded-md font-medium transition-colors"
                style={filter === val
                  ? { backgroundColor: '#00A7A2', color: 'white' }
                  : { backgroundColor: '#f3f4f6', color: '#6b7280' }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <input
          type="text"
          placeholder="Search name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A7A2]"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && <p className="text-sm text-gray-400 text-center py-8">Loading...</p>}
        {error && <p className="text-sm text-red-500 text-center py-4 px-3">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No participants found.</p>
        )}

        {/* Pending */}
        {pending.map((p) => (
          <ParticipantRow
            key={p.id}
            participant={p}
            isSelected={selected?.id === p.id}
            onClick={() => onSelect(p)}
          />
        ))}

        {/* In Progress */}
        {inProgress.length > 0 && (
          <>
            {pending.length > 0 && (
              <div className="px-4 py-1 text-xs text-amber-600 bg-amber-50 border-b border-amber-100 uppercase tracking-wide">
                In Progress
              </div>
            )}
            {inProgress.map((p) => (
              <ParticipantRow
                key={p.id}
                participant={p}
                isSelected={selected?.id === p.id}
                onClick={() => onSelect(p)}
                isInProgress
              />
            ))}
          </>
        )}

        {/* Done */}
        {done.length > 0 && (
          <>
            {(pending.length > 0 || inProgress.length > 0) && (
              <div className="px-4 py-1 text-xs text-gray-400 bg-gray-50 border-b border-gray-100 uppercase tracking-wide">
                Completed today
              </div>
            )}
            {done.map((p) => (
              <ParticipantRow
                key={p.id}
                participant={p}
                isSelected={selected?.id === p.id}
                onClick={() => onSelect(p)}
                isDone
              />
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 flex flex-col gap-2">
        <div className="text-xs text-gray-400 text-center">
          {remainingCount} remaining · {doneCount} done
        </div>
        <button
          onClick={() => setShowCSV(true)}
          className="w-full py-2 px-3 text-sm text-white rounded-lg transition-colors"
          style={{ backgroundColor: '#00A7A2' }}
        >
          Upload CSV
        </button>
        <button
          onClick={() => setShowDB(true)}
          className="w-full py-2 px-3 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          DB Settings
        </button>
      </div>

      {showCSV && (
        <CSVUpload onClose={() => setShowCSV(false)} onSuccess={() => { setShowCSV(false); onRefetch(); }} />
      )}
      {showDB && (
        <DBSettings onClose={() => setShowDB(false)} onSuccess={() => { setShowDB(false); onRefetch(); }} />
      )}
    </aside>
  );
}

function ParticipantRow({ participant: p, isSelected, onClick, isDone = false, isInProgress = false }) {
  return (
    <div
      onClick={onClick}
      className={`w-full px-3 py-2.5 border-b border-gray-100 transition-colors flex items-center gap-3 cursor-pointer border-l-[3px]
        ${isSelected
          ? isDone
            ? 'bg-green-50 border-l-green-400'
            : isInProgress
              ? 'bg-amber-100 border-l-amber-500'
              : 'bg-[#00A7A2]/10 border-l-[#00A7A2]'
          : 'hover:bg-gray-50 border-l-transparent'
        }`}
    >
      <div className={`shrink-0 ${isDone ? 'opacity-40 grayscale' : ''}`}>
        <Avatar
          src={p.avatar_url ? `http://localhost:3001${p.avatar_url}` : null}
          name={p.name}
          size={36}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate leading-tight
          ${isDone
            ? 'line-through text-gray-400'
            : isSelected
              ? isInProgress ? 'text-amber-600 font-medium' : 'text-[#00A7A2] font-medium'
              : 'text-gray-800'
          }`}>
          {p.name}
        </p>
        {isDone && <p className="text-xs text-green-500 leading-tight">✓ documented</p>}
        {isInProgress && <p className="text-xs text-amber-500 leading-tight">📝 draft saved</p>}
      </div>
    </div>
  );
}
