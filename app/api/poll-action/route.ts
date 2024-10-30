import { NextResponse } from 'next/server';
import { addVote } from '../../lib/store';

export const runtime = 'edge';

// Official poll data (you can update these numbers)
const OFFICIAL_POLLS = {
  trump: 44.3,
  harris: 41.7,
  source: 'RealClearPolitics Average'
};

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const buttonIndex = data.untrustedData.buttonIndex;
    const results = addVote(buttonIndex === 1 ? 'trump' : 'harris');

    const chartConfig = {
      type: 'bar',
      data: {
        labels: ['Trump', 'Harris', 'Trump', 'Harris'],
        datasets: [
          {
            label: 'Official Polls',
            data: [OFFICIAL_POLLS.trump, OFFICIAL_POLLS.harris, null, null],
            backgroundColor: ['#E51D24', '#0000FF'],
            borderColor: ['#C41920', '#0000DD'],
            borderWidth: 2,
            borderRadius: 8,
            barPercentage: 0.8,
          },
          {
            label: 'Frame Votes',
            data: [null, null, Number(results.trump), Number(results.harris)],
            backgroundColor: ['rgba(229,29,36,0.6)', 'rgba(0,0,255,0.6)'],
            borderColor: ['#C41920', '#0000DD'],
            borderWidth: 2,
            borderRadius: 8,
            barPercentage: 0.8,
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: ['2024 Presidential Poll', 
                  `Official Polls vs Frame Votes (Total Frame Votes: ${results.totalVotes.toLocaleString()})`],
            font: { size: 24, weight: 'bold' },
            padding: 20
          },
          subtitle: {
            display: true,
            text: `Source: ${OFFICIAL_POLLS.source}`,
            font: { size: 14 },
            padding: 10
          },
          legend: {
            display: true,
            position: 'top',
          },
          datalabels: {
            display: true,
            color: '#000',
            font: { size: 16, weight: 'bold' },
            formatter: (value: any) => value ? value + '%' : ''
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
            grid: {
              display: false
            },
            ticks: {
              font: { size: 16, weight: 'bold' },
              callback: function(value: any, index: number) {
                // Only show Trump/Harris once for each pair
                return index % 2 === 0 ? this.getLabelForValue(value) : '';
              }
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
          <meta property="fc:frame:button:1" content="Vote Trump" />
          <meta property="fc:frame:button:2" content="Vote Harris" />
          <meta property="og:title" content="2024 Presidential Poll" />
          <meta property="og:description" content="Official Polls vs Frame Votes - Cast your vote!" />
          <meta property="og:image" content="${chartUrl}" />
        </head>
        <body>
          <p>Thanks for voting! Total frame votes: ${results.totalVotes}</p>
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