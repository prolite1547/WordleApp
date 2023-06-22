export const copyArray = arr => {
  return [...arr.map(rows => [...rows])];
};

export const dayOfTheYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return day;
};

export const getDayKey = () => {
  const date = new Date();
  const year = date.getFullYear();
  return `day-${dayOfTheYear()}-${year}`;
};
