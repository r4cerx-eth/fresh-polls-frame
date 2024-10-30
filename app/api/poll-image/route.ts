import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const data = {
    trump: "45.5",
    harris: "42.3",
    totalVotes: 1234,
    lastUpdated: new Date().toLocaleDateString()
  };
  
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f8f9fa"/>
    <rect x="50" y="50" width="1100" height="530" fill="white" rx="15" />
    
    <!-- Title -->
    <text x="600" y="120" font-family="Arial" font-size="48" font-weight="bold" text-anchor="middle" fill="#1d2939">
      2024 Presidential Poll
    </text>
    
    <!-- Trump Bar -->
    <rect x="200" y="180" width="${data.trump}0" height="60" fill="#E51D24" rx="5" opacity="0.8"/>
    <text x="220" y="220" font-family="Arial" font-size="72" font-weight="bold" fill="#E51D24">
      ${data.trump}%
    </text>
    <text x="220" y="260" font-family="Arial" font-size="36" fill="#1d2939">
      Trump
    </text>
    
    <!-- Harris Bar -->
    <rect x="200" y="300" width="${data.harris}0" height="60" fill="#0000FF" rx="5" opacity="0.8"/>
    <text x="220" y="340" font-family="Arial" font-size="72" font-weight="bold" fill="#0000FF">
      ${data.harris}%
    </text>
    <text x="220" y="380" font-family="Arial" font-size="36" fill="#1d2939">
      Harris
    </text>
    
    <!-- Stats -->
    <text x="600" y="480" font-family="Arial" font-size="24" text-anchor="middle" fill="#64748b">
      Total Votes: ${data.totalVotes.toLocaleString()}
    </text>
    
    <!-- Call to Action -->
    <text x="600" y="540" font-family="Arial" font-size="32" font-weight="bold" text-anchor="middle" fill="#1d2939">
      Cast your vote! [1] Trump  [2] Harris
    </text>
  </svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    },
  });
}