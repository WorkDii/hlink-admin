import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, InputNumber, Select } from "antd";
import { useWatch } from "antd/es/form/Form";
import ListReadyUnit from "./listReadyUnit";
import { Unit } from "./list";
import { useState } from "react";

export const HospitalDrugUnitCreate = () => {
  const { formProps, saveButtonProps, form } = useForm({});
  const hcode = useWatch("hcode", form);
  const hospital_drug = useWatch("hospital_drug", form);
  const [readyUnit, setReadyUnit] = useState<string[]>([]);

  const { selectProps: ouSelectProps } = useSelect({
    resource: "ou",
    optionLabel: "name",
  });
  const { selectProps: hospitalDrugSelectProps } = useSelect({
    resource: "hospital_drug",
    filters: [{ field: "hcode", operator: "eq", value: hcode }],

    // fix type error
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    optionLabel: (v) => `[${v.drugcode24}] ${v.name}`,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    searchField: "search",
  });
  const { selectProps: unitSelectProps } = useSelect({
    resource: "unit",
    filters: [{ field: "id", operator: "nin", value: readyUnit }],

    // fix type error
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    optionLabel: (v: Unit) => `${v?.name} / (${v?.name_eng})`,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    searchField: "search",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={"โรงพยาบาล"}
          name={["hcode"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select
            {...ouSelectProps}
            onChange={() => {
              form.resetFields(["hospital_drug"]);
            }}
          />
        </Form.Item>
        <Form.Item
          label={"รายการยา"}
          name={["hospital_drug"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select {...hospitalDrugSelectProps} />
        </Form.Item>
        {hcode && hospital_drug && (
          <ListReadyUnit
            hcode={hcode}
            hospital_drug={hospital_drug}
            setReadyUnit={setReadyUnit}
          />
        )}
        <Form.Item
          label={"หน่วย"}
          name={["unit"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select {...unitSelectProps} allowClear />
        </Form.Item>
        <Form.Item
          label={"ตัวคูณ"}
          name={["multiplier"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Create>
  );
};
