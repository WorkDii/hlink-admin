import { List } from "@refinedev/antd";
import { Table } from "antd";
import PcuOptionsButton from "../../components/pcuOptionsButton";
import { useEffect, useState } from "react";
import { directusClient } from "../../directusClient";
import { aggregate } from "@tspvivek/refine-directus";


export const DrugProblemList = () => {
  const [pcucode, setPcucode] = useState<string | undefined>(undefined);
  const [data, setData] = useState<{ pcucode: string, drugtype: string, drugcode: string, count: number }[]>([])
  useEffect(() => {
    directusClient.request(
      // @ts-ignore
      aggregate("visitdrug", {

        aggregate: {
          count: ['*']
        },
        groupBy: ['pcucode', 'drugtype', 'drugcode'],
        query: {
          limit: -1,
          filter: {
            pcucode: {
              _eq: pcucode
            },
            hospital_drug: {
              _null: true
            },
            drugtype: {
              _in: ['01', '04', '10']
            }
          },
        }
      })
    ).then((data: any) => {
      setData(data)
    }).catch(() => {
      setData([])
    })
  }, [pcucode])
  const columns = [
    {
      title: 'code5',
      dataIndex: 'pcucode',
    },
    {
      title: 'ประเภทยา',
      dataIndex: 'drugtype',
    },
    {
      title: 'รหัสยา',
      dataIndex: 'drugcode',
    },
    {
      title: 'จำนวนการใช้ยา',
      dataIndex: 'count',
    },
  ]
  return (

    <List
      headerProps={{
        subTitle: `รายการยาที่ยังไม่ได้ตั้งค่ารหัสยา 24 หลัก`,
      }}
    >
      <PcuOptionsButton
        pcucode={pcucode}
        setPcucode={setPcucode}
        style={{ marginBottom: 8 }}
      />
      <Table
        dataSource={data.sort((a, b) => Number(a.drugtype) - Number(b.drugtype))}
        columns={columns}
        pagination={{ showSizeChanger: true, defaultPageSize: 100 }}

      />
    </List>
  );
};
