import { Document, Page, Text, StyleSheet, Font } from "@react-pdf/renderer";
import ReportTable from "./table";
import Signature from "./signature";
import Note from "./note";
import { getInventoryRequestItem } from "../getInventoryRequestItem";

Font.register({
  family: "Sarabun",
  fonts: [
    { src: "/THSarabunNew/THSarabunNew.ttf" },
    { src: "/THSarabunNew/THSarabunNew Bold.ttf", fontWeight: "bold" },
    { src: "/THSarabunNew/THSarabunNew Italic.ttf", fontStyle: "italic" },
    {
      src: "/THSarabunNew/THSarabunNew BoldItalic.ttf",
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});

const styles = StyleSheet.create({
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
    fontFamily: "Sarabun",
    fontSize: "16px",
  },
});

type Props = {
  data: Awaited<ReturnType<typeof getInventoryRequestItem>>;
  pcu: string;
  request_id: string;
  date_created: string;
};

// Create Document Component
export const ReportDrug = ({ data, pcu, request_id, date_created }: Props) => {
  return (
    <Document>
      <Page style={styles.body}>
        <Text
          fixed
          style={{
            color: "gray",
            textAlign: "right",
            fontSize: "12px",
          }}
          render={({ pageNumber, totalPages }) =>
            `หมายเลขคำขอที่ ${request_id} หน้าที่ ${(pageNumber + "").padStart(
              2,
              "0"
            )} / ${(totalPages + "").padStart(2, "0")}`
          }
        />

        <Text
          style={{
            textAlign: "center",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          แบบคำขอเบิกยา {pcu}
        </Text>
        <Text
          style={{
            textAlign: "center",
            fontSize: "16px",
            marginBottom: 16,
          }}
        >
          หมายเลขคำขอที่ {request_id} ณ วันที่{" "}
          {new Date(date_created).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <ReportTable data={data} maximumDays={10}></ReportTable>
        <Note />
        <Signature />
      </Page>
    </Document>
  );
};
