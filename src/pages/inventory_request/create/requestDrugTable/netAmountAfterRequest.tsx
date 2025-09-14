import { accountant } from "../../../../utils/numth";
import { useWatch } from "antd/es/form/Form";

interface Props {
  index: number;
  form: any;
}

function NetAmountAfterRequest({ form, index }: Props) {
  const quantity = useWatch(["inventory_drug", index, "quantity"], form);
  const current_remain = useWatch(
    ["inventory_drug", index, "current_remain"],
    form
  );
  const current_rate = useWatch(
    ["inventory_drug", index, "current_rate"],
    form
  );
  const total = quantity + current_remain;

  return (
    <>
      <div>{accountant(total)}</div>
      <div>(x{accountant(total / current_rate)})</div>
    </>
  );
}

export default NetAmountAfterRequest;
