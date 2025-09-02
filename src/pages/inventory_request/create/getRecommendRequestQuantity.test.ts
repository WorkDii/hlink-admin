import { describe, expect } from "vitest";
import { getRecommendRequestQuantity } from "./getRecommendRequestQuantity";

describe("getRecommendRequestQuantity", (test) => {
  test("should return recommend quantity", async () => {
    expect(
      getRecommendRequestQuantity({
        current_rate: 10,
        current_remain: 1,
        prepack: 10,
      })
    ).toEqual(20);

    expect(
      getRecommendRequestQuantity({
        current_rate: 10,
        current_remain: -6,
        prepack: 10,
      })
    ).toEqual(30);

    expect(
      getRecommendRequestQuantity({
        current_rate: 10,
        current_remain: -4,
        prepack: 10,
      })
    ).toEqual(20);

    expect(
      getRecommendRequestQuantity({
        current_rate: 100,
        current_remain: 101,
        prepack: 10,
      })
    ).toEqual(100);

    expect(
      getRecommendRequestQuantity({
        current_rate: 100,
        current_remain: 109,
        prepack: 10,
      })
    ).toEqual(90);

    expect(
      getRecommendRequestQuantity({
        current_rate: 1,
        current_remain: 109,
        prepack: 10,
      })
    ).toEqual(0);

    // look strange => should consult P'tai hatyai hospital
    expect(
      getRecommendRequestQuantity({
        current_rate: 10,
        current_remain: 1,
        prepack: 100,
      })
    ).toEqual(100);
  });
});
