import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Select, Typography } from "antd";
import { useWatch } from "antd/es/form/Form";
import { useEffect } from "react";
import { RequestTableDrug } from "./requestDrugTable";
import { getRecommendDrug } from "./getRecommendDrug";
import { resetHospitalDrugSelect } from "./resetHospitalDrugSelect";
import { createDataInventoryRequest } from "./create";

const Text = Typography.Text;

export const InventoryRequestCreate = () => {
  const { formProps, saveButtonProps, form } = useForm();
  const pcucode = useWatch("pcucode", form);

  const { selectProps: ouSelectProps } = useSelect({
    resource: "ou",
    optionLabel: "name",
  });

  useEffect(() => {
    form.setFieldValue("inventory_drug", null);
    if (pcucode) {
      getRecommendDrug(pcucode).then((v) => {
        form.setFieldValue(
          "inventory_drug",
          v.filter((v) => v._quantity > 0)
        );
        resetHospitalDrugSelect(form);
      });
    }
  }, [pcucode]);
  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        onFinish={async (v: any) => {
          const data = await createDataInventoryRequest(v);
          if (formProps.onFinish) formProps.onFinish(data || {});
        }}
      >
        <Form.Item name={"hospital_drug_selected"}></Form.Item>
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
            {...ouSelectProps}
            onChange={() => {
              form.resetFields(["inventory_drug"]);
            }}
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
            {...ouSelectProps}
            onChange={() => {
              form.resetFields(["hospital_drug"]);
            }}
          />
        </Form.Item>
        <Form.List
          name="inventory_drug"
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
      </Form>
    </Create>
  );
};
