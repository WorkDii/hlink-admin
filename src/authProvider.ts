import { AuthProvider } from "@refinedev/core";

import { directusClient } from "./directusClient";
import { readMe } from "@tspvivek/refine-directus";

export const authProvider: AuthProvider = {
  login: async ({ username, email, password }) => {
    if ((username || email) && password) {
      const { access_token } = await directusClient.login(
        email.trim().toLowerCase(),
        password,
        { mode: "json" }
      );
      if (access_token) {
        return {
          success: true,
          redirectTo: "/",
        };
      }
    }

    return {
      success: false,
      error: {
        name: "LoginError",
        message: "Invalid username or password",
      },
    };
  },
  logout: async () => {
    await directusClient.logout();
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const token = await directusClient.getToken();
    if (token) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    const me = await directusClient.request<{
      id: string;
      first_name?: string;
      last_name?: string;
      avatar?: string;
      email: string;
    }>(readMe({ fields: ["*.*"] }));
    if (me) {
      return {
        id: me.id,
        name: `${me.first_name} ${me.last_name}` || me.email,
        avatar: me.avatar || "https://i.pravatar.cc/300",
      };
    }
    return null;
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
};
