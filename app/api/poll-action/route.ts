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
          data: [null, null, trumpVotes, harrisVotes],
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
    console.log('Received data:', data);

    const buttonIndex = data.untrustedData.buttonIndex;
    const fid = data.untrustedData.fid;
    console.log('Processing vote - FID:', fid, 'Button:', buttonIndex);

    try {
      const results = await recordVote(
        fid, 
        buttonIndex === 1 ? 'trump' : 'harris'
      );
      console.log('Vote recorded successfully:', results);

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
      console.log('Vote error:', error);
      
      if (error instanceof Error && error.message === 'User has already voted') {
        console.log('Duplicate vote detected for FID:', fid);
        const results = await getVotePercentages();
        const chartConfig = createChartConfig(
          parseFloat(results.trump), 
          parseFloat(results.harris)
        );
        const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=1200&h=630&bkg=white&f=Arial`;
        
        return new NextResponse(
          `<!DOCTYPE html>
          <html>
            <head>
              <meta property="fc:frame" content="vNext" />
              <meta property="fc:frame:image" content="${chartUrl}" />
              <meta property="fc:frame:button:1" content="Already Voted" />
              <meta property="og:title" content="2024 Presidential Poll" />
              <meta property="og:image" content="${chartUrl}" />
            </head>
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
    console.error('Fatal error:', error);
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="https://placehold.co/600x400?text=Error+Processing+Vote" />
          <meta property="fc:frame:button:1" content="Try Again" />
          <meta property="og:title" content="Error - 2024 Presidential Poll" />
          <meta property="og:image" content="https://placehold.co/600x400?text=Error+Processing+Vote" />
        </head>
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
}