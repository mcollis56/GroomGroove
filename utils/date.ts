// lib/utils/date.ts

export function getSydneyDate() {
  const now = new Date();
  
  // Force conversion to Sydney time string "MM/DD/YYYY"
  const sydneyString = now.toLocaleDateString("en-US", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const [month, day, year] = sydneyString.split('/');
  
  // Return a Date object representing Midnight in Sydney
  return new Date(`${year}-${month}-${day}T00:00:00`);
}

export function isSydneyToday(dateString: string) {
  if (!dateString) return false;
  
  const appointmentDate = new Date(dateString);
  const sydneyToday = getSydneyDate();
  const sydneyTomorrow = new Date(sydneyToday);
  sydneyTomorrow.setDate(sydneyTomorrow.getDate() + 1);
  
  // Check if the appointment falls within Sydney's "Today"
  return appointmentDate >= sydneyToday && appointmentDate < sydneyTomorrow;
}
