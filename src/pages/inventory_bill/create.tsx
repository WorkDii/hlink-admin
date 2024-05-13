import { PlusCircleOutlined } from "@ant-design/icons";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Select, Space, Typography } from "antd";
import { useWatch } from "antd/es/form/Form";
import CreateInventoryDrugItem from "./create_inventory_drug";

const Text = Typography.Text;

export const InventoryBillCreate = () => {
  const { formProps, saveButtonProps, form } = useForm();
  const hcode = useWatch("hcode", form);

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

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        onFinish={(v) => {
          console.log(11111, v);
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
                    <CreateInventoryDrugItem
                      {...props}
                      hospitalDrugSelectProps={hospitalDrugSelectProps}
                      remove={remove}
                      form={form}
                    ></CreateInventoryDrugItem>
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
