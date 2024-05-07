import { AuthPage } from "@refinedev/antd";
import { TitleApp } from "../../components";

export const Login = () => {
  return (
    <AuthPage
      type="login"
      formProps={{}}
      title={<TitleApp collapsed={false}></TitleApp>}
      registerLink={<div></div>}
      forgotPasswordLink={<div></div>}
    />
  );
};
