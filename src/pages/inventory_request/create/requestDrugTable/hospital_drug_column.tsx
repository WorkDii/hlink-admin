/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useSelect } from "@refinedev/antd";
import { Form, FormInstance, Select } from "antd";
import { useWatch } from "antd/es/form/Form";
import { getRecommendDrug } from "../getRecommendDrug";
import { resetHospitalDrugSelect } from "../resetHospitalDrugSelect";

type Props = {
  index: number;
  form: FormInstance;
};

export default function HospitalDrugColumn({ index, form }: Props) {
  const hcode = form.getFieldValue("hcode");
  const pcucode = form.getFieldValue("pcucode");
  const hospital_drug = useWatch(
    ["inventory_drug", index, "hospital_drug", "id"],
    form
  );

  const hospital_drug_selected = useWatch(["hospital_drug_selected"], form);

  const { selectProps: hospitalDrugSelectProps } = useSelect({
    resource: "hospital_drug",
    filters: [{ field: "hcode", operator: "eq", value: hcode }],
    // @ts-ignore
    optionLabel: (v) => {
      return `[${v.drugcode24}] ${v.name}`;
    },
    // @ts-ignore
    searchField: "search",
    defaultValue: hospital_drug,
  });
  return (
    <Form.Item
      name={[index, "hospital_drug", "id"]}
      rules={[
        {
          required: true,
        },
      ]}
    >
      <Select
        {...hospitalDrugSelectProps}
        options={hospitalDrugSelectProps.options?.map((v) => ({
          ...v,
          disabled: hospital_drug_selected.includes(v.value),
        }))}
        onChange={(v: any, o) => {
          if (hospitalDrugSelectProps.onChange) {
            hospitalDrugSelectProps.onChange(v, o);
          }
          if (v) {
            getRecommendDrug(pcucode, v).then((data) => {
              form.setFieldValue(["inventory_drug", index], data[0]);
            });
          }
          resetHospitalDrugSelect(form);
        }}
      ></Select>
    </Form.Item>
  );
}
