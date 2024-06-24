import { ThemedSiderV2 } from "@refinedev/antd";
import { Button, Menu } from "antd";
import { FaLine } from "react-icons/fa";

export const CustomSider = (props: any) => {
  return (
    <ThemedSiderV2
      {...props}
      render={({ items, logout, collapsed }) => {
        return (
          <>
            {items}
            {logout}
            <div
              style={{
                width: "100%",
                padding: "16px 16px",
                position: "absolute",
                bottom: 48,
              }}
            >
              <Button
                icon={<FaLine />}
                style={{ width: "100%" }}
                onClick={() => {
                  window.open("https://line.me/ti/p/O-tsCPcI6P");
                }}
              >
                {!collapsed && "ติดต่อ Admin"}
              </Button>
            </div>
          </>
        );
      }}
      fixed
    />
  );
};
