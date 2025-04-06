/**
 * Get message from message table by conversation id
 */

import { NextResponse } from "next/server";
import { getPrice } from '@/service/stock'
import dayjs from "dayjs";
export async function POST(req: Request) {
    const email: string = req.headers.get('email') || ''

    const body = await req.json();
    const {
        stockTicker,
        multiplier = 1,
        timespan = 'day',
        from = dayjs(new Date()).add(-365, 'day').format('YYYY-MM-DD'),
        to = dayjs(new Date()).format('YYYY-MM-DD')
    } = body;

    const result = await getPrice(stockTicker, multiplier, timespan, from, to)
    const results = result?.results || []
    return NextResponse.json({ code: 0, data: results, message: "" });
}

export async function GET(request: Request) {

    return NextResponse.json({ code: 0, data: null, message: "" });
}
