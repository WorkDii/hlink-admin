import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Select, Typography } from "antd";
import { useWatch } from "antd/es/form/Form";
import { useEffect } from "react";
import { RequestTableDrug } from "./create/requestDrugTable";
import { resetHospitalDrugSelect } from "./create/resetHospitalDrugSelect";
import { createDataInventoryRequest } from "./create/create";

const Text = Typography.Text;

export const InventoryRequestEdit = () => {
  const { formProps, saveButtonProps, form } = useForm();
  const pcucode = useWatch("pcucode", form);

  const { selectProps: ouHospitalSelectProps } = useSelect({
    resource: "ou",
    optionLabel: "name",
    filters: [{ field: "drug_stock_parent", operator: "null", value: true }],
  });

  const { selectProps: warehouseSelectProps } = useSelect({
    resource: "warehouse",
    optionLabel: "bill_warehouse",
    optionValue: 'bill_warehouse',
  });

  const { selectProps: ouPCUSelectProps } = useSelect({
    resource: "ou",
    optionLabel: "name",
    filters: [{ field: "drug_stock_parent", operator: "nnull", value: true }],
  });

  useEffect(() => {
    form.setFieldValue("inventory_drug", null);
    if (pcucode) {
      form.setFieldValue(
        "inventory_drug",
        []
      );
      resetHospitalDrugSelect(form);
    }
  }, [pcucode]);

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        onFinish={async (v: any) => {
          const data = await createDataInventoryRequest(v);
          if (formProps.onFinish) formProps.onFinish(data || {});
        }}
      >
        <Form.Item
          label="รพ."
          name={"hcode"}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select {...ouHospitalSelectProps} />
        </Form.Item>

        <Form.Item
          label="รพ.สต."
          name={"pcucode"}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select {...ouPCUSelectProps} />
        </Form.Item>

        <Form.Item
          label="สถานที่เบิกยา"
          name={"bill_warehouse"}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select {...warehouseSelectProps} />
        </Form.Item>

        <Form.Item label="หมายเหตุ" name={"note"}>
          <Select
            mode="tags"
            style={{ width: "100%" }}
            placeholder="หมายเหตุ (ถ้ามี)"
            open={false}
          />
        </Form.Item>

        {pcucode && (
          <>
            <Text>เลือกยาที่ต้องการเบิก</Text>
            <Form.List name="inventory_drug">
              {(fields, operations) => (
                <RequestTableDrug 
                  fields={fields} 
                  operation={operations} 
                  errors={[]} 
                  form={form} 
                />
              )}
            </Form.List>
          </>
        )}
      </Form>
    </Edit>
  );
};