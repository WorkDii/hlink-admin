import React, { useEffect } from "react";
import { Document, Page, Text, StyleSheet, Font } from "@react-pdf/renderer";
import ReportTable from "./table";
import Signature from "./signature";

Font.register({
  family: "Sarabun",
  fonts: [
    // regular
    { src: "/Sarabun-Thin.ttf", fontWeight: "thin" },
    { src: "/Sarabun-Light.ttf", fontWeight: "light" },
    { src: "/Sarabun-Regular.ttf" },
    { src: "/Sarabun-Medium.ttf", fontWeight: "medium" },
    { src: "/Sarabun-SemiBold.ttf", fontWeight: "semibold" },
    { src: "/Sarabun-Bold.ttf", fontWeight: "bold" },
    // italic
    { src: "/Sarabun-ThinItalic.ttf", fontWeight: "thin", fontStyle: "italic" },
    {
      src: "/Sarabun-LightItalic.ttf",
      fontWeight: "light",
      fontStyle: "italic",
    },
    { src: "/Sarabun-Italic.ttf", fontStyle: "italic" },
    {
      src: "/Sarabun-MediumItalic.ttf",
      fontWeight: "medium",
      fontStyle: "italic",
    },
    {
      src: "/Sarabun-SemiBoldItalic.ttf",
      fontWeight: "semibold",
      fontStyle: "italic",
    },
    { src: "/Sarabun-BoldItalic.ttf", fontWeight: "bold", fontStyle: "italic" },
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
            fontSize: "8px",
            paddingBottom: "16px",
          }}
          render={({ pageNumber, totalPages }) =>
            `หมายเลขคำขอที่ IDR09570240001  ${(pageNumber + "").padStart(
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
            marginBottom: 8,
          }}
        >
          แบบคำขอเบิกยา {pcuname}
        </Text>
        <Text
          style={{
            textAlign: "center",
            fontSize: "14px",
            fontWeight: "light",
            marginBottom: 16,
          }}
        >
          ณ วันที่{" "}
          {new Date().toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <ReportTable data={data} maximumDays={10}></ReportTable>
        <Signature />
      </Page>
    </Document>
  );
};
