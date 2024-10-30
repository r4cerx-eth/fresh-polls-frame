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
    
    if (alreadyVoted || buttonIndex > 2) {
      // Handle both already voted users and button clicks after voting
      console.log('Showing results for voted user - FID:', fid);
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${chartUrl}" />
            <meta property="fc:frame:button:1" content="✓ Already Voted" />
            <meta property="fc:frame:button:2" content="See Results" />
            <meta property="fc:frame:post:title" content="Current poll results shown above." />
            <meta property="og:title" content="2024 Presidential Poll Results" />
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
            <meta property="fc:frame:button:1" content="🔄 Refresh Results" />
            <meta property="fc:frame:button:1:action" content="link" />
            <meta property="fc:frame:button:1:target" content="https://fresh-polls-frame.vercel.app/api/poll-action" />
            <meta property="fc:frame:post:title" content="Thanks for voting! Click to refresh results." />
            <meta property="og:title" content="2024 Presidential Poll" />
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
          <meta property="fc:frame:button:1:action" content="link" />
          <meta property="fc:frame:button:1:target" content="https://fresh-polls-frame.vercel.app/api/poll-action" />
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