import { accountant } from "@wdii/numth";
import { useWatch } from "antd/es/form/Form";

type Props = {
  index: number;
  form: any;
};

const NetAmountRequest = ({ form, index }: Props) => {
  const quantity = useWatch(["inventory_drug", index, "quantity"], form);
  return accountant(quantity);
};

export default NetAmountRequest;
