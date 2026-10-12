/* DumpIt forms → Supabase.
   Credentials are NOT stored in this repo. They are injected at build
   time into ./config.js (gitignored) — see config.template.js,
   .env.example and inject-env.mjs. Never commit config.js or .env. */
var DUMPIT_CFG = (typeof window !== "undefined" && window.DUMPIT_CONFIG) || {};
var SUPABASE_URL = DUMPIT_CFG.SUPABASE_URL || "";
var SUPABASE_ANON_KEY = DUMPIT_CFG.SUPABASE_ANON_KEY || "";

(function () {
  "use strict";

  function showMsg(el, text, ok) {
    el.hidden = false;
    el.textContent = text;
    el.classList.toggle("ok", !!ok);
    el.classList.toggle("err", !ok);
  }

  // Single shared client: creating one per submit spawns a GoTrueClient
  // per submit, which logs the "Multiple GoTrueClient instances" warning.
  // Harmless here (we never sign in — anon inserts only), but noisy.
  var _sb = null;
  function client() {
    if (_sb) return _sb;
    if (!window.supabase) return null;
    // config.js missing or ungenerated → stay inert, show the fallback message.
    if (!SUPABASE_URL || SUPABASE_URL.indexOf("https://") !== 0) return null;
    if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.length < 20) return null;
    _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return _sb;
  }

  function wire(formId, opts) {
    var form = document.getElementById(formId);
    if (!form) return;
    var info = document.getElementById(opts.msgId);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // Honeypot: invisible to humans, irresistible to bots. Fake success, drop silently.
      var trap = form.querySelector(".hp");
      if (trap && trap.value) {
        showMsg(info, opts.success, true);
        return;
      }
      var sb = client();
      if (!sb) {
        showMsg(info, "Forms aren't connected yet — message me directly at dev.killie@gmail.com instead.", false);
        return;
      }
      var email = form.email.value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMsg(info, "That email doesn't look right — check it and try again.", false);
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      sb.from(opts.table).insert(opts.row(email, form)).then(function (res) {
        btn.disabled = false;
        if (res.error) {
          // 23505 = already on the list → still a success from the user's view.
          if (res.error.code === "23505") {
            form.reset();
            showMsg(info, opts.success, true);
            return;
          }
          showMsg(info, "Something hiccuped — message me directly at dev.killie@gmail.com instead.", false);
          return;
        }
        form.reset();
        showMsg(info, opts.success, true);
      });
    });
  }

  // iPhone waitlist: email only.
  wire("ios-form", {
    table: "ios_waitlist",
    msgId: "ios-msg",
    row: function (email) { return { email: email }; },
    success: "You're on the list! One email when the iPhone version ships, nothing else."
  });

  // Logged-out deletion requests: email + preset reason + optional detail.
  wire("delete-form", {
    table: "deletion_requests",
    msgId: "delete-msg",
    row: function (email, form) {
      var picked = form.querySelector('input[name="reason"]:checked');
      var reason = picked ? picked.value : null;
      // "Prefer not to say" means: store no reason — unless they typed detail.
      if (reason === "Prefer not to say") reason = null;
      var detail = form.reason_detail.value.trim().slice(0, 300);
      if (detail) reason = (reason ? reason + " — " : "") + detail;
      if (reason) reason = reason.slice(0, 500);
      // NOTE: no `status` sent — the DB default ('pending') fills it in,
      // and anon only has INSERT on (email, reason). Sending `status`
      // gets the insert rejected with 42501 permission denied.
      return { email: email, reason: reason };
    },
    success: "Request logged. I'll email you shortly to confirm before deleting anything."
  });
})();
