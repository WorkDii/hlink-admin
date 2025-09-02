import { accountant } from "@wdii/numth";
import { useWatch } from "antd/es/form/Form";

interface Props {
  index: number;
  form: any;
}

function NetAmountRequest({ form, index }: Props) {
  const quantity = useWatch(["inventory_drug", index, "quantity"], form);
  return accountant(quantity);
}

export default NetAmountRequest;
