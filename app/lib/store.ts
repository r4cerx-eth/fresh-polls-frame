export const votes = {
    trump: 455,
    harris: 423,
    totalVotes: 878
  };
  
  export function addVote(candidate: 'trump' | 'harris') {
    if (candidate === 'trump') {
      votes.trump += 1;
    } else {
      votes.harris += 1;
    }
    votes.totalVotes += 1;
  
    return {
      trump: ((votes.trump / votes.totalVotes) * 100).toFixed(1),
      harris: ((votes.harris / votes.totalVotes) * 100).toFixed(1),
      totalVotes: votes.totalVotes
    };
  }