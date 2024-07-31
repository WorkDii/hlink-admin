import { AuthPage } from "@refinedev/antd";
import { TitleApp } from "../../components";

export const Login = () => {
  return (
    <AuthPage
      title={<TitleApp collapsed={false}></TitleApp>}
      registerLink={<div></div>}
      forgotPasswordLink={<div></div>}
      type="login"
      formProps={{
        initialValues: {
          username: "",
          password: "",
        },
      }}
    />
  );
};
