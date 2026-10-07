const fs=require('fs'),vm=require('vm'),assert=require('assert');
async function main(testMode=false){
 const nodes=new Map(); const node=id=>nodes.get(id)||nodes.set(id,{textContent:'',hidden:false,disabled:false,value:'',events:{},addEventListener(t,f){this.events[t]=f;},replaceChildren(){},append(){},reportValidity(){return true;}}).get(id);
 let signupCalls=0,accountHeaders,authCallback;
 const auth={getSession:async()=>({data:{session:null}}),onAuthStateChange:f=>{authCallback=f;},signInWithPassword:async()=>({error:null}),signUp:async()=>{signupCalls++;return {error:null};},signOut:async()=>({error:null})};
 const context={document:{getElementById:node,createElement:()=>node('new')},window:{supabase:{createClient:()=>({auth})}},URL,location:{href:'https://example.test/account.html'+(testMode?'?email_test=1':''),pathname:'/account.html'},history:{replaceState(){}},fetch:async(url,options)=>{
  if(url==='customer_auth_config.json')return {ok:true,json:async()=>({url:'https://auth.test',publishable_key:'public',market_api:'https://market.test',email_flows_verified:false})};
  accountHeaders=options.headers;return {ok:true,json:async()=>({customer:{email:'verified@example.test'},subscriptions:[],notice:'Payments not enabled'})};
 }};
 vm.runInNewContext(fs.readFileSync('account.js','utf8'),context);await new Promise(r=>setTimeout(r,0));
 assert.equal(node('signUp').disabled,!testMode);assert.equal(node('recover').disabled,!testMode);
 node('email').value='user@example.test';node('password').value='password';
 auth.getSession=async()=>({data:{session:{access_token:'verified-token'}}});
 node('authForm').events.submit({preventDefault(){}});await new Promise(r=>setTimeout(r,0));
 assert.equal(node('password').value,'');assert.equal(accountHeaders.Authorization,'Bearer verified-token');
 assert.equal(node('customerEmail').textContent,'verified@example.test');
 assert.equal(node('accountSection').hidden,false);
 node('password').value='new-password-long';await node('signUp').events.click();await new Promise(r=>setTimeout(r,0));assert.equal(signupCalls,testMode?1:0);
 authCallback('SIGNED_OUT');assert.equal(node('accountSection').hidden,true);assert.equal(node('customerEmail').textContent,'');
 console.log('Customer account UI: sign-in, private request, password clearing, email-flow gating and sign-out clearing passed.');
}
main().then(()=>main(true)).catch(e=>{console.error(e);process.exit(1);});
