export default function Home() {
  const chartUrl = "https://quickchart.io/chart?c={type:'bar',data:{labels:['Trump','Harris'],datasets:[{label:'Votes',data:[45.5,42.3],backgroundColor:['%23E51D24','%230000FF']}]}}";
  
  return (
    <>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={chartUrl} />
        <meta property="fc:frame:button:1" content="Vote Trump" />
        <meta property="fc:frame:button:2" content="Vote Harris" />
        <meta property="fc:frame:post_url" content="https://fresh-polls-frame.vercel.app/api/poll-action" />
        
        <meta property="og:title" content="2024 Presidential Poll" />
        <meta property="og:description" content="Cast your vote in the 2024 Presidential Poll" />
        <meta property="og:image" content={chartUrl} />
      </head>
      
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold">2024 Presidential Poll</h1>
          <p className="mt-4">Cast your vote using Farcaster!</p>
        </div>
      </main>
    </>
  );
}