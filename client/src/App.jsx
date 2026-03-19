import { useState } from 'react';
import ParticipantList from './components/ParticipantList';
import DocumentationForm from './components/DocumentationForm';
import { useParticipants } from './hooks/useParticipants';
import { usePresets } from './hooks/usePresets';

export default function App() {
  const { participants, loading, error, refetch, markDone, markInProgress } = useParticipants();
  const presets = usePresets();
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editMode, setEditMode] = useState(false);

  function handleSelect(participant) {
    setSelectedParticipant(participant);
    if (window.innerWidth < 768) setSidebarOpen(false);
  }

  function handleMarkDone(id) {
    markDone(id);
    const remaining = participants.filter((p) => p.status !== 'done' && p.id !== id);
    setSelectedParticipant(remaining.length > 0 ? remaining[0] : null);
  }

  function handleSave(id) {
    markInProgress(id);
    setSelectedParticipant((prev) => prev ? { ...prev, status: 'in_progress' } : prev);
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="h-screen flex flex-col bg-gray-100 font-sans">
      {/* Top navbar */}
      <header className={`text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md transition-colors ${editMode ? 'bg-red-600' : 'bg-[#00A7A2]'}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="md:hidden p-1 rounded hover:bg-white/20 transition-colors"
            aria-label="Toggle participant list"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-base font-bold leading-tight">RT Documentation</h1>
            <p className="text-xs text-white/70 leading-tight hidden sm:block">
              {editMode ? 'Editing button options — changes save automatically' : 'PACE Day Center'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Edit Mode toggle */}
          <button
            onClick={() => setEditMode((e) => !e)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors
              ${editMode
                ? 'bg-white text-red-700 border-white hover:bg-red-50'
                : 'bg-white/15 text-white border-white/40 hover:bg-white/25'
              }`}
          >
            {editMode ? '✓ Done Editing' : 'Edit Options'}
          </button>

          <div className="text-right hidden sm:block">
            <p className="text-xs text-white/70">{today}</p>
            <p className="text-xs text-white/90">
              {participants.filter((p) => p.status !== 'done').length} remaining
            </p>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <div className={`${sidebarOpen ? 'flex' : 'hidden'} md:flex flex-col`}>
          <ParticipantList
            participants={participants}
            loading={loading}
            error={error}
            selected={selectedParticipant}
            onSelect={handleSelect}
            onRefetch={refetch}
          />
        </div>

        <DocumentationForm
          participant={selectedParticipant}
          onMarkDone={handleMarkDone}
          onSave={handleSave}
          editMode={editMode}
          presets={presets}
          onRefetch={refetch}
        />
      </div>
    </div>
  );
}
