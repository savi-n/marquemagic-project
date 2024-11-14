const MILLI_SECONDS_IN_SECOND = 1000;
const SECONDS_IN_A_MINUTE = 60;
const MINUTES_IN_AN_HOUR = 60;
const HOURS_IN_DAY = 24;

module.exports = {


  friendlyName: 'Diff between date time',


  description: '',


  inputs: {
    startTime: {
      type: "string"
    },
    endTime: {
      type: "string"
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    const { startTime, endTime } = inputs;
    if (!startTime || !endTime) return exits.success("");

    const starTimestamp = Date.parse(startTime);
    const endTimestamp = Date.parse(endTime);
    const diffInSeconds = (endTimestamp - starTimestamp) / MILLI_SECONDS_IN_SECOND;
    const diffInMinutes = parseInt(diffInSeconds / SECONDS_IN_A_MINUTE);
    const secondsPart = diffInSeconds % SECONDS_IN_A_MINUTE;
    const diffInHours = parseInt(diffInMinutes / MINUTES_IN_AN_HOUR);
    const minutesPart = diffInMinutes % MINUTES_IN_AN_HOUR;
    const diffInDays = parseInt(diffInHours / HOURS_IN_DAY);
    const hoursPart = diffInHours % HOURS_IN_DAY;
    let outputString = "";
    if (diffInDays) outputString += `${diffInDays} day` + (diffInDays > 1 ? "s" : "") + " ";
    if (hoursPart || outputString) outputString += `${hoursPart} hour` + (hoursPart > 1 ? "s" : "") + " ";
    if (minutesPart || outputString) outputString += `${minutesPart} minute` + (minutesPart > 1 ? "s" : "") + " ";
    outputString += `${secondsPart} second` + (secondsPart > 1 ? "s" : "") + " ";
    return exits.success(outputString);
  }
};

