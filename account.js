/* Managed Auth SDK pinned to 2.117.2 with SRI. No payment grants in browser. */
(async function () {
  'use strict';
  const el = id => document.getElementById(id);
  const status = message => { el('status').textContent = message; };
  let client, config, busy = false;
  // Explicit prelaunch opt-in; a UI switch, never an authorization boundary.
  const emailTest = new URL(location.href).searchParams.get('email_test') === '1';
  const emailFlowsEnabled = () => Boolean(config?.email_flows_verified || emailTest);
  function lock(value) {
    busy = value;
    ['signIn','signUp','recover','signOut'].forEach(id => {
      el(id).disabled = value || (['signUp','recover'].includes(id) && !emailFlowsEnabled());
    });
  }
  async function account() {
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    const session = data.session;
    el('accountSection').hidden = true;
    el('customerEmail').textContent = '';
    el('memberships').replaceChildren();
    el('signInSection').hidden = Boolean(session);
    if (!session) return;
    const r = await fetch(config.market_api + '/api/account', {
      headers: { Authorization: 'Bearer ' + session.access_token }, cache: 'no-store'
    });
    if (!r.ok) {
      el('signInSection').hidden = false;
      if (r.status === 401) await client.auth.signOut({ scope: 'local' });
      throw new Error(r.status === 403 ? 'Confirm your email before using your account.' : 'We could not verify your account. Please retry or sign in again.');
    }
    const d = await r.json();
    el('customerEmail').textContent = d.customer.email;
    const rows = d.subscriptions || [];
    if (!rows.length) {
      const p = document.createElement('p'); p.textContent = 'No paid membership is attached to this account.'; el('memberships').append(p);
    }
    rows.forEach(row => {
      const p = document.createElement('p');
      p.textContent = `${row.plan_id}: ${(row.amount_cents / 100).toFixed(2)} ${row.currency}/month · ${row.state}`;
      el('memberships').append(p);
    });
    el('accountNotice').textContent = d.notice;
    el('accountSection').hidden = false;
  }
  async function run(action) {
    if (busy) return;
    lock(true); status('Working…');
    try { await action(); } catch (error) { status(error.message || 'Please try again.'); }
    finally { lock(false); }
  }
  try {
    const r = await fetch('customer_auth_config.json', { cache: 'no-store' });
    if (!r.ok) throw new Error('Account setup is unavailable.');
    config = await r.json();
    if (!window.supabase) throw new Error('The sign-in service could not load. Please refresh.');
    client = window.supabase.createClient(config.url, config.publishable_key, {
      auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true,
              storageKey: 'scrap-radar-customer-auth-v1' }
    });
    el('emailSetup').textContent = emailTest
      ? 'Email test mode: delivery is not yet verified. Use the same browser for confirmation and recovery. No payments or paid access are enabled.'
      : config.email_flows_verified
      ? 'Use the same browser for email confirmation and password recovery links.'
      : 'New registration and password recovery are awaiting email-delivery and return-link verification. Existing accounts can sign in.';
    client.auth.onAuthStateChange(event => {
      if (event === 'PASSWORD_RECOVERY') el('recoverySection').hidden = false;
      if (event === 'SIGNED_OUT') { el('recoverySection').hidden = true; el('accountSection').hidden = true; el('customerEmail').textContent = ''; el('memberships').replaceChildren(); el('signInSection').hidden = false; }
    });
    el('authForm').addEventListener('submit', event => {
      event.preventDefault(); run(async () => {
        const { error } = await client.auth.signInWithPassword({ email: el('email').value.trim(), password: el('password').value });
        el('password').value = '';
        if (error) throw new Error('Sign-in failed. Check your email, password and confirmation status.');
        await account(); status('Signed in.');
      });
    });
    el('signUp').addEventListener('click', () => run(async () => {
      if (!emailFlowsEnabled() || !el('authForm').reportValidity()) return;
      if (el('password').value.length < 12) throw new Error('Use at least 12 characters for a new password.');
      const { error } = await client.auth.signUp({ email: el('email').value.trim(), password: el('password').value,
        options: { emailRedirectTo: new URL('account.html', location.href).href } });
      el('password').value = '';
      if (error) throw new Error('Registration could not be completed. Please try again later.');
      status('If registration is available for this email, check your inbox for a confirmation link.');
    }));
    el('recover').addEventListener('click', () => run(async () => {
      if (!emailFlowsEnabled() || !el('email').reportValidity()) return;
      const { error } = await client.auth.resetPasswordForEmail(el('email').value.trim(), { redirectTo: new URL('account.html', location.href).href });
      if (error) throw new Error('We could not request a recovery email. Please try again later.');
      status('If the account is eligible, check your inbox for a password recovery link.');
    }));
    el('recoveryForm').addEventListener('submit', event => {
      event.preventDefault(); run(async () => {
        const { error } = await client.auth.updateUser({ password: el('newPassword').value });
        el('newPassword').value = '';
        if (error) throw new Error('The password could not be updated. Request a new recovery link.');
        el('recoverySection').hidden = true; await account(); status('Password updated.');
      });
    });
    el('signOut').addEventListener('click', () => run(async () => {
      const { error } = await client.auth.signOut();
      if (error) { await client.auth.signOut({ scope: 'local' }); status('Signed out on this device. Other-session sign-out could not be confirmed.'); }
      else status('Signed out.');
      await account();
    }));
    lock(false); await account();
    if (new URL(location.href).searchParams.has('code')) history.replaceState(null, '', location.pathname);
  } catch (error) { lock(true); status(error.message || 'Account service unavailable.'); }
})();
