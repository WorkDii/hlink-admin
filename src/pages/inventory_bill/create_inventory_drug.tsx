import { DeleteOutlined } from "@ant-design/icons";
import { useSelect } from "@refinedev/antd";
import { useOne } from "@refinedev/core";
import { Button, Col, Form, Input, Row, Select, Tag, Typography } from "antd";
import { useWatch } from "antd/es/form/Form";
import { FormInstance, FormListFieldData } from "antd/lib";
import { useEffect, useState } from "react";
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
  const [multiplier, setMultiplier] = useState<number>(1);
  const hospital_drug = useWatch(
    ["inventory_drug", name, "hospital_drug"],
    form
  );

  const _quantity = useWatch(["inventory_drug", name, "_quantity"], form);
  useEffect(() => {
    form.setFieldValue(
      ["inventory_drug", name, "quantity"],
      _quantity * multiplier
    );
  }, [_quantity, form, multiplier, name]);

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
  const {
    selectProps: hospitalDrugsUnitProps,
    queryResult: hospitalDrugsUnit,
  } = useSelect<{
    multiplier: number;
    unit: { name: string; name_eng: string; id: string };
  }>({
    resource: "hospital_drug_unit",
    filters: [{ field: "hospital_drug", operator: "eq", value: hospital_drug }],
    meta: {
      fields: ["unit.*", "multiplier"],
    },
    sorters: [
      {
        field: "multiplier",
        order: "asc",
      },
    ],
    // fix type error
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    optionLabel: (v) => {
      return `${v.unit?.name}/${v.unit?.name_eng} (x ${v.multiplier})`;
    },
    // fix type error
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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
              form.setFieldValue(["inventory_drug", name, "_quantity"], null);
            }}
          />
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
            onChange={(value) => {
              const _d = hospitalDrugsUnit?.data?.data.find((d) => {
                return d.unit.id === value;
              });
              if (_d) {
                setMultiplier(_d?.multiplier);
              } else {
                setMultiplier(1);
              }
            }}
          ></Select>
        </Form.Item>
      </Col>
      <Col span={3}>
        <Tag color="success">
          {_quantity * multiplier} {default_unit?.name} /{" "}
          {default_unit?.name_eng}
        </Tag>
      </Col>
      <Col span={2}>
        <Button icon={<DeleteOutlined />} onClick={() => remove(name)} />
      </Col>
    </Row>
  );
}

export default CreateInventoryDrugItem;
