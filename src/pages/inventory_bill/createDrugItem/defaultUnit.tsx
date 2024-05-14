import { useOne } from "@refinedev/core";

export function useDefaultUnit(hospital_drug_id: string) {
  const hospitalDrugs = useOne<{
    default_unit: { id: string; name: string; name_eng: string };
  }>({
    resource: "hospital_drug",
    id: hospital_drug_id,
    meta: {
      fields: ["default_unit.name", "default_unit.name_eng", "default_unit.id"],
    },
  });
  const default_unit = hospitalDrugs.data?.data.default_unit;
  if (!default_unit) return null;

  const { id, name, name_eng } = default_unit;
  return {
    id,
    name,
    name_eng,
    label: `${name}/${name_eng}`,
    option: {
      value: id,
      label: `${name}/${name_eng}`,
    },
  };
}
