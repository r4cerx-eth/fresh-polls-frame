import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const buttonId = body.untrustedData.buttonIndex;

    if (buttonId === 1) {
      return new Response(JSON.stringify({
        image: `http://localhost:3000/api/poll-image?timestamp=${Date.now()}`,
      }));
    } else if (buttonId === 2) {
      return new Response(JSON.stringify({
        location: "https://www.realclearpolitics.com/epolls/2024/president/us/general_election_trump_vs_biden-7383.html"
      }));
    }

    return new Response("Invalid button", { status: 400 });
  } catch (error) {
    console.error("Error handling action:", error);
    return new Response("Error processing request", { status: 500 });
  }
}
