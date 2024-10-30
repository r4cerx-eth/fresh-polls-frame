import { votes } from '@/lib/store';

export default function Home() {
  // ... rest of your imports ...

  const chartConfig = {
    // ... same config as in poll-action ...
    data: {
      labels: ['Trump', 'Harris'],
      datasets: [{
        label: '2024 Presidential Poll',
        data: [
          ((votes.trump / votes.totalVotes) * 100).toFixed(1),
          ((votes.harris / votes.totalVotes) * 100).toFixed(1)
        ],
        backgroundColor: ['#E51D24', '#0000FF'],
        borderColor: ['#C41920', '#0000DD'],
        borderWidth: 2,
        borderRadius: 8,
      }]
    },
    options: {
      plugins: {
        subtitle: {
          display: true,
          text: `Total Votes: ${votes.totalVotes.toLocaleString()}`,
          font: { size: 16 }
        }
      }
      // ... rest of options ...
    }
  };

  // ... rest of your component ...
}