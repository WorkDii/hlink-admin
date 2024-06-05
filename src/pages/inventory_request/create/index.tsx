import { PlusCircleOutlined } from "@ant-design/icons";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Select, Space, Typography } from "antd";
import { useWatch } from "antd/es/form/Form";
import CreateDrugItem from "../createDrugItem";
import { useDataProvider } from "@refinedev/core";
import { getBillId } from "../createCustomValue";
import { useEffect } from "react";
import { getRecommendDrug } from "./getRecommendDrug";

const Text = Typography.Text;

export const InventoryRequestCreate = () => {
  const { formProps, saveButtonProps, form } = useForm();
  const hcode = useWatch("hcode", form);
  const pcucode = useWatch("pcucode", form);

  const { selectProps: ouSelectProps } = useSelect({
    resource: "ou",
    optionLabel: "name",
  });

  const { selectProps: hospitalDrugSelectProps } = useSelect({
    resource: "hospital_drug",
    filters: [{ field: "hcode", operator: "eq", value: hcode }],

    // fix type error
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    optionLabel: (v) => `[${v.drugcode24}] ${v.name}`,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    searchField: "search",
  });

  const dataProvider = useDataProvider()();
  useEffect(() => {
    if (pcucode) {
      getRecommendDrug(pcucode).then((v) => {
        console.log(3333333, v);
      });
    }
  }, [pcucode]);
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
          {(fields, { add, remove }, { errors }) => {
            return (
              <>
                <Space direction="vertical" style={{ width: "100%" }}>
                  {fields.map((props) => (
                    <CreateDrugItem
                      {...props}
                      hospitalDrugSelectProps={hospitalDrugSelectProps}
                      remove={remove}
                      form={form}
                    ></CreateDrugItem>
                  ))}
                  <Typography.Link onClick={() => add()}>
                    <PlusCircleOutlined /> เพิ่มรายการยา
                  </Typography.Link>
                </Space>
                <Form.ErrorList errors={errors} />
              </>
            );
          }}
        </Form.List>
      </Form>
    </Create>
  );
};
