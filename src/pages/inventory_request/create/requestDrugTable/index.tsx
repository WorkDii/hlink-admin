import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  FormInstance,
  FormListFieldData,
  FormListOperation,
  Input,
  Space,
  Table,
  Typography,
} from "antd";
import React from "react";
import HospitalDrugColumn from "./hospital_drug_column";
import CurrentRateColumn from "./current_rate_column";

type Props = {
  fields: FormListFieldData[];
  operation: FormListOperation;
  errors: React.ReactNode[];
  form: FormInstance;
};

export const RequestTableDrug = ({
  fields,
  operation: { add, move, remove },
  errors,
  form,
}: Props) => {
  const dataSource = fields.map((field) => ({ index: field.name }));
  const columns = [
    {
      title: "รายการยา",
      render: (_: any, { index }: { index: number }) => (
        <HospitalDrugColumn index={index} form={form}></HospitalDrugColumn>
      ),
    },
    {
      title: "ปริมาณการใช้ 30 วัน",
      render: (_: any, { index }: { index: number }) => (
        <CurrentRateColumn index={index} form={form}></CurrentRateColumn>
      ),
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
            <Input readOnly></Input>
          </Form.Item>
        );
      },
    },
    {
      title: "จำนวนสั่งซื้อ",
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
            <Input></Input>
          </Form.Item>
        );
      },
    },
    {
      title: "หน่วย",
      render: (_: any, record: { index: number }) => {
        return (
          <Form.Item
            name={[record.index, "unit"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input></Input>
          </Form.Item>
        );
      },
    },
    {
      title: "จำนวนสั่งซื้อสุทธิ",
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
            <Input readOnly></Input>
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
