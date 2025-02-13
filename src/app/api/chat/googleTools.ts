// calendar/quickstart/index.js
const {google} = require('googleapis');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_TOKEN || '{}');
    return google.auth.fromJSON(credentials);
  } catch (err) {
    throw err;
  }
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
}

export async function getFreeBusy(args: any) {
  console.log("Getting free/busy");
  const { timeMin, timeMax } = JSON.parse(args);

  try {
    const auth = await authorize();
    const calendar = google.calendar({version: 'v3', auth});
    
  const res = await calendar.freebusy.query({
    requestBody: {
    items: [{ id: 'primary' }],
    timeMin: new Date(timeMin).toISOString(),
    timeMax: new Date(timeMax).toISOString(),
  }});

    return JSON.stringify(res.data.calendars.primary.busy);
  } catch (err) {
    console.error(err);
    return "An error occurred while fetching the free/busy information.";
  }
}

/**
 * Creates a calendar event with a Google Meet link.
 * @param {string} meetingTitle The title of the meeting.
 * @param {string} startTime The start time of the event in ISO format.
 * @param {number} length The length of the meeting in minutes.
 * @param {string} attendeeEmail The email of the attendee.
 */
export async function scheduleMeeting(args: any) {
  console.log("Scheduling meeting");
  const { meetingTitle, startTime, length, attendeeEmail } = JSON.parse(args);

  try {
    const auth = await authorize();
    const calendar = google.calendar({ version: 'v3', auth });
    
    const event = {
      summary: meetingTitle,
      attendees: [{ email: "chisholm.craig@gmail.com" }, { email: attendeeEmail }],
      start: {
        dateTime: new Date(startTime).toISOString(),
        timeZone: 'America/Halifax',
      },
      end: {
        dateTime: new Date(new Date(startTime).getTime() + length * 60000).toISOString(),
        timeZone: 'America/Halifax',
      },
      conferenceData: {
        createRequest: {
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    };

    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
    });

    return "Meeting scheduled successfully";
  } catch (err) {
    console.error(err);
    return "An error occurred while scheduling the meeting.";
  }
}