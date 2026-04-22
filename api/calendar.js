export default async function handler(req, res) {
  try {
    const url = "https://calendar.google.com/calendar/ical/1b1b5d22d089ff60b2ef371f51fcda2a7bc2aab3c4243e0ea025f27bb71d789f%40group.calendar.google.com/public/basic.ics";

    const response = await fetch(url);
    const text = await response.text();

    const events = [];
    const entries = text.split("BEGIN:VEVENT");

    entries.forEach(entry => {
      const titleMatch = entry.match(/SUMMARY:(.*)/);
      const startMatch = entry.match(/DTSTART:(.*)/);

      if (titleMatch && startMatch) {
        events.push({
          title: titleMatch[1],
          start: startMatch[1]
        });
      }
    });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
}