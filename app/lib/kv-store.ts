import { kv } from '@vercel/kv';

// Add error handling and logging
export async function recordVote(fid: number, choice: 'trump' | 'harris'): Promise<VoteData> {
  try {
    // Check if user has already voted
    if (await hasUserVoted(fid)) {
      throw new Error('User has already voted');
    }

    // Get current votes
    const votes = await getVotes();
    console.log('Current votes:', votes); // Debug log
    
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

    console.log('Updated votes:', votes); // Debug log
    return votes;
  } catch (error) {
    console.error('KV store error:', error); // Debug log
    throw error;
  }
}