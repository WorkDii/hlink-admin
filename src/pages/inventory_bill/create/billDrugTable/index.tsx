import {
  DeleteOutlined,
} from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Form,
  FormInstance,
  FormListFieldData,
  FormListOperation,
  Input,
  InputNumber,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import React, { useState } from "react";
import { useWatch } from "antd/es/form/Form";

type Props = {
  fields: FormListFieldData[];
  operation: FormListOperation;
  errors: React.ReactNode[];
  form: FormInstance;
};

export const TableBillDrug = ({
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
          "inventory_request_drug",
          index,
          "hospital_drug",
        ]) as { id: number; name: string; drugcode24: string };
        return (
          <>
            <div>{name}</div>
            <Typography.Text>
              [{drugcode24}]
            </Typography.Text>
          </>
        );
      },
    },
    {
      title: "จำนวนจ่ายยา",
      render: (_: any, { index }: { index: number }) => {
        return (
          <div style={{ display: "flex", alignItems: "baseline" }}>
          <Form.Item
            name={[index, "quantity"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <InputNumber
            ></InputNumber>
            </Form.Item>
            <Tag style={{ marginLeft: 10 }}> 
              {form.getFieldValue([
                "inventory_request_drug",
                index,
                "hospital_drug",
                "default_unit",
                "name"
              ])}
            </Tag>
            </div>
        );
      },
    },
    {
      title: "วันหมดอายุ",
      render: (_: any, { index }: { index: number }) => {
        return (
          <Form.Item
            name={[index, "expiry_date"]}
            rules={[
              {
                required: true,
                message: "กรุณาระบุวันหมดอายุ",
              },
            ]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              placeholder="เลือกวันหมดอายุ"
              style={{ width: '100%' }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: "Lot Number",
      render: (_: any, { index }: { index: number }) => {
        return (
          <Form.Item
            name={[index, "lot_number"]}
          >
            <Input placeholder="ระบุ Lot Number" />
          </Form.Item>
        );
      },
    },
    {
      title: "Cost",
      render: (_: any, { index }: { index: number }) => {
        const cost = form.getFieldValue([
          "inventory_request_drug",
          index,
          "cost"
        ]);
        return (
          <Form.Item
            name={[index, "cost"]}
            initialValue={cost}
            rules={[
              {
                required: true,
                message: "กรุณาระบุต้นทุน",
              },
            ]}
          >
            <InputNumber
              formatter={(value) => `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/฿\s?|(,*)/g, '')}
              style={{ width: '100%' }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: "Action",
      render: (_: any, { index }: { index: number }) => {
        return (
          <Button
            icon={<DeleteOutlined />}
            onClick={() => {
              remove(index);
            }}
          />
        );
      },
    },
  ];
  return (
    <>
      <Space direction="vertical" style={{ width: "100%", textAlign: "right" }}>
        <Table dataSource={dataSource} columns={columns} pagination={{
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
        }} />
      </Space>
      <Form.ErrorList errors={errors} />
    </>
  );
};
