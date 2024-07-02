import React, { useEffect } from "react";
import { Document, Page, Text, StyleSheet, Font } from "@react-pdf/renderer";
import ReportTable from "./table";
import Signature from "./signature";
import Note from "./note";

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

// Create Document Component
export const MyDocument = () => {
  const pcuname = "รพ.สต.ควนลัง";
  const data = [];
  for (let index = 0; index < 100; index++) {
    data.push({
      code24: "100286000002040640181079",
      name: "Silver zinc sulfadiazine cream   (Silveral)",
      quantity: 10,
      rate: 10,
      remain: 100,
    });
  }

  useEffect(() => {
    console.log(111111);
  }, []);

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
            `หมายเลขคำขอที่ IDR09570240001 หน้าที่ ${(pageNumber + "").padStart(
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
          แบบคำขอเบิกยา {pcuname}
        </Text>
        <Text
          style={{
            textAlign: "center",
            fontSize: "16px",
            marginBottom: 16,
          }}
        >
          หมายเลขคำขอที่ IDR09570240001 ณ วันที่{" "}
          {new Date().toLocaleDateString("th-TH", {
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
