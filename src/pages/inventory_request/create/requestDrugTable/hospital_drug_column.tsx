/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useSelect } from "@refinedev/antd";
import { Form, FormInstance, Select } from "antd";
import { useWatch } from "antd/es/form/Form";
import { useEffect } from "react";
import { getData } from "./getData";

type Props = {
  index: number;
  form: FormInstance;
};

export default function HospitalDrugColumn({ index, form }: Props) {
  const hcode = form.getFieldValue("hcode");
  const pcucode = form.getFieldValue("pcucode");
  const hospital_drug = useWatch(
    ["inventory_drug", index, "hospital_drug"],
    form
  );

  const { selectProps: hospitalDrugSelectProps } = useSelect({
    resource: "hospital_drug",
    filters: [{ field: "hcode", operator: "eq", value: hcode }],
    // @ts-ignore
    optionLabel: (v) => `[${v.drugcode24}] ${v.name}`,
    // @ts-ignore
    searchField: "search",
    defaultValue: hospital_drug,
  });
  useEffect(() => {
    if (hospital_drug) {
      getData(pcucode, hospital_drug).then((data) => {
        form.setFieldValue(["inventory_drug", index], {
          hospital_drug,
          ...data,
        });
      });
    }
  }, [hospital_drug]);
  return (
    <Form.Item
      name={[index, "hospital_drug"]}
      rules={[
        {
          required: true,
        },
      ]}
    >
      <Select {...hospitalDrugSelectProps}></Select>
    </Form.Item>
  );
}
