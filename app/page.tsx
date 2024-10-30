export default function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fresh-polls-frame.vercel.app';
  
  // Chart configuration
  const chartConfig = {
    type: 'bar',
    data: {
      labels: ['Trump', 'Harris'],
      datasets: [{
        label: '2024 Presidential Poll',
        data: [45.5, 42.3],
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
          text: 'Total Votes: 1,234',
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
  
  return (
    <>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={chartUrl} />
        <meta property="fc:frame:button:1" content="Vote Trump" />
        <meta property="fc:frame:button:2" content="Vote Harris" />
        <meta property="fc:frame:post_url" content={`${baseUrl}api/poll-action`} /> {/* Removed leading slash */}
        
        <meta property="og:title" content="2024 Presidential Poll" />
        <meta property="og:description" content="Cast your vote in the 2024 Presidential Poll" />
        <meta property="og:image" content={chartUrl} />
      </head>
      
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold">2024 Presidential Poll</h1>
          <p className="mt-4">Cast your vote using Farcaster!</p>
          <img src={chartUrl} alt="Poll Results" className="mt-8 max-w-2xl mx-auto" />
        </div>
      </main>
    </>
  );
}