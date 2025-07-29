import { aggregate, readItems } from "@tspvivek/refine-directus"
import { directusClient } from "../../directusClient"
import { format } from 'date-fns'

type DrugStockStatus = {
  status: 'วิกฤต' | 'ต่ำ' | 'เหมาะสม' | 'เกิน' | 'มากเกินไป'
  color: string
}

const getDrugStockStatus = (ratio: number): DrugStockStatus => {
  const days = ratio * 30
  if (days < 7) {
    return {
      status: 'วิกฤต',
      color: '#ff4d4f'
    }
  } else if (days < 14) {
    return {
      status: 'ต่ำ',
      color: '#faad14'
    }
  } else if (days <= 30) {
    return {
      status: 'เหมาะสม',
      color: '#52c41a'
    }
  } else if (days <= 60) {
    return {
      status: 'เกิน',
      color: '#1890ff'
    }
  } else {
    return {
      status: 'มากเกินไป',
      color: '#b37feb'
    }
  }
}

const getRatioData = (issued: any, remain: any) => {
  let value = Number(remain || 0) / Number(issued || 0)
  if (value > 999) value = 999
  const valueString = (Math.round(value * 100) / 100).toFixed(2)
  const days = Math.round(value * 30)
  const status = getDrugStockStatus(value)
  return {
    value,
    valueString,
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
    issued30dayTotal += (Number(i.issued30day) || 0)
    remainTotal += (Number(i.remaining) || 0)
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
      sum: ['remaining', 'issued30day']
    },
    groupBy: ['date']
  }))
  return _data.map(i => {
    const ratio = getRatioData(i.sum.issued30day, i.sum.remaining)
    return {
      ...i,
      ratio
    }
  })
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
  return {
    totalInventoryValue,
    totalItem,
    totalDrugRatio30Day,
    drugsWithoutHospitalData,
    historicalDrugRatio
  }
}



