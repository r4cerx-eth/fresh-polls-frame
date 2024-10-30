import { kv } from '@vercel/kv';

interface VoteData {
  trump: number;
  harris: number;
  totalVotes: number;
}

interface UserVote {
  fid: number;
  choice: 'trump' | 'harris';
  timestamp: number;
}

// Initialize votes if they don't exist
async function initializeVotes() {
  const exists = await kv.exists('votes');
  if (!exists) {
    await kv.set('votes', {
      trump: 0,
      harris: 0,
      totalVotes: 0
    });
  }
}

// Get current vote counts
export async function getVotes(): Promise<VoteData> {
  await initializeVotes();
  const votes = await kv.get<VoteData>('votes');
  return votes || { trump: 0, harris: 0, totalVotes: 0 };
}

// Check if user has already voted
export async function hasUserVoted(fid: number): Promise<boolean> {
  const vote = await kv.get<UserVote>(`user:${fid}`);
  return !!vote;
}

// Record a new vote
export async function recordVote(fid: number, choice: 'trump' | 'harris'): Promise<VoteData> {
  try {
    // Check if user has already voted
    if (await hasUserVoted(fid)) {
      throw new Error('User has already voted');
    }

    // Get current votes
    const votes = await getVotes();
    console.log('Current votes:', votes);
    
    // Update vote counts
    votes[choice]++;
    votes.totalVotes++;

    // Save in transaction
    await kv
      .multi()
      .set('votes', votes)
      .set(`user:${fid}`, {
        fid,
        choice,
        timestamp: Date.now()
      })
      .exec();

    console.log('Updated votes:', votes);
    return votes;
  } catch (error) {
    console.error('KV store error:', error);
    throw error;
  }
}

// Get vote percentages
export async function getVotePercentages(): Promise<{ trump: string; harris: string; totalVotes: number }> {
  const votes = await getVotes();
  const total = votes.totalVotes || 1; // Prevent division by zero
  return {
    trump: ((votes.trump / total) * 100).toFixed(1),
    harris: ((votes.harris / total) * 100).toFixed(1),
    totalVotes: votes.totalVotes
  };
}