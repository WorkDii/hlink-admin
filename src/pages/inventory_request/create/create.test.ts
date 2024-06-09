import { describe, expect, it, vi } from "vitest";
import { generateRequestID } from "./create";
import { INVENTORY_DRUG_REQUEST_BILL_ID } from "../../../contexts/constants";

const date = new Date("2023-01-01");

vi.useFakeTimers();
vi.setSystemTime(date);

describe("generateBIllID", () => {
  it("should generate bill id", () => {
    expect(generateRequestID("12345")).toBe(
      `${INVENTORY_DRUG_REQUEST_BILL_ID}12345230001`
    );
    expect(
      generateRequestID("12345", `${INVENTORY_DRUG_REQUEST_BILL_ID}12345230001`)
    ).toBe(`${INVENTORY_DRUG_REQUEST_BILL_ID}12345230002`);
  });
});
