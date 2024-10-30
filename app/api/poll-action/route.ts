import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log('Vote received:', data);

    // Create chart config for the response
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

    // Return the Frame response
    return new NextResponse(
      JSON.stringify({
        frames: [{
          version: 'vNext',
          image: chartUrl,
          buttons: [
            { label: 'Vote Trump', action: 'post' },
            { label: 'Vote Harris', action: 'post' }
          ],
        }]
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
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