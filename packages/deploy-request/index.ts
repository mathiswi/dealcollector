import axios from 'axios';

export async function handler(): Promise<any> {
  const url = process.env.DEPLOY_HOOK as string;
  await axios.post(url);
  return;
}