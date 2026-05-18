const getSessionDate = (date) => {
  const d = new Date(date);
  d.setHours(d.getHours() - 4);
  d.setMinutes(d.getMinutes() - 30);
  d.setHours(0, 0, 0, 0);
  return d;
};

const d1 = new Date("2026-05-18T04:29:00+05:30"); // session of 17th
const d2 = new Date("2026-05-18T04:31:00+05:30"); // session of 18th
const d3 = new Date("2026-05-19T01:54:51+05:30"); // session of 18th
const d4 = new Date("2026-05-19T04:31:00+05:30"); // session of 19th

console.log("d2 vs d1:", Math.round((getSessionDate(d2).getTime() - getSessionDate(d1).getTime()) / 86400000));
console.log("d3 vs d2:", Math.round((getSessionDate(d3).getTime() - getSessionDate(d2).getTime()) / 86400000));
console.log("d4 vs d3:", Math.round((getSessionDate(d4).getTime() - getSessionDate(d3).getTime()) / 86400000));

