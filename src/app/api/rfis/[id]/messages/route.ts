import { NextResponse } from "next/server";
import { addMessage } from "../../../../../server/store";
import type { Message } from "../../../../../lib/site-data";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const msg = (await req.json()) as Message;
  if (!msg?.body) return NextResponse.json({ error: "empty message" }, { status: 400 });
  const rfi = await addMessage(params.id, msg);
  if (!rfi) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ rfi });
}
