import { Product } from "use-shopping-cart/core";

export const Price = {
  Standard: {
    month: 5,
    year: 30
  },
  Pro: {
    month: 10,
    year: 60
  },
  Ultimate: {
    month: 10,
    year: 60
  },
  GPTService: {
    month: 10,
    year: 90
  }
}

export const ChatProducts: Product[] = [
  {
    name: "Standard",
    price_id: "price_1NiecnGQLlND4d8GF2ASQrwx",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Standard.month * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "month",
      interval_count: 1,
    },
  },
  {
    name: "Standard",
    price_id: "price_1NieVYGQLlND4d8GlxYR1m7I",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Standard.year * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "year",
      interval_count: 1,
    },
  },
];

export const GPTProducts = [
  {
    name: "GPT Service",
    price_id: "price_1NieT2GQLlND4d8GjAzsuOOt",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.GPTService.month * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "month",
      interval_count: 1,
    },
  },
  {
    name: "GPT Service",
    price_id: "price_1NieUbGQLlND4d8G0U7u4vb6",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.GPTService.year * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "year",
      interval_count: 1,
    },
  },
];
