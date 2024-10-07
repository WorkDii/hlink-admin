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
} from "antd";
import React, { useState } from "react";
import UnitColumn from "./unit_column";
import { updateQuantity } from "./updateQuantity";
import { accountant } from "@wdii/numth";
import ModalSearchDrug from "./modalSearchDrug";
import { useWatch } from "antd/es/form/Form";
import NetAmountRequest from "./netAmountRequest";
import NetAmountAfterRequest from "./netAmountAfterRequest";
import { divide } from "lodash";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hcode = useWatch(["hcode"], form);
  const pcucode = useWatch(["pcucode"], form);

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
        return <NetAmountRequest index={index} form={form}></NetAmountRequest>;
      },
    },
    {
      title: "จำนวนหลังเบิก",
      render: (_: any, { index }: { index: number }) => {
        return (
          <NetAmountAfterRequest
            index={index}
            form={form}
          ></NetAmountAfterRequest>
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
              const { id } = form.getFieldValue([
                "inventory_drug",
                index,
                "hospital_drug",
              ]) as { id: number; name: string; drugcode24: string };
              const hospital_drug_selected = form.getFieldValue(
                "hospital_drug_selected"
              );
              form.setFieldValue(
                "hospital_drug_selected",
                hospital_drug_selected.filter((v: number) => v !== id)
              );
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
        <ModalSearchDrug
          isModalOpen={isModalOpen}
          handleCancel={() => {
            setIsModalOpen(false);
          }}
          handleOk={(data: any) => {
            add(data, 0);
            const hospital_drug_selected = form.getFieldValue(
              "hospital_drug_selected"
            );
            form.setFieldValue("hospital_drug_selected", [
              ...hospital_drug_selected,
              data.hospital_drug.id,
            ]);
            setIsModalOpen(false);
          }}
          form={form}
        ></ModalSearchDrug>
        {pcucode && hcode && (
          <Space>
            <Button
              onClick={() => {
                form.setFieldValue(["inventory_drug"], []);
                form.setFieldValue(["hospital_drug_selected"], []);
              }}
              type="default"
              danger
            >
              <MinusCircleOutlined /> ลบรายการทั้งหมดออก
            </Button>
            <Button
              onClick={() => {
                setIsModalOpen(true);
              }}
              type="primary"
            >
              <PlusCircleOutlined /> เพิ่มรายการยา
            </Button>
          </Space>
        )}


        <Table dataSource={dataSource} columns={columns} pagination={{
          showSizeChanger: true,
        }} summary={() => {
          return (
            
            <Table.Summary.Row>
              <Table.Summary.Cell index={1} colSpan={9} >
                <div style={{ textAlign: 'right' }}>
                  ทั้งหมด: <b>
                  {dataSource.length && (
                    `${Number(dataSource.length ?? 0).toLocaleString('th-TH')}`
                  )}
                  </b> รายการ
                </div>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }} />
      </Space>
      <Form.ErrorList errors={errors} />
    </>
  );
};
