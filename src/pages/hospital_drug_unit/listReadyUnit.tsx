import { useTable } from "@refinedev/antd";
import { Table, Typography } from "antd";
import { Unit } from "./list";
import { HttpError, useOne } from "@refinedev/core";
import { useEffect } from "react";

type Props = {
  hcode?: string;
  hospital_drug?: string;
  setReadyUnit: React.Dispatch<React.SetStateAction<string[]>>;
};

const { Text } = Typography;

interface IHospitalDrug {
  default_unit: Unit;
}

const ListReadyUnit = ({ hcode, hospital_drug, setReadyUnit }: Props) => {
  const { data: hospitalDrugData } = useOne<IHospitalDrug, HttpError>({
    resource: "hospital_drug",
    id: hospital_drug,
    meta: {
      fields: ["default_unit.*"],
    },
  });
  const { tableProps } = useTable({
    syncWithLocation: true,
    resource: "hospital_drug_unit",
    meta: {
      fields: ["unit.*", "multiplier"],
    },
    filters: {
      permanent: [
        {
          field: "hcode",
          operator: "eq",
          value: hcode,
        },
        {
          field: "hospital_drug",
          operator: "eq",
          value: hospital_drug,
        },
      ],
    },
    sorters: {
      permanent: [{ field: "multiplier", order: "asc" }],
    },
  });
  useEffect(() => {
    if (tableProps.dataSource) {
      setReadyUnit(tableProps.dataSource.map((v: any) => v.unit.id));
    } else {
      setReadyUnit([]);
    }
  }, [setReadyUnit, tableProps]);
  return (
    <Table {...tableProps} rowKey={"id"}>
      <Table.Column
        dataIndex="unit"
        title="หน่วย"
        render={(v: Unit) => {
          return (
            <Text>
              {v.name} / {v.name_eng}
            </Text>
          );
        }}
      />
      <Table.Column
        dataIndex="multiplier"
        title="ตัวคูณ"
        sorter
        render={(v) => {
          return (
            <Text>
              {["=", v, hospitalDrugData?.data.default_unit.name].join(" ")}
            </Text>
          );
        }}
      ></Table.Column>
    </Table>
  );
};

export default ListReadyUnit;
