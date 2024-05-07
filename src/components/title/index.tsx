import { ThemedTitleV2 } from "@refinedev/antd";
import { MdOutlineDatasetLinked } from "react-icons/md";

type Props = {
  collapsed: boolean;
  text?: string;
};

export const TitleApp = ({ collapsed, text }: Props) => {
  return (
    <ThemedTitleV2
      collapsed={collapsed}
      text={text || "HLink Admin"}
      icon={<MdOutlineDatasetLinked size={26} />}
    />
  );
};
