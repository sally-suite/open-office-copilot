import { Product } from "use-shopping-cart/core";

export const Points = [
  // {
  //   price: 2,
  //   point: 100
  // },
  // {
  //   price: 5,
  //   point: 200
  // },
  {
    price: 10,
    point: 500
  },
  // {
  //   price: 20,
  //   point: 1100
  // }
]

export const Price = {
  Ultimate: {
    month: 10,
    year: 119
  },
  Pro: {
    month: 20,
    year: 180
  },
  Standard: {
    month: 10,
    year: 96
  },
  Basic: {
    month: 8,
    year: 72
  },
  GPTService: {
    month: 5,
    year: 60
  },
  CustomAgent: {
    unit: 100
  },
  Word: {
    month: 5,
    year: 48
  },
  Powerpoint: {
    month: 5,
    year: 48
  },
  Excel: {
    month: 6,
    year: 60
  },
  Outlook: {
    month: 5,
    year: 48
  },
  Chrome: {
    month: 5,
    year: 48
  },
  Flex: {
    month: 2,
    year: 10,
    price: 10
  }
}
// export const Price = {
//   Standard: {
//     month: 15,
//     year: 120
//   },
//   Pro: {
//     month: 20,
//     year: 180
//   },
//   GPTService: {
//     month: 10,
//     year: 90
//   }
// }

export const ChatProducts: Product[] = [
  {
    name: "Pro",
    // price_id: "price_1Po5WCGQLlND4d8GZBi3dH51",
    price_id: "price_1QD4ytGQLlND4d8GdDkyRq9F",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Pro.month * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "month",
      interval_count: 1,
    },
  },
  {
    name: "Pro",
    // price_id: "price_1OpMIwGQLlND4d8GsDcNd9AK",
    price_id: "price_1Qtmm1GQLlND4d8GDJ9yizg5",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Pro.year * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "year",
      interval_count: 1,
    },
  },
  {
    name: "Standard",
    price_id: "price_1QD4mPGQLlND4d8GN4jC1nB5",
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
    price_id: "price_1QwCHLGQLlND4d8Ghf74AjNz",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Standard.year * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "year",
      interval_count: 1,
    },
  },
  {
    name: "Basic",
    price_id: "price_1QD4h6GQLlND4d8GNU1aYKHA",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Basic.month * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "month",
      interval_count: 1,
    },
  },
  {
    name: "Basic",
    price_id: "price_1QD4wUGQLlND4d8G05DBC9Wz",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Basic.year * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "year",
      interval_count: 1,
    },
  },
  {
    name: "Word",
    price_id: "price_1QD4cUGQLlND4d8GnBLvR5bo",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Word.month * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "month",
      interval_count: 1,
    },
  },
  {
    name: "Word",
    price_id: "price_1QQLlMGQLlND4d8GnLWIwuW3",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Word.year * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "year",
      interval_count: 1,
    },
  },
  {
    name: "PowerPoint",
    price_id: "price_1QD4cUGQLlND4d8GnBLvR5bo",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Powerpoint.month * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "month",
      interval_count: 1,
    },
  },
  {
    name: "PowerPoint",
    price_id: "price_1QQLlMGQLlND4d8GnLWIwuW3",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Powerpoint.year * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "year",
      interval_count: 1,
    },
  },
  {
    name: "Excel",
    price_id: "price_1QRXmBGQLlND4d8Grc1PKlWq",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Excel.month * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "month",
      interval_count: 1,
    },
  },
  {
    name: "Excel",
    price_id: "price_1QD4jkGQLlND4d8Gc9UEVg4a",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Excel.year * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "year",
      interval_count: 1,
    },
  },

  {
    name: "Chrome",
    price_id: "price_1QD4cUGQLlND4d8GnBLvR5bo",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Chrome.month * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "month",
      interval_count: 1,
    },
  },
  {
    name: "Chrome",
    price_id: "price_1QQLlMGQLlND4d8GnLWIwuW3",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Chrome.year * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "year",
      interval_count: 1,
    },
  },
  {
    name: "Outlook",
    price_id: "price_1QD4cUGQLlND4d8GnBLvR5bo",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Outlook.month * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "month",
      interval_count: 1,
    },
  },
  {
    name: "Outlook",
    price_id: "price_1QQLlMGQLlND4d8GnLWIwuW3",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Outlook.year * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "year",
      interval_count: 1,
    },
  },
  {
    name: "Ultimate",
    price_id: "price_1PeT5gGQLlND4d8GrR14e2WA",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Ultimate.year * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "year",
      interval_count: 1,
    },
  },
  // {
  //   name: "Flex",
  //   price_id: "price_1QgL6mGQLlND4d8G1LC1AMCu",
  //   // price in smallest currency unit (e.g. cent for USD)
  //   price: Price.Flex.price * 100,
  //   currency: "USD",
  //   recurring: {
  //     aggregate_usage: null,
  //     interval: "year",
  //     interval_count: 1,
  //   },
  // },
  {
    name: "Flex",
    price_id: "price_1Qrat8GQLlND4d8G23DHs97z",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Flex.month * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "month",
      interval_count: 1,
    },
  },
  {
    name: "Flex",
    price_id: "price_1QraxjGQLlND4d8GlZFRn4IF",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Flex.year * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "year",
      interval_count: 1,
    },
  },
];

export const ChatProductsForAliPay: Product[] = [
  {
    name: "Pro",
    // price_id: "price_1Po5WCGQLlND4d8GZBi3dH51",
    price_id: "price_1QuuRqGQLlND4d8Glw5FG03P",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Pro.month * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "month",
      interval_count: 1,
    },
  },
  {
    name: "Pro",
    // price_id: "price_1OpMIwGQLlND4d8GsDcNd9AK",
    price_id: "price_1QuuSfGQLlND4d8GHXWgMoPv",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Pro.year * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "year",
      interval_count: 1,
    },
  },
  {
    name: "Standard",
    price_id: "price_1QuuPjGQLlND4d8Gzi4n4NvV",
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
    price_id: "price_1QwCIaGQLlND4d8GfaB3Coxq",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Standard.year * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "year",
      interval_count: 1,
    },
  },
  {
    name: "Basic",
    price_id: "price_1QuuMAGQLlND4d8GVF0CDAcp",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Basic.month * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "month",
      interval_count: 1,
    },
  },
  {
    name: "Basic",
    price_id: "price_1QwCQEGQLlND4d8GPL5GvCQW",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Basic.year * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "year",
      interval_count: 1,
    },
  },
  {
    name: "Flex",
    price_id: "price_1QuukKGQLlND4d8GAHoUFEY8",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Flex.month * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "month",
      interval_count: 1,
    },
  },
  {
    name: "Flex",
    price_id: "price_1QuujSGQLlND4d8G0ZdWhyha",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Flex.year * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "year",
      interval_count: 1,
    },
  },
  {
    name: "Word",
    price_id: "price_1QvHNtGQLlND4d8GxctFDXnW",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Word.month * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "month",
      interval_count: 1,
    },
  },
  {
    name: "Word",
    price_id: "price_1QvHPpGQLlND4d8GpfPcpncw",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Word.year * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "year",
      interval_count: 1,
    },
  },
  {
    name: "PowerPoint",
    price_id: "price_1QvHNtGQLlND4d8GxctFDXnW",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Powerpoint.month * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "month",
      interval_count: 1,
    },
  },
  {
    name: "PowerPoint",
    price_id: "price_1QvHPpGQLlND4d8GpfPcpncw",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Powerpoint.year * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "year",
      interval_count: 1,
    },
  },
  {
    name: "Excel",
    price_id: "price_1QvHOmGQLlND4d8GdpkG2zVR",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Excel.month * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "month",
      interval_count: 1,
    },
  },
  {
    name: "Excel",
    price_id: "price_1QvHQWGQLlND4d8GaQVZidLs",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Excel.year * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "year",
      interval_count: 1,
    },
  },

  {
    name: "Chrome",
    price_id: "price_1QvHNtGQLlND4d8GxctFDXnW",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Chrome.month * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "month",
      interval_count: 1,
    },
  },
  {
    name: "Chrome",
    price_id: "price_1QvHPpGQLlND4d8GpfPcpncw",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Chrome.year * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "year",
      interval_count: 1,
    },
  },
  {
    name: "Outlook",
    price_id: "price_1QvHNtGQLlND4d8GxctFDXnW",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Outlook.month * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "month",
      interval_count: 1,
    },
  },
  {
    name: "Outlook",
    price_id: "price_1QvHPpGQLlND4d8GpfPcpncw",
    // price in smallest currency unit (e.g. cent for USD)
    price: Price.Outlook.year * 100,
    currency: "USD",
    recurring: {
      aggregate_usage: null,
      interval: "year",
      interval_count: 1,
    },
  },
];
