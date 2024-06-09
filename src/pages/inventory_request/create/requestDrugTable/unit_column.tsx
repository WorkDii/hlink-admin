/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Form, FormInstance, Select } from "antd";
import { useWatch } from "antd/es/form/Form";
import { updateQuantity } from "./updateQuantity";
import { PREPACK_UNIT_ID } from "../../../../contexts/constants";

type Props = {
  index: number;
  form: FormInstance;
};

export default function UnitColumn({ index, form }: Props) {
  const defaultUnit = useWatch<{ id: string; name: string }>(
    ["inventory_drug", index, "hospital_drug", "default_unit"],
    form
  );
  const prepack = useWatch<number>(
    ["inventory_drug", index, "hospital_drug", "prepack"],
    form
  );
  return (
    <Form.Item
      name={[index, "unit"]}
      rules={[
        {
          required: true,
        },
      ]}
    >
      <Select
        onChange={() => {
          updateQuantity(form, index);
        }}
      >
        {defaultUnit && (
          <Select.Option value={defaultUnit.id}>
            {defaultUnit.name}
          </Select.Option>
        )}
        <Select.Option value={PREPACK_UNIT_ID}>
          PREPACK / {prepack}
        </Select.Option>
      </Select>
    </Form.Item>
  );
}
