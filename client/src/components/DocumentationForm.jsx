import { useState, useEffect, useRef } from 'react';
import ExerciseSection from './ExerciseSection';
import DiabeticSection from './DiabeticSection';
import OOSASection from './OOSASection';
import SocializationSection from './SocializationSection';
import GeneratedNote from './GeneratedNote';
import Avatar from './Avatar';
import { todayString } from '../utils/generateNote';

function defaultForm() {
  return {
    date: todayString(),
    hasExercise: false,
    exerciseType: '',
    participantFell: 'N',
    hasDiabetic: false,
    hasOOSA: false,
    oosaStart: '',
    oosaEnd: '',
    oosaReason: '',
    oosaReasonOpen: false,
    hasSocialization: true,
    activities: [],
    customActivity: '',
    selfEngaged: 'Y',
    understoodInstructions: 'Y',
    barriers: 'none',
    customBarrier: '',
  };
}

export default function DocumentationForm({ participant, onMarkDone, onSave, editMode, presets, onRefetch }) {
  const [formData, setFormData] = useState(defaultForm());
  const [avatarHovered, setAvatarHovered] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locked, setLocked] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    async function loadDraft() {
      if (!participant?.id) {
        setFormData(defaultForm());
        return;
      }
      setLocked(participant.status === 'done');
      try {
        const today = new Date().toISOString().slice(0, 10);
        const res = await fetch(`/api/notes/draft?participant_id=${participant.id}&date=${today}`);
        if (res.ok) {
          const { draft } = await res.json();
          setFormData(draft ? { ...defaultForm(), ...draft } : defaultForm());
        } else {
          setFormData(defaultForm());
        }
      } catch {
        setFormData(defaultForm());
      }
    }
    loadDraft();
  }, [participant?.id]);

  useEffect(() => {
    if (participant?.status === 'done') setLocked(true);
  }, [participant?.status]);

  function onChange(patch) {
    setFormData((prev) => {
      const next = { ...prev, ...patch };
      // When OOSA is turned on, disable the other sections
      if (patch.hasOOSA === true) {
        next.hasExercise = false;
        next.hasDiabetic = false;
        next.hasSocialization = false;
      }
      return next;
    });
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file || !participant) return;
    e.target.value = '';
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      await fetch(`/api/participants/${participant.id}/avatar`, { method: 'POST', body: form });
      onRefetch();
    } finally {
      setUploading(false);
    }
  }

  const isDone = participant?.status === 'done';
  const isLocked = isDone && locked;

  if (!participant && !editMode) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500 text-sm">Select a participant from the list to begin documentation.</p>
        </div>
      </div>
    );
  }

  if (!participant && editMode) {
    return (
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">
          <div className="bg-red-50 border-2 border-red-300 rounded-xl px-4 py-3 text-sm text-red-800 font-medium">
            Edit Mode — add or remove preset buttons. Changes save automatically.
          </div>
          <ExerciseSection formData={formData} onChange={onChange} editMode presets={presets} />
          <SocializationSection formData={formData} onChange={onChange} editMode presets={presets} />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">
        {/* Participant header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">

            {/* Avatar with hover pencil */}
            <div
              className="relative shrink-0 cursor-pointer"
              style={{ width: 52, height: 52 }}
              onMouseEnter={() => setAvatarHovered(true)}
              onMouseLeave={() => setAvatarHovered(false)}
              onClick={() => fileInputRef.current?.click()}
              title="Click to change photo"
            >
              <Avatar
                src={participant.avatar_url ? `http://localhost:3001${participant.avatar_url}` : null}
                name={participant.name}
                size={52}
              />
              {/* Pencil overlay — only visible on hover */}
              <div
                className="absolute inset-0 rounded-full flex items-center justify-center transition-opacity duration-150"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.45)',
                  opacity: avatarHovered && !uploading ? 1 : 0,
                  fontSize: 20,
                }}
              >
                ✏️
              </div>
              {/* Uploading spinner */}
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-800 leading-tight">{participant.name}</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {participant.status === 'done' ? '✓ Already documented today' : participant.status === 'in_progress' ? '📝 Draft saved' : 'Pending documentation'}
              </p>
            </div>
          </div>

          {/* Date picker + lock button */}
          <div className="flex items-end gap-2">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Attendance Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => onChange({ date: e.target.value })}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A7A2] bg-white"
              />
            </div>
            {isDone && (
              <button
                onClick={() => setLocked((l) => !l)}
                title={locked ? 'Unlock to edit' : 'Lock form'}
                className={`p-2 rounded-lg border transition-colors ${
                  locked
                    ? 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200'
                    : 'bg-amber-100 border-amber-300 text-amber-700 hover:bg-amber-200'
                }`}
              >
                {locked ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3A5.25 5.25 0 0 0 12 1.5Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 1.5c2.9 0 5.25 2.35 5.25 5.25v3.75a.75.75 0 0 1-1.5 0V6.75a3.75 3.75 0 1 0-7.5 0v3h.75a3 3 0 0 1 3 3v6.75a3 3 0 0 1-3 3H3.75a3 3 0 0 1-3-3v-6.75a3 3 0 0 1 3-3H15v-3C15 3.85 16.35 1.5 18 1.5Z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {editMode && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl px-4 py-3 text-sm text-red-800 font-medium">
            Edit Mode — add or remove preset buttons. Changes save automatically.
          </div>
        )}
        <div className={isLocked ? 'pointer-events-none opacity-60 select-none' : ''}>
          <div className="space-y-4">
            <div className={formData.hasOOSA ? 'pointer-events-none opacity-40 select-none' : ''}>
              <div className="space-y-4">
                <ExerciseSection formData={formData} onChange={onChange} editMode={editMode} presets={presets} />
                <DiabeticSection formData={formData} onChange={onChange} />
              </div>
            </div>
            <OOSASection formData={formData} onChange={onChange} participant={participant} onSave={onSave} />
            <div className={formData.hasOOSA ? 'pointer-events-none opacity-40 select-none' : ''}>
              <SocializationSection formData={formData} onChange={onChange} editMode={editMode} presets={presets} />
            </div>
          </div>
        </div>
        {!editMode && <GeneratedNote participant={participant} formData={formData} onMarkDone={onMarkDone} onSave={onSave} />}
      </div>
    </main>
  );
}
