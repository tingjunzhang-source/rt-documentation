export default function DiabeticSection({ formData, onChange }) {
  const { hasDiabetic } = formData;

  return (
    <div className={`rounded-xl border-2 transition-colors
      ${hasDiabetic
        ? 'border-[#00A7A2]/40 bg-[#00A7A2]/5'
        : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="font-semibold text-gray-700 text-sm">Diabetic Options</h3>
        <button
          onClick={() => onChange({ hasDiabetic: !hasDiabetic })}
          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
          style={{ backgroundColor: hasDiabetic ? '#00A7A2' : '#d1d5db' }}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
            ${hasDiabetic ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
      </div>

      {hasDiabetic && (
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-500 font-mono">Blood sugar levels are monitored by PCP/RN.</p>
        </div>
      )}
    </div>
  );
}
