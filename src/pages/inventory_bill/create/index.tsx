import { Create, useForm, useSelect } from "@refinedev/antd";
import { Checkbox, Form, Select, Typography } from "antd";
import { useWatch } from "antd/es/form/Form";
import { useEffect } from "react";
import { InventoryRequest } from "../../../type";


const Text = Typography.Text;

export const InventoryBillCreate = () => {
  const { formProps, saveButtonProps, form } = useForm({
    defaultFormValues: {
      status: true,
    }
  });
  const pcucode = useWatch("pcucode", form);

  const { selectProps: inventoryRequestSelectProps } = useSelect({
    resource: "inventory_request",
    meta: {
      fields: ['*',  'pcucode.name'],
    },
    // @ts-ignore
    optionLabel: (d: InventoryRequest & { hcode: { name: string }, pcucode: { name: string } }) => 
      `[${d.request_id}] ${d.inventory_request_drug.length} รายการ  ขอเบิกโดย ${d.pcucode.name}`,
    optionValue: "id",
  });
  // const { selectProps: ouPCUSelectProps } = useSelect({
  //   resource: "ou",
  //   optionLabel: "name",
  //   filters: [{ field: "drug_stock_parent", operator: "nnull", value: true }],
  // });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        onFinish={async (v: any) => {
          // const data = await createDataInventoryRequest(v);
          // if (formProps.onFinish) formProps.onFinish(data || {});
        }}
      >
        
        <Form.Item label={"คำขอเบิกยา"} name={["inventory_request"]} rules={[{ required: true }]} style={{marginBottom: 8}}><Select {...inventoryRequestSelectProps} /></Form.Item>
        <Form.List
          name={["inventory_drug"]}
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
            return null
            // return (
            //   <RequestTableDrug
            //     form={form}
            //     fields={fields}
            //     operation={operation}
            //     errors={errors}
            //   ></RequestTableDrug>
            // );
          }}
        </Form.List>
      </Form>
    </Create>
  );
};
