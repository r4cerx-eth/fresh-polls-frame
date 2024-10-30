import { NextResponse } from 'next/server';
import { addVote } from '../../lib/store';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log('Vote received:', data);

    // Handle the vote based on button index
    const buttonIndex = data.untrustedData.buttonIndex;
    const results = addVote(buttonIndex === 1 ? 'trump' : 'harris');

    // Create a more detailed chart configuration
    const chartConfig = {
      type: 'bar',
      data: {
        labels: ['Trump', 'Harris'],
        datasets: [{
          label: 'Poll Results',
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
            text: ['2024 Presidential Poll', `Total Votes: ${results.totalVotes.toLocaleString()}`],
            font: { size: 24, weight: 'bold' },
            padding: 20
          },
          subtitle: {
            display: true,
            text: `Last Vote: ${buttonIndex === 1 ? 'Trump' : 'Harris'}`,
            font: { size: 16 },
            padding: 10
          },
          legend: {
            display: false
          },
          datalabels: {
            display: true,
            color: '#000',
            font: { size: 20, weight: 'bold' },
            formatter: (value: any) => value + '%'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              font: { size: 14 },
              callback: (value: number) => value + '%'
            }
          },
          x: {
            ticks: {
              font: { size: 16, weight: 'bold' }
            }
          }
        },
        layout: {
          padding: 20
        }
      }
    };

    const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=1200&h=630&bkg=white&f=Arial`;

    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${chartUrl}" />
          <meta property="fc:frame:button:1" content="Vote Trump (${results.trump}%)" />
          <meta property="fc:frame:button:2" content="Vote Harris (${results.harris}%)" />
          <meta property="og:title" content="2024 Presidential Poll" />
          <meta property="og:description" content="Cast your vote! Current results - Trump: ${results.trump}%, Harris: ${results.harris}% (Total Votes: ${results.totalVotes})" />
          <meta property="og:image" content="${chartUrl}" />
        </head>
        <body>
          <p>Thanks for voting! Total votes: ${results.totalVotes}</p>
        </body>
      </html>`,
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