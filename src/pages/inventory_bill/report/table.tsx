import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { wholeNumber } from "@wdii/numth";
import { getInventoryBillItem } from "../downloadCSV/getInventoryBillItem";

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
    width: `${100 - 7 - 10 - 15 - 10 - 10}%`,
    margin: 0,
  },
  colQuantity: {
    width: "10%",
    textAlign: "center",
    margin: 0,
  },
  colExpireDate: {
    width: "10%",
    textAlign: "center",
    margin: 0,
  },
  colLotNo: {
    width: "10%",
    textAlign: "center",
    margin: 0,
  },
  colWarehouse: {
    width: "15%",
    textAlign: "center",
    margin: 0,
    borderRight: "1px solid gray",
  },
});

type Props = {
  data: Awaited<ReturnType<typeof getInventoryBillItem>>;
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
        <Text style={[styles.colExpireDate, styles.col, styles.colHeader]}>
          วันหมดอายุ
        </Text>
        <Text style={[styles.colLotNo, styles.col, styles.colHeader]}>
          ล็อต
        </Text>
        <Text style={[styles.colWarehouse, styles.col, styles.colHeader]}>
          คลัง
        </Text>
      </View>
      {data.map((row, i: any) => (
        <View key={i} style={styles.row}>
          <Text style={[styles.colIndex, styles.col]}>{i + 1}</Text>
          <Text style={[styles.colName, styles.col]}>
            [{row.hospital_drug_drugcode24} / {row.h_drugcode}] - {row.hospital_drug_name}
          </Text>
          <Text style={[styles.colQuantity, styles.col]}>
            <Text style={styles.bold}>{wholeNumber(row.quantity)}</Text>
          </Text>
          <Text style={[styles.colExpireDate, styles.col]}>
            {row.expire_date}
          </Text>
          <Text style={[styles.colLotNo, styles.col]}>
            {row.lot_no}
          </Text>
          <Text style={[styles.colWarehouse, styles.col]}>
            {row.warehouse}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default ReportTable;
