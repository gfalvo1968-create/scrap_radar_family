(async () => {
  'use strict';
  const el = id => document.getElementById(id);
  const say = text => { el('status').textContent = text; };
  let config, client, busy = false;
  const params = new URLSearchParams(location.search);
  let intent = params.get('intent');
  // PayPal return parameters never establish payment or membership status.
  history.replaceState(null, '', location.pathname);
  const lock = value => { busy = value; document.querySelectorAll('button').forEach(b => { b.disabled = value; }); };
  async function request(path, body) {
    const {data,error} = await client.auth.getSession();
    if (error || !data.session) throw new Error('Sign in to your Family account first.');
    const r = await fetch(config.market_api + '/api/paypal/pilot' + path, {
      method: body ? 'POST' : 'GET', cache: 'no-store',
      headers: {Authorization: 'Bearer '+data.session.access_token, 'Content-Type':'application/json'},
      ...(body ? {body: JSON.stringify(body)} : {})
    });
    const d = await r.json();
    if (!r.ok) throw new Error(typeof d.detail === 'string' ? d.detail : 'The test could not complete. Please retry.');
    return d;
  }
  async function check() {
    if (!intent) return;
    const d = await request('/intents/'+encodeURIComponent(intent));
    el('result').hidden = false;
    el('details').textContent = `${d.plan}: $${(d.amount_cents/100).toFixed(2)} USD/month · PayPal state: ${d.state}. ` +
      (d.test_payment_recorded ? 'PayPal recorded the test payment. ' : 'A test payment has not yet been confirmed. ') +
      'Paid app access remains off.';
    say('Checked directly with PayPal.');
  }
  async function run(action) {
    if (busy) return;
    lock(true); say('Working…');
    try { await action(); } catch(e) { say(e.message || 'Please retry.'); }
    finally { lock(false); }
  }
  async function show() {
    const {data,error} = await client.auth.getSession();
    if (error) throw error;
    el('login').hidden = Boolean(data.session);
    el('choices').hidden = !data.session;
    if (!data.session) { say('Sign in to start or check a test.'); return; }
    // Validate identity online before showing purchases, including owner restriction.
    const r = await fetch(config.market_api+'/api/account', {
      headers:{Authorization:'Bearer '+data.session.access_token},cache:'no-store'});
    if (!r.ok) throw new Error('Your account could not be verified. Please sign in again.');
    const d = await r.json();
    if (d.customer.email.toLowerCase() !== 'support@scrapradarfamily.com') {
      el('choices').hidden = true;
      throw new Error('Sandbox testing is currently limited to the owner account.');
    }
    if (intent) await check(); else say('Ready for a PayPal sandbox test.');
  }
  try {
    config = await (await fetch('customer_auth_config.json',{cache:'no-store'})).json();
    client = window.supabase.createClient(config.url, config.publishable_key, {
      auth:{flowType:'pkce',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'scrap-radar-customer-auth-v1'}});
    el('loginForm').addEventListener('submit', e => {
      e.preventDefault(); run(async () => {
        const {error} = await client.auth.signInWithPassword({email:el('email').value.trim(),password:el('password').value});
        el('password').value='';
        if (error) throw new Error('Sign-in failed. Use your Family account password here.');
        await show();
      });
    });
    document.querySelectorAll('[data-plan]').forEach(button => button.addEventListener('click', () => run(async () => {
      say('Preparing your test subscription. This may take a moment…');
      const d = await request('/checkout',{plan:button.dataset.plan});
      const u = new URL(d.approval_url);
      if (u.protocol!=='https:' || !['www.sandbox.paypal.com','sandbox.paypal.com'].includes(u.host) || u.pathname!=='/webapps/billing/subscriptions') throw new Error('Invalid sandbox destination.');
      intent=d.intent;
      sessionStorage.setItem('scrap-radar-paypal-test-intent',intent);
      location.assign(u.href);
    })));
    el('recheck').addEventListener('click',()=>run(check));
    intent = intent || sessionStorage.getItem('scrap-radar-paypal-test-intent');
    if (intent && !/^[0-9a-f-]{36}$/.test(intent)) intent=null;
    if (intent) sessionStorage.setItem('scrap-radar-paypal-test-intent',intent);
    await run(show);
  } catch(e) { say(e.message || 'The test page could not load.'); }
})();
