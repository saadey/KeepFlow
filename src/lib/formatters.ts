export function formatTaskDate(timestamp: number): string {
  const date = new Date(timestamp);
  
  // Format: 08:06 PM
  const timeStr = date.toLocaleString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  });

  // Format: Sat
  const dayName = date.toLocaleString('en-US', { weekday: 'short' });

  // Day with suffix: 18th
  const day = date.getDate();
  const suffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };
  const dayStr = `${day}${suffix(day)}`;

  // Month and Year: April 2026
  const monthYear = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return `${timeStr}, ${dayName}, ${dayStr} ${monthYear}`;
}
