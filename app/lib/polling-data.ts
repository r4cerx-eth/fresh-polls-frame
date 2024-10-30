export async function getRCPPolls() {
    try {
      const response = await fetch('https://www.realclearpolitics.com/epolls/json/6730_historical.js', {
        next: { revalidate: 3600 }, // Cache for 1 hour
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('RCP API error:', response.status);
        return {
          trump: 46.7, // Fallback values in case API fails
          harris: 48
        };
      }
  
      const data = await response.json();
      
      // Process RCP data - adjust these based on actual response structure
      return {
        trump: parseFloat(data.poll.average.candidate1).toFixed(1),
        harris: parseFloat(data.poll.average.candidate2).toFixed(1)
      };
    } catch (error) {
      console.error('Error fetching RCP polls:', error);
      return {
        trump: 46.7, // Fallback values in case of error
        harris: 48
      };
    }
  }