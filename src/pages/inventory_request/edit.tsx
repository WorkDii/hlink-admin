import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Select, Typography, Spin, message } from "antd";
import { useEffect, useState } from "react";
import { useWatch } from "antd/es/form/Form";
import { RequestTableDrug } from "./create/requestDrugTable";
import { updateDataInventoryRequest } from "./edit/update";
import { directusClient } from "../../directusClient";
import { readInventoryRequestDrugItems, updateInventoryRequestItem } from "../../directus/generated/client";
import { useParams, useNavigate } from "react-router-dom";

const Text = Typography.Text;

export const InventoryRequestEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formProps, form } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  const customSaveButtonProps = {
    htmlType: "submit" as const,
    loading: isLoading,
    onClick: async () => {
      try {
        setIsLoading(true);
        const values = await form.validateFields();
        const transformedData = await updateDataInventoryRequest({
          id: id!,
          inventory_drug: (values as any).inventory_drug || [],
        });

        await directusClient.request(updateInventoryRequestItem(id!, transformedData as any));
        message.success("อัปเดตข้อมูลสำเร็จ");
        navigate("/inventory_requests");
      } catch (error) {
        console.error("Update failed:", error);
        message.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
      } finally {
        setIsLoading(false);
      }
    },
  };

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

  // Load initial data when form is ready
  useEffect(() => {
    const loadInitialData = async (inventoryRequestDrug: string[]) => {
      if (inventoryRequestDrug && Array.isArray(inventoryRequestDrug) && inventoryRequestDrug.length > 0) {
        try {
          const response = await directusClient.request(readInventoryRequestDrugItems({
            filter: {
              id: {
                _in: inventoryRequestDrug,
              },
            },
            fields: ['*', { hospital_drug: ['*'] }],
            limit: -1,
          }));

          form.setFieldValue("inventory_drug", response);
          form.setFieldValue("hospital_drug_selected", (response as any[]).map((item: any) => item.hospital_drug.id));
        } catch (error) {
          console.error("Error loading inventory drug data:", error);
        }
      } else {
        // Initialize empty arrays if no existing data
        form.setFieldValue("inventory_drug", []);
        form.setFieldValue("hospital_drug_selected", []);
      }
    };
    if (formProps.initialValues?.inventory_request_drug) {
      loadInitialData(formProps.initialValues.inventory_request_drug);
    }
  }, [formProps.initialValues]);

  return (
    <Edit saveButtonProps={customSaveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
      >
        <Form.Item name={"hospital_drug_selected"} ></Form.Item>
        <Form.Item
          label={"โรงพยาบาล"}
          name={["hcode"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select
            {...ouHospitalSelectProps}
            disabled
          />
        </Form.Item>
        <Form.Item
          label={"สถานที่เบิกยา"}
          name={["bill_warehouse"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select
            {...warehouseSelectProps}
            disabled
          />
        </Form.Item>
        <Form.Item
          label={"รพ.สต."}
          name={["pcucode"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select
            {...ouPCUSelectProps}
            disabled
          />
        </Form.Item>
        {(
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
              return (
                <RequestTableDrug
                  form={form}
                  fields={fields}
                  operation={operation}
                  errors={errors}
                ></RequestTableDrug>
              );
            }}
          </Form.List>
        )}
      </Form>
    </Edit>
  );
};