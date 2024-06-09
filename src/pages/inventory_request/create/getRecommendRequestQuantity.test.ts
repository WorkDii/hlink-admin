import { describe, expect } from "vitest";
import { getRecommendRequestQuantity } from "./getRecommendRequestQuantity";

describe("getRecommendDrug", (test) => {
  test("should return recommend drug", async () => {
    expect(
      getRecommendRequestQuantity({
        current_rate: 10,
        current_remain: 1,
        prepack: 10,
      })
    ).toEqual({
      _quantity: 2,
      quantity: 20,
    });

    expect(
      getRecommendRequestQuantity({
        current_rate: 10,
        current_remain: -6,
        prepack: 10,
      })
    ).toEqual({
      _quantity: 3,
      quantity: 30,
    });

    expect(
      getRecommendRequestQuantity({
        current_rate: 10,
        current_remain: -4,
        prepack: 10,
      })
    ).toEqual({
      _quantity: 2,
      quantity: 20,
    });

    expect(
      getRecommendRequestQuantity({
        current_rate: 100,
        current_remain: 101,
        prepack: 10,
      })
    ).toEqual({
      _quantity: 10,
      quantity: 100,
    });

    expect(
      getRecommendRequestQuantity({
        current_rate: 100,
        current_remain: 109,
        prepack: 10,
      })
    ).toEqual({
      _quantity: 9,
      quantity: 90,
    });

    // look strange => should consult P'tai hatyai hospital
    expect(
      getRecommendRequestQuantity({
        current_rate: 10,
        current_remain: 1,
        prepack: 100,
      })
    ).toEqual({
      _quantity: 1,
      quantity: 100,
    });
  });
});
