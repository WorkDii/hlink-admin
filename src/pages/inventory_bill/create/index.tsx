import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, Typography } from "antd";
import { useWatch } from "antd/es/form/Form";
import { useEffect } from "react";
import { InventoryRequest, InventoryRequestDrug } from "../../../type";
import { TableBillDrug } from "./billDrugTable";
import { getDrugRequestList } from "./getDrugRequestList";
import { createDataInventoryBill, From, updateInventoryRequestStatus } from "./create";


const Text = Typography.Text;

export const InventoryBillCreate = () => {
  const { formProps, saveButtonProps, form } = useForm<From>({
    onMutationSuccess: async (data) => {
      await updateInventoryRequestStatus(data.data.inventory_request);
    },
  });

  const { selectProps: inventoryRequestSelectProps } = useSelect({
    resource: "inventory_request",
    meta: {
      fields: ['*', 'pcucode.name'],
    },
    filters: [
      {
        field: "status",
        operator: "eq",
        value: "pending"
      },
      {
        field: "bill_warehouse",
        operator: "eq",
        value: "คลินิกเวชฯ"
      }
    ],
    // @ts-ignore
    optionLabel: (d: InventoryRequest & { hcode: { name: string }, pcucode: { name: string } }) =>
      `[${d.request_id}] จำนวนยา ${d.inventory_request_drug.length} รายการ  ขอเบิกโดย ${d.pcucode.name}`,
    optionValue: "id",
  });

  const inventory_request = useWatch("inventory_request", form);

  useEffect(() => {
    if (inventory_request) {
      getDrugRequestList(inventory_request).then((v) => {
        form.setFieldValue("pcucode", v.pcucode);
        form.setFieldValue("hcode", v.hcode);
        form.setFieldValue("bill_warehouse", v.bill_warehouse);
        form.setFieldValue("request_id", v.request_id);
        form.setFieldValue("inventory_request_drug", v.inventory_request_drug);
      });
    } else {
      form.setFieldValue("inventory_request_drug", []);
    }
  }, [inventory_request]);

  return (
    <Create saveButtonProps={saveButtonProps}   >
      <Form
        form={form}
        {...formProps}
        layout="vertical"
        onFinish={async (v: any) => {
          const data = await createDataInventoryBill(v);
          if (formProps.onFinish) formProps.onFinish(data || {});
        }}
      >

        <Form.Item label={"คำขอเบิกยา"} name={["inventory_request"]} rules={[{ required: true }]} style={{ marginBottom: 8 }}><Select {...inventoryRequestSelectProps} /></Form.Item>
        <Form.Item name={['pcucode']} hidden><Input></Input></Form.Item>
        <Form.Item name={['hcode']} hidden><Input></Input></Form.Item>
        <Form.Item name={['bill_warehouse']} hidden><Input></Input></Form.Item>
        <Form.Item name={['request_id']} hidden><Input></Input></Form.Item>

        <Form.List
          name={["inventory_request_drug"]}
          rules={[
            {
              validator: async (_, names) => {
                if (!names || names.length < 1) {
                  return Promise.reject(
                    <Text type="danger">
                      กรุณาเพิ่มรายการยา อย่างน้อย 1 รายการ
                    </Text>
                  );
                }
              },
            },
          ]}
        >
          {(fields, operation, { errors }) => {
            return (
              <TableBillDrug
                form={form}
                fields={fields}
                operation={operation}
                errors={errors}
              ></TableBillDrug>
            );
          }}
        </Form.List>
      </Form>
    </Create>
  );
};
