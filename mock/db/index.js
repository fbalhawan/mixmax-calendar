const moment = require('moment');
const random = require('random');
const seedrandom = require('seedrandom');
const fs = require('fs');

const START_WORKDAY = 9;
const END_WORKDAY = 17;
const HOURS_INCREMENT = 1;
// Path of pre-created dates
const PATH = "./mock/db/dates.json";

/**
 * Convert to specific date format
 * @param {Moment} m 
 * @returns String
 */
function dateStr(m) {
  return m.format('YYYY-MM-DDTHH:mm:ss.SSS');
}

/**
 * Generate list of moment dates, with hourly increment, over 7 days
 * @returns {Array.<String>} dates
 */
function generateDates() {
  let dates = [];
  // Today at 00:00
  let start = moment().startOf('day');
  // Last day at 00:00
  let end = moment().startOf('day').add(7, 'days').hours(END_WORKDAY).minutes(0);

  while (start.isBefore(end)) {
    if (start.hours() >= START_WORKDAY && start.hours() < END_WORKDAY) {
      dates.push(dateStr(start));
    }
    start.add(HOURS_INCREMENT, 'hours');
    if (start.hours() >= END_WORKDAY) {
      start.add(1, 'day').hours(START_WORKDAY);
    }
  }

  return dates;
}

const DB = {
  dates: {
/**
 * Generate list of generated moment dates
 * This function is expected to be executed daily, or whenever dates.json is deleted
 * @returns {Array.<String>} dates
 */
    updateDailyHours: () => {
      // Check if dates were already generated
      if (fs.existsSync(PATH)) {
        let data = fs.readFileSync(PATH, 'utf8');
        let savedDates = JSON.parse(data);

        let firstDate = moment(savedDates[0]);
        // Check if the first date slot is in the past, and update the list if necessary
        if (moment().startOf('day').isAfter(firstDate.startOf('day'))) {
          let dates = generateDates();
          fs.writeFileSync(PATH, JSON.stringify(dates));
          return dates;
        }

        return savedDates;
      }
      // If dates.json doesn't exist, generate dates and create it
      else {
        let dates = generateDates();
        fs.writeFileSync(PATH, JSON.stringify(dates));
        return dates;
      }
    }
  },
  calendar: {
    /**
     * Returns all calendar events for the given user.
     */
    findEventsForUser: async (user) => {
      const { uniformInt } = random.clone(seedrandom(user));

      const today = moment().startOf('day');
      const n = uniformInt(5, 30)();

      const events = [];
      for (let i = 0; i < n; i++) {
        // Start date between yesterday and 7 days forward:
        const start = today.clone().add(uniformInt(-1, 7)(), 'days');

        // Start time in [START_WORKDAY, END_WORKDAY) hours:
        start.add(uniformInt(START_WORKDAY, END_WORKDAY - 1)(), 'hours');

        // Add between 0 and 50 minutes:
        start.add(uniformInt(0, 5)() * 10, 'minutes');

        // Add random duration between 30 and 120 minutes to get end time:
        const end = start.clone().add(uniformInt(3, 12)() * 10, 'minutes');

        if (end.hour() >= END_WORKDAY) {
          end.add(1, 'day').subtract(END_WORKDAY - START_WORKDAY, 'hours');
        }

        events[i] = {
          start: dateStr(start),
          end: dateStr(end),
        };
      }
      return events;
    },
    /**
     * Remove reserved date slots
     * @param {Array.<Object>} dates 
     * @returns {Array.<String>} updatedDates
     */
    filterDates: (dates) => {
      // Check if dates were already generated
      if (fs.existsSync(PATH)) {
        let data = fs.readFileSync(PATH, 'utf8');
        let savedDates = JSON.parse(data);

        const now = moment();
        // Filter out dates
        let updatedDates = savedDates.filter(savedDate => {
          return !dates.some(commitDate => {
            let savedMoment = moment(savedDate);
            let startMoment = moment(commitDate.start);
            let endMoment = moment(commitDate.end);
            return savedMoment.isBetween(startMoment, endMoment, null, '[]');
          }) && moment(savedDate).isSameOrAfter(now);
        });

        fs.writeFileSync(PATH, JSON.stringify(updatedDates));
        return updatedDates;
      }
      // Else, return an empty array
      else {
        console.log("File does not exist");
        return [];
      }
    }
  },
};

module.exports = DB;
