import { getAnalyticsData } from './app/admin/analytics/actions';

async function main() {
  console.log("Fetching analytics data...");
  const data = await getAnalyticsData();
  console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error);
