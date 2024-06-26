import { StyleSheet, Text, View } from "@react-pdf/renderer";
import PropTypes from "prop-types";

const styles = StyleSheet.create({
  table: {
    width: "100%",
    fontSize: 12,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    padding: 0,
  },
  header: {
    borderBottom: "2px solid #000",
    borderTop: "none",
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

const ReportTable = ({ data, maximumDays }: any) => {
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
      {data.map((row: any, i: any) => (
        <View key={i} style={styles.row}>
          <Text style={[styles.colIndex, styles.col]}>{i + 1}</Text>
          <Text style={[styles.colName, styles.col]}>
            [{row.code24}] - {row.name}
          </Text>
          {/* <Text>{row.name}</Text> */}
          <Text style={[styles.colQuantity, styles.col]}>
            <Text style={styles.bold}>{row.quantity}</Text>
          </Text>
          <Text style={[styles.colRate, styles.col]}>{row.rate}</Text>
          <Text style={[styles.colRemain, styles.col]}>{row.remain}</Text>
        </View>
      ))}
      <Text
        style={{
          fontWeight: "bold",
          textDecoration: "underline",
          paddingTop: "16px",
        }}
      >
        หมายเหตุ
      </Text>
      <Text style={{ fontStyle: "italic", color: "gray" }}>
        rate/ด. = คือปริมาณการใช้ยา 30 วัน โดยคำนวณจากค่าเฉลีย 90 วันย้อนหลัง{" "}
      </Text>
      <Text style={{ fontStyle: "italic", color: "gray" }}>
        คงเหลือ = จำนวนยาคงเหลือในคลัง ณ วันที่ทำรายงาน
      </Text>
    </View>
  );
};

ReportTable.propTypes = {
  data: PropTypes.array.isRequired,
  maximumDays: PropTypes.number.isRequired,
};

export default ReportTable;
