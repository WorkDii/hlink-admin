import { FormInstance } from "antd";
import { HospitalDrug } from "../getRecommendDrug";
import { PREPACK_UNIT_ID } from "../../../../contexts/constants";

export function updateQuantity(form: FormInstance, index: number) {
  const unit = form.getFieldValue(["inventory_drug", index, "unit"]);
  const hospital_drug = form.getFieldValue([
    "inventory_drug",
    index,
    "hospital_drug",
  ]) as HospitalDrug;
  const _quantity = form.getFieldValue(["inventory_drug", index, "_quantity"]);
  if (hospital_drug) {
    const value =
      unit === PREPACK_UNIT_ID ? _quantity * hospital_drug.prepack : _quantity;
    form.setFieldValue(["inventory_drug", index, "quantity"], value);
  }
}
