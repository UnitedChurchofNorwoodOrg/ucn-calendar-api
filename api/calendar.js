export default async function handler(req, res) {
  try {
    const url = "https://calendar.google.com/calendar/ical/1b1b5d22d089ff60b2ef371f51fcda2a7bc2aab3c4243e0ea025f27bb71d789f%40group.calendar.google.com/public/basic.ics";

    const response = await fetch(url);
    const text = await response.text();

    const events = [];
    const seen = new Set();

    const entries = text.split("BEGIN:VEVENT");

    entries.forEach(entry => {
      const titleMatch = entry.match(/SUMMARY:(.+)/);
      const startMatch = entry.match(/DTSTART[^:]*:(.+)/);
      const locationMatch = entry.match(/LOCATION:(.+)/);

      if (titleMatch && startMatch) {
        const title = titleMatch[1].trim();
        const rawDate = startMatch[1].trim();
        const location = locationMatch ? locationMatch[1].trim() : null;

        // Parse date
        const year = rawDate.slice(0, 4);
        const month = rawDate.slice(4, 6) - 1;
        const day = rawDate.slice(6, 8);
        const hour = rawDate.slice(9, 11) || "00";
        const minute = rawDate.slice(11, 13) || "00";

        const dateObj = new Date(year, month, day, hour, minute);

        // Remove duplicates
        const key = title + dateObj.toISOString();
        if (seen.has(key)) return;
        seen.add(key);

        events.push({ title, dateObj, location });
      }
    });

    // Get current week (Sunday → Saturday)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Filter events for current week
    const weeklyEvents = events.filter(e =>
      e.dateObj >= startOfWeek && e.dateObj < endOfWeek
    );

    // Group by day
    const grouped = {};

    weeklyEvents.forEach(e => {
      const dayLabel = e.dateObj.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric"
      });

      const time = e.dateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
      });

      if (!grouped[dayLabel]) grouped[dayLabel] = [];

      grouped[dayLabel].push({
        time,
        title: e.title,
        location: e.location || null
      });
    });

    // Sort days Sunday → Saturday
    const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const sorted = {};

    dayOrder.forEach(dayName => {
      Object.keys(grouped).forEach(fullDay => {
        if (fullDay.startsWith(dayName)) {
          sorted[fullDay] = grouped[fullDay];
        }
      });
    });

    res.status(200).json(sorted);

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
}