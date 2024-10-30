﻿import { NextResponse } from 'next/server';
import { addVote } from '@/lib/store';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log('Vote received:', data);

    // Handle the vote based on button index
    const buttonIndex = data.untrustedData.buttonIndex;
    const results = addVote(buttonIndex === 1 ? 'trump' : 'harris');

    const chartConfig = {
      type: 'bar',
      data: {
        labels: ['Trump', 'Harris'],
        datasets: [{
          label: '2024 Presidential Poll',
          data: [results.trump, results.harris],
          backgroundColor: ['#E51D24', '#0000FF'],
          borderColor: ['#C41920', '#0000DD'],
          borderWidth: 2,
          borderRadius: 8,
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: '2024 Presidential Poll',
            font: { size: 24, weight: 'bold' }
          },
          subtitle: {
            display: true,
            text: `Total Votes: ${results.totalVotes.toLocaleString()}`,
            font: { size: 16 }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (value: number) => value + '%'
            }
          }
        }
      }
    };

    const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=1200&h=630&bkg=white&f=Arial`;

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${chartUrl}" />
          <meta property="fc:frame:button:1" content="Vote Trump" />
          <meta property="fc:frame:button:2" content="Vote Harris" />
          <meta property="og:title" content="2024 Presidential Poll" />
          <meta property="og:description" content="Cast your vote in the 2024 Presidential Poll" />
          <meta property="og:image" content="${chartUrl}" />
        </head>
        <body>
          <p>Thanks for voting! Total votes: ${results.totalVotes}</p>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error processing vote:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to process vote' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}