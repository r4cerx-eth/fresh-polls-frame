export async function getRCPPolls() {
    try {
      const response = await fetch('https://www.realclearpolitics.com/epolls/json/6730_historical.js', {
        next: { revalidate: 3600 },
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('RCP API error:', response.status);
        return {
          trump: 50.0, // Even percentages
          harris: 50.0
        };
      }
  
      const data = await response.json();
      
      // For now, return even percentages instead of processing RCP data
      return {
        trump: 50.0,
        harris: 50.0
      };
    } catch (error) {
      console.error('Error fetching RCP polls:', error);
      return {
        trump: 50.0, // Even percentages in case of error
        harris: 50.0
      };
    }
  }