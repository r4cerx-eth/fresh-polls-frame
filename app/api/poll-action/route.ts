import { NextResponse } from 'next/server';
import { recordVote, getVotePercentages } from '../../lib/kv-store';
import { OFFICIAL_POLLS } from '../../lib/constants';

export const runtime = 'edge';

function createChartConfig(trumpVotes: number, harrisVotes: number) {
  return {
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
          data: [null, null, Number(trumpVotes), Number(harrisVotes)],
          backgroundColor: ['rgba(229,29,36,0.6)', 'rgba(0,0,255,0.6)'],
          borderColor: ['#C41920', '#0000DD'],
          borderWidth: 2,
          borderRadius: 8,
          barPercentage: 0.8,
        }
      ]
    }
  };
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const buttonIndex = data.untrustedData.buttonIndex;
    const fid = data.untrustedData.fid;

    try {
      const results = await recordVote(
        fid, 
        buttonIndex === 1 ? 'trump' : 'harris'
      );

      const chartConfig = createChartConfig(results.trump, results.harris);
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
            'Access-Control-Allow-Origin': '*'
          }
        }
      );

    } catch (error) {
      if (error instanceof Error && error.message === 'User has already voted') {
        const currentResults = await getVotePercentages();
        const chartConfig = createChartConfig(
          parseFloat(currentResults.trump), 
          parseFloat(currentResults.harris)
        );
        const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=1200&h=630&bkg=white&f=Arial`;
        
        return new NextResponse(
          `<!DOCTYPE html>
          <html>
            <head>
              <meta property="fc:frame" content="vNext" />
              <meta property="fc:frame:image" content="${chartUrl}" />
              <meta property="fc:frame:button:1" content="Already Voted!" />
              <meta property="og:title" content="2024 Presidential Poll" />
              <meta property="og:image" content="${chartUrl}" />
            </head>
            <body>
              <p>You have already voted in this poll!</p>
            </body>
          </html>`,
          {
            status: 200,
            headers: {
              'Content-Type': 'text/html',
              'Access-Control-Allow-Origin': '*'
            }
          }
        );
      }
      throw error;
    }

  } catch (error) {
    console.error('Error processing vote:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to process vote' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}