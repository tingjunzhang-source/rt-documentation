// Shared in-memory state used by both participants and notes routes
module.exports = {
  // key: `${participantId}_${date}` → serialized formData string
  drafts: {},
  // finalized notes array
  finalNotes: [],
  nextNoteId: 1,
};
