import { aggregate, readItems } from "@tspvivek/refine-directus"
import { directusClient } from "../../directusClient"
import { format } from 'date-fns'

type DrugStockStatus = {
  status: 'วิกฤต' | 'ต่ำ' | 'เหมาะสม' | 'เกิน' | 'มากเกินไป'
  color: string
}

export const STATUS_COLORS: Record<DrugStockStatus['status'], string> = {
  'วิกฤต': '#ff4d4f',
  'ต่ำ': '#faad14',
  'เหมาะสม': '#52c41a',
  'เกิน': '#1890ff',
  'มากเกินไป': '#b37feb'
}

/**
 * ฟังก์ชัน getDrugStockStatus ใช้สำหรับประเมินสถานะของสต็อกยา
 * โดยรับค่า ratio (อัตราส่วนของจำนวนยาคงเหลือเทียบกับการใช้ต่อเดือน)
 * แล้วคำนวณจำนวนวันที่ยาคงเหลือจะเพียงพอ (days = ratio * 30)
 * จากนั้นจะจัดกลุ่มสถานะตามช่วงของ days ดังนี้:
 * - น้อยกว่า 7 วัน: "วิกฤต" (สีแดง)
 * - น้อยกว่า 15 วัน (0.5 เดือน): "ต่ำ" (สีส้ม)
 * - 15-45 วัน (0.5-1.5 เดือน): "เหมาะสม" (สีเขียว)
 * - 45-75 วัน (1.5-2.5 เดือน): "เกิน" (สีน้ำเงิน)
 * - มากกว่า 75 วัน: "มากเกินไป" (สีม่วง)
 * ฟังก์ชันจะคืนค่าเป็นอ็อบเจกต์ที่มี status และ color สำหรับแสดงผลในแดชบอร์ด
 */
const getDrugStockStatus = (ratio: number): DrugStockStatus => {
  const days = ratio * 30
  if (days < 7) {
    return {
      status: 'วิกฤต',
      color: STATUS_COLORS['วิกฤต']
    }
  } else if (days < 0.5 * 30) {
    return {
      status: 'ต่ำ',
      color: STATUS_COLORS['ต่ำ']
    }
  } else if (days <= 1.5 * 30) {
    return {
      status: 'เหมาะสม',
      color: STATUS_COLORS['เหมาะสม']
    }
  } else if (days <= 2.5 * 30) {
    return {
      status: 'เกิน',
      color: STATUS_COLORS['เกิน']
    }
  } else {
    return {
      status: 'มากเกินไป',
      color: STATUS_COLORS['มากเกินไป']
    }
  }
}

const getRatioData = (issued: any, remain: any) => {
  // 2 decimal places
  let value = Math.round((Number(remain || 0) / Number(issued || 0)) * 100) / 100
  const days = Math.round(value * 30)
  const status = getDrugStockStatus(value)
  return {
    value,
    days,
    ...status
  }
}

export const getLastInventoryDate = async (pcucode: string) => {
  const lastDate = (await directusClient.request(readItems('inventory_drug_detail', {
    filter: {
      pcucode: {
        _eq: pcucode
      }
    },
    sort: ['-date'],
    limit: 1
  })))[0].date
  return lastDate && format(lastDate, 'yyyy-MM-dd')
}

// ฟังก์ชัน getInventoryDashboardData ใช้สำหรับดึงและคำนวณข้อมูลสรุปแดชบอร์ดคลังยา
// โดยจะดึงข้อมูลคลังยาล่าสุดของหน่วยบริการ (pcucode) ที่ระบุ
// และคำนวณมูลค่าคลังยารวม (totalInventoryValue) จากราคาต่อหน่วยและจำนวนคงเหลือของยาแต่ละรายการ
// หากไม่ระบุวันที่ (date) จะค้นหาวันที่ล่าสุดโดยอัตโนมัติ
// หากไม่พบข้อมูลจะส่ง error กลับ
const listData = async (pcucode: string, lastDate: string) => {
  const _data = await directusClient.request(readItems('inventory_drug_detail', {
    filter: {
      pcucode: {
        _eq: pcucode
      },
      drugtype: {
        _in: ['01', '04', '10']
      },
      date: {
        _eq: lastDate
      }
    },
    fields: ['*', { hospital_drug: ['id', 'name', 'cost'] }],
    sort: ['drugtype', 'hospital_drug'],
    limit: -1
  }))
  return _data.map(i => {
    const ratio = getRatioData(i.issued30day, i.remaining)
    return {
      ...i,
      ratio
    }
  })
}

type ListData = Awaited<ReturnType<typeof listData>>


// คำอธิบาย:
// ฟังก์ชัน getTotalInventoryValue ใช้สำหรับคำนวณมูลค่ารวมของคลังยา
// โดยนำราคาต่อหน่วยของยาแต่ละรายการ (จาก hospital_drug) คูณกับจำนวนคงเหลือ (remaining)
// แล้วนำผลลัพธ์ของแต่ละรายการมารวมกันเป็นมูลค่ารวมทั้งหมด
// ฟังก์ชันนี้จะคำนวณเฉพาะรายการที่มี hospital_drug และมีข้อมูล cost เท่านั้น
const getTotalInventoryValue = async (data: ListData) => {
  return data
    .filter(i => typeof i.hospital_drug === 'object' && i.hospital_drug !== null && 'cost' in i.hospital_drug)
    .reduce((acc, item) => {
      const cost = typeof item.hospital_drug === 'object' && item.hospital_drug !== null && 'cost' in item.hospital_drug
        ? Number((item.hospital_drug as any).cost) || 0
        : 0;
      const quantity = item.remaining || 0
      return acc + (cost * quantity);
    }, 0);
}

const getTotalItem = async (data: ListData) => {
  return data.length
}

const getTotalDrugRatio30Day = async (data: ListData) => {
  let issued30dayTotal = 0
  let remainTotal = 0
  data.forEach(i => {
    if (i.hospital_drug && typeof i.hospital_drug === 'object' && i.hospital_drug !== null) {
      issued30dayTotal += (Number(i.issued30day) * (Number(i.hospital_drug.cost) || 0) || 0)
      remainTotal += (Number(i.remaining) * (Number(i.hospital_drug.cost) || 0) || 0)
    }
  })
  return getRatioData(issued30dayTotal, remainTotal)
}

const getDrugsWithoutHospitalData = async (data: ListData) => {
  return data.filter(i => !i.hospital_drug)
}


/**
 * หา DrugRatio30Day ย้อนหลัง
 * ดึงข้อมูลอัตราการสำรองยา (เดือน) ย้อนหลังตามจำนวนวันที่กำหนด
 * @param pcucode รหัส PCU
 * @param days จำนวนวันย้อนหลัง (default: 6 เดือน = 180 วัน)
 * @returns Array ของ { date, ratio }
 */
export const getDrugRatio30DayHistory = async (pcucode: string, days: number = 180) => {
  // ดึงวันที่ล่าสุด
  const lastDate = await getLastInventoryDate(pcucode);
  if (!lastDate) throw new Error("ไม่พบข้อมูลคลังยาล่าสุด");

  // สร้าง array ของวันที่ย้อนหลัง
  const dates: string[] = [];
  const endDate = new Date(lastDate);
  for (let i = 0; i < days; i += 30) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    // แปลงเป็น yyyy-MM-dd
    const dateStr = d.toISOString().slice(0, 10);
    dates.push(dateStr);
  }

  // ดึงข้อมูลและคำนวณ ratio สำหรับแต่ละเดือนย้อนหลัง
  const result: { date: string, ratio: ReturnType<typeof getRatioData> }[] = [];
  for (const date of dates) {
    const data = await listData(pcucode, date);
    const ratio = await getTotalDrugRatio30Day(data);
    result.push({ date, ratio });
  }
  return result;
}
export const listHistoricalDrugRatio = async (pcucode: string) => {
  const _data = await directusClient.request(aggregate('inventory_drug_detail', {
    query: {
      filter: {
        pcucode: {
          _eq: pcucode
        }
      }
    },
    aggregate: {
      sum: ['remaining_cost', 'issued30day_cost']
    },
    groupBy: ['date']
  }))
  return _data.filter(i => !!i.date).map(i => {
    const ratio = getRatioData(i.sum.issued30day_cost, i.sum.remaining_cost)
    return {
      date: format(i.date || new Date, 'yyyy-MM-dd'),
      ratio
    }
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

const getDrugStatus = async (data: ListData) => {
  const status: Record<DrugStockStatus['status'], number> = {
    'วิกฤต': 0,
    'ต่ำ': 0,
    'เหมาะสม': 0,
    'เกิน': 0,
    'มากเกินไป': 0
  }
  data.forEach(i => {
    status[i.ratio.status] = (status[i.ratio.status] || 0) + 1
  })
  return status
}

export const getInventoryDashboardData = async (pcucode: string, date?: string) => {
  let lastDate = date
  if (!lastDate) {
    lastDate = await getLastInventoryDate(pcucode) || undefined
  }
  if (!lastDate) {
    throw new Error("ไม่พบข้อมูลคลังยาล่าสุด");
  }
  const data = await listData(pcucode, lastDate)
  const totalInventoryValue = await getTotalInventoryValue(data)
  const totalItem = await getTotalItem(data)
  const totalDrugRatio30Day = await getTotalDrugRatio30Day(data)
  const drugsWithoutHospitalData = await getDrugsWithoutHospitalData(data)
  const historicalDrugRatio = await listHistoricalDrugRatio(pcucode)
  const drugStatus = await getDrugStatus(data)
  return {
    totalInventoryValue,
    totalItem,
    totalDrugRatio30Day,
    drugsWithoutHospitalData,
    historicalDrugRatio,
    drugStatus,
    drugData: data // Include detailed drug data for list display
  }
}



