/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useSelect } from "@refinedev/antd";
import { Form, FormInstance, Input, Select } from "antd";
import { useWatch } from "antd/es/form/Form";

type Props = {
  index: number;
  form: FormInstance;
};

export default function CurrentRateColumn({ index, form }: Props) {
  return (
    <Form.Item
      name={[index, "current_rate"]}
      rules={[
        {
          required: true,
        },
      ]}
    >
      <Input readOnly></Input>
    </Form.Item>
  );
}
