import { useState, useRef } from 'react';

export default function CSVUpload({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/participants/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed.');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Upload Participant CSV</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-500">
            Your CSV should have a column named <code className="bg-gray-100 px-1 rounded">name</code> with participant full names, one per row.
          </p>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
              ${dragging ? 'border-[#00A7A2] bg-[#00A7A2]/5' : 'border-gray-300 hover:border-[#00A7A2]/60 hover:bg-gray-50'}`}
          >
            <p className="text-sm text-gray-500">
              {file ? file.name : 'Drag & drop a CSV file, or click to browse'}
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {result && (
            <p className="text-sm text-green-600">
              Successfully imported {result.imported} participant(s).
            </p>
          )}
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
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 py-2 text-sm text-white rounded-lg transition-colors disabled:opacity-50" style={{ backgroundColor: '#00A7A2' }}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
