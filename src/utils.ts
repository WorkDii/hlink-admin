export function dateTime2TimeBangkok(dateTime: string) {
  return dateTime + "T00:00:00+07:00";
}

export interface DrugRatioStatus {
  color: string;
  status: string;
  key: 'critical' | 'low' | 'optimal' | 'excess';
}
export function getDrugRatioStatus(ratio: number): DrugRatioStatus {
  let color = '#ff4d4f'; // red
  let status = 'ต่ำ';
  let key = 'low'

  if (ratio >= 2.0) {
    color = '#faad14'; // orange - สต็อกเกิน
    status = 'สต็อกเกิน';
    key = 'excess'
  } else if (ratio >= 1 && ratio < 2.0) {
    color = '#52c41a'; // green - เหมาะสม
    status = 'เหมาะสม';
    key = 'optimal'
  } else if (ratio >= 0.5 && ratio < 1) {
    color = '#faad14'; // orange - ต่ำ
    status = 'ต่ำ';
    key = 'low'
  } else {
    color = '#ff4d4f'; // red - วิกฤต
    status = 'วิกฤต';
    key = 'critical'
  }

  return { color, status, key };
}
