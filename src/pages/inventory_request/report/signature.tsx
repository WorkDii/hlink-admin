import { Text, View } from "@react-pdf/renderer";

function Signature() {
  return (
    <View style={{ fontSize: "14px", paddingLeft: "105mm" }}>
      <Text style={{ paddingBottom: "8px" }}>
        ผู้เบิก .............................................
      </Text>
      <Text style={{ paddingBottom: "8px" }}>
        (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)
      </Text>
      <Text style={{ paddingBottom: "8px" }}>
        ตำแหน่ง .........................................
      </Text>
      <Text style={{ paddingBottom: "8px" }}>
        วันที่ ..............................................
      </Text>
    </View>
  );
}

export default Signature;
