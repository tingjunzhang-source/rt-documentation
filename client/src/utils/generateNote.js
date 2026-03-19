/**
 * Generates the formatted documentation paragraph from form data.
 * @param {Object} formData
 * @returns {string} The formatted note text
 */
export function generateNote(formData) {
  const {
    date,
    hasExercise,
    exerciseType,
    participantFell,
    hasDiabetic,
    hasOOSA,
    oosaStart,
    oosaEnd,
    oosaReason,
    hasSocialization,
    activities,
    customActivity,
    selfEngaged,
    understoodInstructions,
    barriers,
    customBarrier,
  } = formData;

  const lines = [];

  // Format date as M/D/YY
  const d = new Date(date + 'T00:00:00');
  const formattedDate = `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(2)}`;

  lines.push(`Day Center Attendance Day: ${formattedDate}`);

  if (hasOOSA) {
    const fmtDate = (s) => { const d = new Date(s + 'T00:00:00'); return `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`; };
    const range = oosaStart && oosaEnd ? `, time frame: ${fmtDate(oosaStart)}-${fmtDate(oosaEnd)}` : '';
    const reason = oosaReason && oosaReason.trim() ? oosaReason.trim() : 'OOSA';
    lines.push(`PPT canceled their daycenter appointment due to ${reason}${range}`);
    return lines.join('\n');
  }

  if (hasExercise && exerciseType) {
    lines.push(`Balance & Coordination Exercise Completed: PPT did ${exerciseType}`);
    if (hasDiabetic) {
      lines.push(`Blood sugar levels are monitored by PCP/RN.`);
    }
    lines.push(`Did PPT Fall? (Y or N): ${participantFell || 'N'}.`);
    lines.push(''); // blank separator line
  } else if (hasDiabetic) {
    lines.push(`Blood sugar levels are monitored by PCP/RN.`);
    lines.push('');
  }

  if (hasSocialization !== false) {
    // Build activity string (multi-select joined with " and ")
    const allActivities = [...(activities || [])];
    if (customActivity && customActivity.trim()) {
      allActivities.push(customActivity.trim());
    }
    const activityText = allActivities.join(' and ');

    lines.push(`Socialization Activity: ${activityText}`);
    lines.push(`Was PPT self-engaged?: ${selfEngaged || 'Y'}`);
    lines.push(`Did PPT understand instructions?: ${understoodInstructions || 'Y'}`);

    const barrierText = barriers === 'custom' ? (customBarrier || '').trim() : 'None';
    lines.push(`Barrier(s): ${barrierText}.`);
  }

  return lines.join('\n');
}

/**
 * Returns today's date as YYYY-MM-DD string for the date input default.
 */
export function todayString() {
  return new Date().toISOString().slice(0, 10);
}
