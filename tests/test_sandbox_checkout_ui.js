const fs=require('fs'),vm=require('vm'),assert=require('assert');
async function test(destination='https://www.sandbox.paypal.com/webapps/billing/subscriptions?token=test') {
 const nodes=new Map(), node=id=>nodes.get(id)||nodes.set(id,{textContent:'',hidden:false,disabled:false,value:'',dataset:{plan:'family'},events:{},addEventListener(t,f){this.events[t]=f;}}).get(id);
 const button=node('buy');let redirect,body,headers,checks=0,creates=0;
 const auth={getSession:async()=>({data:{session:{access_token:'session-token'}}})};
 const context={URL,URLSearchParams,history:{replaceState(){}},location:{search:'?intent=11111111-1111-4111-8111-111111111111&paid=true',pathname:'/sandbox_checkout.html',assign:u=>{redirect=u;}},sessionStorage:{getItem:()=>null,setItem(){}},document:{getElementById:node,querySelectorAll:()=>[button]},window:{supabase:{createClient:()=>({auth})}},fetch:async(url,opts)=>{
  if(url==='customer_auth_config.json')return {json:async()=>({market_api:'https://api.test'})};
  headers=opts.headers;
  if(url.endsWith('/api/account'))return {ok:true,json:async()=>({customer:{email:'support@scrapradarfamily.com'}})};
  if(url.includes('/intents/')){checks++;return {ok:true,json:async()=>({plan:'family',amount_cents:4495,state:'APPROVAL_PENDING',test_payment_recorded:false})};}
  creates++;body=JSON.parse(opts.body);return {ok:true,json:async()=>({intent:'11111111-1111-4111-8111-111111111111',approval_url:destination})};
 }};
 vm.runInNewContext(fs.readFileSync('sandbox_checkout.js','utf8'),context);await new Promise(r=>setTimeout(r,5));
 assert.equal(checks,1);assert(node('details').textContent.includes('APPROVAL_PENDING'));assert(!node('details').textContent.includes('recorded the test payment'));
 button.events.click();button.events.click();await new Promise(r=>setTimeout(r,5));
 assert.equal(creates,1);assert.deepEqual(body,{plan:'family'});assert.equal(headers.Authorization,'Bearer session-token');
 if(destination.includes('www.sandbox.paypal.com/'))assert.equal(redirect,destination);
 else {assert.equal(redirect,undefined);assert(node('status').textContent.includes('Invalid sandbox'));}
}
test().then(()=>test('https://www.paypal.com/webapps/billing/subscriptions?token=test')).then(()=>console.log('Sandbox UI: callback verification, session bearer, duplicate-click suppression and live redirect rejection passed.')).catch(e=>{console.error(e);process.exit(1);});
