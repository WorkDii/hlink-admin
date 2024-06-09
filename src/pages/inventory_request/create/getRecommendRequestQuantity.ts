// ต้องการเติมแบบ prepack ให้ใกล้เคียง 60 วันมาที่สุด โดยห้ามน้อยว่า 30 วันเป็นอันขาด (สามารถเกิน 60 วัน ได้ กรณีที่ เศษของจำนวน Prepack น้อยกว่า 50%)
export function getRecommendRequestQuantity({
  current_rate,
  prepack,
  current_remain,
}: {
  current_rate: number;
  current_remain: number;
  prepack: number;
}) {
  const minQuantity = current_rate * 1; // จำนวน "น้อยที่สุด" ที่ต้องการสต็อก คือ 1 เท่าของการใช้ยา 30 วัน
  const expectQuantity = current_rate * 2; // จำนวนที่ "คาดหวัง" ต้องการสต็อก คือ 2 เท่าของการใช้ยา 30 วัน
  const needForExpectQuantity = expectQuantity - current_remain; // จำนวนที่ต้องการเติมเพื่อให้สต็อกครบ

  let _quantity = Math.round(needForExpectQuantity / prepack);
  if (_quantity === 0 && minQuantity > current_remain) _quantity = 1;
  return {
    quantity: _quantity * prepack,
    _quantity,
  };
}
