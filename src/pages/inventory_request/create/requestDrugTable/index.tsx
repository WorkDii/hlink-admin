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
  Space,
  Table,
  Typography,
} from "antd";
import React, { useState } from "react";
import { accountant } from "@wdii/numth";
import ModalSearchDrug from "./modalSearchDrug";
import { useWatch } from "antd/es/form/Form";
import NetAmountAfterRequest from "./netAmountAfterRequest";

interface Props {
  fields: FormListFieldData[];
  operation: FormListOperation;
  errors: React.ReactNode[];
  form: FormInstance;
}

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
        const hospitalDrug = form.getFieldValue([
          "inventory_drug",
          index,
          "hospital_drug",
        ]) as { id: number; name: string; drugcode24: string };
        const { name, drugcode24 } = hospitalDrug;
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
      title: "จำนวน prepack",
      render: (_: any, { index }: { index: number }) => {
        const prepack = form.getFieldValue([
          "inventory_drug",
          index,
          "current_prepack"
        ]);
        return prepack ? prepack : "-";
      },
    },
    {
      title: "จำนวนขอ",
      render: (_: any, { index }: { index: number }) => {
        return accountant(
          form.getFieldValue(["inventory_drug", index, "quantity"])
        );
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
              const hospitalDrug = form.getFieldValue([
                "inventory_drug",
                index,
                "hospital_drug",
              ]) as { id: number; name: string; drugcode24: string };
              const hospital_drug_selected = form.getFieldValue(
                "hospital_drug_selected"
              );
              form.setFieldValue(
                "hospital_drug_selected",
                hospital_drug_selected.filter((drugId: number) => drugId !== hospitalDrug.id)
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
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} รายการ`
        }} />
      </Space>
      <Form.ErrorList errors={errors} />
    </>
  );
};
