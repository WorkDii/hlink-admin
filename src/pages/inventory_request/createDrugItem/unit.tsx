import { useEffect, useState } from "react";
import { directusClient } from "../../../directusClient";
import { readItem } from "@tspvivek/refine-directus";

export function useUnit(hospital_drug_id: string) {
  const [options, setOptions] = useState<{ value: number; label: string }[]>(
    []
  );
  const [multiplier, setMultiplier] = useState<number>(1);

  useEffect(() => {
    setMultiplier(1);
    if (!hospital_drug_id) return;
    directusClient
      .request<{ prepack: number; default_unit: { name: string } }>(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        readItem("hospital_drug", hospital_drug_id, {
          fields: ["default_unit.name", "prepack"],
        })
      )
      .then((data) => {
        const options = [
          {
            value: 1,
            label: `${data.default_unit.name}`,
          },
          {
            value: data.prepack,
            label: `PREPACK / ${data.prepack}`,
          },
        ];
        setOptions(options);
      });
  }, [hospital_drug_id]);

  return { options, multiplier, setMultiplier };
}
