/**
 * Get message from message table by conversation id
 */

import { NextResponse } from "next/server";
import { getIndicator } from '@/service/stock'
export async function POST(req: Request) {
  const email: string = req.headers.get('email') || ''

  const body = await req.json();
  const {
    indicator,
    stockTicker,
    timespan = 'day',
    window = 10,
  } = body;
  console.log(indicator, stockTicker, timespan, window)
  const result = await getIndicator(indicator, stockTicker, timespan, window)
  console.log(result)
  return NextResponse.json({ code: 0, data: result, message: "" });
}

export async function GET(request: Request) {

  // const order = await orders.create({
  //   orderNumber: 'ORDER_003',
  //   orderStatus: 'Waiting',
  //   paymentMethod: 'Paypal',
  //   userEmail: 'hongyin163@gmail.com',
  //   expirationDate: new Date('2023-08-18'),
  //   totalAmount: 100,
  //   userId: 1,
  //   orderDate: new Date('2023-08-17'),
  // });
  return NextResponse.json({ code: 0, data: null, message: "" });
}
