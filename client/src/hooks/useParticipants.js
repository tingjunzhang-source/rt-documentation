import { useState, useEffect, useCallback } from 'react';

export function useParticipants() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchParticipants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/participants');
      if (!res.ok) throw new Error('Failed to load participants.');
      const data = await res.json();
      setParticipants(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const markDone = useCallback((id) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'done' } : p))
    );
  }, []);

  const markInProgress = useCallback((id) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'in_progress' } : p))
    );
  }, []);

  return { participants, loading, error, refetch: fetchParticipants, markDone, markInProgress };
}
