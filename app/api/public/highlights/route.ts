import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Reado does not offer an API. Please import your highlights via the web interface." },
    { status: 404 },
  );
}

export async function GET() {
  return NextResponse.json(
    { error: "Reado does not offer an API. Please import your highlights via the web interface." },
    { status: 404 },
  );
}

