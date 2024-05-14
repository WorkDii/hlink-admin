import { useSelect } from "@refinedev/antd";
import { useDefaultUnit } from "./defaultUnit";

export function useUnit(hospital_drug_id: string) {
  const defaultUnit = useDefaultUnit(hospital_drug_id);

  const { selectProps: unitSelectProps, queryResult: unitQueryResult } =
    useSelect<{
      multiplier: number;
      unit: { name: string; name_eng: string; id: string };
    }>({
      resource: "hospital_drug_unit",
      filters: [
        { field: "hospital_drug", operator: "eq", value: hospital_drug_id },
      ],
      meta: {
        fields: ["unit.*", "multiplier"],
      },
      sorters: [
        {
          field: "multiplier",
          order: "asc",
        },
      ],
      // fix type error
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      optionLabel: (v) => {
        return `${v.unit?.name}/${v.unit?.name_eng} (x ${v.multiplier})`;
      },
      // fix type error
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      optionValue: "unit.id",
      pagination: { pageSize: 10000 },
    });
  const defaultUnitOption = defaultUnit?.option ? [defaultUnit.option] : [];
  const options = unitSelectProps.options || [];

  return {
    unitSelectProps,
    unitOptions: [...defaultUnitOption, ...options],
    defaultUnit,
    findMultiplier: (value: string) => {
      // หาใน hospital_drug_unit ถ้าหากไม่เจอ แปลว่าเป็นหน่วยพื้นฐาน ซึ่งเท่ากับ 1
      const _d = unitQueryResult.data?.data.find((d) => {
        return d.unit.id === value;
      });
      return _d?.multiplier || 1;
    },
  };
}
