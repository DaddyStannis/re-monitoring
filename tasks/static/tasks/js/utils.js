const DAYS = ["Sun.", "Mon.", "Tues.", "Wed.", "Thurs.", "Fri.", "Sat."];

function addLeadingZero(num) {
  return num < 10 ? "0" + num : num;
}

function formatDatetime(timestamp) {
  const datetime = new Date(Number(timestamp) * 1000);
  const Y = datetime.getFullYear();
  const M = addLeadingZero(datetime.getMonth() + 1);
  const D = addLeadingZero(datetime.getDate());
  const d = DAYS[datetime.getDay()];
  const h = addLeadingZero(datetime.getHours());
  const m = addLeadingZero(datetime.getMinutes());
  const s = addLeadingZero(datetime.getSeconds());
  return `${D}.${M}.${Y} ${h}:${m}:${s} (${d})`;
}
