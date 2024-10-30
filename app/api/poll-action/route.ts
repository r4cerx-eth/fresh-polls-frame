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

// ... previous imports and createChartConfig function ...

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log('Received data:', data);

    const buttonIndex = data.untrustedData.buttonIndex;
    const fid = data.untrustedData.fid;
    console.log('Processing vote - FID:', fid, 'Button:', buttonIndex);

    // Get current results regardless of voting status
    const currentResults = await getVotePercentages();
    const chartConfig = createChartConfig(
      parseFloat(currentResults.trump), 
      parseFloat(currentResults.harris)
    );
    const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=1200&h=630&bkg=white&f=Arial`;

    try {
      // Only try to record vote if it's a valid voting button
      if (buttonIndex === 1 || buttonIndex === 2) {
        await recordVote(
          fid, 
          buttonIndex === 1 ? 'trump' : 'harris'
        );
        console.log('Vote recorded successfully');
      }

      // Always return the current state with both voting options
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
        
        // Return the same voting options with a note about already voting
        return new NextResponse(
          `<!DOCTYPE html>
          <html>
            <head>
              <meta property="fc:frame" content="vNext" />
              <meta property="fc:frame:image" content="${chartUrl}" />
              <meta property="fc:frame:button:1" content="Vote Trump" />
              <meta property="fc:frame:button:2" content="Vote Harris" />
              <meta property="fc:frame:post:title" content="You've already voted! Current results shown above." />
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
    // Return a generic error state with voting options still available
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${chartUrl || 'https://placehold.co/600x400?text=Error+Processing+Vote'}" />
          <meta property="fc:frame:button:1" content="Vote Trump" />
          <meta property="fc:frame:button:2" content="Vote Harris" />
          <meta property="fc:frame:post:title" content="Error processing vote. Please try again." />
          <meta property="og:title" content="2024 Presidential Poll" />
          <meta property="og:image" content="${chartUrl || 'https://placehold.co/600x400?text=Error+Processing+Vote'}" />
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