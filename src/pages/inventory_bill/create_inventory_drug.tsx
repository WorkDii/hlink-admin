import { DeleteOutlined } from "@ant-design/icons";
import { useSelect } from "@refinedev/antd";
import { useOne } from "@refinedev/core";
import { Button, Col, Form, Input, Row, Select, Tag, Typography } from "antd";
import { useWatch } from "antd/es/form/Form";
import { FormInstance, FormListFieldData } from "antd/lib";
const { Text } = Typography;

type Props = FormListFieldData & {
  hospitalDrugSelectProps: any;
  remove: (index: number | number[]) => void;
  form: FormInstance;
};

function CreateInventoryDrugItem({
  key,
  name,
  hospitalDrugSelectProps,
  remove,
  form,
}: Props) {
  const hospital_drug = useWatch(
    ["inventory_drug", name, "hospital_drug"],
    form
  );

  const quantity = useWatch(["inventory_drug", name, "quantity"], form);

  const hospitalDrugs = useOne<{
    default_unit: { id: string; name: string; name_eng: string };
  }>({
    resource: "hospital_drug",
    id: hospital_drug,
    meta: {
      fields: ["default_unit.name", "default_unit.name_eng", "default_unit.id"],
    },
  });
  const default_unit = hospitalDrugs.data?.data.default_unit;
  const { selectProps: hospitalDrugsUnitProps } = useSelect({
    resource: "hospital_drug_unit",
    filters: [{ field: "hospital_drug", operator: "eq", value: hospital_drug }],
    meta: {
      fields: ["unit.*", "multiplier"],
    },
    // fix type error
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    optionLabel: (v) => {
      return `${v.unit?.name}/${v.unit?.name_eng} (x ${v.multiplier})`;
    },
    optionValue: "unit.id",
    pagination: { pageSize: 10000 },
  });

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
          <Select
            {...hospitalDrugSelectProps}
            onChange={() => {
              form.setFieldValue(["inventory_drug", name, "unit"], null);
              form.setFieldValue(["inventory_drug", name, "quantity"], null);
            }}
          />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item
          name={[name, "quantity"]}
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
      <Col span={3}>
        <Form.Item
          name={[name, "unit"]}
          label="หน่วย"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select
            {...hospitalDrugsUnitProps}
            options={[
              {
                value: default_unit?.id,
                label: `${default_unit?.name}/${default_unit?.name_eng}`,
              },
              ...(hospitalDrugsUnitProps.options
                ? hospitalDrugsUnitProps.options
                : []),
            ]}
          ></Select>
        </Form.Item>
      </Col>
      <Col span={5}>
        <Tag color="success">
          {quantity} {default_unit?.name} / {default_unit?.name_eng}
        </Tag>
      </Col>
      <Col span={2}>
        <Button icon={<DeleteOutlined />} onClick={() => remove(name)} />
      </Col>
    </Row>
  );
}

export default CreateInventoryDrugItem;
