import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Select, Typography } from "antd";
import { useWatch } from "antd/es/form/Form";
import { useDataProvider } from "@refinedev/core";
import { useEffect } from "react";
import { RequestTableDrug } from "./requestDrugTable";
import { getRecommendDrug } from "./getRecommendDrug";

const Text = Typography.Text;

export const InventoryRequestCreate = () => {
  const { formProps, saveButtonProps, form } = useForm();
  const pcucode = useWatch("pcucode", form);

  const { selectProps: ouSelectProps } = useSelect({
    resource: "ou",
    optionLabel: "name",
  });

  const dataProvider = useDataProvider()();
  useEffect(() => {
    form.setFieldValue("inventory_drug", null);
    if (pcucode) {
      getRecommendDrug(pcucode).then((v) => {
        console.log("done");
        form.setFieldValue("inventory_drug", v);
      });
    }
  }, [pcucode]);

  // temporary data
  useEffect(() => {
    form.setFieldsValue({
      hcode: "10682",
      pcucode: "09570",
    });
  }, []);
  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        onFinish={async (v: any) => {
          console.log(22222222, v);
          // const bill_id = await getBillId(dataProvider(), v.hcode);
          // if (formProps.onFinish)
          //   formProps.onFinish({
          //     ...v,
          //     bill_id,
          //     status: "pending",
          //   });
        }}
      >
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
