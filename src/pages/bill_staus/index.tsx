import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Tag } from "antd";

type Props = {
  id: "pending" | "canceled" | "completed" | "in progress";
  name: string;
};

function BillStatusTag({ id, name }: Props) {
  switch (id) {
    case "pending":
      return (
        <Tag color="default" icon={<ClockCircleOutlined  />}>
          {name}
        </Tag>
      );
    case "canceled":
      return (
        <Tag color="error" icon={<CloseCircleOutlined />}>
          {name}
        </Tag>
      );
    case "completed":
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          {name}
        </Tag>
      );
    case "in progress":
      return (
        <Tag icon={<SyncOutlined />} color="processing">
          {name}
        </Tag>
      );
    default:
      return <Tag>{name}</Tag>;
  }
}

export default BillStatusTag;
