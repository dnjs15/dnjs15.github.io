/*!
 * 站点浏览量（低调版）—— abacus.jasoncameron.dev 计数，前端定时轮询实现"近乎实时"
 * 失败就整块隐藏，绝不留破相
 */
(function () {
  var NS = 'dnjs15-github-io';
  var API = 'https://abacus.jasoncameron.dev';
  var REFRESH = 30000;
  var TIMEOUT = 5000;

  var siteEls = document.querySelectorAll('[data-views="site"]');
  var pageEls = document.querySelectorAll('[data-views="page"]');
  if (!siteEls.length && !pageEls.length) return;

  function pageKey() {
    var p = location.pathname.replace(/\/+$/, '');
    if (!p) return 'page-home';
    return (
      'page-' +
      p
        .replace(/^\/+|\/+$/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60)
    );
  }

  function fmt(n) {
    return Number(n).toLocaleString('en-US');
  }

  function hide(els) {
    for (var i = 0; i < els.length; i++) els[i].classList.add('is-hidden');
  }

  function paint(els, value) {
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var num = el.querySelector('[data-views-num]');
      if (!num) continue;
      var text = fmt(value);
      if (num.textContent !== text) {
        num.textContent = text;
        el.classList.add('is-updated');
        (function (node) {
          setTimeout(function () {
            node.classList.remove('is-updated');
          }, 700);
        })(el);
      }
      el.classList.add('is-ready');
    }
  }

  function request(mode, key) {
    var ctrl = 'AbortController' in window ? new AbortController() : null;
    var timer = ctrl
      ? setTimeout(function () {
          ctrl.abort();
        }, TIMEOUT)
      : null;
    return fetch(API + '/' + mode + '/' + NS + '/' + key, {
      cache: 'no-store',
      signal: ctrl ? ctrl.signal : undefined,
    })
      .then(function (res) {
        if (!res.ok) throw new Error('counter ' + res.status);
        return res.json();
      })
      .then(function (data) {
        if (timer) clearTimeout(timer);
        return Number(data.value || 0);
      })
      .catch(function (err) {
        if (timer) clearTimeout(timer);
        throw err;
      });
  }

  function once(els, key) {
    if (!els.length) return Promise.resolve();
    var flag = 'views:hit:' + key;
    var seen = false;
    try {
      seen = !!sessionStorage.getItem(flag);
    } catch (e) {}
    return request(seen ? 'get' : 'hit', key)
      .then(function (v) {
        try {
          if (!seen) sessionStorage.setItem(flag, '1');
        } catch (e) {}
        paint(els, v);
      })
      .catch(function () {
        hide(els);
      });
  }

  function refresh(els, key) {
    if (!els.length) return;
    request('get', key)
      .then(function (v) {
        paint(els, v);
      })
      .catch(function () {});
  }

  function refreshAll() {
    refresh(siteEls, 'site');
    refresh(pageEls, pageKey());
  }

  function init() {
    once(siteEls, 'site');
    once(pageEls, pageKey());
    setInterval(function () {
      if (document.visibilityState === 'visible') refreshAll();
    }, REFRESH);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') refreshAll();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
