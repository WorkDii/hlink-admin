import { DeleteButton, Edit, useForm, useSelect } from "@refinedev/antd";
import { useDataProvider, useGo, useResourceParams } from "@refinedev/core";
import { Form, Select, Typography, message, Space } from "antd";
import { useEffect } from "react";
import { RequestTableDrug } from "./create/requestDrugTable";
import { updateDataInventoryRequest } from "./edit/update";
import { directusClient } from "../../directusClient";
import { readInventoryRequestDrugItems } from "../../directus/generated/client";

const Text = Typography.Text;

export const InventoryRequestEdit = (props: any) => {
  const { formProps, form, saveButtonProps } = useForm({
    warnWhenUnsavedChanges: false
  });
  const dataProvider = useDataProvider();
  const { id } = useResourceParams()
  const go = useGo();
  const customSaveButtonProps = {
    ...saveButtonProps,
    onClick: async () => {
      try {
        const values = await form.validateFields();
        const transformedData = await updateDataInventoryRequest({
          id: String(id),
          inventory_drug: (values as any).inventory_drug || [],
        });

        await dataProvider().update({
          resource: "inventory_request",
          id: id!,
          variables: transformedData,
        });

        message.success("อัปเดตข้อมูลสำเร็จ");
        go({
          to: {
            resource: "inventory_request",
            action: "list"
          },
        });
      } catch (error) {
        console.error("Update failed:", error);
        message.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
      }
    },
  };

  const customDeleteButtonProps = {
    recordItemId: id,
    onSuccess: () => {
      message.success("ลบข้อมูลสำเร็จ");
      go({
        to: {
          resource: "inventory_request",
          action: "list"
        },
      });
    },
    onError: (error: any) => {
      console.error("Delete failed:", error);
      message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
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
    <Edit
      saveButtonProps={customSaveButtonProps}
      headerButtons={({ defaultButtons }) => (
        <Space>
          {defaultButtons}
          <DeleteButton {...customDeleteButtonProps} />
        </Space>
      )}
    >
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