import {
  DeleteOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import {
  Button,
  Form,
  FormInstance,
  FormListFieldData,
  FormListOperation,
  InputNumber,
  Space,
  Table,
  Typography,
} from "antd";
import React from "react";
import UnitColumn from "./unit_column";
import { updateQuantity } from "./updateQuantity";
import { accountant } from "@wdii/numth";

type Props = {
  fields: FormListFieldData[];
  operation: FormListOperation;
  errors: React.ReactNode[];
  form: FormInstance;
};

export const RequestTableDrug = ({
  fields,
  operation: { add, remove },
  errors,
  form,
}: Props) => {
  const dataSource = fields.map((field) => ({ index: field.name }));
  const columns = [
    {
      title: "ลำดับที่",
      render: (_: any, { index }: { index: number }) => index + 1,
    },
    {
      title: "รายการยา",
      render: (_: any, { index }: { index: number }) => {
        const { name, drugcode24 } = form.getFieldValue([
          "inventory_drug",
          index,
          "hospital_drug",
        ]) as { id: number; name: string; drugcode24: string };
        return (
          <>
            <div>[{drugcode24}]</div>
            <div>{name}</div>
          </>
        );
      },
    },
    {
      title: "ปริมาณการใช้ 30 วัน",
      render: (_: any, { index }: { index: number }) => {
        return accountant(
          form.getFieldValue(["inventory_drug", index, "current_rate"])
        );
      },
    },
    {
      title: "ปริมาณคงเหลือ",
      render: (_: any, { index }: { index: number }) => {
        return accountant(
          form.getFieldValue(["inventory_drug", index, "current_remain"])
        );
      },
    },
    {
      title: "จำนวนขอเบิก",
      render: (_: any, { index }: { index: number }) => {
        return (
          <Form.Item
            name={[index, "_quantity"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <InputNumber
              onChange={() => {
                updateQuantity(form, index);
              }}
            ></InputNumber>
          </Form.Item>
        );
      },
    },
    {
      title: "หน่วย",
      render: (_: any, { index }: { index: number }) => (
        <UnitColumn form={form} index={index}></UnitColumn>
      ),
    },
    {
      title: "จำนวนขอเบิกสุทธิ",
      render: (_: any, { index }: { index: number }) => {
        return accountant(
          form.getFieldValue(["inventory_drug", index, "quantity"])
        );
      },
    },
    {
      title: "จำนวนหลังเบิก",
      render: (_: any, { index }: { index: number }) => {
        const total = ((form.getFieldValue([
          "inventory_drug",
          index,
          "quantity",
        ]) as number) +
          form.getFieldValue([
            "inventory_drug",
            index,
            "current_remain",
          ])) as number;
        const current_rate = form.getFieldValue([
          "inventory_drug",
          index,
          "current_rate",
        ]) as number;
        return (
          <>
            <div>{accountant(total)}</div>
            <div>(x{accountant(total / current_rate)})</div>
          </>
        );
      },
    },
    {
      title: "Action",
      render: (_: any, record: { index: number }) => {
        return (
          <Button
            icon={<DeleteOutlined />}
            onClick={() => remove(record.index)}
          />
        );
      },
    },
  ];
  return (
    <>
      <Space direction="vertical" style={{ width: "100%", textAlign: "right" }}>
        <Space>
          <Typography.Link
            onClick={() =>
              add(
                {
                  hospital_drug: { drugcode24: "1242", name: "Paracetamol" },
                  current_rate: 30,
                  current_remain: 100,
                  quantity: 0,
                  _quantity: 0,
                  unit: "เม็ด",
                },
                0
              )
            }
          >
            <PlusCircleOutlined /> เพิ่มรายการยา
          </Typography.Link>
          <Typography.Link
            onClick={() => {
              form.setFieldValue(["inventory_drug"], []);
            }}
            type="danger"
          >
            <MinusCircleOutlined /> ลบรายการทั้งหมดออก
          </Typography.Link>
        </Space>
        <Table dataSource={dataSource} columns={columns} />
      </Space>
      <Form.ErrorList errors={errors} />
    </>
  );
};
