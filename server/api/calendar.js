const express = require('express');
const router = express.Router();
const db = require("../../mock/db");
const {query, validationResult} = require("express-validator");
const UserEvent = require("../models/user-event");

const getCalendarValidator = [
  query('hostUserId').notEmpty()
];

/**
 * Get calendar availability by host user id
 * @returns Array.<Object>
 */
router.get('/api/calendar', getCalendarValidator ,async (req, res) => {  
  // Validate query params
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send({ errors: result.array() });
  }
  const { hostUserId } = req.query;

  var listOfUserEvents = await db.calendar.findEventsForUser(hostUserId);
  const filteredDates = db.calendar.filterDates(listOfUserEvents);

  const userEvent = new UserEvent(hostUserId,60,filteredDates);
  res.json(userEvent);
  
});

module.exports = router;
