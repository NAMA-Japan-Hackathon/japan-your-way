import test from 'node:test';
import assert from 'node:assert/strict';
import {createGateway} from '../worker/index.js';

const env={UPSTREAM_SITE_TOKEN:'test-private-token'};
test('gateway forwards only travel API routes and keeps its service token server-side',async()=>{
 const calls=[];
 const gateway=createGateway(async(url,init)=>{calls.push({url,init});return Response.json({connected:true,searchConnected:true,hotelConnected:true},{headers:{'set-cookie':'jyw_travel=test-session; Path=/; Secure; HttpOnly'}});});
 const res=await gateway.fetch(new Request('https://shared.example/api/travel/'),env);
 assert.equal(res.status,200);assert.equal((await res.json()).connected,true);
 assert.equal(calls[0].url,'https://japan-your-way-naitik.satinyshell1.chatgpt.site/api/travel/');
 assert.equal(calls[0].init.headers.get('OAI-Sites-Authorization'),'Bearer test-private-token');
 assert.equal(calls[0].init.redirect,'manual');
 assert.ok(![...res.headers].some(([,v])=>v.includes('test-private-token')));
 const blocked=await gateway.fetch(new Request('https://shared.example/account/'),env);
 assert.equal(blocked.status,404);assert.equal(calls.length,1);
});
test('gateway preserves signed sessions and bounds request bodies',async()=>{
 let forwarded;
 const gateway=createGateway(async(_,init)=>{forwarded=init;return Response.json({message:'Japan travel help',suggestions:[]});});
 const headers={'content-type':'application/json',origin:'https://shared.example',cookie:'jyw_travel=abc.signed; another=private'};
 const res=await gateway.fetch(new Request('https://shared.example/api/travel/',{method:'POST',headers,body:'{"mode":"chat"}'}),env);
 assert.equal(res.status,200);assert.equal(forwarded.headers.get('cookie'),'jyw_travel=abc.signed');
 assert.equal(forwarded.headers.get('origin'),'https://japan-your-way-naitik.satinyshell1.chatgpt.site');
 assert.equal((await gateway.fetch(new Request('https://shared.example/api/travel/',{method:'POST',headers,body:'x'.repeat(120001)}),env)).status,413);
});
test('gateway fails closed on redirects, HTML login pages, missing configuration and rate limits',async()=>{
 const gateway=createGateway(async()=>new Response('sign in',{status:401,headers:{'content-type':'text/html'}}));
 const req=()=>new Request('https://shared.example/api/travel/');
 assert.equal((await gateway.fetch(req(),{})).status,503);
 const blocked=await gateway.fetch(req(),env);assert.equal(blocked.status,502);assert.match((await blocked.json()).error,/backend/i);
 const limited=createGateway(async()=>Response.json({connected:true}),{limit:1});
 assert.equal((await limited.fetch(req(),env)).status,200);assert.equal((await limited.fetch(req(),env)).status,429);
 let redirects=0;
 const redirecting=createGateway(async()=>{redirects++;return new Response(null,{status:302,headers:{location:'https://other.example'}})});
 assert.equal((await redirecting.fetch(req(),env)).status,502);assert.equal(redirects,1);
});
