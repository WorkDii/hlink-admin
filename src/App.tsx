import { Authenticated, Refine } from "@refinedev/core";
import { DevtoolsPanel } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  ErrorComponent,
  RefineThemes,
  ThemedLayoutV2,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { Outlet, Route, Routes, HashRouter } from "react-router-dom";
import { Header } from "./components/header";
import { Login } from "./pages/login";
import { dataProvider } from "@tspvivek/refine-directus";
import { directusClient } from "./directusClient";
import { UnitList } from "./pages/unit";
import { authProvider } from "./authProvider";
import { VisitDrugList } from "./pages/visitdrug";
import { HospitalDrugList } from "./pages/hospital_drug";
import { CustomSider, TitleApp } from "./components";
import {
  HospitalDrugUnitCreate,
  HospitalDrugUnitList,
} from "./pages/hospital_drug_unit";
import { InventoryBillCreate, InventoryBillList } from "./pages/inventory_bill";
import { InventoryList } from "./pages/inventory";
import {
  InventoryRequestCreate,
  InventoryRequestList,
} from "./pages/inventory_request";
import { ConfigProvider } from "./contexts/configProvider";
import { Dashboard } from "./pages/dashboard";
import { InventoryDashboard } from "./pages/dashboard/inventory-dashboard";
import { DashboardOutlined } from "@ant-design/icons";
import { DrugProblemList } from "./pages/drug_problem";

function App() {
  return (
    <HashRouter>
      <ConfigProvider
        theme={{
          ...RefineThemes.Green,
          token: {
            ...RefineThemes.Green.token,
            fontFamily: "Sarabun, sans-serif",
          },
        }}
      >
        <RefineKbarProvider>
          <Refine
            dataProvider={dataProvider(directusClient) as any}
            notificationProvider={useNotificationProvider}
            routerProvider={routerBindings}
            authProvider={authProvider}
            resources={[
              {
                name: "dashboard",
                list: "/dashboard",
                meta: {
                  label: "Dashboard",
                  icon: <DashboardOutlined />,
                },
              },
              {
                name: "inventory-dashboard",
                list: "/inventory-dashboard",
                meta: {
                  label: "Dashboard คลังยา",
                  icon: <DashboardOutlined />,
                },
              },
              {
                name: "inventory",
                list: "/inventories",
                meta: {
                  noStatus: true,
                  label: "คลังยา",
                },
              },
              {
                name: "inventory_request",
                list: "/inventory_requests",
                create: "/inventory_requests/create",
                meta: {
                  noStatus: true,
                  label: "คำขอเบิกยา",
                },
              },
              {
                name: "inventory_bill",
                list: "/inventory_bills",
                create: "/inventory_bills/create",
                meta: {
                  noStatus: true,
                  label: "บิลเบิกยา",
                },
              },
              {
                name: "visitdrug",
                list: "/visitdrugs",
                meta: {
                  noStatus: true,
                  label: "รายการใช้ยา",
                },
              },
              {
                name: "setting",
                meta: {
                  noStatus: true,
                  label: "ตั้งค่า",
                },
              },
              {
                name: "hospital_drug",
                list: "/hospital_drugs",
                meta: {
                  noStatus: true,
                  label: "รายชื่อยา",
                  parent: "setting",
                },
              },
              {
                name: "drug_problem",
                list: "/drug_problems",
                meta: {
                  noStatus: true,
                  label: "รายการยาที่ยังไม่ได้ Sync",
                  parent: "setting",
                },
              },
              {
                name: "unit",
                list: "/units",
                meta: {
                  noStatus: true,
                  label: "หน่วย",
                  parent: "setting",
                },
              },
              {
                name: "ou",
                meta: {
                  noStatus: true,
                  label: "หน่วยงาน",
                  parent: "setting",
                },
              },
              {
                name: "warehouse",
                meta: {
                  noStatus: true,
                  label: "คลังยา",
                  parent: "setting",
                },
              },

            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              useNewQueryKeys: true,
              projectId: "gCK5zza6eQkQSKSRnvMtongcEcWrquzTS5Khpc",
            }}
          >
            <Routes>
              <Route
                element={
                  <Authenticated
                    key="authenticated-inner"
                    fallback={<CatchAllNavigate to="/login" />}
                  >
                    <ThemedLayoutV2
                      Header={() => <Header sticky />}
                      Sider={(props) => <CustomSider {...props}></CustomSider>}
                      Title={({ collapsed }) => (
                        <TitleApp collapsed={collapsed}></TitleApp>
                      )}
                    >
                      <Outlet />
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                <Route
                  index
                  element={<NavigateToResource resource="dashboard" />}
                />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inventory-dashboard" element={<InventoryDashboard />} />
                <Route path="/units">
                  <Route index element={<UnitList />} />
                </Route>
                <Route path="/visitdrugs">
                  <Route index element={<VisitDrugList />} />
                </Route>
                <Route path="/hospital_drugs">
                  <Route index element={<HospitalDrugList />} />
                </Route>
                <Route path="/inventory_bills">
                  <Route index element={<InventoryBillList />} />
                  <Route path="create" element={<InventoryBillCreate />} />
                </Route>
                <Route path="/inventories">
                  <Route index element={<InventoryList />} />
                </Route>
                <Route path="/inventory_requests">
                  <Route index element={<InventoryRequestList />} />
                  <Route path="create" element={<InventoryRequestCreate />} />
                </Route>
                <Route path="/hospital_drug_units">
                  <Route index element={<HospitalDrugUnitList />} />
                  <Route path="create" element={<HospitalDrugUnitCreate />} />
                </Route>
                <Route path="/drug_problems">
                  <Route index element={<DrugProblemList />} />
                </Route>
                <Route path="*" element={<ErrorComponent />} />
              </Route>
              <Route
                element={
                  <Authenticated
                    key="authenticated-outer"
                    fallback={<Outlet />}
                  >
                    <NavigateToResource />
                  </Authenticated>
                }
              >
                <Route path="/login" element={<Login />} />
              </Route>
            </Routes>
            <RefineKbar />
            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
          <DevtoolsPanel />
        </RefineKbarProvider>
      </ConfigProvider>
    </HashRouter>
  );
}

export default App;
