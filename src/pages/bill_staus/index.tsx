import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Tag } from "antd";
import React from "react";

type Props = {
  id: "pending" | "canceled" | "completed";
  name: string;
};

function BillStatusTag({ id, name }: Props) {
  switch (id) {
    case "pending":
      return (
        <Tag color="processing" icon={<SyncOutlined />}>
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
          {name}{" "}
        </Tag>
      );
    default:
      return <Tag>{name}</Tag>;
  }
}

export default BillStatusTag;
