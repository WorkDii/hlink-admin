import { View, Text } from "@react-pdf/renderer";

function Note() {
  return (
    <View>
      <Text
        style={{
          fontWeight: "bold",
          textDecoration: "underline",
          paddingTop: "14px",
        }}
      >
        หมายเหตุ
      </Text>
      <Text style={{ fontStyle: "italic", color: "gray" }}>
        rate/ด. = คือปริมาณการใช้ยา 30 วัน โดยคำนวณจากค่าเฉลี่ย 90 วันย้อนหลัง{" "}
      </Text>
      <Text style={{ fontStyle: "italic", color: "gray" }}>
        คงเหลือ = จำนวนยาคงเหลือในคลัง ณ วันที่ทำรายงาน
      </Text>
    </View>
  );
}

export default Note;
