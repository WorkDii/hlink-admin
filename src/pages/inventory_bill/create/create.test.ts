import { generateBillID, createDataInventoryBill } from "./create"


import { INVENTORY_BILL_ID } from "../../../contexts/constants";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe('generateBillID', () => {
  const mockDate = new Date('2023-06-15');
  const originalDate = global.Date;

  beforeAll(() => {
    global.Date = class extends Date {
      constructor() {
        super();
        return mockDate;
      }
    } as DateConstructor;
  });

  afterAll(() => {
    global.Date = originalDate;
  });

  it('should generate a new bill ID when no lastBillID is provided', () => {
    const pcucode = '12345';
    const expected = `${INVENTORY_BILL_ID}${pcucode}230001`;
    
    expect(generateBillID(pcucode)).toBe(expected);
  });

  it('should increment the bill ID when lastBillID is provided', () => {
    const pcucode = '12345';
    const lastBillID = `${INVENTORY_BILL_ID}${pcucode}230005`;
    const expected = `${INVENTORY_BILL_ID}${pcucode}230006`;
    
    expect(generateBillID(pcucode, lastBillID)).toBe(expected);
  });

  it('should pad the bill number with zeros', () => {
    const pcucode = '12345';
    const lastBillID = `${INVENTORY_BILL_ID}${pcucode}230009`;
    const expected = `${INVENTORY_BILL_ID}${pcucode}230010`;
    
    expect(generateBillID(pcucode, lastBillID)).toBe(expected);
  });
});
