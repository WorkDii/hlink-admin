import { PlusCircleOutlined } from "@ant-design/icons";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Select, Space, Typography } from "antd";
import { useWatch } from "antd/es/form/Form";
import CreateDrugItem from "./createDrugItem";
import { useDataProvider } from "@refinedev/core";
import { getBillId } from "../createCustomValue";
import { useEffect } from "react";
import { getRecommendDrug } from "./getRecommendDrug";
import { RequestTableDrug } from "./requestDrugTable";

const Text = Typography.Text;

export const InventoryRequestCreate = () => {
  const { formProps, saveButtonProps, form } = useForm();
  const hcode = useWatch("hcode", form);
  const pcucode = useWatch("pcucode", form);

  const { selectProps: ouSelectProps } = useSelect({
    resource: "ou",
    optionLabel: "name",
  });

  const dataProvider = useDataProvider()();
  useEffect(() => {
    if (pcucode) {
      getRecommendDrug(pcucode).then((v) => {
        form.setFieldValue("inventory_drug", v.slice(0, 1000));
        // console.log(11111111, form.getFieldValue("inventory_drug"));
      });
    }
  }, [pcucode]);

  useEffect(() => {
    form.setFieldsValue({
      hcode: "10682",
      pcucode: "09570",
      inventory_drug: [
        {
          quantity: 9700,
          unit: 100,
          _quantity: "97",
          hospital_drug: "0a03fe46-de4f-40c7-9458-339936b2d5ed",
        },
      ],
    });
  }, [form]);
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
