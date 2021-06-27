import axios from 'axios';

export async function handler(): Promise<any> {
  const res = await axios.post('https://api.vercel.com/v1/integrations/deploy/prj_FHjwIGwCIRCyVov6Nvt8mx54sbjN/qLBYGAePao');
  console.log(res);
  return res;
}