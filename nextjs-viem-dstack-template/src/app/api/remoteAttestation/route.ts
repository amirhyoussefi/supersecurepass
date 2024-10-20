import {TappdClient} from '@phala/dstack-sdk'
import 'dotenv/config'

const endpoint = process.env.DSTACK_SIMULATOR_ENDPOINT || 'http://localhost:8090'

export const dynamic = 'force-dynamic'
export async function GET() {
  console.log(endpoint)
  const client = new TappdClient(endpoint)
  const randomNumString = Math.random().toString();
  console.log(randomNumString);
  const getRemoteAttestation = await client.tdxQuote(randomNumString);
  return Response.json(getRemoteAttestation);
}
