import {
  AuthenticationData,
  AuthenticationStorage,
  authentication,
  createDirectus,
  rest,
  realtime,
} from "@tspvivek/refine-directus";

export const API_URL = "https://hlink-api.workdii.com";

const LOCAL_STORAGE_KEY = "hlink_directus_storage";

export const authLocalStorage = () =>
  ({
    get: async () => {
      const data =
        typeof window !== "undefined" &&
        window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    },

    set: async (value: AuthenticationData | null) => {
      if (!value) {
        return (
          typeof window !== "undefined" &&
          window.localStorage.removeItem(LOCAL_STORAGE_KEY)
        );
      }
      return (
        typeof window !== "undefined" &&
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value))
      );
    },
  } as AuthenticationStorage);

export const directusClient = createDirectus(API_URL)
  .with(authentication("json", { storage: authLocalStorage() }))
  .with(rest())
  .with(
    realtime({
      authMode: "handshake",
    })
  );
