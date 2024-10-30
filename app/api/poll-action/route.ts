import { NextResponse } from 'next/server';
import { recordVote, getVotePercentages, hasUserVoted } from '../../lib/kv-store';
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
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value: any) {
              return value + '%';
            }
          }
        },
        y: {
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: {
              size: 14
            }
          }
        },
        title: {
          display: true,
          text: '2024 Presidential Poll Results',
          font: {
            size: 16,
            weight: 'bold'
          }
        }
      }
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

    // Get current results
    const currentResults = await getVotePercentages();
    const chartConfig = createChartConfig(
      parseFloat(currentResults.trump), 
      parseFloat(currentResults.harris)
    );
    const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=1200&h=630&bkg=white&f=Arial`;

    // Check if user has already voted
    const alreadyVoted = await hasUserVoted(fid);
    
    if (alreadyVoted) {
      console.log('Already voted user interaction - FID:', fid);
      
      // Create a message image URL with better formatting and smaller text
      const messageUrl = "https://placehold.co/1200x730/white/black/png?text=The+only+people+who+really%0Acare+about+you,%0Aare+the+ones+next+to+you%0A&fontsize=32";
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${messageUrl}" />
            <meta property="fc:frame:post:title" content="Thanks for voting!" />
            <meta property="og:title" content="2024 Presidential Poll Results" />
            <meta property="og:image" content="${messageUrl}" />
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

    // Process new vote
    if (buttonIndex === 1 || buttonIndex === 2) {
      await recordVote(
        fid, 
        buttonIndex === 1 ? 'trump' : 'harris'
      );
      console.log('Vote recorded successfully');

      // Get updated results
      const newResults = await getVotePercentages();
      const newChartConfig = createChartConfig(
        parseFloat(newResults.trump), 
        parseFloat(newResults.harris)
      );
      const newChartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(newChartConfig))}&w=1200&h=630&bkg=white&f=Arial`;

      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${newChartUrl}" />
            <meta property="fc:frame:button:1" content="❤️ Click Me" />
            <meta property="fc:frame:post:title" content="Thanks for voting!" />
            <meta property="og:title" content="2024 Presidential Poll Results" />
            <meta property="og:image" content="${newChartUrl}" />
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

    // Default response for initial load or invalid button
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
    console.error('Fatal error:', error);
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="https://placehold.co/600x400?text=Error+Processing+Vote" />
          <meta property="fc:frame:button:1" content="⚠️ Error" />
          <meta property="fc:frame:post:title" content="Error processing vote. Please try again." />
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