import { useState } from 'react';

export default function ExerciseSection({ formData, onChange, editMode, presets }) {
  const { hasExercise, exerciseType, participantFell } = formData;
  const { exercisePresets, addExercisePreset, deleteExercisePreset } = presets;
  const [newText, setNewText] = useState('');

  function handleAdd() {
    if (newText.trim()) {
      addExercisePreset(newText);
      setNewText('');
    }
  }

  const isCustomValue = exerciseType && !exercisePresets.includes(exerciseType);
  const showBody = hasExercise || editMode;

  return (
    <div className={`rounded-xl border-2 transition-colors
      ${editMode
        ? 'border-red-300 bg-red-50'
        : hasExercise
          ? 'border-[#00A7A2]/40 bg-[#00A7A2]/5'
          : 'border-gray-200 bg-gray-50'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="font-semibold text-gray-700 text-sm">Balance &amp; Coordination Exercise</h3>
        {editMode
          ? <span className="text-xs text-red-600 font-medium">Editing presets</span>
          : (
            <button
              onClick={() => onChange({ hasExercise: !hasExercise, exerciseType: '', participantFell: 'N' })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
              style={{ backgroundColor: hasExercise ? '#00A7A2' : '#d1d5db' }}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
                ${hasExercise ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          )
        }
      </div>

      {showBody && (
        <div className="px-4 pb-4 space-y-3">
          {/* Preset buttons / editable tags */}
          <div>
            {!editMode && <p className="text-xs text-gray-500 mb-2 font-medium">Exercise type</p>}
            <div className="flex flex-wrap gap-2">
              {exercisePresets.map((preset, idx) =>
                editMode ? (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border bg-white border-gray-300 text-gray-700">
                    {preset}
                    <button
                      onClick={() => deleteExercisePreset(idx)}
                      className="ml-1 w-4 h-4 flex items-center justify-center rounded-full text-red-400 hover:bg-red-100 hover:text-red-600 font-bold text-sm leading-none"
                      title="Remove"
                    >
                      ×
                    </button>
                  </span>
                ) : (
                  <button
                    key={idx}
                    onClick={() => onChange({ exerciseType: exerciseType === preset ? '' : preset })}
                    className="px-3 py-1.5 text-xs rounded-lg border transition-colors"
                    style={exerciseType === preset
                      ? { backgroundColor: '#00A7A2', color: 'white', borderColor: '#00A7A2' }
                      : { backgroundColor: 'white', color: '#374151', borderColor: '#d1d5db' }
                    }
                  >
                    {preset.length > 42 ? preset.slice(0, 42) + '…' : preset}
                  </button>
                )
              )}
            </div>

            {/* Add new — edit mode only */}
            {editMode && (
              <div className="flex gap-1 mt-2">
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="Type a new exercise option and press Add..."
                  className="flex-1 px-3 py-1.5 text-xs border border-dashed border-red-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
                />
                <button
                  onClick={handleAdd}
                  disabled={!newText.trim()}
                  className="px-3 py-1.5 text-xs text-white rounded-lg transition-colors disabled:opacity-40"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Custom text + fall question — normal mode only */}
          {!editMode && (
            <>
              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">Or type a custom exercise</p>
                <input
                  type="text"
                  placeholder="e.g. group exercise of Tai Chi..."
                  value={isCustomValue ? exerciseType : ''}
                  onChange={(e) => onChange({ exerciseType: e.target.value })}
                  onFocus={() => { if (!isCustomValue) onChange({ exerciseType: '' }); }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white"
                  style={{ '--tw-ring-color': '#00A7A2' }}
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">Did PPT fall?</p>
                <div className="flex gap-2">
                  {['Y', 'N'].map((val) => (
                    <button
                      key={val}
                      onClick={() => onChange({ participantFell: val })}
                      className="px-6 py-2 text-sm font-semibold rounded-lg border transition-colors"
                      style={participantFell === val
                        ? { backgroundColor: val === 'Y' ? '#ef4444' : '#22c55e', color: 'white', borderColor: val === 'Y' ? '#ef4444' : '#22c55e' }
                        : { backgroundColor: 'white', color: '#374151', borderColor: '#d1d5db' }
                      }
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
