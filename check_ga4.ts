import { getGoogleAnalyticsData } from './app/admin/analytics/actions';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // explicitly load env for the script

async function main() {
  console.log("Fetching GA4 data...");
  const data = await getGoogleAnalyticsData();
  console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error);
