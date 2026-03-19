import { useState, useEffect } from 'react';
import { generateNote } from '../utils/generateNote';

export default function GeneratedNote({ participant, formData, onMarkDone, onSave }) {
  const isDone = participant?.status === 'done';
  const [copied, setCopied] = useState(false);
  const [markingDone, setMarkingDone] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [markedDone, setMarkedDone] = useState(false);
  const [savedDraft, setSavedDraft] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setMarkedDone(false);
    setSavedDraft(false);
    setError(null);
  }, [participant?.id]);

  const note = generateNote(formData);
  const isReady = isDone
    || formData.hasOOSA
    || formData.activities?.length > 0
    || formData.customActivity?.trim()
    || (formData.hasExercise && formData.exerciseType)
    || formData.hasDiabetic;

  async function handleSave() {
    if (!participant) return;
    setSavingDraft(true);
    setError(null);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_id: participant.id,
          note_date: formData.date,
          note_text: note,
          status: 'draft',
          form_data: formData,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save draft.');
      }
      setSavedDraft(true);
      setTimeout(() => setSavedDraft(false), 2500);
      onSave(participant.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingDraft(false);
    }
  }

  async function handleMarkDone() {
    if (!participant) return;
    setMarkingDone(true);
    setError(null);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_id: participant.id,
          note_date: formData.date,
          note_text: note,
          status: 'final',
          form_data: formData,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save note.');
      }
      setMarkedDone(true);
      onMarkDone(participant.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setMarkingDone(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(note);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = note;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-700 text-sm">Generated Note</h3>
      </div>

      <div className="p-4">
        {!isReady ? (
          <p className="text-sm text-gray-400 italic">
            Select at least one activity above to generate the note.
          </p>
        ) : (
          <>
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-200 leading-relaxed">
              {note}
            </pre>

            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}

            <div className="flex gap-2 mt-3">
              <button
                onClick={handleCopy}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors
                  ${copied ? 'bg-gray-200 text-gray-600' : 'text-white hover:opacity-90'}`}
                style={!copied ? { backgroundColor: '#00A7A2' } : {}}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>

              {isDone ? (
                <div className="flex-1 py-2.5 text-sm font-medium rounded-lg bg-green-100 text-green-700 text-center">
                  Done ✓
                </div>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={savingDraft || markedDone}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-60
                      ${savedDraft
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-amber-500 text-white hover:bg-amber-600'
                      }`}
                  >
                    {savingDraft ? 'Saving...' : savedDraft ? 'Saved!' : 'Save'}
                  </button>

                  {!markedDone ? (
                    <button
                      onClick={handleMarkDone}
                      disabled={markingDone || savingDraft}
                      className="flex-1 py-2.5 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60"
                    >
                      {markingDone ? 'Saving...' : 'Mark Done'}
                    </button>
                  ) : (
                    <div className="flex-1 py-2.5 text-sm font-medium rounded-lg bg-green-100 text-green-700 text-center">
                      Done ✓
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
