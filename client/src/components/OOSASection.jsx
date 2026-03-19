import { useState } from 'react';
import { generateNote } from '../utils/generateNote';

export default function OOSASection({ formData, onChange, participant, onSave }) {
  const { hasOOSA, oosaStart, oosaEnd, oosaReason, oosaReasonOpen } = formData;
  const showReason = oosaReasonOpen || !!oosaReason;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const reasonText = oosaReason && oosaReason.trim() ? oosaReason.trim() : 'OOSA';

  async function handleSave() {
    if (!participant) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_id: participant.id,
          note_date: formData.date,
          note_text: generateNote(formData),
          status: 'draft',
          form_data: formData,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save.');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onSave(participant.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`rounded-xl border-2 transition-colors
      ${hasOOSA
        ? 'border-amber-400/60 bg-amber-50'
        : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="font-semibold text-gray-700 text-sm">OOSA</h3>
        <button
          onClick={() => onChange({ hasOOSA: !hasOOSA })}
          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
          style={{ backgroundColor: hasOOSA ? '#f59e0b' : '#d1d5db' }}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
            ${hasOOSA ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
      </div>

      {hasOOSA && (
        <div className="px-4 pb-4 space-y-3">
          {/* Time frame */}
          <div className="space-y-1.5">
            <p className="text-xs text-gray-500 font-medium">Time frame</p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={oosaStart || ''}
                onChange={(e) => onChange({ oosaStart: e.target.value })}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              />
              <span className="text-gray-400 text-sm">–</span>
              <input
                type="date"
                value={oosaEnd || ''}
                onChange={(e) => onChange({ oosaEnd: e.target.value })}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              />
            </div>
          </div>

          {/* Reason toggle */}
          <div className="space-y-1.5">
            <button
              onClick={() => {
                if (showReason) {
                  onChange({ oosaReasonOpen: false, oosaReason: '' });
                } else {
                  onChange({ oosaReasonOpen: true });
                }
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors"
            >
              <span className={`inline-block transition-transform ${showReason ? 'rotate-90' : ''}`}>▶</span>
              {showReason ? 'Remove custom reason' : 'Add reason'}
            </button>

            {showReason && (
              <input
                type="text"
                placeholder="e.g. hospitalized, vacation, family emergency..."
                value={oosaReason || ''}
                onChange={(e) => onChange({ oosaReason: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              />
            )}
          </div>

          {/* Preview */}
          <p className="text-xs text-gray-400 font-mono">
            PPT canceled their daycenter appointment due to {reasonText}
            {oosaStart && oosaEnd ? `, time frame: ${fmt(oosaStart)}-${fmt(oosaEnd)}` : '.'}
          </p>

          {/* Save button */}
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-60
              ${saved
                ? 'bg-amber-100 text-amber-700'
                : 'bg-amber-500 text-white hover:bg-amber-600'
              }`}
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
}

function fmt(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}
