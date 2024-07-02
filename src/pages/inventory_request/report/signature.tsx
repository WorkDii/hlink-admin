import { Text, View } from "@react-pdf/renderer";

function Signature() {
  return (
    <View style={{ fontSize: "16px", paddingLeft: "105mm", marginTop: "18px" }}>
      <View
        wrap
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
          width: "200px",
        }}
      >
        <Text>ผู้เบิก</Text>
        <Text
          style={{
            flex: 1,
            borderBottom: "1px dotted black",
            marginLeft: "6px",
            height: "16px",
          }}
        ></Text>
      </View>
      <View
        wrap
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
          width: "200px",
          paddingTop: "8px",
        }}
      >
        <Text>(</Text>
        <Text>)</Text>
      </View>

      <View
        wrap
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
          width: "200px",
          paddingTop: "8px",
        }}
      >
        <Text>ตำแหน่ง</Text>
        <Text
          style={{
            flex: 1,
            borderBottom: "1px dotted black",
            marginLeft: "6px",
            height: "16px",
          }}
        ></Text>
      </View>

      <View
        wrap
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
          width: "200px",
          paddingTop: "8px",
        }}
      >
        <Text>วันที่</Text>
        <Text
          style={{
            flex: 1,
            borderBottom: "1px dotted black",
            marginLeft: "6px",
            height: "16px",
          }}
        ></Text>
      </View>
    </View>
  );
}

export default Signature;
