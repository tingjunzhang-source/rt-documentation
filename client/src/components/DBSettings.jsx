import { useState } from 'react';

const DEFAULT = { type: 'mysql', host: '', port: '', user: '', password: '', database: '' };

export default function DBSettings({ onClose, onSuccess }) {
  const [config, setConfig] = useState(DEFAULT);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function set(key, val) {
    setConfig((prev) => ({ ...prev, [key]: val }));
    setResult(null);
    setError(null);
  }

  async function handleConnect() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/participants/db-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, port: config.port ? Number(config.port) : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Connection failed.');
      setResult(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const Field = ({ label, name, type = 'text', placeholder }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={config[name]}
        onChange={(e) => set(name, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A7A2]"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Database Connection</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div className="p-5 space-y-3">
          {/* DB Type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Database Type</label>
            <div className="flex gap-2">
              {['mysql', 'postgres'].map((t) => (
                <button
                  key={t}
                  onClick={() => set('type', t)}
                  className={`flex-1 py-2 text-sm rounded-lg border transition-colors
                    ${config.type === t
                      ? 'text-white'
                      : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  style={config.type === t ? { backgroundColor: '#00A7A2', borderColor: '#00A7A2' } : {}}
                >
                  {t === 'mysql' ? 'MySQL' : 'PostgreSQL'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Field label="Host" name="host" placeholder="localhost" />
            </div>
            <Field label="Port" name="port" placeholder={config.type === 'mysql' ? '3306' : '5432'} />
          </div>
          <Field label="Database Name" name="database" placeholder="your_database" />
          <Field label="Username" name="user" placeholder="root" />
          <Field label="Password" name="password" type="password" placeholder="••••••••" />

          {error && <p className="text-sm text-red-500">{error}</p>}
          {result && <p className="text-sm text-green-600">{result}</p>}
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          {result ? (
            <button
              onClick={onSuccess}
              className="flex-1 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Done
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={loading || !config.host || !config.user || !config.database}
              className="flex-1 py-2 text-sm text-white rounded-lg transition-colors disabled:opacity-50" style={{ backgroundColor: '#00A7A2' }}
            >
              {loading ? 'Connecting...' : 'Test & Connect'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
