const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const Event = require('../models/Event');
const Vote = require('../models/Vote');
const socketService = require('../services/socketService');

const getEventResults = async (eventId) => {
    const event = await Event.findById(eventId).select('options');
    return event ? event.options : [];
};


router.post('/', protect, admin, async (req, res) => {
    try {
        const newEvent = new Event({ ...req.body, admin: req.user._id });
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (err) {
        res.status(400).json({ message: 'Invalid event data', error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        // Find events that are published and ongoing
        const events = await Event.find({ isPublished: true, status: 'ongoing' })
            .select('-admin -__v'); 
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching events' });
    }
});

router.post('/:eventId/vote', protect, async (req, res) => {
    const { eventId } = req.params;
    const { optionId, optionName } = req.body; // Assuming optionId is passed from client
    const userId = req.user._id;

    try {
        // Record the vote
        const newVote = new Vote({ event: eventId, user: userId, optionVoted: optionName });
        await newVote.save();

        await Event.updateOne(
            { _id: eventId, 'options._id': optionId },
            { $inc: { 'options.$.voteCount': 1 } }
        );

        const updatedResults = await getEventResults(eventId);
        socketService.emitVoteUpdate(eventId, updatedResults);

        res.json({ message: 'Vote cast successfully!' });

    } catch (err) {
        // Handle duplicate key error (already voted)
        if (err.code === 11000) { 
             return res.status(400).json({ message: 'You have already voted in this event.' });
        }
        console.error(err);
        res.status(500).json({ message: 'Server Error casting vote' });
    }
});

module.exports = router;