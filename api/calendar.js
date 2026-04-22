export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://calendar.google.com/calendar/ical/1b1b5d22d089ff60b2ef371f51fcda2a7bc2aab3c4243e0ea025f27bb71d789f@group.calendar.google.com/public/basic.ics",
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "text/calendar"
        }
      }
    );

    if (!response.ok) {
      throw new Error("Google Calendar fetch failed");
    }

    const text = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/calendar");

    res.status(200).send(text);
  } catch (error) {
    console.error("API ERROR:", error);

    res.status(500).json({
      error: "Failed to fetch calendar",
      details: error.message
    });
  }
}