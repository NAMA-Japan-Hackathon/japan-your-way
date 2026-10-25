// Public, API-only facade. The service credential is injected by Cloudflare.
const UPSTREAM = 'https://japan-your-way-naitik.satinyshell1.chatgpt.site';
const TRAVEL = '/api/travel/';
const AVAILABILITY = '/api/travel/availability/';
const json = (data, status=200) => Response.json(data, {status, headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
function travelCookie(raw) {
  return raw?.match(/(?:^|;\s*)jyw_travel=([A-Za-z0-9_.%-]{1,300})(?:;|$)/)?.[0]?.replace(/^;\s*/, '').split(';')[0] || '';
}
async function boundedBody(request) {
  if (Number(request.headers.get('content-length')) > 120000) throw new RangeError();
  if (!request.body) return '';
  const reader=request.body.getReader();const chunks=[];let size=0;
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>120000){await reader.cancel();throw new RangeError();}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  return new TextDecoder().decode(bytes);
}
export function createGateway(fetcher=fetch, {limit=240}={}) {
  const buckets=new Map();
  return {async fetch(request, env={}) {
    const url=new URL(request.url);
    const path=url.pathname.replace(/\/?$/, '/');
    if(url.pathname==='/' && request.method==='GET')return json({service:'Japan, Your Way shared travel API',status:'online',privacy:'Provider keys remain private on Cloudflare.',endpoints:[TRAVEL,AVAILABILITY]});
    if(![TRAVEL,AVAILABILITY].includes(path))return json({error:'Unknown API route.'},404);
    if(!((path===TRAVEL && request.method==='GET')||request.method==='POST'))return json({error:'Method not supported.'},405);
    if(!env.UPSTREAM_SITE_TOKEN)return json({error:'The shared travel backend is not configured.'},503);
    const ip=request.headers.get('cf-connecting-ip') || 'shared';const now=Date.now();
    for(const [key,value] of buckets)if(value.until<now)buckets.delete(key);
    for(const [key,allowance] of [['all',limit],['ip:'+ip,Math.min(limit,60)]]) {
      const bucket=buckets.get(key)||{count:0,until:now+3600000};
      if(++bucket.count>allowance)return json({error:'The shared API usage allowance is reached. Please try again later.'},429);
      buckets.set(key,bucket);
    }
    if(buckets.size>10000)return json({error:'The shared API is busy. Please try again later.'},429);
    let body;
    if(request.method==='POST'){
      if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'Please send JSON.'},415);
      const browserOrigin=request.headers.get('origin');
      if(browserOrigin && browserOrigin!==url.origin)return json({error:'Use the website’s server API to connect.'},403);
      try{body=await boundedBody(request);}catch{return json({error:'This conversation is too large.'},413);}
    }
    const headers=new Headers({'OAI-Sites-Authorization':`Bearer ${env.UPSTREAM_SITE_TOKEN}`,'Accept':'application/json'});
    const cookie=travelCookie(request.headers.get('cookie'));if(cookie)headers.set('cookie',cookie);
    if(request.method==='POST'){headers.set('Content-Type','application/json');headers.set('Origin',UPSTREAM);}
    try{
      const response=await fetcher(UPSTREAM+path,{method:request.method,headers,body,redirect:'manual',signal:AbortSignal.timeout(path===AVAILABILITY?150000:90000)});
      if(response.status>=300 && response.status<400)return json({error:'The hosted travel backend returned an unexpected redirect.'},502);
      if(!response.headers.get('content-type')?.includes('application/json'))return json({error:'The hosted travel backend is unavailable. Please retry later.'},502);
      const data=await response.json();
      const result=json(data,response.status);
      const session=travelCookie(response.headers.get('set-cookie'));if(session)result.headers.set('Set-Cookie',`${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`);
      return result;
    }catch(error){const detail=String(error?.message || error).replaceAll(env.UPSTREAM_SITE_TOKEN,'[redacted]');console.error('Travel gateway upstream failure:',error?.name,detail.slice(0,400));return json({error:'The hosted travel backend could not respond. Your local trip is still saved.'},502);}
  }};
}
export default createGateway();
