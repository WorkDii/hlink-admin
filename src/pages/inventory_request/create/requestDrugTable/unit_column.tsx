/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Form, FormInstance, Select } from "antd";
import { useWatch } from "antd/es/form/Form";

type Props = {
  index: number;
  form: FormInstance;
};

export default function UnitColumn({ index, form }: Props) {
  const defaultUnit = useWatch<{ id: string; name: string }>(
    ["inventory_drug", index, "default_unit"],
    form
  );
  const prepack = useWatch<number>(["inventory_drug", index, "prepack"], form);
  return (
    <Form.Item
      name={[index, "unit"]}
      rules={[
        {
          required: true,
        },
      ]}
    >
      <Select>
        {defaultUnit && (
          <Select.Option value={defaultUnit.id}>
            {defaultUnit.name}
          </Select.Option>
        )}
        <Select.Option value="000">PREPACK / {prepack}</Select.Option>
      </Select>
    </Form.Item>
  );
}
