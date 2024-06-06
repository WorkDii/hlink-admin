/* eslint-disable @typescript-eslint/ban-ts-comment */
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Row, Select, Tag } from "antd";
import { useWatch } from "antd/es/form/Form";
import { FormInstance, FormListFieldData } from "antd/lib";
import { useEffect } from "react";
import { useUnit } from "./unit";
import { useSelect } from "@refinedev/antd";

type Props = FormListFieldData & {
  hcode: string;
  remove: (index: number | number[]) => void;
  form: FormInstance;
};

function CreateDrugItem({ key, name, remove, form, hcode }: Props) {
  const hospital_drug = useWatch(
    ["inventory_drug", name, "hospital_drug"],
    form
  );

  const {
    options: unitOptions,
    multiplier,
    setMultiplier,
  } = useUnit(hospital_drug);

  const _quantity = useWatch(["inventory_drug", name, "_quantity"], form);

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
    form.setFieldValue(
      ["inventory_drug", name, "quantity"],
      _quantity * multiplier
    );
  }, [_quantity, form, multiplier, name]);

  useEffect(() => {
    form.setFieldValue(["inventory_drug", name, "unit"], null);
    form.setFieldValue(["inventory_drug", name, "_quantity"], null);
  }, [hospital_drug]);

  return (
    <Row key={key} gutter={12} align="middle">
      <Col span={11}>
        <Form.Item
          label={"รายการยา"}
          name={[name, "hospital_drug"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select {...hospitalDrugSelectProps} />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item
          name={[name, "_quantity"]}
          label="จำนวน"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input type="number" />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item
          name={[name, "unit"]}
          label="หน่วย"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select options={unitOptions} onChange={setMultiplier}></Select>
        </Form.Item>
      </Col>
      <Col span={3}>
        <Tag color="success">
          {_quantity * multiplier} {unitOptions[0]?.label}
        </Tag>
      </Col>
      <Col span={2}>
        <Button icon={<DeleteOutlined />} onClick={() => remove(name)} />
      </Col>
    </Row>
  );
}

export default CreateDrugItem;
