import { useState } from 'react';

export default function SocializationSection({ formData, onChange, editMode, presets }) {
  const { hasSocialization, activities, customActivity, selfEngaged, understoodInstructions, barriers, customBarrier } = formData;
  const { activityPresets, addActivityPreset, deleteActivityPreset } = presets;
  const [newText, setNewText] = useState('');

  const showBody = hasSocialization !== false || editMode;

  function toggleActivity(preset) {
    const current = activities || [];
    const next = current.includes(preset)
      ? current.filter((a) => a !== preset)
      : [...current, preset];
    onChange({ activities: next });
  }

  function handleAdd() {
    if (newText.trim()) {
      addActivityPreset(newText);
      setNewText('');
    }
  }

  return (
    <div className={`rounded-xl border-2 transition-colors
      ${editMode
        ? 'border-red-300 bg-red-50'
        : hasSocialization !== false
          ? 'border-[#00A7A2]/40 bg-[#00A7A2]/5'
          : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="font-semibold text-gray-700 text-sm">Socialization Activity</h3>
        {editMode
          ? <span className="text-xs text-red-600 font-medium">Editing presets</span>
          : (
            <button
              onClick={() => onChange({ hasSocialization: hasSocialization === false ? true : false })}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
              style={{ backgroundColor: hasSocialization !== false ? '#00A7A2' : '#d1d5db' }}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
                ${hasSocialization !== false ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          )
        }
      </div>

      {showBody && <div className="px-4 pb-4 space-y-4">
      {/* Activity presets */}
      <div>
        {!editMode && (
          <p className="text-xs text-gray-500 mb-2 font-medium">Select activity/activities (multi-select)</p>
        )}
        <div className="flex flex-wrap gap-2">
          {activityPresets.map((preset, idx) =>
            editMode ? (
              <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border bg-white border-gray-300 text-gray-700">
                {preset}
                <button
                  onClick={() => deleteActivityPreset(idx)}
                  className="ml-1 w-4 h-4 flex items-center justify-center rounded-full text-red-400 hover:bg-red-100 hover:text-red-600 font-bold text-sm leading-none"
                  title="Remove"
                >
                  ×
                </button>
              </span>
            ) : (
              <button
                key={idx}
                onClick={() => toggleActivity(preset)}
                className="px-3 py-1.5 text-xs rounded-lg border transition-colors"
                style={(activities || []).includes(preset)
                  ? { backgroundColor: '#00A7A2', color: 'white', borderColor: '#00A7A2' }
                  : { backgroundColor: 'white', color: '#374151', borderColor: '#d1d5db' }
                }
              >
                {preset}
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
              placeholder="Type a new activity option and press Add..."
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

      {/* Rest — hidden in edit mode */}
      {!editMode && (
        <>
          <div>
            <p className="text-xs text-gray-500 mb-1 font-medium">Additional / custom activity</p>
            <input
              type="text"
              placeholder="e.g. New Year's gift distribution..."
              value={customActivity || ''}
              onChange={(e) => onChange({ customActivity: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <YNToggle
              label="Was PPT self-engaged?"
              value={selfEngaged}
              onChange={(val) => onChange({ selfEngaged: val })}
            />
            <YNToggle
              label="Did PPT understand instructions?"
              value={understoodInstructions}
              onChange={(val) => onChange({ understoodInstructions: val })}
            />
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">Barrier(s)</p>
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => onChange({ barriers: 'none', customBarrier: '' })}
                className="px-4 py-1.5 text-xs rounded-lg border transition-colors"
                style={barriers !== 'custom'
                  ? { backgroundColor: '#00A7A2', color: 'white', borderColor: '#00A7A2' }
                  : { backgroundColor: 'white', color: '#374151', borderColor: '#d1d5db' }
                }
              >
                None
              </button>
              <button
                onClick={() => onChange({ barriers: 'custom' })}
                className="px-4 py-1.5 text-xs rounded-lg border transition-colors"
                style={barriers === 'custom'
                  ? { backgroundColor: '#f59e0b', color: 'white', borderColor: '#f59e0b' }
                  : { backgroundColor: 'white', color: '#374151', borderColor: '#d1d5db' }
                }
              >
                Describe barrier
              </button>
            </div>
            {barriers === 'custom' && (
              <input
                type="text"
                placeholder="Describe the barrier(s)..."
                value={customBarrier || ''}
                onChange={(e) => onChange({ customBarrier: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              />
            )}
          </div>
        </>
      )}
      </div>}
    </div>
  );
}

function YNToggle({ label, value, onChange }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-2 font-medium">{label}</p>
      <div className="flex gap-2">
        {['Y', 'N'].map((val) => (
          <button
            key={val}
            onClick={() => onChange(val)}
            className="px-6 py-2 text-sm font-semibold rounded-lg border transition-colors"
            style={value === val
              ? { backgroundColor: val === 'Y' ? '#22c55e' : '#ef4444', color: 'white', borderColor: val === 'Y' ? '#22c55e' : '#ef4444' }
              : { backgroundColor: 'white', color: '#374151', borderColor: '#d1d5db' }
            }
          >
            {val}
          </button>
        ))}
      </div>
    </div>
  );
}
