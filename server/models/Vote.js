const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  event: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  user: { // The user who cast the vote
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  optionVoted: { // Name of the option (candidate) voted for
    type: String,
    required: true
  }
}, { timestamps: true });

VoteSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Vote', VoteSchema);