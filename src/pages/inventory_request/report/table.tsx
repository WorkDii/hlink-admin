import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { getInventoryRequestItem } from "../getInventoryRequestItem";
import { wholeNumber } from "../../../utils/numth";

const styles = StyleSheet.create({
  table: {
    width: "100%",
    fontSize: 14,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    padding: 0,
  },
  header: {
    borderBottom: "2px solid #000",
    borderTop: "none",
    fontSize: 16,
  },
  bold: {
    fontWeight: "bold",
  },
  col: {
    padding: 4,
    border: "1px solid gray",
    borderTop: "none",
    borderRight: "none",
  },
  colHeader: {
    border: "none",
  },
  colIndex: {
    width: "7%",
    textAlign: "center",
    margin: 0,
  },
  colName: {
    width: `${100 - 7 - 10 - 10 - 10}%`,
    margin: 0,
  },
  colQuantity: {
    width: "10%",
    textAlign: "center",
    margin: 0,
  },
  colRate: {
    width: "10%",
    textAlign: "center",
    margin: 0,
  },
  colRemain: {
    width: "10%",
    textAlign: "center",
    margin: 0,
    borderRight: "1px solid gray",
  },
});

type Props = {
  data: Awaited<ReturnType<typeof getInventoryRequestItem>>;
};

const ReportTable = ({ data }: { data: any[] }) => {
  return (
    <View style={styles.table}>
      <View style={[styles.row, styles.bold, styles.header]} fixed>
        <Text style={[styles.colIndex, styles.col, styles.colHeader]}>
          ลำดับ{" "}
        </Text>
        <Text
          style={[
            styles.colName,
            styles.col,
            styles.colHeader,
            { textAlign: "center" },
          ]}
        >
          รายการยา
        </Text>
        <Text style={[styles.colQuantity, styles.col, styles.colHeader]}>
          จำนวน{" "}
        </Text>
        <Text style={[styles.colRate, styles.col, styles.colHeader]}>
          rate/ด.
        </Text>
        <Text style={[styles.colRemain, styles.col, styles.colHeader]}>
          คงเหลือ
        </Text>
      </View>
      {data.map((row, i: any) => (
        <View key={i} style={styles.row}>
          <Text style={[styles.colIndex, styles.col]}>{i + 1}</Text>
          <Text style={[styles.colName, styles.col]}>
            [{row.hospital_drug_drugcode24} / {row.h_drugcode}] - {row.hospital_drug_name} (PREPACK
            = {wholeNumber(row.current_prepack)})
          </Text>
          <Text style={[styles.colQuantity, styles.col]}>
            <Text style={styles.bold}>{wholeNumber(row.quantity)}</Text>
          </Text>
          <Text style={[styles.colRate, styles.col]}>
            {wholeNumber(row.current_rate)}
          </Text>
          <Text style={[styles.colRemain, styles.col]}>
            {wholeNumber(row.current_remain)}
          </Text>
        </View>
      ))}
    </View>
  );
};



export default ReportTable;
