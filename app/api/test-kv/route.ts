import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  try {
    // Test write
    await kv.set("test_key", "Hello KV!");
    
    // Test read
    const value = await kv.get("test_key");
    
    return NextResponse.json({ 
      success: true, 
      message: "KV is working!", 
      value 
    });
  } catch (error) {
    console.error("KV Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}
