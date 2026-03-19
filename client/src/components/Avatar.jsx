// Palette for fallback initials avatars (when no image is provided)
const COLORS = [
  '#f43f5e', '#f97316', '#f59e0b', '#10b981',
  '#14b8a6', '#3b82f6', '#6366f1', '#a855f7',
  '#ec4899', '#06b6d4',
];

function colorForName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function initials(name) {
  // Handle "Last, First (Chinese)" format — use first letter of last name
  const clean = name.replace(/\s*\(.*?\)\s*/g, '').trim();
  const parts = clean.split(/[\s,]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return clean.slice(0, 1).toUpperCase();
}

export default function Avatar({ src, name = '', size = 40 }) {
  const color = colorForName(name);
  const fontSize = Math.round(size * 0.38);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        onError={(e) => {
          // Fall back to initials on broken image
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
    );
  }

  return (
    <span
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        color: 'white',
        fontWeight: 600,
        fontFamily: 'system-ui, sans-serif',
        flexShrink: 0,
      }}
    >
      {initials(name)}
    </span>
  );
}
