import { useState, useEffect } from 'react';

const DEFAULT_EXERCISE_PRESETS = [
  'group exercise of Outdoor walking (walk around the day center)',
  'Seated exercise group',
  'Standing balance exercise group',
  'Stretching exercise group',
];

const DEFAULT_ACTIVITY_PRESETS = [
  'Mind and Body Class (dancing and singing)',
  'Game Rummikub',
  'Arts & Crafts',
  'Music Therapy',
  'Movie/Video activity',
  'Holiday/Special Event',
  'Bingo',
  'Card Games',
  'Cooking/Baking activity',
  'Gardening activity',
  'Reading/Discussion group',
  'Birthday Celebration',
];

function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

export function usePresets() {
  const [exercisePresets, setExercisePresets] = useState(() =>
    loadFromStorage('rt-exercise-presets', DEFAULT_EXERCISE_PRESETS)
  );
  const [activityPresets, setActivityPresets] = useState(() =>
    loadFromStorage('rt-activity-presets', DEFAULT_ACTIVITY_PRESETS)
  );

  useEffect(() => {
    localStorage.setItem('rt-exercise-presets', JSON.stringify(exercisePresets));
  }, [exercisePresets]);

  useEffect(() => {
    localStorage.setItem('rt-activity-presets', JSON.stringify(activityPresets));
  }, [activityPresets]);

  return {
    exercisePresets,
    activityPresets,
    addExercisePreset: (text) => {
      const trimmed = text.trim();
      if (trimmed && !exercisePresets.includes(trimmed))
        setExercisePresets((prev) => [...prev, trimmed]);
    },
    deleteExercisePreset: (idx) =>
      setExercisePresets((prev) => prev.filter((_, i) => i !== idx)),
    addActivityPreset: (text) => {
      const trimmed = text.trim();
      if (trimmed && !activityPresets.includes(trimmed))
        setActivityPresets((prev) => [...prev, trimmed]);
    },
    deleteActivityPreset: (idx) =>
      setActivityPresets((prev) => prev.filter((_, i) => i !== idx)),
  };
}
