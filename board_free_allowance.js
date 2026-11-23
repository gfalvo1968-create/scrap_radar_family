/* Read-only public Board Sense allowance display.
 * Does not alter upload handlers, tester access, server quotas or purchases.
 * Read-only GET is from the same API origin already used by the public case.
 */
(function (root) {
  'use strict';
  var USAGE_URL = 'https://boardsense.scrapradarfamily.com/free-usage';

  function parseUsage(payload) {
    var u = payload && payload.free_usage;
    if (!payload || payload.status !== 'success' || !u ||
        !Number.isInteger(u.limit) || u.limit < 1 || u.limit > 25 ||
        !Number.isInteger(u.used_today) || u.used_today < 0 ||
        !Number.isInteger(u.remaining) || u.remaining < 0 ||
        u.remaining !== Math.max(0, u.limit - u.used_today) ||
        typeof u.allowed !== 'boolean' || u.allowed !== (u.remaining > 0) ||
        typeof u.day_utc !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(u.day_utc)) {
      throw new Error('Unexpected free-usage response');
    }
    return {
      used: u.used_today,
      limit: u.limit,
      remaining: u.remaining,
      day: u.day_utc
    };
  }

  function usageText(usage) {
    var label = 'Public free Board Sense cases: ' + usage.remaining +
      ' of ' + usage.limit + ' remaining today (UTC ' + usage.day + ').';
    if (usage.remaining === 0) {
      return label + ' Today\'s free case has been used; return tomorrow.';
    }
    return label + ' One physical board may include 2–6 photos.';
  }

  function readAllowance(fetcher) {
    // No credentials, tester key, body, or analysis POST. This is non-consuming.
    return fetcher(USAGE_URL, {
      method: 'GET', credentials: 'omit', cache: 'no-store', redirect: 'error'
    }).then(function (response) {
      if (!response || !response.ok) throw new Error('Allowance lookup unavailable');
      return response.json();
    }).then(parseUsage);
  }

  function install(doc, appWindow) {
    var photoInput = doc.getElementById('casePhotos');
    if (!photoInput || doc.getElementById('boardSenseFreeAllowance')) return false;
    var tray = photoInput.closest('.side-box');
    if (!tray || !tray.parentNode) return false;

    var banner = doc.createElement('div');
    banner.id = 'boardSenseFreeAllowance';
    banner.setAttribute('role', 'group');
    banner.setAttribute('aria-label', 'Public free Board Sense allowance');
    banner.style.cssText = 'box-sizing:border-box;margin:12px 0;padding:12px 14px;' +
      'border:1px solid #5b9886;border-radius:12px;background:#09251f;color:#edfff7;' +
      'line-height:1.5;';

    var result = doc.createElement('span');
    result.id = 'boardSenseFreeAllowanceText';
    result.setAttribute('role', 'status');
    result.setAttribute('aria-live', 'polite');
    result.textContent = 'Checking today\'s public free Board Sense allowance…';

    var refresh = doc.createElement('button');
    refresh.type = 'button';
    refresh.id = 'boardSenseFreeAllowanceRefresh';
    refresh.textContent = 'Refresh free allowance';
    refresh.style.cssText = 'display:inline-block;margin:8px 0 0;padding:7px 10px;' +
      'border:1px solid #7bdcbc;border-radius:8px;background:#143a2e;' +
      'color:white;cursor:pointer;font-size:14px;';

    var hint = doc.createElement('small');
    hint.style.cssText = 'display:block;opacity:.84;margin-top:6px;';
    hint.textContent = 'Checking or refreshing does not use a scan. ' +
      'The server decides whether a new board can be analyzed.';

    banner.appendChild(result);
    banner.appendChild(doc.createElement('div')).appendChild(refresh);
    banner.appendChild(hint);
    tray.parentNode.insertBefore(banner, tray);

    var latestRequest = 0;
    function refreshAllowance() {
      var requestId = ++latestRequest;
      refresh.disabled = true;
      result.textContent = 'Checking today\'s public free Board Sense allowance…';
      readAllowance(appWindow.fetch.bind(appWindow))
        .then(function (usage) {
          if (requestId === latestRequest) result.textContent = usageText(usage);
        })
        .catch(function () {
          if (requestId === latestRequest) {
            result.textContent = 'Public free allowance status temporarily unavailable. ' +
              'This check did not use a scan. Please try Refresh.';
          }
        })
        .then(function () {
          if (requestId === latestRequest) refresh.disabled = false;
        });
    }
    refresh.addEventListener('click', refreshAllowance);
    refreshAllowance();
    return true;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseUsage: parseUsage, usageText: usageText, readAllowance: readAllowance };
  } else if (root && root.document) {
    install(root.document, root);
  }
})(typeof window !== 'undefined' ? window : globalThis);
