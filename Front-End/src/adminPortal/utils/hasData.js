export function hasItems(list) {
  return Array.isArray(list) && list.length > 0;
}


export function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.jobCards)) return value.jobCards;
  if (value && Array.isArray(value.data)) return value.data;
  if (value && Array.isArray(value.results)) return value.results;
  return [];
}