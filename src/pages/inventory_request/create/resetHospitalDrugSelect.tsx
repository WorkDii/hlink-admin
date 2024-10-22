import { FormInstance } from "antd";
import { HospitalDrug } from "../../../type";

export function resetHospitalDrugSelect(form: FormInstance) {
  const allInventoryDrug: { hospital_drug: HospitalDrug }[] =
    form.getFieldValue("inventory_drug");
  const hospital_drug_selected = allInventoryDrug.map(
    (v) => v.hospital_drug.id
  );
  form.setFieldValue("hospital_drug_selected", hospital_drug_selected);
}
