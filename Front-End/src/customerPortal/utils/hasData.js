

export function hasVehicle(vehicle) {
  return Boolean(vehicle && vehicle.plateNumber);
}

export function hasTracking(tracking) {
  return Boolean(tracking && (tracking.status || tracking.percentComplete != null));
}

export function hasBill(bill) {
  return Boolean(bill && (bill.total != null || bill.id));
}

export function hasItems(list) {
  return Array.isArray(list) && list.length > 0;
}