import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
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
import HospitalDrugColumn from "./hospital_drug_column";
import UnitColumn from "./unit_column";
import { updateQuantity } from "./updateQuantity";

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
      render: (_: any, { index }: { index: number }) => (
        <HospitalDrugColumn index={index} form={form}></HospitalDrugColumn>
      ),
    },
    {
      title: "ปริมาณการใช้ 30 วัน",
      render: (_: any, record: { index: number }) => {
        return (
          <Form.Item
            name={[record.index, "current_rate"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <InputNumber disabled></InputNumber>
          </Form.Item>
        );
      },
    },
    {
      title: "ปริมาณคงเหลือ",
      render: (_: any, record: { index: number }) => {
        return (
          <Form.Item
            name={[record.index, "current_remain"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <InputNumber disabled></InputNumber>
          </Form.Item>
        );
      },
    },
    {
      title: "จำนวนขอเบิก",
      render: (_: any, record: { index: number }) => {
        return (
          <Form.Item
            name={[record.index, "_quantity"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <InputNumber
              onChange={() => {
                updateQuantity(form, record.index);
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
      render: (_: any, record: { index: number }) => {
        return (
          <Form.Item
            name={[record.index, "quantity"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <InputNumber disabled></InputNumber>
          </Form.Item>
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
      <Space direction="vertical" style={{ width: "100%" }}>
        <Table dataSource={dataSource} columns={columns} />
        <Typography.Link onClick={() => add()}>
          <PlusCircleOutlined /> เพิ่มรายการยา
        </Typography.Link>
      </Space>
      <Form.ErrorList errors={errors} />
    </>
  );
};
