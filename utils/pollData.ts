export async function getLatestPolls() {
  try {
    return {
      trump: 45.5,
      harris: 42.3,
      lastUpdated: new Date().toLocaleDateString()
    };
  } catch (error) {
    console.error("Error fetching polls:", error);
    return {
      trump: 45,
      harris: 42,
      lastUpdated: new Date().toLocaleDateString()
    };
  }
}
