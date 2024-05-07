import { ThemedSiderV2 } from "@refinedev/antd";
import { Menu } from "antd";
import { FaLine } from "react-icons/fa";

export const CustomSider = (props: any) => {
  return (
    <ThemedSiderV2
      {...props}
      render={({ items, logout }) => {
        return (
          <>
            {items}
            {logout}
            <Menu.Item icon={<FaLine />}>
              <a href="#" target="_blank" rel="noopener noreferrer">
                ติดต่อ Admin
              </a>
            </Menu.Item>
          </>
        );
      }}
      fixed
    />
  );
};
