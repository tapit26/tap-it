import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  createContext,
  useContext,
} from "react";

/* ============================================================================
   TAP-IT — link-in-bio platform
   Single-file application. Sections:
     1. Design tokens + stylesheet
     2. Icons
     3. Storage layer (persistent) + data access
     4. Validation / security helpers
     5. Primitives (Button, Input, Modal, Toast, Skeleton, EmptyState, Avatar)
     6. Themes + PhonePreview (shared across hero, onboarding, dashboard)
     7. Auth context + router
     8. Marketing pages
     9. Auth pages
    10. Onboarding
    11. Dashboard (overview, links, appearance, analytics, settings)
    12. Public profile
============================================================================ */

/* ---------------------------------------------------------------- 1. STYLE */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&family=Playfair+Display:wght@600;700&family=Oswald:wght@500;600;700&family=Caveat:wght@600;700&family=Space+Mono:wght@400;700&display=swap');

html, body { margin:0; padding:0; }
#root { min-height:100vh; }

.pch, .pch *, .pch *::before, .pch *::after { box-sizing: border-box; }
.pch {
  --p:#111111; --p-600:#000000; --p-700:#000000; --p2:#3A3A3A;
  --bg:#FAFAFA; --ink:#111111; --mut:#6B6B6B; --w:#FFFFFF;
  --line:#E3E3E3; --line-2:#EFEFEF; --tint:#F2F2F2; --tint-2:#E9E9E9;
  --ok:#0E9F6E; --ok-bg:#E7F8F1; --warn:#B45309; --warn-bg:#FEF3C7;
  --bad:#D64550; --bad-bg:#FDECEE;
  --ring: 0 0 0 3px rgba(17,17,17,.22);
  --sh-1: 0 1px 2px rgba(17,17,17,.06);
  --sh-2: 0 8px 24px -12px rgba(17,17,17,.28);
  --sh-3: 0 28px 70px -28px rgba(17,17,17,.42);
  --r-s:10px; --r-m:14px; --r-l:20px; --r-xl:28px;
  --sans:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;
  --disp:'Manrope','Inter',system-ui,sans-serif;
  font-family: var(--sans);
  color: var(--ink);
  background: var(--bg);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  font-size: 16px;
  line-height: 1.55;
}
html, body { margin:0; padding:0; }
html[data-theme="dark"], body[data-theme="dark"] { background:#121212; }
html[data-theme="light"], body[data-theme="light"] { background:#FAFAFA; }
.pch { min-height:100vh; width:100%; background:var(--bg); overflow-x:hidden; }

.pch[data-theme="dark"] {
  --p-700:#F2F2F2;
  --bg:#121212; --ink:#F2F2F2; --mut:#9C9C9C; --w:#1C1C1C;
  --line:#2D2D2D; --line-2:#252525; --tint:#1F1F1F; --tint-2:#282828;
  --ok:#34D399; --ok-bg:#12301F; --warn:#FBBF24; --warn-bg:#332810;
  --bad:#F87171; --bad-bg:#3A1519;
  --ring: 0 0 0 3px rgba(255,255,255,.22);
  --sh-1: 0 1px 2px rgba(0,0,0,.4);
  --sh-2: 0 8px 24px -12px rgba(0,0,0,.7);
  --sh-3: 0 28px 70px -28px rgba(0,0,0,.85);
}
.pch[data-theme="dark"] .pill-ok { color: var(--ok); }
.pch[data-theme="dark"] .pill-bad { color: var(--bad); }
.pch[data-theme="dark"] img { filter: brightness(.95); }

.theme-toggle {
  position: fixed; bottom: 18px; right: 18px; z-index: 60;
  width: 44px; height: 44px; border-radius: 999px;
  display: flex; align-items: center; justify-content: center;
  background: var(--w); border: 1px solid var(--line); box-shadow: var(--sh-2);
  cursor: pointer; color: var(--ink);
}
.theme-toggle:hover { border-color: var(--p); }

.pch h1,.pch h2,.pch h3,.pch h4 { font-family: var(--disp); margin:0; letter-spacing:-.022em; line-height:1.1; font-weight:800; }
.pch p { margin:0; }
.pch button { font: inherit; color: inherit; }
.pch a { color: inherit; text-decoration: none; }
.pch :focus-visible { outline: none; box-shadow: var(--ring); border-radius: 8px; }
.pch ::selection { background: var(--tint-2); }

/* --- layout --- */
.wrap { width:100%; max-width:1140px; margin:0 auto; padding:0 20px; }
.wrap-sm { width:100%; max-width:780px; margin:0 auto; padding:0 20px; }
.stack > * + * { margin-top: var(--gap, 16px); }
.row { display:flex; align-items:center; gap:10px; }
.row-b { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.grow { flex:1 1 auto; min-width:0; }
.mut { color: var(--mut); }
.tiny { font-size:12.5px; }
.sm { font-size:14px; }
.center { text-align:center; }
.trunc { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.only-sm { display:none !important; }
.ob-inline { display:none; }

/* --- buttons --- */
.btn {
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  border:1px solid transparent; border-radius:999px; cursor:pointer;
  font-weight:600; font-size:15px; padding:11px 20px; white-space:nowrap;
  transition: transform .14s ease, box-shadow .18s ease, background .18s ease, border-color .18s ease, color .18s ease;
}
.btn:disabled { opacity:.55; cursor:not-allowed; }
.btn-p, .btn.btn-p { background: var(--p); color:#fff; box-shadow: 0 6px 18px -8px rgba(17,17,17,.55); }
.btn-p:hover:not(:disabled) { background: var(--p-600); transform: translateY(-1px); }
.btn-p:active:not(:disabled) { transform: translateY(0); }
.btn-g, .btn.btn-g { background: var(--w); color: var(--ink); border-color: var(--line); box-shadow: var(--sh-1); }
.btn-g:hover:not(:disabled) { border-color:var(--mut); background:var(--tint); }
.btn-q, .btn.btn-q { background: transparent; color: var(--mut); }
.btn-q:hover:not(:disabled) { background: var(--tint); color: var(--ink); }
.btn-d, .btn.btn-d { background: var(--bad-bg); color:#B3323C; }
.btn-d:hover:not(:disabled) { background:var(--bad-bg); }
.btn-blk { width:100%; }
.btn-sm { padding:8px 14px; font-size:14px; }
.btn-lg { padding:14px 26px; font-size:16.5px; }
.spin { width:15px; height:15px; border:2px solid currentColor; border-right-color:transparent; border-radius:50%; animation: sp .7s linear infinite; }
@keyframes sp { to { transform: rotate(360deg); } }

/* --- surfaces --- */
.card { background: var(--w); border:1px solid var(--line); border-radius: var(--r-l); box-shadow: var(--sh-1); }
.pad { padding:20px; }
.pad-l { padding:26px; }

/* --- fields --- */
.fld { display:block; }
.fld-lab { display:block; font-size:13.5px; font-weight:600; margin-bottom:6px; }
.inp {
  width:100%; background: var(--w); border:1px solid var(--line); border-radius: var(--r-m);
  padding:11px 13px; font-size:15px; color: var(--ink);
  transition: border-color .16s ease, box-shadow .16s ease;
}
.inp::placeholder { color:#A3A3A3; }
.inp:hover { border-color:#CFCFCF; }
.inp:focus { outline:none; border-color: var(--p); box-shadow: var(--ring); }
.inp[aria-invalid="true"] { border-color: var(--bad); }
.inp[aria-invalid="true"]:focus { box-shadow: 0 0 0 3px rgba(214,69,80,.22); }
textarea.inp { resize:vertical; min-height:86px; line-height:1.5; }
.inp-wrap { position:relative; }
.inp-wrap .inp { padding-right:44px; }
.inp-btn { position:absolute; right:6px; top:50%; transform:translateY(-50%); background:none; border:0; padding:7px; border-radius:9px; color:var(--mut); cursor:pointer; display:flex; }
.inp-btn:hover { background: var(--tint); color: var(--ink); }
.pfx { display:flex; align-items:stretch; border:1px solid var(--line); border-radius: var(--r-m); background: var(--w); overflow:hidden; transition: border-color .16s, box-shadow .16s; }
.pfx:focus-within { border-color: var(--p); box-shadow: var(--ring); }
.pfx-tag { display:flex; align-items:center; padding:0 2px 0 13px; color:var(--mut); font-size:15px; white-space:nowrap; }
.pfx input { flex:1; min-width:0; border:0; background:none; padding:11px 13px 11px 2px; font-size:15px; color:var(--ink); }
.pfx input:focus { outline:none; box-shadow:none; }
.err { color:#C13B45; font-size:13px; margin-top:6px; display:flex; gap:6px; align-items:flex-start; }
.hint { color: var(--mut); font-size:13px; margin-top:6px; }
.chk { display:flex; gap:10px; align-items:flex-start; cursor:pointer; font-size:14px; }
.chk input { width:18px; height:18px; margin:1px 0 0; accent-color: var(--p); flex:none; cursor:pointer; }

/* --- chips / pills --- */
.pill { display:inline-flex; align-items:center; gap:6px; padding:5px 11px; border-radius:999px; font-size:12.5px; font-weight:600; }
.pill-ok { background: var(--ok-bg); color:#0A7A55; }
.pill-bad { background: var(--bad-bg); color:#B3323C; }
.pill-n { background: var(--tint); color: var(--p-700); }
.pill-w { background: var(--warn-bg); color: var(--warn); }

/* --- nav --- */
.nav { position:sticky; top:0; z-index:50; background: rgba(250,250,250,.78); backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%); border-bottom:1px solid transparent; transition: border-color .2s, background .2s; }
.nav.stuck { border-bottom-color: var(--line); background: rgba(250,250,250,.92); }
.nav-in { height:68px; display:flex; align-items:center; gap:8px; }
.nav-lnk { padding:9px 13px; border-radius:10px; font-size:14.5px; font-weight:500; color:var(--mut); background:none; border:0; cursor:pointer; }
.nav-lnk:hover { color: var(--ink); background: var(--tint); }

/* --- logo --- */
.logo { display:inline-flex; align-items:center; gap:9px; font-family:var(--disp); font-weight:800; font-size:19px; letter-spacing:-.03em; background:none; border:0; padding:4px; cursor:pointer; }

/* --- hero --- */
.hero { position:relative; overflow:hidden; padding:64px 0 24px; }
.hero-glow { position:absolute; inset:-30% -20% auto -20%; height:620px; pointer-events:none;
  background: radial-gradient(50% 50% at 22% 34%, rgba(17,17,17,.09), transparent 68%),
              radial-gradient(44% 46% at 80% 22%, rgba(17,17,17,.06), transparent 70%); }
.hero-grid { position:relative; display:grid; grid-template-columns: 1.05fr .95fr; gap:52px; align-items:center; }
.h1 { font-size: clamp(40px, 6.4vw, 66px); line-height:1.02; letter-spacing:-.04em; }
.lede { font-size:17.5px; color:var(--mut); max-width:46ch; margin-top:18px; }
.hero-cta { display:flex; gap:12px; flex-wrap:wrap; margin-top:28px; }
.hero-note { margin-top:20px; font-size:13.5px; color:var(--mut); display:flex; align-items:center; gap:8px; }

/* --- phone --- */
.phone-stage { position:relative; display:flex; justify-content:center; }
.phone { position:relative; width:308px; max-width:100%; border-radius:42px; padding:11px; background: linear-gradient(160deg,#2B2B2B,#0D0D0D); box-shadow: var(--sh-3); }
.phone-scr { border-radius:32px; overflow:hidden; height:592px; position:relative; }
.phone-notch { position:absolute; top:19px; left:50%; transform:translateX(-50%); width:92px; height:22px; border-radius:999px; background:#0D0D0D; z-index:3; }
.float { animation: fl 7s ease-in-out infinite; }
@keyframes fl { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-14px) } }
.chip-float { position:absolute; background:var(--w); border:1px solid var(--line); border-radius:14px; padding:9px 13px; box-shadow: var(--sh-2); font-size:13px; font-weight:600; display:flex; align-items:center; gap:8px; }

/* --- profile canvas (shared by preview + public page) --- */
.pf { height:100%; overflow-y:auto; overflow-x:hidden; padding:52px 20px 40px; }
.pf::-webkit-scrollbar { width:0; }
.pf-av { width:88px; height:88px; border-radius:50%; margin:0 auto; display:flex; align-items:center; justify-content:center; font-family:var(--disp); font-weight:800; font-size:31px; overflow:hidden; position:relative; z-index:2; }
.pf-cover { width:100%; height:132px; border-radius:22px; background-size:cover; background-position:center; margin-bottom:0; }
.pf-av img { width:100%; height:100%; object-fit:cover; }
.pf-name { font-family:var(--disp); font-weight:800; font-size:calc(19px * var(--fs-scale, 1)); text-align:center; margin-top:14px; letter-spacing:-.02em; }
p.pf-bio { text-align:center; font-size:calc(14px * var(--fs-scale, 1)); margin-top:7px; opacity:.78; line-height:1.5; max-width:34ch; margin-left:auto; margin-right:auto; white-space:pre-line; }
.pf-soc { display:flex; justify-content:center; flex-wrap:wrap; gap:14px; margin-top:18px; }
.pf-soc button, .pf-soc a { background:none; border:0; cursor:pointer; opacity:.82; display:flex; transition: transform .16s ease, opacity .16s ease; }
.pf-soc button:hover, .pf-soc a:hover { transform: translateY(-2px); opacity:1; }
.pf-links { margin-top:26px; display:flex; flex-direction:column; gap:13px; }
.pf-lnk { display:flex; align-items:center; gap:12px; width:100%; padding:15px 16px; cursor:pointer; font-weight:600; font-size:calc(15px * var(--fs-scale, 1)); text-align:left; border:1px solid transparent; transition: transform .16s cubic-bezier(.2,.8,.3,1), box-shadow .16s ease, filter .16s ease; animation: lnkIn .42s cubic-bezier(.2,.8,.3,1) backwards; }
.pf-lnk:hover { transform: translateY(-2px) scale(1.012); }
.pf-lnk:active { transform: translateY(0) scale(.995); }
@keyframes lnkIn { from { opacity:0; transform: translateY(12px); } }
.pf-hd { text-align:center; font-weight:700; font-size:13.5px; opacity:.62; padding-top:8px; }
.pf-foot { text-align:center; margin-top:32px; font-size:12px; }
.pf-foot-badge { display:inline-block; padding:6px 13px; border-radius:999px; background:rgba(0,0,0,.55); color:#fff; backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); }

/* --- features --- */
.sec { padding:88px 0; }
.sec-h { max-width:38ch; }
.sec-h h2 { font-size: clamp(28px,3.6vw,40px); }
.sec-h p { color:var(--mut); margin-top:12px; font-size:16.5px; }
.f-grid { display:grid; grid-template-columns: repeat(3,1fr); gap:18px; margin-top:44px; }
.f-card { background:var(--w); border:1px solid var(--line); border-radius: var(--r-l); padding:24px; transition: border-color .2s ease, box-shadow .2s ease; }
.f-card:hover { border-color:#CFCFCF; box-shadow: var(--sh-2); }
.f-ico { width:42px; height:42px; border-radius:12px; background: var(--tint); color: var(--p); display:flex; align-items:center; justify-content:center; }
.f-card h3 { font-size:17px; margin-top:16px; }
.f-card p { color:var(--mut); font-size:14.5px; margin-top:7px; }

/* --- steps --- */
.steps { display:grid; grid-template-columns: repeat(3,1fr); gap:0; margin-top:44px; border-top:1px solid var(--line); }
.step { padding:28px 26px 8px; border-right:1px solid var(--line); position:relative; }
.step:last-child { border-right:0; }
.step-n { font-family:var(--disp); font-weight:800; font-size:13px; color: var(--p); }
.step h3 { font-size:19px; margin-top:14px; }
.step p { color:var(--mut); font-size:14.5px; margin-top:8px; }
.step::before { content:''; position:absolute; top:-1px; left:0; width:34%; height:2px; background: var(--p); }

/* --- stats / proof --- */
.proof { background: linear-gradient(155deg,#1E1E1E 0%,#0A0A0A 62%,#161616 100%); color:#fff; border-radius: var(--r-xl); padding:52px 40px; }
.proof h2 { color:#fff; }
.stats { display:grid; grid-template-columns:repeat(3,1fr); gap:22px; margin-top:34px; }
.stat-n { font-family:var(--disp); font-weight:800; font-size: clamp(30px,4.4vw,46px); letter-spacing:-.04em; background: linear-gradient(96deg,#fff 18%,#B5B5B5); -webkit-background-clip:text; background-clip:text; color:transparent; }
.stat-l { color:#ADADAD; font-size:14px; margin-top:2px; }
.tst { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-top:34px; }
.tst-c { background: rgba(255,255,255,.055); border:1px solid rgba(255,255,255,.12); border-radius: var(--r-l); padding:22px; }
.tst-c p { color:#E6E6E6; font-size:14.5px; line-height:1.6; }
.tst-m { display:flex; gap:11px; align-items:center; margin-top:18px; }
.tst-m b { display:block; font-size:14px; }
.tst-m span { color:#ABABAB; font-size:12.5px; }

/* --- cta band --- */
.cta-band { border-radius: var(--r-xl); padding:64px 40px; text-align:center; background:
   radial-gradient(70% 120% at 50% 0%, #F0F0F0, #FAFAFA 72%); border:1px solid var(--line); }
.cta-band h2 { font-size: clamp(30px,4.4vw,46px); }
.cta-band p { color:var(--mut); margin:14px auto 0; max-width:44ch; font-size:16.5px; }

/* --- footer --- */
.foot { border-top:1px solid var(--line); padding:54px 0 34px; margin-top:10px; }
.foot-grid { display:grid; grid-template-columns: 1.6fr repeat(3,1fr); gap:30px; }
.foot h4 { font-size:13px; font-family:var(--sans); font-weight:700; }
.foot ul { list-style:none; padding:0; margin:14px 0 0; display:flex; flex-direction:column; gap:9px; }
.foot a, .foot button { color:var(--mut); font-size:14px; background:none; border:0; padding:0; cursor:pointer; text-align:left; }
.foot a:hover, .foot button:hover { color:var(--p); }

/* --- auth --- */
.auth-page { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:28px 20px 44px;
  background: radial-gradient(60% 46% at 50% 0%, #F0F0F0, var(--bg) 66%); }
.auth-card { width:100%; max-width:436px; background:var(--w); border:1px solid var(--line); border-radius:24px; padding:32px; box-shadow: var(--sh-2); }
.auth-card h1 { font-size:27px; }
.divider { display:flex; align-items:center; gap:14px; color:var(--mut); font-size:13px; margin:20px 0; }
.divider::before,.divider::after { content:''; height:1px; background:var(--line); flex:1; }
.meter { height:5px; border-radius:99px; background:var(--line-2); overflow:hidden; display:flex; gap:3px; margin-top:9px; }
.meter i { flex:1; background:var(--line-2); border-radius:99px; transition: background .25s ease; }

/* --- onboarding --- */
.ob { min-height:100vh; display:grid; grid-template-columns: 1fr 420px; }
.ob-main { padding:34px 40px 60px; overflow-y:auto; }
.ob-side { background: linear-gradient(168deg,#1E1E1E,#0A0A0A); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; padding:40px 20px; }
.ob-bar { height:5px; background:var(--line-2); border-radius:99px; overflow:hidden; }
.ob-bar i { display:block; height:100%; background:linear-gradient(90deg,var(--p),var(--p2)); border-radius:99px; transition: width .4s cubic-bezier(.2,.8,.3,1); }
.pick { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
.pick-i { text-align:left; background:var(--w); border:1px solid var(--line); border-radius:var(--r-m); padding:14px; cursor:pointer; display:flex; gap:11px; align-items:center; transition: border-color .16s, background .16s; }
.pick-i:hover { border-color:#CFCFCF; }
.pick-i[aria-pressed="true"] { border-color:var(--p); background:var(--tint); }

/* --- dashboard shell --- */
.dash { display:grid; grid-template-columns: 244px 1fr; min-height:100vh; }
.side { border-right:1px solid var(--line); background:var(--w); padding:18px 14px; position:sticky; top:0; height:100vh; display:flex; flex-direction:column; }
.side-l { display:flex; align-items:center; gap:11px; width:100%; padding:10px 12px; border-radius:12px; background:none; border:0; cursor:pointer; color:var(--mut); font-weight:600; font-size:14.5px; text-align:left; }
.side-l:hover { background:var(--tint); color:var(--ink); }
.side-l[aria-current="page"] { background:var(--tint-2); color:var(--p-700); }
.dash-main { min-width:0; display:flex; flex-direction:column; }
.dash-top { border-bottom:1px solid var(--line); background:var(--w); background:color-mix(in srgb, var(--w) 85%, transparent); backdrop-filter:blur(10px); position:sticky; top:0; z-index:30; padding:12px 24px; }
.dash-body { padding:26px 24px 80px; flex:1; }
.dash-split { display:grid; grid-template-columns: minmax(0,1fr) 336px; gap:26px; align-items:start; }
.dash-prev { position:sticky; top:86px; }
.h-page { font-size:24px; }
.mobile-bar { display:none; }

/* --- link rows --- */
.lrow { background:var(--w); border:1px solid var(--line); border-radius:var(--r-l); padding:14px 14px 14px 8px; display:flex; gap:10px; align-items:center; transition: box-shadow .18s ease, border-color .18s ease, opacity .18s; }
.lrow:hover { box-shadow: var(--sh-2); }
.lrow.drag { opacity:.4; }
.lrow.over { border-color: var(--p); box-shadow: 0 0 0 3px rgba(17,17,17,.14); }
.lrow.off { background:var(--tint); }
.grip { display:flex; flex-direction:column; align-items:center; gap:2px; padding:4px; color:#B0B0B0; cursor:grab; background:none; border:0; border-radius:8px; }
.grip:hover { color:var(--p); background:var(--tint); }
.grip:active { cursor:grabbing; }
.icobtn { background:none; border:1px solid transparent; border-radius:10px; padding:8px; color:var(--mut); cursor:pointer; display:flex; transition: background .16s, color .16s; }
.icobtn:hover { background:var(--tint); color:var(--ink); }
.icobtn.danger:hover { background:var(--bad-bg); color:var(--bad); }
.sw { width:42px; height:24px; border-radius:99px; background:#D6D6D6; border:0; position:relative; cursor:pointer; flex:none; transition: background .2s ease; }
.sw i { position:absolute; top:3px; left:3px; width:18px; height:18px; border-radius:50%; background:#fff; box-shadow:0 1px 3px rgba(0,0,0,.22); transition: transform .2s cubic-bezier(.2,.8,.3,1); }
.sw[aria-checked="true"] { background: var(--p); }
.sw[aria-checked="true"] i { transform: translateX(18px); }

/* --- theme picker --- */
.th-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:13px; }
.th { border:2px solid var(--line); background:var(--w); border-radius:var(--r-m); padding:7px; cursor:pointer; transition: border-color .16s, transform .16s; }
.th:hover { transform: translateY(-2px); }
.th[aria-pressed="true"] { border-color: var(--p); }
.th-sw { height:78px; border-radius:9px; padding:9px; display:flex; flex-direction:column; gap:5px; justify-content:flex-end; }
.th-sw i { display:block; height:10px; border-radius:99px; }
.th-name { font-size:12.5px; font-weight:600; margin-top:7px; text-align:center; }

/* --- analytics --- */
.kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
.kpi { background:var(--w); border:1px solid var(--line); border-radius:var(--r-l); padding:18px; }
.kpi-v { font-family:var(--disp); font-weight:800; font-size:29px; letter-spacing:-.03em; margin-top:5px; }
.bars { display:flex; align-items:flex-end; gap:7px; height:170px; }
.bar-c { flex:1; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; gap:7px; height:100%; }
.bar { width:100%; border-radius:7px 7px 3px 3px; background: linear-gradient(180deg,var(--p2),var(--p)); min-height:3px; transition: height .5s cubic-bezier(.2,.8,.3,1); position:relative; }
.bar.alt { background: linear-gradient(180deg,#C7C7C7,#A0A0A0); }
.bar-x { font-size:11px; color:var(--mut); }
.tbl { width:100%; border-collapse:collapse; }
.tbl th { text-align:left; font-size:12.5px; color:var(--mut); font-weight:600; padding:0 12px 10px; }
.tbl td { padding:12px; border-top:1px solid var(--line-2); font-size:14.5px; vertical-align:middle; }
.mini { height:7px; border-radius:99px; background:var(--line-2); overflow:hidden; min-width:70px; }
.mini i { display:block; height:100%; background:linear-gradient(90deg,var(--p),var(--p2)); border-radius:99px; }

/* --- modal --- */
.ovl { position:fixed; inset:0; background: rgba(17,17,17,.45); backdrop-filter: blur(3px); z-index:200; display:flex; align-items:center; justify-content:center; padding:18px; animation: fade .18s ease; }
@keyframes fade { from { opacity:0 } }
.mdl { background:var(--w); border-radius:22px; width:100%; max-width:460px; box-shadow: var(--sh-3); animation: pop .24s cubic-bezier(.2,.8,.3,1); max-height:92vh; overflow-y:auto; }
@keyframes pop { from { opacity:0; transform: translateY(14px) scale(.97) } }

/* --- toast --- */
.toasts { position:fixed; z-index:300; bottom:18px; right:18px; display:flex; flex-direction:column; gap:10px; width:min(340px, calc(100vw - 36px)); }
.toast { display:flex; gap:11px; align-items:flex-start; background:#1A1A1A; color:#fff; border-radius:15px; padding:13px 14px; box-shadow: var(--sh-3); animation: tin .28s cubic-bezier(.2,.8,.3,1); font-size:14px; }
.toast.ok i { color:#4ADE80 }
.toast.bad i { color:#FCA5A5 }
@keyframes tin { from { opacity:0; transform: translateY(14px) } }

/* --- skeleton / empty --- */
.sk { background: linear-gradient(90deg,#EDEDED 25%,#F7F7F7 37%,#EDEDED 63%); background-size:400% 100%; animation: shim 1.3s ease infinite; border-radius:10px; }
@keyframes shim { from { background-position:100% 0 } to { background-position:0 0 } }
.empty { text-align:center; padding:52px 24px; border:1px dashed var(--line); border-radius:var(--r-l); background: var(--tint); }
.empty-i { width:52px; height:52px; border-radius:15px; background:var(--tint); color:var(--p); display:flex; align-items:center; justify-content:center; margin:0 auto 16px; }

/* --- responsive --- */
@media (max-width: 1024px) {
  .hero-grid { grid-template-columns:1fr; gap:40px; }
  .lede { max-width:none; }
  .f-grid, .steps, .tst { grid-template-columns:1fr 1fr; }
  .step { border-bottom:1px solid var(--line); }
  .dash-split { grid-template-columns:1fr; }
  .dash-prev { position:static; }
  .dash-prev .phone { margin: 0 auto; }
  .ob { grid-template-columns:1fr; }
  .ob-side { display:none; }
  .ob-inline { display:block; }
}
@media (max-width: 860px) {
  .dash { grid-template-columns:1fr; }
  .side { display:none; }
  .mobile-bar { display:flex; position:sticky; bottom:0; z-index:40; background:var(--w); background:color-mix(in srgb, var(--w) 94%, transparent); backdrop-filter:blur(12px); border-top:1px solid var(--line); padding:8px 6px calc(8px + env(safe-area-inset-bottom)); }
  .mobile-bar button { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; background:none; border:0; padding:7px 2px; border-radius:12px; color:var(--mut); font-size:11px; font-weight:600; cursor:pointer; }
  .mobile-bar button[aria-current="page"] { color: var(--p); background: var(--tint); }
  .dash-body { padding:20px 16px 30px; }
  .dash-top { padding:11px 16px; }
}
@media (max-width: 720px) {
  .sec { padding:60px 0; }
  .f-grid, .steps, .tst, .stats, .foot-grid { grid-template-columns:1fr; }
  .stats { grid-template-columns:repeat(3,1fr); gap:12px; }
  .kpis { grid-template-columns:1fr 1fr; }
  .step { border-right:0; padding:24px 0 6px; }
  .proof, .cta-band { padding:40px 22px; border-radius:22px; }
  .hide-sm { display:none !important; }
  .only-sm { display:revert !important; }
  .wrap, .wrap-sm { padding:0 16px; }
  .auth-card { padding:24px 20px; border-radius:20px; }
  .ob-main { padding:24px 18px 48px; }
  .th-grid { grid-template-columns:1fr 1fr; }
  .pick { grid-template-columns:1fr; }
  .toasts { left:14px; right:14px; bottom:14px; width:auto; }
}
@media (max-width: 380px) {
  .pch { font-size:15.5px; }
  .h1 { font-size:34px; }
  .btn { padding:10px 16px; font-size:14.5px; }
  .stats { grid-template-columns:1fr; }
  .kpis { grid-template-columns:1fr; }
  .phone { width:100%; padding:9px; border-radius:36px; }
  .phone-scr { height:540px; border-radius:28px; }
}
@media (prefers-reduced-motion: reduce) {
  .pch *, .pch *::before, .pch *::after {
    animation-duration:.01ms !important; animation-iteration-count:1 !important;
    transition-duration:.01ms !important; scroll-behavior:auto !important;
  }
}
`;

/* ---------------------------------------------------------------- 2. ICONS */

const LOGO_SRC = "data:image/png;base64,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";
const LOGO_SRC_DARK = "data:image/png;base64,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";

const I = {
  sun: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><circle cx="12" cy="12" r="4.5" /><path d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7" /></svg>,
  moon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 14.7A8.5 8.5 0 1 1 9.3 3.2a7 7 0 0 0 11.5 11.5Z" /></svg>,
  logo: (s = 26, dark = false) => (
    <img
      src={dark ? LOGO_SRC_DARK : LOGO_SRC}
      alt=""
      width={s}
      height={s}
      style={{ width: s, height: s, borderRadius: s * 0.3, display: "block", flex: "none" }}
      aria-hidden="true"
    />
  ),
  eye: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>,
  eyeOff: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.8 2.8M9.4 5.3A9.9 9.9 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.2 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 3.9-.8" /></svg>,
  check: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>,
  x: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>,
  alert: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.2v.1" /></svg>,
  plus: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>,
  grip: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.7" /><circle cx="15" cy="6" r="1.7" /><circle cx="9" cy="12" r="1.7" /><circle cx="15" cy="12" r="1.7" /><circle cx="9" cy="18" r="1.7" /><circle cx="15" cy="18" r="1.7" /></svg>,
  pencil: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>,
  trash: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5" /></svg>,
  copy: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="12" height="12" rx="2.5" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></svg>,
  ext: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>,
  home: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" /></svg>,
  link: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 0 0-5.7-5.7l-1.4 1.4" /><path d="M13.5 10.5a4 4 0 0 0-5.7 0L5 13.3a4 4 0 0 0 5.7 5.7l1.4-1.4" /></svg>,
  brush: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20c0-2 1.4-3 3-3s3 1 3 3-1.4 2-3 2H3c.6-.5 1-1.2 1-2Z" /><path d="M10.5 17.5 20.2 7.8a2.3 2.3 0 0 0-3.2-3.2L7.3 14.3" /></svg>,
  chart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>,
  gear: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.5 15a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 4.5a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7 2 2 0 1 1 0 4Z" /></svg>,
  eyeSm: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>,
  cursor: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 3.5 19 11l-6.4 1.7L10 19Z" /></svg>,
  sparkle: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" /><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8Z" /></svg>,
  layers: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 9 5-9 5-9-5Z" /><path d="m3 13 9 5 9-5" /></svg>,
  palette: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21a9 9 0 1 1 9-9c0 2-1.6 2.6-3 2.6h-1.4A2.1 2.1 0 0 0 15 18.3c0 1.5-1.2 2.7-3 2.7Z" /><circle cx="7.8" cy="11.2" r="1.1" fill="currentColor" stroke="none" /><circle cx="11" cy="7.6" r="1.1" fill="currentColor" stroke="none" /><circle cx="15.4" cy="8.6" r="1.1" fill="currentColor" stroke="none" /></svg>,
  share: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5.5" r="2.6" /><circle cx="6" cy="12" r="2.6" /><circle cx="18" cy="18.5" r="2.6" /><path d="m8.4 10.7 7.2-3.9M8.4 13.3l7.2 3.9" /></svg>,
  id: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="4.5" width="19" height="15" rx="3" /><circle cx="8.5" cy="11" r="2.2" /><path d="M5 16.4c.6-1.5 2-2.2 3.5-2.2s2.9.7 3.5 2.2M15 9.6h4M15 13.4h3" /></svg>,
  back: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19 8 12l7-7" /></svg>,
  fwd: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 5 7 7-7 7" /></svg>,
  up: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 15 6-6 6 6" /></svg>,
  down: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>,
  google: <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6Z" /><path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3C3.7 21 7.6 23.5 12 23.5Z" /><path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 0 1 0-4.4v-3H1.8a11.5 11.5 0 0 0 0 10.4Z" /><path fill="#EA4335" d="M12 5.1c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.1 11.1 0 0 0 12 .5C7.6.5 3.7 3 1.8 6.8l3.8 3c.9-2.8 3.4-4.7 6.4-4.7Z" /></svg>,
  bird: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 19h18" /><circle cx="12" cy="10" r="4" /><path d="M12 14v5" /></svg>,
};

const SOCIALS = {
  instagram: { label: "Instagram", base: "instagram.com/", path: "M12 8.2A3.8 3.8 0 1 0 15.8 12 3.8 3.8 0 0 0 12 8.2Zm0 6.2A2.4 2.4 0 1 1 14.4 12 2.4 2.4 0 0 1 12 14.4ZM17 3H7a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4Zm2.6 14a2.6 2.6 0 0 1-2.6 2.6H7A2.6 2.6 0 0 1 4.4 17V7A2.6 2.6 0 0 1 7 4.4h10A2.6 2.6 0 0 1 19.6 7Zm-3-9.6a.95.95 0 1 0 .95.95.95.95 0 0 0-.95-.95Z" },
  x: { label: "X", base: "x.com/", path: "M17.3 3h3.2l-7 8 8.2 10h-6.4l-5-6.1L4.5 21H1.3l7.5-8.6L1 3h6.6l4.5 5.6Zm-1.1 16h1.8L7.9 4.8H6Z" },
  youtube: { label: "YouTube", base: "youtube.com/@", path: "M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.6 2.6 0 0 0-1.8 1.8A27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8ZM10 15.1V8.9l5.3 3.1Z" },
  tiktok: { label: "TikTok", base: "tiktok.com/@", path: "M16.5 2h-3v13.2a2.7 2.7 0 1 1-2.2-2.7v-3a5.7 5.7 0 1 0 5.2 5.7V9a7 7 0 0 0 4.1 1.3V7.3a4.1 4.1 0 0 1-4.1-4.1Z" },
  linkedin: { label: "LinkedIn", base: "linkedin.com/in/", path: "M6.2 21H3V9h3.2ZM4.6 7.5A1.9 1.9 0 1 1 6.5 5.6a1.9 1.9 0 0 1-1.9 1.9ZM21 21h-3.2v-6.1c0-1.6-.6-2.5-1.9-2.5a2 2 0 0 0-1.9 1.4 2.6 2.6 0 0 0-.1.9V21H10.7V9h3.2v1.7a3.6 3.6 0 0 1 3.2-1.9c2.2 0 3.9 1.5 3.9 4.7Z" },
  github: { label: "GitHub", base: "github.com/", path: "M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.3-3.4-1.3a2.7 2.7 0 0 0-1.1-1.5c-.9-.6.1-.6.1-.6a2.1 2.1 0 0 1 1.6 1 2.2 2.2 0 0 0 3 .9 2.2 2.2 0 0 1 .6-1.4c-2.2-.2-4.6-1.1-4.6-5a3.9 3.9 0 0 1 1-2.7 3.6 3.6 0 0 1 .1-2.7s.9-.3 2.8 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1a3.6 3.6 0 0 1 .1 2.7 3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.8-4.6 5a2.5 2.5 0 0 1 .7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" },
  spotify: { label: "Spotify", base: "open.spotify.com/user/", path: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm4.3 14.5a.8.8 0 0 1-1.1.3 11.4 11.4 0 0 0-6-1.5 12 12 0 0 0-2.4.3.8.8 0 1 1-.4-1.5 13.5 13.5 0 0 1 2.8-.3 13 13 0 0 1 6.8 1.7.8.8 0 0 1 .3 1Zm1.2-3a1 1 0 0 1-1.3.3 14.3 14.3 0 0 0-7.2-1.8 15 15 0 0 0-3.1.4 1 1 0 0 1-.5-1.9 17 17 0 0 1 3.6-.4 16.2 16.2 0 0 1 8.2 2.1 1 1 0 0 1 .3 1.3Zm1.2-3.2a1.2 1.2 0 0 1-1.6.4A17.4 17.4 0 0 0 9.4 8.6a18.4 18.4 0 0 0-3.6.4 1.2 1.2 0 1 1-.6-2.3A20.8 20.8 0 0 1 9.4 6a19.8 19.8 0 0 1 9 2.1 1.2 1.2 0 0 1 .3 1.2Z" },
  whatsapp: { label: "WhatsApp", base: "wa.me/", path: "M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.36a9.87 9.87 0 0 0 4.62 1.15h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.03c-.24.68-1.19 1.25-1.95 1.41-.52.11-1.2.2-3.48-.75-2.92-1.21-4.8-4.17-4.94-4.37-.14-.19-1.18-1.57-1.18-3 0-1.43.75-2.13 1.02-2.42.24-.26.62-.38.99-.38.12 0 .23 0 .33.01.29.01.44.03.63.49.24.58.81 2.02.88 2.17.07.15.12.32.02.51-.09.19-.14.31-.28.48-.14.16-.29.36-.42.48-.14.13-.28.27-.12.54.16.27.71 1.17 1.53 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.18-.27.36-.22.6-.13.24.09 1.53.72 1.79.85.26.13.44.19.5.3.06.11.06.6-.18 1.28Z" },
  email: { label: "Email", base: "mailto:", path: "M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 2-8 5.2L4 6Zm0 12H4V8.1l7.5 4.9a1 1 0 0 0 1 0L20 8.1Z" },
  website: { label: "Website", base: "", path: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm7.9 9h-3.1a15.4 15.4 0 0 0-1.3-5.6A8 8 0 0 1 19.9 11ZM12 4c.9 1.1 2 3.3 2.2 7H9.8C10 7.3 11.1 5.1 12 4ZM8.5 5.4A15.4 15.4 0 0 0 7.2 11H4.1a8 8 0 0 1 4.4-5.6ZM4.1 13h3.1a15.4 15.4 0 0 0 1.3 5.6A8 8 0 0 1 4.1 13ZM12 20c-.9-1.1-2-3.3-2.2-7h4.4c-.2 3.7-1.3 5.9-2.2 7Zm3.5-1.4a15.4 15.4 0 0 0 1.3-5.6h3.1a8 8 0 0 1-4.4 5.6Z" },
};

function SocialIcon({ name, size = 21 }) {
  const s = SOCIALS[name];
  if (!s) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={s.path} />
    </svg>
  );
}

/* -------------------------------------------------------------- 3. STORAGE */

import { supabase } from "./supabaseClient.js";

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

/* Unused now that Supabase Auth hashes passwords server-side; kept only
   so passwordScore()/passwordError() below (unrelated helpers) still parse. */
function digest(str) {
  let h1 = 0x811c9dc5, h2 = 0x1000193;
  const salted = `tapit::${str}`;
  for (let i = 0; i < salted.length; i++) {
    const c = salted.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
    h2 = Math.imul(h2 + c + i, 2654435761) >>> 0;
  }
  return (h1.toString(36) + h2.toString(36)).padStart(14, "0");
}

/* Assembles the in-memory "rec" shape ({account, profile, links, analytics})
   that the rest of the app already expects, from Supabase rows. */
function recFromRow(row, links, analytics, email) {
  return {
    account: {
      id: row.id,
      username: row.username,
      name: row.display_name || "",
      email: email || "",
      createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
      onboarded: !!row.onboarded,
      deactivated: !!row.deactivated,
      google: false,
    },
    profile: {
      displayName: row.display_name || "",
      bio: row.bio || "",
      phone: row.phone || "",
      avatar: row.avatar_url || null,
      cover: row.cover_url || null,
      theme: row.theme || "dawn",
      customBg: row.custom_bg || "#FFFFFF",
      customBg2: row.custom_bg2 || "#6C5CE7",
      customBgType: row.custom_bg_type || "solid",
      customBgAngle: row.custom_bg_angle ?? 165,
      customText: row.custom_text || "",
      customCard: row.custom_card || "",
      customCardText: row.custom_card_text || "",
      customBorder: row.custom_border || "",
      customAccent: row.custom_accent || "#6C5CE7",
      coverBlur: !!row.cover_blur,
      bgPhoto: row.bg_photo || null,
      bgPhotoOverlay: row.bg_photo_overlay ?? 45,
      bgPhotoBlur: !!row.bg_photo_blur,
      bgPhotoTextMode: row.bg_photo_text_mode || "light",
      fontScale: row.font_scale || 100,
      buttonStyle: row.button_style || "soft",
      radius: row.radius || "round",
      font: row.font || "manrope",
      socials: row.socials || [],
    },
    links: links || [],
    analytics: analytics || { views: [], clicks: [] },
  };
}

const db = {
  async usernameTaken(username) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username.toLowerCase())
      .maybeSingle();
    return Boolean(data);
  },

  /* Loads a full rec by username. Analytics rows are only returned by
     Supabase when the caller IS the owner (Row Level Security enforces
     this server-side), so this is safe to call for any visitor. */
  async user(username) {
    if (!username) return null;
    const { data: profileRow, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username.toLowerCase())
      .maybeSingle();
    if (error || !profileRow) return null;

    const { data: linkRows } = await supabase
      .from("links")
      .select("*")
      .eq("owner_id", profileRow.id)
      .order("position", { ascending: true });

    const links = (linkRows || []).map((l) => ({
      id: l.id,
      title: l.title,
      url: l.url,
      icon: l.icon || "",
      badge: l.badge || "",
      type: l.type || "link",
      active: l.active !== false,
      clicks: l.clicks || 0,
      createdAt: l.created_at ? new Date(l.created_at).getTime() : Date.now(),
    }));

    const { data: eventRows } = await supabase
      .from("analytics_events")
      .select("*")
      .eq("owner_id", profileRow.id);

    const analytics = { views: [], clicks: [] };
    (eventRows || []).forEach((e) => {
      const t = new Date(e.created_at).getTime();
      if (e.event_type === "view") analytics.views.push({ t });
      else analytics.clicks.push({ t, linkId: e.link_id });
    });

    let email = "";
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user?.id === profileRow.id) {
      email = sessionData.session.user.email || "";
    }

    return recFromRow(profileRow, links, analytics, email);
  },

  /* Persists profile fields + syncs the links table to match rec.links
     exactly (upsert survivors, delete anything removed). RLS ensures a
     user can only ever write rows where owner_id/id is their own auth id. */
  async saveUser(rec) {
    const { account, profile, links } = rec;

    await supabase
      .from("profiles")
      .update({
        display_name: profile.displayName ?? account.name ?? "",
        bio: profile.bio || "",
        phone: profile.phone || null,
        avatar_url: profile.avatar || null,
        cover_url: profile.cover || null,
        theme: profile.theme || "dawn",
        custom_bg: profile.customBg || "#FFFFFF",
        custom_bg2: profile.customBg2 || "#6C5CE7",
        custom_bg_type: profile.customBgType || "solid",
        custom_bg_angle: profile.customBgAngle ?? 165,
        custom_text: profile.customText || null,
        custom_card: profile.customCard || null,
        custom_card_text: profile.customCardText || null,
        custom_border: profile.customBorder || null,
        custom_accent: profile.customAccent || "#6C5CE7",
        cover_blur: !!profile.coverBlur,
        bg_photo: profile.bgPhoto || null,
        bg_photo_overlay: profile.bgPhotoOverlay ?? 45,
        bg_photo_blur: !!profile.bgPhotoBlur,
        bg_photo_text_mode: profile.bgPhotoTextMode || "light",
        font_scale: profile.fontScale || 100,
        button_style: profile.buttonStyle || "soft",
        radius: profile.radius || "round",
        font: profile.font || "manrope",
        socials: profile.socials || [],
        onboarded: !!account.onboarded,
      })
      .eq("id", account.id);

    if (links) {
      const rows = links.map((l, i) => ({
        id: l.id,
        owner_id: account.id,
        title: l.title,
        url: l.url || "", // headers have no url — DB column is NOT NULL, so store "" instead of null
        icon: l.icon || "",
        badge: l.badge || "",
        type: l.type || "link",
        active: l.active !== false,
        clicks: l.clicks || 0,
        position: i,
      }));
      if (rows.length) {
        const { error: linksErr } = await supabase.from("links").upsert(rows);
        if (linksErr) throw new Error("Couldn't save your links: " + linksErr.message);
      }
      const { data: existing } = await supabase
        .from("links")
        .select("id")
        .eq("owner_id", account.id);
      const keepIds = new Set(links.map((l) => l.id));
      const toDelete = (existing || []).map((r) => r.id).filter((id) => !keepIds.has(id));
      if (toDelete.length) {
        const { error: delErr } = await supabase.from("links").delete().in("id", toDelete);
        if (delErr) throw new Error("Couldn't delete a link: " + delErr.message);
      }
    }

    return rec;
  },

  async logView(ownerId) {
    await supabase.from("analytics_events").insert({ owner_id: ownerId, event_type: "view" });
  },

  async logClick(ownerId, linkId) {
    await supabase
      .from("analytics_events")
      .insert({ owner_id: ownerId, link_id: linkId, event_type: "click" });
    const { data: link } = await supabase.from("links").select("clicks").eq("id", linkId).maybeSingle();
    if (link) {
      await supabase.from("links").update({ clicks: (link.clicks || 0) + 1 }).eq("id", linkId);
    }
  },
};

/* ------------------------------------------------- 4. VALIDATION / SECURITY */

const RESERVED = new Set([
  "login", "signup", "signin", "register", "dashboard", "onboarding", "settings", "admin",
  "about", "privacy", "terms", "pricing", "features", "help", "support", "api", "app",
  "forgot-password", "reset-password", "tap-it", "www", "explore", "new", "u", "me",
]);

const USERNAME_RE = /^[a-z0-9](?:[a-z0-9._]{1,18})[a-z0-9]$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/* wa.me links just need the phone number's digits, country code included,
   no +, spaces, dashes or leading zeros after the country code. */
function whatsappDigits(raw) {
  const digits = String(raw || "").replace(/[^\d]/g, "");
  return digits;
}
function whatsappUrl(raw) {
  const digits = whatsappDigits(raw);
  if (digits.length < 8 || digits.length > 15) return null;
  return "https://wa.me/" + digits;
}

const clean = (s, max = 240) =>
  String(s ?? "").replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, max);

/* Like clean(), but keeps newlines — for multi-line fields like bio. */
const cleanMultiline = (s, max = 240) =>
  String(s ?? "").replace(/[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);

function usernameError(raw) {
  const u = String(raw || "").toLowerCase();
  if (!u) return "Pick a username.";
  if (u.length < 3) return "Usernames need at least 3 characters.";
  if (u.length > 20) return "Usernames max out at 20 characters.";
  if (!/^[a-z0-9._]+$/.test(u)) return "Use letters, numbers, dots and underscores only.";
  if (!USERNAME_RE.test(u)) return "Start and end with a letter or number.";
  if (/[._]{2,}/.test(u)) return "No repeated dots or underscores.";
  if (RESERVED.has(u)) return "That name is reserved by Tap-it.";
  return null;
}

function emailError(raw) {
  const e = String(raw || "").trim();
  if (!e) return "Enter an email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "That doesn't look like a valid email.";
  return null;
}

function passwordScore(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}
const STRENGTH = [
  { label: "Too short", color: "#D64550" },
  { label: "Weak", color: "#D64550" },
  { label: "Fair", color: "#E8A33D" },
  { label: "Good", color: "#3FAE7A" },
  { label: "Strong", color: "#0E9F6E" },
];
function passwordError(pw) {
  if (!pw) return "Enter a password.";
  if (pw.length < 8) return "Passwords need at least 8 characters.";
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return "Mix in at least one letter and one number.";
  return null;
}

/* Blocks javascript:, data:, vbscript: and normalises bare domains. */
function safeUrl(raw) {
  let v = clean(raw, 400);
  if (!v) return null;
  if (/^(javascript|data|vbscript|file):/i.test(v.replace(/\s/g, ""))) return null;
  if (/^mailto:/i.test(v) || /^tel:/i.test(v)) return v;
  if (!/^https?:\/\//i.test(v)) v = "https://" + v.replace(/^\/+/, "");
  try {
    const u = new URL(v);
    if (!/^https?:$/.test(u.protocol)) return null;
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}
const prettyUrl = (u) => String(u).replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");

/* Simple client-side throttle for auth attempts. */
const throttle = { login: {}, signup: 0 };
function checkThrottle(bucket, key, max, windowMs) {
  const now = Date.now();
  const arr = (throttle[bucket][key] = (throttle[bucket][key] || []).filter((t) => now - t < windowMs));
  if (arr.length >= max) return Math.ceil((windowMs - (now - arr[0])) / 1000);
  arr.push(now);
  return 0;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M" : n >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K" : String(n));
const dayKey = (d) => new Date(d).toISOString().slice(0, 10);

/* ----------------------------------------------------------- 5. PRIMITIVES */

const ToastCtx = createContext(() => {});
const ThemeCtx = createContext({ theme: "light", toggleTheme: () => {} });
function useTheme() { return useContext(ThemeCtx); }
const useToast = () => useContext(ToastCtx);

function ToastHost({ items, dismiss }) {
  return (
    <div className="toasts" role="region" aria-live="polite" aria-label="Notifications">
      {items.map((t) => (
        <div key={t.id} className={"toast " + (t.kind || "ok")}>
          <i style={{ display: "flex", marginTop: 1 }}>{t.kind === "bad" ? I.alert : I.check}</i>
          <span className="grow">{t.msg}</span>
          {t.action && (
            <button
              className="btn btn-sm"
              style={{ background: "rgba(255,255,255,.14)", color: "#fff", padding: "4px 10px" }}
              onClick={() => { t.action.run(); dismiss(t.id); }}
            >
              {t.action.label}
            </button>
          )}
          <button className="icobtn" style={{ color: "#A3A3A3", padding: 4 }} onClick={() => dismiss(t.id)} aria-label="Dismiss">
            {I.x}
          </button>
        </div>
      ))}
    </div>
  );
}

function Button({ variant = "p", size, loading, children, className = "", ...rest }) {
  return (
    <button
      className={`btn btn-${variant} ${size ? "btn-" + size : ""} ${className}`}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && <span className="spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

function Field({ label, error, hint, id, children, right }) {
  return (
    <div className="fld">
      {label && (
        <div className="row-b" style={{ marginBottom: 6 }}>
          <label className="fld-lab" htmlFor={id} style={{ marginBottom: 0 }}>{label}</label>
          {right}
        </div>
      )}
      {children}
      {error && <div className="err">{I.alert}<span>{error}</span></div>}
      {!error && hint && <div className="hint">{hint}</div>}
    </div>
  );
}

function TextInput({ id, error, ...rest }) {
  return <input id={id} className="inp" aria-invalid={error ? "true" : undefined} {...rest} />;
}

function PasswordInput({ id, error, ...rest }) {
  const [show, setShow] = useState(false);
  return (
    <div className="inp-wrap">
      <input id={id} type={show ? "text" : "password"} className="inp" aria-invalid={error ? "true" : undefined} {...rest} />
      <button type="button" className="inp-btn" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}>
        {show ? I.eyeOff : I.eye}
      </button>
    </div>
  );
}

function Modal({ open, onClose, title, children, footer, labelledBy = "mdl-t" }) {
  const ref = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onCloseRef.current();
      if (e.key === "Tab" && ref.current) {
        const f = ref.current.querySelectorAll('button,input,select,textarea,a[href],[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => {
      const el = ref.current?.querySelector("input,textarea") || ref.current?.querySelector("button");
      el?.focus();
    }, 40);
    return () => { document.removeEventListener("keydown", onKey); clearTimeout(t); };
  }, [open]);
  if (!open) return null;
  return (
    <div className="ovl" onMouseDown={(e) => e.target === e.currentTarget && onCloseRef.current()}>
      <div className="mdl" role="dialog" aria-modal="true" aria-labelledby={labelledBy} ref={ref}>
        <div className="row-b" style={{ padding: "20px 22px 0" }}>
          <h3 id={labelledBy} style={{ fontSize: 19 }}>{title}</h3>
          <button className="icobtn" onClick={onClose} aria-label="Close">{I.x}</button>
        </div>
        <div style={{ padding: "16px 22px 0" }}>{children}</div>
        {footer && <div className="row" style={{ padding: "20px 22px 22px", justifyContent: "flex-end" }}>{footer}</div>}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, body, action }) {
  return (
    <div className="empty">
      <div className="empty-i">{icon}</div>
      <h3 style={{ fontSize: 17 }}>{title}</h3>
      <p className="mut sm" style={{ marginTop: 7, maxWidth: "42ch", marginLeft: "auto", marginRight: "auto" }}>{body}</p>
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  );
}

function Skeleton({ h = 16, w = "100%", r = 10, style }) {
  return <div className="sk" style={{ height: h, width: w, borderRadius: r, ...style }} />;
}

function Avatar({ src, name, size = 40, bg = "#EBEBEB", fg = "#3D3D3D", radius = "50%" }) {
  const initials = (name || "?")
    .split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  return (
    <div
      style={{
        width: size, height: size, borderRadius: radius, background: bg, color: fg,
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
        fontFamily: "var(--disp)", fontWeight: 800, fontSize: size * 0.38, flex: "none",
      }}
      aria-hidden="true"
    >
      {src ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
    </div>
  );
}

function Logo({ onClick, size = 26 }) {
  const { theme } = useTheme();
  const inner = (
    <>
      {I.logo(size, theme === "dark")}
      <span>Tap-it</span>
    </>
  );
  return onClick ? (
    <button className="logo" onClick={onClick} aria-label="Tap-it home">{inner}</button>
  ) : (
    <span className="logo">{inner}</span>
  );
}

/* --------------------------------------------- 6. THEMES + PROFILE PREVIEW */

const THEMES = [
  { id: "dawn", name: "Dawn", bg: "linear-gradient(170deg,#FFF6F0 0%,#F3EEFF 100%)", text: "#241F33", card: "#FFFFFF", cardText: "#241F33", border: "#EBE4F7", accent: "#6C5CE7", shadow: "0 6px 18px -10px rgba(60,40,110,.35)" },
  { id: "midnight", name: "Midnight", bg: "linear-gradient(170deg,#171331 0%,#0C0A18 100%)", text: "#F3F1FB", card: "rgba(255,255,255,.08)", cardText: "#F3F1FB", border: "rgba(255,255,255,.16)", accent: "#A78BFA", shadow: "none" },
  { id: "lilac", name: "Lilac", bg: "linear-gradient(165deg,#6C5CE7 0%,#8B5CF6 100%)", text: "#FFFFFF", card: "rgba(255,255,255,.16)", cardText: "#FFFFFF", border: "rgba(255,255,255,.30)", accent: "#FFFFFF", shadow: "none" },
  { id: "paper", name: "Paper", bg: "#F6F5F2", text: "#1B1A17", card: "#FFFFFF", cardText: "#1B1A17", border: "#E3E1DA", accent: "#1B1A17", shadow: "0 2px 0 0 #1B1A17" },
  { id: "moss", name: "Moss", bg: "linear-gradient(170deg,#EDF6F0 0%,#DDEDE4 100%)", text: "#17312A", card: "#FFFFFF", cardText: "#17312A", border: "#CBE1D6", accent: "#1F7A5C", shadow: "0 6px 16px -10px rgba(20,60,45,.4)" },
  { id: "ember", name: "Ember", bg: "linear-gradient(170deg,#2A1720 0%,#12090F 100%)", text: "#FDEDE6", card: "rgba(255,255,255,.07)", cardText: "#FDEDE6", border: "rgba(255,160,120,.28)", accent: "#FF9B6A", shadow: "none" },
  { id: "mono", name: "Monochrome", bg: "#FFFFFF", text: "#000000", card: "#000000", cardText: "#FFFFFF", border: "#000000", accent: "#000000", shadow: "none" },
];
const themeById = (id) => THEMES.find((t) => t.id === id) || THEMES[0];

/* Luminance test — same idea as pickContrast() below, but returns a
   boolean so callers can pick light/dark supporting colors. */
function isLightColor(hex) {
  const h = String(hex || "").replace("#", "");
  if (h.length !== 6) return true;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

/* Builds a full theme object (same shape as THEMES entries) from the
   user's own picked colors. Any color left blank falls back to a
   sensible value derived from the background, so partial customization
   still looks coherent. */
function buildCustomTheme(colors = {}) {
  const safeBg = /^#[0-9a-f]{6}$/i.test(colors.bg || "") ? colors.bg : "#FFFFFF";
  const safeBg2 = /^#[0-9a-f]{6}$/i.test(colors.bg2 || "") ? colors.bg2 : "#FFFFFF";
  const angle = Number.isFinite(colors.bgAngle) ? colors.bgAngle : 165;
  const isGradient = colors.bgType === "gradient";
  const bgCss = isGradient ? `linear-gradient(${angle}deg, ${safeBg} 0%, ${safeBg2} 100%)` : safeBg;
  // Luminance/contrast decisions use the first color even in gradient mode —
  // a full blend check isn't worth it for picking text/card fallbacks.
  const light = isLightColor(safeBg);
  const fallbackText = light ? "#17151F" : "#FFFFFF";
  const fallbackCard = light ? "rgba(0,0,0,.045)" : "rgba(255,255,255,.09)";
  const fallbackBorder = light ? "rgba(0,0,0,.10)" : "rgba(255,255,255,.16)";
  const safe = (v, fallback) => (/^#[0-9a-f]{6}$/i.test(v || "") ? v : fallback);
  return {
    id: "custom",
    name: "Custom",
    bg: bgCss,
    text: safe(colors.text, fallbackText),
    card: safe(colors.card, fallbackCard) || fallbackCard,
    cardText: safe(colors.cardText, safe(colors.text, fallbackText)),
    border: safe(colors.border, fallbackBorder) || fallbackBorder,
    accent: safe(colors.accent, safeBg),
    shadow: light ? "0 6px 18px -10px rgba(20,20,30,.25)" : "none",
  };
}

/* Builds a theme object for the "Photo" preset: a full-bleed uploaded
   background image with a dark/light overlay for text contrast. */
function buildPhotoTheme(profile = {}) {
  const overlay = Number.isFinite(profile.bgPhotoOverlay) ? profile.bgPhotoOverlay : 45;
  const dark = profile.bgPhotoTextMode !== "dark"; // default: light text on photo
  return {
    id: "photo",
    name: "Photo",
    bg: profile.bgPhoto ? `linear-gradient(rgba(0,0,0,${overlay / 100}),rgba(0,0,0,${overlay / 100})), url(${profile.bgPhoto})` : "#1B1A17",
    bgSize: "cover",
    bgPosition: "center",
    text: dark ? "#FFFFFF" : "#17151F",
    card: dark ? "rgba(255,255,255,.14)" : "rgba(255,255,255,.75)",
    cardText: dark ? "#FFFFFF" : "#17151F",
    border: dark ? "rgba(255,255,255,.28)" : "rgba(0,0,0,.14)",
    accent: dark ? "#FFFFFF" : "#17151F",
    shadow: "none",
  };
}

/* Resolves a profile's active theme, including the custom case. */
function getTheme(profile) {
  if (profile?.theme === "custom") {
    return buildCustomTheme({
      bg: profile.customBg,
      bg2: profile.customBg2,
      bgType: profile.customBgType,
      bgAngle: profile.customBgAngle,
      text: profile.customText,
      card: profile.customCard,
      cardText: profile.customCardText,
      border: profile.customBorder,
      accent: profile.customAccent,
    });
  }
  if (profile?.theme === "photo") {
    return buildPhotoTheme(profile);
  }
  return themeById(profile?.theme);
}

const BUTTON_STYLES = [
  { id: "soft", name: "Soft" },
  { id: "solid", name: "Solid" },
  { id: "outline", name: "Outline" },
  { id: "lift", name: "Lifted" },
];
const RADII = [
  { id: "pill", name: "Pill", v: 999 },
  { id: "round", name: "Rounded", v: 16 },
  { id: "square", name: "Square", v: 4 },
];
const FONTS = [
  { id: "manrope", name: "Manrope", stack: "'Manrope','Inter',sans-serif" },
  { id: "inter", name: "Inter", stack: "'Inter',system-ui,sans-serif" },
  { id: "serif", name: "Serif", stack: "Georgia,'Times New Roman',serif" },
  { id: "poppins", name: "Poppins", stack: "'Poppins','Inter',sans-serif" },
  { id: "playfair", name: "Playfair", stack: "'Playfair Display',Georgia,serif" },
  { id: "oswald", name: "Oswald", stack: "'Oswald','Inter',sans-serif" },
  { id: "caveat", name: "Handwritten", stack: "'Caveat','Manrope',cursive" },
  { id: "mono", name: "Mono", stack: "'Space Mono','Courier New',monospace" },
];

function linkStyleFor(theme, appearance) {
  const r = RADII.find((x) => x.id === appearance.radius)?.v ?? 16;
  const base = { borderRadius: r, color: theme.cardText };
  switch (appearance.buttonStyle) {
    case "solid":
      return { ...base, background: theme.accent, color: theme.id === "paper" ? "#fff" : pickContrast(theme.accent), border: "1px solid transparent" };
    case "outline":
      return { ...base, background: "transparent", border: `1.5px solid ${theme.border}`, color: theme.text };
    case "lift":
      return { ...base, background: theme.card, border: `1px solid ${theme.border}`, boxShadow: theme.shadow === "none" ? "0 8px 18px -12px rgba(0,0,0,.7)" : theme.shadow };
    default:
      return { ...base, background: theme.card, border: `1px solid ${theme.border}` };
  }
}
function pickContrast(hex) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "#fff";
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#17151F" : "#FFFFFF";
}

function saveContact(profile, username) {
  const name = clean(profile.displayName, 60) || username || "Contact";
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${name}`,
    profile.phone ? `TEL;TYPE=CELL:${profile.phone}` : null,
    username ? `URL:${window.location.origin}${window.location.pathname}#/${username}` : null,
    "END:VCARD",
  ].filter(Boolean);
  const blob = new Blob([lines.join("\r\n")], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(username || name).replace(/\s+/g, "-")}.vcf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** The one component reused by the hero mockup, onboarding, dashboard preview and the public page. */
function ProfileCanvas({ profile, links, interactive = false, onLinkClick, username, fillParentBg = false }) {
  const theme = getTheme(profile);
  const appearance = { buttonStyle: profile.buttonStyle || "soft", radius: profile.radius || "round" };
  const font = FONTS.find((f) => f.id === (profile.font || "manrope"))?.stack || FONTS[0].stack;
  const live = links.filter((l) => l.active !== false);

  return (
    <div className="pf" style={{ background: fillParentBg ? "none" : theme.bg, backgroundSize: theme.bgSize || "auto", backgroundPosition: theme.bgPosition || "center", backgroundRepeat: "no-repeat", color: theme.text, fontFamily: font, "--fs-scale": (profile.fontScale || 100) / 100 }}>
      {profile.cover && (
        <div className="pf-cover" style={{ backgroundImage: `url(${profile.cover})`, border: `1px solid ${theme.border}`, filter: profile.coverBlur ? "blur(6px)" : "none" }} />
      )}
      <div
        className="pf-av"
        style={{ background: profile.avatar ? "transparent" : theme.card, color: theme.cardText, border: `1px solid ${theme.border}`, marginTop: profile.cover ? -44 : 0 }}
      >
        {profile.avatar ? <img src={profile.avatar} alt="" /> : (profile.displayName || "?").slice(0, 1).toUpperCase()}
      </div>
      <div className="pf-name">{profile.displayName || "Your name"}</div>
      {profile.bio ? <p className="pf-bio" style={{ textAlign: "center", whiteSpace: "pre-line" }}>{profile.bio}</p> : <p className="pf-bio" style={{ opacity: 0.4 }}>Add a short bio in Appearance.</p>}

      {profile.phone && (
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <button
            type="button"
            className="pf-lnk"
            style={{ ...linkStyleFor(theme, appearance), display: "inline-flex", width: "auto", padding: "8px 18px", fontSize: 13.5, gap: 7 }}
            onClick={() => interactive && saveContact(profile, username)}
          >
            {I.check} Save contact
          </button>
        </div>
      )}

      {profile.socials?.length > 0 && (
        <div className="pf-soc">
          {profile.socials.map((s) => (
            <a
              key={s.platform + s.url}
              href={interactive ? s.url : undefined}
              target={/^(mailto:|tel:|sms:)/i.test(s.url || "") ? undefined : "_blank"}
              rel="noopener noreferrer nofollow"
              onClick={(e) => { if (!interactive) e.preventDefault(); else onLinkClick?.({ id: "social:" + s.platform, title: SOCIALS[s.platform]?.label || s.platform }); }}
              aria-label={SOCIALS[s.platform]?.label || s.platform}
              style={{ color: theme.text }}
            >
              <SocialIcon name={s.platform} />
            </a>
          ))}
        </div>
      )}

      <div className="pf-links">
        {live.length === 0 && (
          <div style={{ textAlign: "center", opacity: 0.55, fontSize: 13.5, padding: "26px 0" }}>
            No links yet. Add one and it shows up here instantly.
          </div>
        )}
        {live.map((l, i) =>
          l.type === "header" ? (
            <div className="pf-hd" key={l.id} style={{ animationDelay: `${i * 45}ms` }}>{l.title}</div>
          ) : (
            <a
              key={l.id}
              className="pf-lnk"
              href={interactive ? l.url : undefined}
              target={/^(mailto:|tel:|sms:)/i.test(l.url || "") ? undefined : "_blank"}
              rel="noopener noreferrer nofollow"
              style={{ ...linkStyleFor(theme, appearance), animationDelay: `${i * 45}ms` }}
              onClick={(e) => { if (!interactive) e.preventDefault(); else onLinkClick?.(l); }}
            >
              {l.icon && <span style={{ display: "flex", opacity: 0.9 }}><SocialIcon name={l.icon} size={18} /></span>}
              <span className="grow trunc">{l.title}</span>
              {l.badge && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 7px", borderRadius: 99, background: "rgba(0,0,0,.10)" }}>
                  {l.badge}
                </span>
              )}
            </a>
          )
        )}
      </div>

      <div className="pf-foot">
        <span className="pf-foot-badge">Powered by Tap-it</span>
      </div>
    </div>
  );
}

function Phone({ children, className = "" }) {
  return (
    <div className={"phone " + className}>
      <div className="phone-notch" />
      <div className="phone-scr">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------- 7. AUTH + ROUTING */

const AuthCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);

function useHashRoute() {
  const read = () => {
    const h = window.location.hash.replace(/^#/, "") || "/";
    const [path, qs] = h.split("?");
    return { path: path.replace(/\/+$/, "") || "/", query: new URLSearchParams(qs || "") };
  };
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => { setRoute(read()); window.scrollTo({ top: 0, behavior: "auto" }); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const go = useCallback((to, opts) => {
    const target = to.startsWith("#") ? to.slice(1) : to;
    if (opts?.replace) window.location.replace("#" + target);
    else window.location.hash = target;
  }, []);
  return [route, go];
}

/* ------------------------------------------------------- 8. MARKETING PAGE */

function Nav({ go, user }) {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setStuck(window.scrollY > 8);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const jump = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <header className={"nav" + (stuck ? " stuck" : "")}>
      <div className="wrap nav-in">
        <Logo onClick={() => go("/")} />
        <nav className="row hide-sm" style={{ marginLeft: 18, gap: 2 }} aria-label="Main">
          <button className="nav-lnk" onClick={() => jump("features")}>Features</button>
          <button className="nav-lnk" onClick={() => jump("how")}>How it works</button>
        </nav>
        <div className="grow" />
        {user ? (
          <>
            <button className="nav-lnk hide-sm" onClick={() => go("/login")}>Log in</button>
            <Button size="sm" onClick={() => go("/dashboard")}>Go to dashboard</Button>
          </>
        ) : (
          <>
            <button className="nav-lnk hide-sm" onClick={() => go("/login")}>Log in</button>
            <Button size="sm" onClick={() => go("/signup")}>Get started</Button>
          </>
        )}
        <button
          className="icobtn only-sm"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={open}
        >
          {open ? I.x : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>}
        </button>
      </div>
      {open && (
        <div className="wrap only-sm" style={{ paddingBottom: 14 }}>
          <div className="card pad stack" style={{ "--gap": "4px" }}>
            <button className="nav-lnk" onClick={() => jump("features")}>Features</button>
            <button className="nav-lnk" onClick={() => jump("how")}>How it works</button>
            {!user && <button className="nav-lnk" onClick={() => { setOpen(false); go("/login"); }}>Log in</button>}
            {user && <button className="nav-lnk" onClick={() => { setOpen(false); go("/login"); }}>Switch account</button>}
          </div>
        </div>
      )}
    </header>
  );
}

const HERO_PROFILE = {
  displayName: "Nadia Hassan",
  bio: "Ceramicist in Lisbon. Studio notes, new drops, and the occasional kiln disaster.",
  avatar: null,
  socials: [{ platform: "instagram", url: "#" }, { platform: "youtube", url: "#" }, { platform: "spotify", url: "#" }, { platform: "email", url: "#" }],
  theme: "dawn", buttonStyle: "soft", radius: "round", font: "manrope",
};
const HERO_LINKS = [
  { id: "h0", type: "header", title: "This week", active: true },
  { id: "h1", title: "Spring glaze collection", url: "#", active: true, badge: "New" },
  { id: "h2", title: "Studio tour on YouTube", url: "#", active: true, icon: "youtube" },
  { id: "h3", title: "Wheel-throwing workshop", url: "#", active: true },
  { id: "h4", title: "Kiln playlist", url: "#", active: true, icon: "spotify" },
  { id: "h5", title: "Say hello", url: "#", active: true, icon: "email" },
];

function HeroMockup() {
  const [themeIdx, setThemeIdx] = useState(0);
  const order = ["dawn", "midnight", "lilac", "moss"];
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setThemeIdx((i) => (i + 1) % order.length), 4200);
    return () => clearInterval(t);
  }, []);
  const profile = { ...HERO_PROFILE, theme: order[themeIdx] };
  return (
    <div className="phone-stage">
      <div className="float" style={{ position: "relative" }}>
        <Phone>
          <ProfileCanvas profile={profile} links={HERO_LINKS} />
        </Phone>
        <div className="chip-float hide-sm" style={{ top: 82, left: -52 }}>
          <span style={{ color: "var(--p)", display: "flex" }}>{I.cursor}</span> 1,284 clicks
        </div>
        <div className="chip-float hide-sm" style={{ bottom: 128, right: -46 }}>
          <span style={{ color: "var(--p)", display: "flex" }}>{I.palette}</span> {themeById(order[themeIdx]).name}
        </div>
        <div className="chip-float hide-sm" style={{ bottom: 34, left: -34 }}>
          tap-it-nu.vercel.app/nadia
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: I.id, t: "Your own page", d: "Claim a username and get a page at tap-it-nu.vercel.app/you that you fully control." },
  { icon: I.sparkle, t: "A profile that sounds like you", d: "Photo, name, bio and social icons — edited live, saved the moment you hit save." },
  { icon: I.layers, t: "Unlimited links", d: "Websites, shops, videos, playlists, PDFs. Reorder them by dragging." },
  { icon: I.chart, t: "Clicks you can read", d: "See views, clicks and which links people actually tap, day by day." },
  { icon: I.palette, t: "Themes worth sharing", d: "Six themes, three button shapes, three typefaces. Preview before you publish." },
  { icon: I.share, t: "One URL, everywhere", d: "Drop it in Instagram, TikTok, YouTube, X or your email signature." },
];

const STEPS = [
  { n: "01", t: "Sign up", d: "Create your account and choose your unique username." },
  { n: "02", t: "Add your links", d: "Add social profiles, websites, products, videos, and anything else you want people to discover." },
  { n: "03", t: "Share your profile", d: "Put your unique URL in your Instagram, TikTok, YouTube, X, email signature, or anywhere else." },
];

const TESTIMONIALS = [
  { q: "I moved six link services into one page in an afternoon. My drops now sit above everything else and I can see what people tap.", n: "Marisol Vega", r: "Ceramicist" },
  { q: "The analytics are the part I didn't expect to use daily. Knowing which video link earns the clicks changed what I post.", n: "Dan Okoye", r: "Video essayist" },
  { q: "My students find the syllabus, office hours and reading list in one place. No more pinned posts nobody scrolls to.", n: "Priya Raman", r: "Lecturer" },
];

function Landing({ go, user }) {
  return (
    <>
      <Nav go={go} user={user} />
      <main>
        <section className="hero">
          <div className="hero-glow" />
          <div className="wrap hero-grid">
            <div>
              <span className="pill pill-n">Free to start — no card needed</span>
              <h1 className="h1" style={{ marginTop: 18 }}>One link. Everything you are.</h1>
              <p className="lede">
                Create a beautiful home for everything you create, share, and recommend. Bring your audience to one
                simple, customizable page.
              </p>
              <div className="hero-cta">
                <Button size="lg" onClick={() => go("/signup")}>Get started — it's free</Button>
                <Button variant="g" size="lg" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>
                  See how it works
                </Button>
              </div>
              <p className="hero-note">
                <span style={{ color: "var(--ok)", display: "flex" }}>{I.check}</span>
                Claim your username in under a minute
              </p>
            </div>
            <HeroMockup />
          </div>
        </section>

        <section className="sec" id="features">
          <div className="wrap">
            <div className="sec-h">
              <h2>Everything you need to be findable</h2>
              <p>A page, the links on it, and the numbers that tell you what's working.</p>
            </div>
            <div className="f-grid">
              {FEATURES.map((f) => (
                <div className="f-card" key={f.t}>
                  <div className="f-ico">{f.icon}</div>
                  <h3>{f.t}</h3>
                  <p>{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sec" id="how" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-h">
              <h2>Three steps to a live page</h2>
              <p>Most people finish before their coffee goes cold.</p>
            </div>
            <div className="steps">
              {STEPS.map((s) => (
                <div className="step" key={s.n}>
                  <div className="step-n">{s.n}</div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sec">
          <div className="wrap">
            <div className="cta-band">
              <h2>Your audience is waiting.</h2>
              <p>Create your page in minutes and give everyone one place to find you.</p>
              <div style={{ marginTop: 26 }}>
                <Button size="lg" onClick={() => go("/signup")}>Create your page</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer go={go} />
    </>
  );
}

function Footer({ go }) {
  const toast = useToast();
  const soon = (n) => toast(`${n} isn't part of this prototype yet.`, "bad");
  return (
    <footer className="foot">
      <div className="wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Logo onClick={() => go("/")} />
        <p className="mut sm" style={{ marginTop: 12, maxWidth: "32ch" }}>
          One page for everything you make. Built for people who publish in more than one place.
        </p>
      </div>
      <div className="wrap mut tiny" style={{ marginTop: 34, textAlign: "center" }}>
        © {new Date().getFullYear()} Tap-it.
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------ 9. AUTH PAGES */

function AuthShell({ go, children, footer }) {
  return (
    <div className="auth-page">
      <div style={{ marginBottom: 22 }}>
        <Logo onClick={() => go("/")} size={28} />
      </div>
      <div className="auth-card">{children}</div>
      {footer && <div className="mut sm" style={{ marginTop: 20, textAlign: "center" }}>{footer}</div>}
    </div>
  );
}

function Login({ go }) {
  const { login } = useAuth();
  const toast = useToast();
  const [f, setF] = useState({ email: "", password: "", remember: true });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [top, setTop] = useState("");

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setF((p) => ({ ...p, [k]: v }));
    setErrs((p) => ({ ...p, [k]: null }));
    setTop("");
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!f.email.trim()) next.email = "Enter your email.";
    else if (!EMAIL_RE.test(f.email.trim())) next.email = "That email doesn't look right.";
    if (!f.password) next.password = "Enter your password.";
    setErrs(next);
    if (Object.keys(next).length) return;

    const wait = checkThrottle("login", f.email.trim().toLowerCase(), 5, 60_000);
    if (wait) { setTop(`Too many attempts. Try again in ${wait}s.`); return; }

    setBusy(true);
    const res = await login(f.email, f.password, f.remember);
    setBusy(false);
    if (!res.ok) { setTop(res.error); return; }
    toast(`Welcome back, ${res.user.profile.displayName.split(" ")[0]}.`);
    go(res.user.onboarded ? "/dashboard" : "/onboarding", { replace: true });
  };

  return (
    <AuthShell go={go} footer={<>New to Tap-it? <button className="btn btn-q btn-sm" onClick={() => go("/signup")} style={{ padding: "2px 6px", color: "var(--p)", fontWeight: 600 }}>Sign up</button></>}>
      <h1>Welcome back</h1>
      <p className="mut sm" style={{ marginTop: 8 }}>Log in to continue to your account.</p>

      {top && (
        <div role="alert" style={{ marginTop: 18, background: "var(--bad-bg)", color: "#B3323C", padding: "11px 13px", borderRadius: 12, fontSize: 14, display: "flex", gap: 8 }}>
          <span style={{ display: "flex", marginTop: 2 }}>{I.alert}</span>{top}
        </div>
      )}

      <form onSubmit={submit} noValidate className="stack" style={{ marginTop: 20, "--gap": "16px" }}>
        <Field label="Email" id="li-email" error={errs.email}>
          <TextInput id="li-email" type="email" autoComplete="email" placeholder="you@example.com" value={f.email} onChange={set("email")} error={errs.email} />
        </Field>
        <Field
          label="Password"
          id="li-pw"
          error={errs.password}
          right={<button type="button" className="tiny" onClick={() => go("/forgot-password")} style={{ background: "none", border: 0, color: "var(--p)", fontWeight: 600, cursor: "pointer" }}>Forgot password?</button>}
        >
          <PasswordInput id="li-pw" autoComplete="current-password" placeholder="Your password" value={f.password} onChange={set("password")} error={errs.password} />
        </Field>
        <label className="chk">
          <input type="checkbox" checked={f.remember} onChange={set("remember")} />
          <span>Remember me on this device</span>
        </label>
        <Button type="submit" className="btn-blk" loading={busy}>{busy ? "Logging in" : "Log in"}</Button>
      </form>
    </AuthShell>
  );
}

function Signup({ go }) {
  const { signup } = useAuth();
  const toast = useToast();
  const [f, setF] = useState({ name: "", email: "", username: "", password: "", confirm: "", terms: false });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [top, setTop] = useState("");
  const [uState, setUState] = useState({ status: "idle", msg: "" });
  const timer = useRef(null);

  const set = (k) => (e) => {
    let v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    if (k === "username") v = v.toLowerCase().replace(/[^a-z0-9._]/g, "").slice(0, 20);
    setF((p) => ({ ...p, [k]: v }));
    setErrs((p) => ({ ...p, [k]: null }));
    setTop("");
  };

  useEffect(() => {
    clearTimeout(timer.current);
    const u = f.username;
    if (!u) { setUState({ status: "idle", msg: "" }); return; }
    const err = usernameError(u);
    if (err) { setUState({ status: "bad", msg: err }); return; }
    setUState({ status: "checking", msg: "Checking availability" });
    timer.current = setTimeout(async () => {
      const taken = await db.usernameTaken(u);
      setUState(taken
        ? { status: "bad", msg: `tap-it-nu.vercel.app/${u} is taken` }
        : { status: "ok", msg: `tap-it-nu.vercel.app/${u} is available` });
    }, 420);
    return () => clearTimeout(timer.current);
  }, [f.username]);

  const score = passwordScore(f.password);

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!clean(f.name)) next.name = "Tell us what to call you.";
    if (!f.email.trim()) next.email = "Enter your email.";
    else if (!EMAIL_RE.test(f.email.trim())) next.email = "That email doesn't look right.";
    const ue = usernameError(f.username);
    if (ue) next.username = ue;
    const pe = passwordError(f.password);
    if (pe) next.password = pe;
    if (f.confirm !== f.password) next.confirm = "Passwords don't match.";
    if (!f.terms) next.terms = "Accept the terms to continue.";
    setErrs(next);
    if (Object.keys(next).length) return;

    const wait = checkThrottle("login", "signup", 6, 60_000);
    if (wait) { setTop(`Too many attempts. Try again in ${wait}s.`); return; }

    setBusy(true);
    const res = await signup(f);
    setBusy(false);
    if (!res.ok) {
      if (res.field) setErrs({ [res.field]: res.error });
      else setTop(res.error);
      return;
    }
    toast("Account created. Let's set up your page.");
    go("/onboarding", { replace: true });
  };

  return (
    <AuthShell go={go} footer={<>Already have an account? <button className="btn btn-q btn-sm" onClick={() => go("/login")} style={{ padding: "2px 6px", color: "var(--p)", fontWeight: 600 }}>Log in</button></>}>
      <h1>Create your account</h1>
      <p className="mut sm" style={{ marginTop: 8 }}>Build your page and share everything you create.</p>

      {top && (
        <div role="alert" style={{ marginTop: 18, background: "var(--bad-bg)", color: "#B3323C", padding: "11px 13px", borderRadius: 12, fontSize: 14 }}>{top}</div>
      )}

      <form onSubmit={submit} noValidate className="stack" style={{ marginTop: 20, "--gap": "15px" }}>
        <Field label="Full name" id="su-name" error={errs.name}>
          <TextInput id="su-name" autoComplete="name" placeholder="Nadia Hassan" value={f.name} onChange={set("name")} error={errs.name} />
        </Field>
        <Field label="Email" id="su-email" error={errs.email}>
          <TextInput id="su-email" type="email" autoComplete="email" placeholder="you@example.com" value={f.email} onChange={set("email")} error={errs.email} />
        </Field>
        <Field
          label="Username"
          id="su-user"
          error={errs.username}
          hint={!f.username ? "Letters, numbers, dots and underscores. 3–20 characters." : undefined}
        >
          <div className="pfx">
            <span className="pfx-tag">tap-it-nu.vercel.app/</span>
            <input id="su-user" value={f.username} onChange={set("username")} placeholder="yourname" autoComplete="off" spellCheck="false" aria-describedby="su-user-state" />
          </div>
          <div id="su-user-state" aria-live="polite" style={{ marginTop: 7, minHeight: 20 }}>
            {uState.status === "checking" && <span className="mut tiny">{uState.msg}…</span>}
            {uState.status === "ok" && <span className="pill pill-ok">{I.check} {uState.msg}</span>}
            {uState.status === "bad" && <span className="pill pill-bad">{I.x} {uState.msg}</span>}
          </div>
        </Field>
        <Field label="Password" id="su-pw" error={errs.password}>
          <PasswordInput id="su-pw" autoComplete="new-password" placeholder="At least 8 characters" value={f.password} onChange={set("password")} error={errs.password} />
          {f.password && (
            <>
              <div className="meter" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <i key={i} style={{ background: i < score ? STRENGTH[score].color : undefined }} />
                ))}
              </div>
              <div className="hint" aria-live="polite">
                Strength: <b style={{ color: STRENGTH[score].color }}>{STRENGTH[score].label}</b> — 8+ characters with a letter and a number is the minimum.
              </div>
            </>
          )}
        </Field>
        <Field label="Confirm password" id="su-pw2" error={errs.confirm}>
          <PasswordInput id="su-pw2" autoComplete="new-password" placeholder="Type it again" value={f.confirm} onChange={set("confirm")} error={errs.confirm} />
        </Field>
        <div>
          <label className="chk">
            <input type="checkbox" checked={f.terms} onChange={set("terms")} />
            <span>I agree to the Tap-it terms of service and privacy policy.</span>
          </label>
          {errs.terms && <div className="err">{I.alert}<span>{errs.terms}</span></div>}
        </div>
        <Button type="submit" className="btn-blk" loading={busy}>{busy ? "Creating account" : "Create account"}</Button>
      </form>
    </AuthShell>
  );
}

function ForgotPassword({ go }) {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) { setErr("Enter the email on your account."); return; }
    setBusy(true);
    // Supabase sends the actual email and never reveals whether the
    // address is registered — same response either way, by design.
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}${window.location.pathname}#/reset-password`,
    });
    setBusy(false);
    setSent(true);
  };

  if (sent) {
    return (
      <AuthShell go={go}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: "var(--ok-bg)", color: "#0A7A55", display: "flex", alignItems: "center", justifyContent: "center" }}>{I.check}</div>
        <h1 style={{ marginTop: 16 }}>Check your inbox</h1>
        <p className="mut sm" style={{ marginTop: 8 }}>
          If an account exists for {email.trim()}, a reset link is on its way.
        </p>
        <Button variant="q" className="btn-blk" style={{ marginTop: 18 }} onClick={() => go("/login")}>{I.back} Back to log in</Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell go={go} footer={<button className="btn btn-q btn-sm" onClick={() => go("/login")} style={{ color: "var(--p)", fontWeight: 600 }}>Back to log in</button>}>
      <h1>Reset your password</h1>
      <p className="mut sm" style={{ marginTop: 8 }}>Enter your email and we'll send a link to set a new one.</p>
      <form onSubmit={submit} noValidate className="stack" style={{ marginTop: 20 }}>
        <Field label="Email" id="fp-email" error={err}>
          <TextInput id="fp-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setErr(null); }} error={err} />
        </Field>
        <Button type="submit" className="btn-blk" loading={busy}>{busy ? "Sending link" : "Send reset link"}</Button>
      </form>
    </AuthShell>
  );
}

function ResetPassword({ go, query }) {
  const toast = useToast();
  const [state, setState] = useState({ loading: true, valid: false });
  const [f, setF] = useState({ pw: "", confirm: "" });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Clicking the emailed link redirects back here with a recovery
    // token in the URL; supabase-js reads it automatically and fires
    // a PASSWORD_RECOVERY event once the session is ready.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setState({ loading: false, valid: true });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) setState({ loading: false, valid: true });
      else setState((s) => (s.loading ? { loading: false, valid: false } : s));
    });
    return () => sub?.subscription?.unsubscribe();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    const pe = passwordError(f.pw);
    if (pe) next.pw = pe;
    if (f.confirm !== f.pw) next.confirm = "Passwords don't match.";
    setErrs(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: f.pw });
    setBusy(false);
    if (error) { toast(error.message, "bad"); return; }
    toast("Password updated. Log in with your new password.");
    await supabase.auth.signOut();
    go("/login", { replace: true });
  };

  if (state.loading) {
    return (
      <AuthShell go={go}>
        <div className="stack"><Skeleton h={28} w="60%" /><Skeleton h={14} /><Skeleton h={44} /><Skeleton h={44} /></div>
      </AuthShell>
    );
  }
  if (!state.valid) {
    return (
      <AuthShell go={go}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: "var(--bad-bg)", color: "#B3323C", display: "flex", alignItems: "center", justifyContent: "center" }}>{I.alert}</div>
        <h1 style={{ marginTop: 16 }}>This link expired</h1>
        <p className="mut sm" style={{ marginTop: 8 }}>Reset links last 30 minutes and work once. Request a fresh one to continue.</p>
        <Button className="btn-blk" style={{ marginTop: 20 }} onClick={() => go("/forgot-password")}>Request a new link</Button>
      </AuthShell>
    );
  }
  return (
    <AuthShell go={go}>
      <h1>Set a new password</h1>
      <p className="mut sm" style={{ marginTop: 8 }}>Choose a new password for your account.</p>
      <form onSubmit={submit} noValidate className="stack" style={{ marginTop: 20 }}>
        <Field label="New password" id="rp-pw" error={errs.pw}>
          <PasswordInput id="rp-pw" autoComplete="new-password" value={f.pw} onChange={(e) => { setF((p) => ({ ...p, pw: e.target.value })); setErrs({}); }} error={errs.pw} />
        </Field>
        <Field label="Confirm password" id="rp-pw2" error={errs.confirm}>
          <PasswordInput id="rp-pw2" autoComplete="new-password" value={f.confirm} onChange={(e) => { setF((p) => ({ ...p, confirm: e.target.value })); setErrs({}); }} error={errs.confirm} />
        </Field>
        <Button type="submit" className="btn-blk" loading={busy}>{busy ? "Saving" : "Save new password"}</Button>
      </form>
    </AuthShell>
  );
}

/* ------------------------------------------------------------ 10. ONBOARDING */

const STARTER_LINKS = [
  { key: "instagram", title: "Instagram", icon: "instagram", url: "https://instagram.com/" },
  { key: "youtube", title: "YouTube channel", icon: "youtube", url: "https://youtube.com/" },
  { key: "tiktok", title: "TikTok", icon: "tiktok", url: "https://tiktok.com/" },
  { key: "website", title: "My website", icon: "website", url: "https://example.com" },
  { key: "spotify", title: "Listen on Spotify", icon: "spotify", url: "https://open.spotify.com/" },
  { key: "email", title: "Email me", icon: "email", url: "mailto:hello@example.com" },
];

function Onboarding({ go }) {
  const { user, patchUser } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(user.profile.displayName || "");
  const [bio, setBio] = useState(user.profile.bio || "");
  const [avatar, setAvatar] = useState(user.profile.avatar || null);
  const [picked, setPicked] = useState(["instagram"]);
  const [theme, setTheme] = useState(user.profile.theme || "dawn");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const { request: requestCrop, modal: cropModal } = useImageCropper();

  const previewProfile = { ...user.profile, displayName: displayName || user.profile.displayName, bio, avatar, theme };
  const previewLinks = picked.map((k) => {
    const s = STARTER_LINKS.find((x) => x.key === k);
    return { id: k, title: s.title, url: s.url, icon: s.icon, active: true };
  });

  const onAvatar = async (file) => {
    if (!file) return;
    if (!/^image\//.test(file.type)) { toast("Pick an image file.", "bad"); return; }
    if (file.size > 6 * 1024 * 1024) { toast("Images need to be under 6MB.", "bad"); return; }
    const cropped = await requestCrop(file, { aspect: 1, shape: "circle", maxOutput: 320 });
    if (cropped) setAvatar(cropped);
  };

  const finish = async () => {
    setBusy(true);
    const links = picked.map((k, i) => {
      const s = STARTER_LINKS.find((x) => x.key === k);
      return { id: uid(), title: s.title, url: s.url, icon: s.icon, active: true, type: "link", order: i, createdAt: Date.now(), clicks: 0 };
    });
    await patchUser((rec) => {
      rec.profile.displayName = clean(displayName, 60) || rec.profile.displayName;
      rec.profile.bio = cleanMultiline(bio, 160);
      rec.profile.avatar = avatar;
      rec.profile.theme = theme;
      rec.links = links;
      rec.account.onboarded = true;
    });
    await sleep(320);
    setBusy(false);
    toast("Your page is live. Share it anywhere.");
    go("/dashboard", { replace: true });
  };

  const steps = [
    {
      title: "Who's behind the page?",
      sub: "This is the first thing visitors read. You can change it any time.",
      body: (
        <div className="stack" style={{ "--gap": "18px" }}>
          <div className="row" style={{ gap: 16 }}>
            <Avatar src={avatar} name={displayName || user.account.name} size={68} />
            <div className="stack" style={{ "--gap": "6px" }}>
              <label className="btn btn-g btn-sm" style={{ cursor: "pointer" }}>
                {avatar ? "Change photo" : "Upload photo"}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onAvatar(e.target.files?.[0])} />
              </label>
              {avatar && <button className="btn btn-q btn-sm" onClick={() => setAvatar(null)}>Remove</button>}
            </div>
          </div>
          <Field label="Display name" id="ob-name" error={err}>
            <TextInput id="ob-name" value={displayName} maxLength={60} onChange={(e) => { setDisplayName(e.target.value); setErr(null); }} placeholder="Nadia Hassan" error={err} />
          </Field>
          <Field label="Bio" id="ob-bio" hint={`${bio.length}/160 characters`}>
            <textarea id="ob-bio" className="inp" maxLength={160} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Ceramicist in Lisbon. Studio notes and new drops." />
          </Field>
        </div>
      ),
      next: () => {
        if (!clean(displayName)) { setErr("Add a display name so people know whose page this is."); return false; }
        return true;
      },
    },
    {
      title: "What should people find first?",
      sub: "Pick a few to start with. You'll add the real URLs in a moment.",
      body: (
        <div className="pick">
          {STARTER_LINKS.map((s) => {
            const on = picked.includes(s.key);
            return (
              <button
                key={s.key}
                className="pick-i"
                aria-pressed={on}
                onClick={() => setPicked((p) => (on ? p.filter((x) => x !== s.key) : [...p, s.key]))}
              >
                <span style={{ color: on ? "var(--p)" : "var(--mut)", display: "flex" }}><SocialIcon name={s.icon} /></span>
                <span className="grow" style={{ fontWeight: 600, fontSize: 14.5 }}>{s.title}</span>
                {on && <span style={{ color: "var(--p)", display: "flex" }}>{I.check}</span>}
              </button>
            );
          })}
        </div>
      ),
      next: () => true,
    },
    {
      title: "Choose a look",
      sub: "Themes change everything at once. Swap whenever the mood does.",
      body: (
        <div className="th-grid">
          {THEMES.map((t) => (
            <button key={t.id} className="th" aria-pressed={theme === t.id} onClick={() => setTheme(t.id)}>
              <div className="th-sw" style={{ background: t.bg }}>
                <i style={{ background: t.card, border: `1px solid ${t.border}` }} />
                <i style={{ background: t.card, border: `1px solid ${t.border}` }} />
                <i style={{ background: t.accent, opacity: 0.9 }} />
              </div>
              <div className="th-name">{t.name}</div>
            </button>
          ))}
        </div>
      ),
      next: () => true,
    },
  ];

  const cur = steps[step];

  return (
    <div className="ob">
      {cropModal}
      <div className="ob-main">
        <div className="row-b" style={{ maxWidth: 520, margin: "0 auto 26px" }}>
          <Logo size={26} />
          <span className="mut tiny">Step {step + 1} of 3</span>
        </div>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div className="ob-bar" aria-hidden="true"><i style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
          <h1 style={{ fontSize: 28, marginTop: 26 }}>{cur.title}</h1>
          <p className="mut sm" style={{ marginTop: 8 }}>{cur.sub}</p>
          <div style={{ marginTop: 26 }}>{cur.body}</div>

          <div className="ob-inline" style={{ marginTop: 28 }}>
            <Phone>
              <ProfileCanvas profile={previewProfile} links={previewLinks} />
            </Phone>
          </div>

          <div className="row" style={{ marginTop: 30, gap: 10 }}>
            {step > 0 && <Button variant="g" onClick={() => setStep((s) => s - 1)}>{I.back} Back</Button>}
            <div className="grow" />
            {step < 2 ? (
              <Button onClick={() => { if (cur.next()) setStep((s) => s + 1); }}>Continue {I.fwd}</Button>
            ) : (
              <Button onClick={finish} loading={busy}>{busy ? "Publishing" : "Publish my page"}</Button>
            )}
          </div>
        </div>
      </div>
      <aside className="ob-side">
        <Phone>
          <ProfileCanvas profile={previewProfile} links={previewLinks} />
        </Phone>
        <p style={{ color: "#ABABAB", fontSize: 13 }}>tap-it-nu.vercel.app/{user.account.username}</p>
      </aside>
    </div>
  );
}

/* Pan/zoom crop UI. Renders into the existing Modal shell. Returns a
   cropped, resized dataURL via onConfirm; canvas math mirrors the
   on-screen transform 1:1 so the export matches what's shown. */
function ImageCropModal({ src, aspect = 1, shape = "rect", maxOutput = 800, onCancel, onConfirm }) {
  const FRAME_W = 300;
  const FRAME_H = Math.round(FRAME_W / aspect);
  const imgRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0, px: 0, py: 0 });

  const baseScale = () => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return 1;
    return Math.max(FRAME_W / img.naturalWidth, FRAME_H / img.naturalHeight);
  };

  const pt = (e) => (e.touches ? e.touches[0] : e);
  const onDown = (e) => { dragging.current = true; const p = pt(e); start.current = { x: p.clientX, y: p.clientY, px: pos.x, py: pos.y }; };
  const onMove = (e) => {
    if (!dragging.current) return;
    const p = pt(e);
    setPos({ x: start.current.px + (p.clientX - start.current.x), y: start.current.py + (p.clientY - start.current.y) });
  };
  const onUp = () => { dragging.current = false; };

  const confirm = () => {
    const img = imgRef.current;
    if (!img) return;
    const outW = shape === "circle" ? Math.min(maxOutput, 640) : maxOutput;
    const outH = Math.round(outW / aspect);
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    const ratio = outW / FRAME_W;
    const scale = baseScale() * zoom * ratio;
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const cx = outW / 2 + pos.x * ratio;
    const cy = outH / 2 + pos.y * ratio;
    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(outW / 2, outH / 2, outW / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
    }
    ctx.drawImage(img, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
    onConfirm(canvas.toDataURL("image/jpeg", 0.88));
  };

  return (
    <Modal
      open
      onClose={onCancel}
      title={shape === "circle" ? "Crop photo" : "Crop cover"}
      footer={<><Button variant="q" onClick={onCancel}>Cancel</Button><Button onClick={confirm} disabled={!ready}>Use photo</Button></>}
    >
      <div
        style={{
          width: FRAME_W, height: FRAME_H, margin: "0 auto", overflow: "hidden", position: "relative",
          borderRadius: shape === "circle" ? "50%" : 16, background: "#111", cursor: "grab", touchAction: "none",
          border: "1px solid var(--line)",
        }}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
      >
        <img
          ref={imgRef}
          src={src}
          alt=""
          draggable={false}
          onLoad={() => setReady(true)}
          style={{
            position: "absolute", left: "50%", top: "50%", userSelect: "none", pointerEvents: "none",
            transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) scale(${baseScale() * zoom})`,
            transformOrigin: "center center",
          }}
        />
      </div>
      <div className="row" style={{ gap: 10, marginTop: 16, alignItems: "center" }}>
        <span className="mut sm">Zoom</span>
        <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} style={{ flex: 1 }} />
      </div>
      <p className="mut sm" style={{ marginTop: 6 }}>Drag the image to reposition.</p>
    </Modal>
  );
}

/* Opens ImageCropModal for a given file and resolves to the cropped
   dataURL (or null if cancelled). const { request, modal } = useImageCropper();
   call request(file, {aspect, shape, maxOutput}), render {modal} nearby. */
function useImageCropper() {
  const [state, setState] = useState(null);
  const request = (file, opts) =>
    new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      setState({ src: url, resolve, ...opts });
    });
  const close = (result) => {
    if (state) { URL.revokeObjectURL(state.src); state.resolve(result); }
    setState(null);
  };
  const modal = state ? (
    <ImageCropModal
      src={state.src}
      aspect={state.aspect}
      shape={state.shape}
      maxOutput={state.maxOutput}
      onCancel={() => close(null)}
      onConfirm={(dataUrl) => close(dataUrl)}
    />
  ) : null;
  return { request, modal };
}

async function downscale(file, max) {
  const dataUrl = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(new Error("read failed"));
    r.readAsDataURL(file);
  });
  try {
    const img = await new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = rej;
      im.src = dataUrl;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    c.getContext("2d").drawImage(img, 0, 0, w, h);
    return c.toDataURL("image/jpeg", 0.82);
  } catch {
    return dataUrl;
  }
}

/* ------------------------------------------------------------- 11. DASHBOARD */

const NAV_ITEMS = [
  { id: "", label: "Overview", icon: I.home },
  { id: "links", label: "Links", icon: I.link },
  { id: "appearance", label: "Appearance", icon: I.brush },
  { id: "analytics", label: "Analytics", icon: I.chart },
  { id: "settings", label: "Settings", icon: I.gear },
];

function DashboardShell({ go, route, children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const section = route.path.replace(/^\/dashboard\/?/, "");
  const publicUrl = `tap-it-nu.vercel.app/#/${user.account.username}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${publicUrl}`);
      toast("Link copied to your clipboard.");
    } catch {
      toast("Copy didn't work. Select the URL and copy it manually.", "bad");
    }
  };

  return (
    <div className="dash">
      <aside className="side">
        <div style={{ padding: "4px 8px 18px" }}><Logo onClick={() => go("/dashboard")} /></div>
        <nav className="stack" style={{ "--gap": "3px" }} aria-label="Dashboard">
          {NAV_ITEMS.map((n) => {
            const href = "/dashboard" + (n.id ? "/" + n.id : "");
            const active = section === n.id;
            return (
              <button key={n.id} className="side-l" aria-current={active ? "page" : undefined} onClick={() => go(href)}>
                {n.icon}{n.label}
              </button>
            );
          })}
        </nav>
        <div className="grow" />
        <div className="card pad" style={{ background: "var(--tint)", borderColor: "var(--tint-2)" }}>
          <div className="tiny mut">Your page</div>
          <div className="sm trunc" style={{ fontWeight: 600, marginTop: 3 }}>{publicUrl}</div>
          <div className="row" style={{ marginTop: 11, gap: 7 }}>
            <Button variant="g" size="sm" onClick={copyLink} style={{ flex: 1 }}>{I.copy} Copy</Button>
            <Button variant="g" size="sm" onClick={() => go("/" + user.account.username)} aria-label="Open public page">{I.ext}</Button>
          </div>
        </div>
        <button className="side-l" style={{ marginTop: 8 }} onClick={() => { logout(); go("/", { replace: true }); toast("Logged out."); }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M15 17l5-5-5-5M20 12H9M12 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" /></svg>
          Log out
        </button>
      </aside>

      <div className="dash-main">
        <div className="dash-top row-b">
          <div className="row grow" style={{ minWidth: 0 }}>
            <span className="only-sm"><Logo size={24} /></span>
            <div className="grow hide-sm" style={{ minWidth: 0 }}>
              <span className="mut sm">tap-it-nu.vercel.app/</span>
              <span className="sm" style={{ fontWeight: 600 }}>{user.account.username}</span>
            </div>
          </div>
          <div className="row">
            <Button variant="g" size="sm" onClick={copyLink} className="hide-sm">{I.copy} Copy link</Button>
            <button
              className="sw"
              role="switch"
              aria-checked={theme === "dark"}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              onClick={toggleTheme}
            >
              <i />
            </button>
            <Button size="sm" onClick={() => go("/" + user.account.username)}>{I.eyeSm} View page</Button>
            <Avatar src={user.profile.avatar} name={user.profile.displayName} size={34} />
          </div>
        </div>
        <div className="dash-body">{children}</div>
        <nav className="mobile-bar" aria-label="Sections">
          {NAV_ITEMS.map((n) => (
            <button
              key={n.id}
              aria-current={section === n.id ? "page" : undefined}
              onClick={() => go("/dashboard" + (n.id ? "/" + n.id : ""))}
            >
              {n.icon}
              {n.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

function PreviewPane({ user, title = "Live preview" }) {
  return (
    <div className="dash-prev">
      <div className="row-b" style={{ marginBottom: 12 }}>
        <h3 style={{ fontSize: 14, fontFamily: "var(--sans)", fontWeight: 700 }}>{title}</h3>
        <span className="pill pill-n">Updates as you type</span>
      </div>
      <Phone>
        <ProfileCanvas profile={user.profile} links={user.links} />
      </Phone>
    </div>
  );
}

/* --- Overview --- */
function Overview({ go }) {
  const { user } = useAuth();
  const toast = useToast();
  const a = useMemo(() => summarize(user.analytics, user.links, 7), [user.analytics, user.links]);
  const active = user.links.filter((l) => l.active !== false && l.type !== "header").length;

  return (
    <div className="stack" style={{ "--gap": "22px" }}>
      <div>
        <h1 className="h-page">Hi, {user.profile.displayName.split(" ")[0]}.</h1>
        <p className="mut sm" style={{ marginTop: 6 }}>
          {active === 0 ? "Your page is live but empty. Add your first link to give people somewhere to go." : `${active} live link${active === 1 ? "" : "s"} on your page right now.`}
        </p>
      </div>

      <div className="kpis">
        <Kpi label="Page views" value={a.views} sub="last 7 days" />
        <Kpi label="Link clicks" value={a.clicks} sub="last 7 days" />
        <Kpi label="Click rate" value={a.views ? Math.round((a.clicks / a.views) * 100) + "%" : "—"} sub="clicks per view" />
        <Kpi label="Live links" value={active} sub="visible to visitors" />
      </div>

      <div className="dash-split">
        <div className="stack" style={{ "--gap": "18px" }}>
          <div className="card pad-l">
            <div className="row-b">
              <h3 style={{ fontSize: 17 }}>Top links this week</h3>
              <Button variant="q" size="sm" onClick={() => go("/dashboard/analytics")}>All analytics</Button>
            </div>
            <div style={{ marginTop: 16 }}>
              {a.top.length === 0 ? (
                <EmptyState
                  icon={I.chart}
                  title="No clicks yet"
                  body="Once people start tapping your links, the winners show up here."
                  action={<Button size="sm" onClick={() => go("/" + user.account.username)}>Open your page</Button>}
                />
              ) : (
                <table className="tbl">
                  <thead><tr><th>Link</th><th style={{ width: "34%" }}>Share</th><th style={{ textAlign: "right" }}>Clicks</th></tr></thead>
                  <tbody>
                    {a.top.slice(0, 5).map((t) => (
                      <tr key={t.id}>
                        <td className="trunc" style={{ maxWidth: 200 }}>{t.title}</td>
                        <td><div className="mini"><i style={{ width: `${t.pct}%` }} /></div></td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>{t.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="card pad-l">
            <h3 style={{ fontSize: 17 }}>Finish setting up</h3>
            <div className="stack" style={{ "--gap": "10px", marginTop: 14 }}>
              <Task done={Boolean(user.profile.avatar)} label="Add a profile photo" onClick={() => go("/dashboard/appearance")} />
              <Task done={Boolean(user.profile.bio)} label="Write a bio" onClick={() => go("/dashboard/appearance")} />
              <Task done={active >= 3} label="Add at least three links" onClick={() => go("/dashboard/links")} />
              <Task done={(user.profile.socials || []).length > 0} label="Connect social icons" onClick={() => go("/dashboard/appearance")} />
              <Task done={a.views > 0} label="Share your page once" onClick={async () => {
                try { await navigator.clipboard.writeText(`https://tap-it-nu.vercel.app/#/${user.account.username}`); toast("Link copied — paste it in your bio."); }
                catch { toast("Copy didn't work in this browser.", "bad"); }
              }} />
            </div>
          </div>
        </div>
        <PreviewPane user={user} />
      </div>
    </div>
  );
}

function Kpi({ label, value, sub }) {
  return (
    <div className="kpi">
      <div className="mut tiny">{label}</div>
      <div className="kpi-v">{typeof value === "number" ? fmt(value) : value}</div>
      <div className="mut tiny" style={{ marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function Task({ done, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="row"
      style={{ width: "100%", textAlign: "left", background: done ? "var(--ok-bg)" : "var(--w)", border: `1px solid ${done ? "var(--ok)" : "var(--line)"}`, borderRadius: 13, padding: "11px 13px", cursor: "pointer" }}
    >
      <span style={{ width: 21, height: 21, borderRadius: 99, background: done ? "var(--ok)" : "var(--line-2)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        {done ? I.check : null}
      </span>
      <span className="grow sm" style={{ fontWeight: 600, textDecoration: done ? "none" : "none", color: done ? "var(--mut)" : "var(--ink)" }}>{label}</span>
      {!done && <span style={{ color: "var(--mut)", display: "flex" }}>{I.fwd}</span>}
    </button>
  );
}

/* --- Links --- */
const emptyDraft = () => ({ id: null, title: "", url: "", icon: "", badge: "", type: "link" });

function LinksPage() {
  const { user, patchUser } = useAuth();
  const toast = useToast();
  const [draft, setDraft] = useState(null);
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);

  const links = user.links;

  const save = async () => {
    const next = {};
    const title = clean(draft.title, 80);
    if (!title) next.title = "Give the link a label people will understand.";
    let url = null;
    if (draft.type !== "header") {
      url = safeUrl(draft.url);
      if (draft.icon === "email") {
        const addr = (draft.url || "").replace(/^mailto:/i, "").trim();
        if (!addr) next.url = "Add your email address.";
        else if (!EMAIL_RE.test(addr)) next.url = "That email address doesn't look right.";
      } else if (draft.icon === "whatsapp") {
        const phone = (draft.url || "").replace(/^https:\/\/wa\.me\//i, "").trim();
        url = whatsappUrl(phone);
        if (!phone) next.url = "Add your phone number.";
        else if (!url) next.url = "Add a valid phone number with country code.";
      } else if (!draft.url.trim()) next.url = "Add the destination URL.";
      else if (!url) next.url = "That URL isn't valid. Try something like example.com/page.";
    }
    setErrs(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    await patchUser((rec) => {
      if (draft.id) {
        const i = rec.links.findIndex((l) => l.id === draft.id);
        if (i > -1) rec.links[i] = { ...rec.links[i], title, url, icon: draft.icon || "", badge: clean(draft.badge, 14), type: draft.type };
      } else {
        rec.links.push({
          id: uid(), title, url, icon: draft.icon || "", badge: clean(draft.badge, 14),
          type: draft.type, active: true, clicks: 0, createdAt: Date.now(),
        });
      }
    });
    setBusy(false);
    toast(draft.id ? "Link saved." : "Link added to your page.");
    setDraft(null);
    setErrs({});
  };

  const remove = async (link) => {
    const snapshot = [...links];
    await patchUser((rec) => { rec.links = rec.links.filter((l) => l.id !== link.id); });
    setConfirmDel(null);
    toast(`"${link.title}" deleted.`, "ok", {
      label: "Undo",
      run: () => patchUser((rec) => { rec.links = snapshot; }).then(() => toast("Link restored.")),
    });
  };

  const toggle = async (link) => {
    await patchUser((rec) => {
      const l = rec.links.find((x) => x.id === link.id);
      if (l) l.active = l.active === false;
    });
  };

  const move = async (id, dir) => {
    await patchUser((rec) => {
      const i = rec.links.findIndex((l) => l.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= rec.links.length) return;
      [rec.links[i], rec.links[j]] = [rec.links[j], rec.links[i]];
    });
  };

  const onDrop = async (targetId) => {
    if (!dragId || dragId === targetId) { setDragId(null); setOverId(null); return; }
    await patchUser((rec) => {
      const from = rec.links.findIndex((l) => l.id === dragId);
      const to = rec.links.findIndex((l) => l.id === targetId);
      if (from < 0 || to < 0) return;
      const [item] = rec.links.splice(from, 1);
      rec.links.splice(to, 0, item);
    });
    setDragId(null);
    setOverId(null);
    toast("Order updated.");
  };

  return (
    <div className="stack" style={{ "--gap": "22px" }}>
      <div className="row-b">
        <div>
          <h1 className="h-page">Links</h1>
          <p className="mut sm" style={{ marginTop: 6 }}>Drag to reorder. Anything switched off stays hidden from visitors.</p>
        </div>
        <div className="row">
          <Button variant="g" size="sm" onClick={() => { setDraft({ ...emptyDraft(), type: "header" }); setErrs({}); }} className="hide-sm">Add header</Button>
          <Button size="sm" onClick={() => { setDraft(emptyDraft()); setErrs({}); }}>{I.plus} Add link</Button>
        </div>
      </div>

      <div className="dash-split">
        <div className="stack" style={{ "--gap": "12px" }}>
          {links.length === 0 ? (
            <EmptyState
              icon={I.link}
              title="No links yet"
              body="Add your first link and it appears on your page straight away — no publishing step."
              action={<Button onClick={() => setDraft(emptyDraft())}>{I.plus} Add your first link</Button>}
            />
          ) : (
            links.map((l, i) => (
              <div
                key={l.id}
                className={"lrow" + (dragId === l.id ? " drag" : "") + (overId === l.id ? " over" : "") + (l.active === false ? " off" : "")}
                draggable
                onDragStart={() => setDragId(l.id)}
                onDragEnd={() => { setDragId(null); setOverId(null); }}
                onDragOver={(e) => { e.preventDefault(); setOverId(l.id); }}
                onDragLeave={() => setOverId((o) => (o === l.id ? null : o))}
                onDrop={(e) => { e.preventDefault(); onDrop(l.id); }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <button className="grip" aria-label={`Reorder ${l.title}`} title="Drag to reorder">{I.grip}</button>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <button className="icobtn" style={{ padding: 3 }} onClick={() => move(l.id, -1)} disabled={i === 0} aria-label="Move up">{I.up}</button>
                    <button className="icobtn" style={{ padding: 3 }} onClick={() => move(l.id, 1)} disabled={i === links.length - 1} aria-label="Move down">{I.down}</button>
                  </div>
                </div>

                <div className="grow" style={{ minWidth: 0 }}>
                  <div className="row" style={{ gap: 8 }}>
                    {l.icon && <span style={{ color: "var(--p)", display: "flex" }}><SocialIcon name={l.icon} size={17} /></span>}
                    <span className="trunc" style={{ fontWeight: 600 }}>{l.title}</span>
                    {l.type === "header" && <span className="pill pill-n">Header</span>}
                    {l.badge && <span className="pill pill-w">{l.badge}</span>}
                  </div>
                  {l.type !== "header" && (
                    <div className="mut tiny trunc" style={{ marginTop: 3 }}>{prettyUrl(l.url)}</div>
                  )}
                  <div className="mut tiny" style={{ marginTop: 5 }}>
                    {l.type === "header" ? "Section label" : `${l.clicks || 0} click${(l.clicks || 0) === 1 ? "" : "s"} all time`}
                  </div>
                </div>

                <button
                  className="sw"
                  role="switch"
                  aria-checked={l.active !== false}
                  aria-label={`${l.active === false ? "Show" : "Hide"} ${l.title}`}
                  onClick={() => toggle(l)}
                >
                  <i />
                </button>
                <button className="icobtn" onClick={() => { setDraft({ id: l.id, title: l.title, url: l.url || "", icon: l.icon || "", badge: l.badge || "", type: l.type || "link" }); setErrs({}); }} aria-label={`Edit ${l.title}`}>{I.pencil}</button>
                <button className="icobtn danger" onClick={() => setConfirmDel(l)} aria-label={`Delete ${l.title}`}>{I.trash}</button>
              </div>
            ))
          )}
          {links.length > 0 && (
            <p className="mut tiny" style={{ paddingTop: 4 }}>
              Keyboard and touch users: the up and down arrows reorder without dragging.
            </p>
          )}
        </div>
        <PreviewPane user={user} />
      </div>

      <Modal
        open={Boolean(draft)}
        onClose={() => { setDraft(null); setErrs({}); }}
        title={draft?.id ? "Edit link" : draft?.type === "header" ? "Add a header" : "Add a link"}
        footer={
          <>
            <Button variant="q" onClick={() => { setDraft(null); setErrs({}); }}>Cancel</Button>
            <Button onClick={save} loading={busy}>{draft?.id ? "Save changes" : "Add to page"}</Button>
          </>
        }
      >
        {draft && (
          <div className="stack" style={{ "--gap": "15px" }}>
            <Field label={draft.type === "header" ? "Header text" : "Label"} id="lk-title" error={errs.title}>
              <TextInput
                id="lk-title" value={draft.title} maxLength={80}
                placeholder={draft.type === "header" ? "This week" : "Spring glaze collection"}
                onChange={(e) => { setDraft((d) => ({ ...d, title: e.target.value })); setErrs((p) => ({ ...p, title: null })); }}
                error={errs.title}
              />
            </Field>
            {draft.type !== "header" && (
              <>
                {draft.icon === "email" ? (
                  <Field label="Email address" id="lk-url" error={errs.url} hint="Visitors tap this to compose an email straight to you.">
                    <div className="row" style={{ gap: 0, alignItems: "stretch" }}>
                      <span
                        aria-hidden="true"
                        style={{
                          display: "flex", alignItems: "center", padding: "0 10px",
                          background: "var(--tint)", border: "1px solid var(--line)", borderRight: "none",
                          borderRadius: "12px 0 0 12px", color: "var(--mut)", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap",
                        }}
                      >
                        mailto:
                      </span>
                      <TextInput
                        id="lk-url"
                        value={(draft.url || "").replace(/^mailto:/i, "")}
                        placeholder="hello@yourbusiness.com"
                        inputMode="email" spellCheck="false" autoCapitalize="none"
                        style={{ borderRadius: "0 12px 12px 0" }}
                        onChange={(e) => { setDraft((d) => ({ ...d, url: "mailto:" + e.target.value.trim() })); setErrs((p) => ({ ...p, url: null })); }}
                        error={errs.url}
                      />
                    </div>
                  </Field>
                ) : draft.icon === "whatsapp" ? (
                  <Field label="Phone number" id="lk-url" error={errs.url} hint="Include the country code. Visitors tap this to open a chat with you on WhatsApp.">
                    <div className="row" style={{ gap: 0, alignItems: "stretch" }}>
                      <span
                        aria-hidden="true"
                        style={{
                          display: "flex", alignItems: "center", padding: "0 10px",
                          background: "var(--tint)", border: "1px solid var(--line)", borderRight: "none",
                          borderRadius: "12px 0 0 12px", color: "var(--mut)", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap",
                        }}
                      >
                        wa.me/
                      </span>
                      <TextInput
                        id="lk-url"
                        value={(draft.url || "").replace(/^https:\/\/wa\.me\//i, "")}
                        placeholder="+1 555 123 4567"
                        inputMode="tel" spellCheck="false" autoCapitalize="none"
                        style={{ borderRadius: "0 12px 12px 0" }}
                        onChange={(e) => { setDraft((d) => ({ ...d, url: "https://wa.me/" + e.target.value })); setErrs((p) => ({ ...p, url: null })); }}
                        error={errs.url}
                      />
                    </div>
                  </Field>
                ) : (
                  <Field label="URL" id="lk-url" error={errs.url} hint="https:// is added for you if you leave it off.">
                    <TextInput
                      id="lk-url" value={draft.url} placeholder="example.com/shop" inputMode="url" spellCheck="false"
                      onChange={(e) => { setDraft((d) => ({ ...d, url: e.target.value })); setErrs((p) => ({ ...p, url: null })); }}
                      error={errs.url}
                    />
                  </Field>
                )}
                <Field label="Icon" id="lk-icon" hint="Optional. Shows to the left of the label.">
                  <div className="row" style={{ flexWrap: "wrap", gap: 7 }}>
                    <button
                      className="btn btn-g btn-sm"
                      style={{ borderColor: !draft.icon ? "var(--p)" : undefined }}
                      onClick={() => setDraft((d) => ({ ...d, icon: "" }))}
                    >None</button>
                    {Object.keys(SOCIALS).map((k) => (
                      <button
                        key={k}
                        className="btn btn-g btn-sm"
                        aria-label={SOCIALS[k].label}
                        aria-pressed={draft.icon === k}
                        style={{ padding: 9, borderColor: draft.icon === k ? "var(--p)" : undefined, color: draft.icon === k ? "var(--p)" : "var(--mut)" }}
                        onClick={() => setDraft((d) => ({ ...d, icon: k }))}
                      >
                        <SocialIcon name={k} size={17} />
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Badge" id="lk-badge" hint="Optional. Short tag like New or Sold out.">
                  <TextInput id="lk-badge" value={draft.badge} maxLength={14} placeholder="New" onChange={(e) => setDraft((d) => ({ ...d, badge: e.target.value }))} />
                </Field>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(confirmDel)}
        onClose={() => setConfirmDel(null)}
        title="Delete this link?"
        footer={
          <>
            <Button variant="q" onClick={() => setConfirmDel(null)}>Keep it</Button>
            <Button variant="d" onClick={() => remove(confirmDel)}>Delete link</Button>
          </>
        }
      >
        <p className="mut sm">
          "{confirmDel?.title}" comes off your page immediately. Its click history goes with it. You'll get one chance to undo.
        </p>
      </Modal>
    </div>
  );
}

/* --- Appearance --- */
function Appearance() {
  const { user, patchUser } = useAuth();
  const toast = useToast();
  const [p, setP] = useState(user.profile);
  const [busy, setBusy] = useState(false);
  const [socialDraft, setSocialDraft] = useState({ platform: "instagram", handle: "" });
  const { request: requestCrop, modal: cropModal } = useImageCropper();
  const dirty = JSON.stringify(p) !== JSON.stringify(user.profile);

  useEffect(() => { setP(user.profile); }, [user.profile]);

  const upd = (patch) => setP((prev) => ({ ...prev, ...patch }));

  const saveAll = async () => {
    setBusy(true);
    await patchUser((rec) => {
      rec.profile = { ...rec.profile, ...p, displayName: clean(p.displayName, 60) || rec.profile.displayName, bio: cleanMultiline(p.bio, 160) };
    });
    setBusy(false);
    toast("Appearance updated.");
  };

  const addSocial = () => {
    const handle = clean(socialDraft.handle, 80).replace(/^@/, "");
    if (!handle) { toast(socialDraft.platform === "whatsapp" ? "Add your phone number first." : "Add your handle first.", "bad"); return; }
    const meta = SOCIALS[socialDraft.platform];
    const url = socialDraft.platform === "email"
      ? (EMAIL_RE.test(handle) ? "mailto:" + handle : null)
      : socialDraft.platform === "whatsapp"
      ? whatsappUrl(handle)
      : safeUrl(/^https?:\/\//i.test(handle) ? handle : meta.base + handle);
    if (!url) { toast(socialDraft.platform === "whatsapp" ? "Add a valid phone number with country code." : "That handle doesn't produce a valid link.", "bad"); return; }
    if ((p.socials || []).some((s) => s.platform === socialDraft.platform)) { toast(`${meta.label} is already on your page.`, "bad"); return; }
    upd({ socials: [...(p.socials || []), { platform: socialDraft.platform, url }] });
    setSocialDraft({ platform: "instagram", handle: "" });
  };

  const previewUser = { ...user, profile: p };

  return (
    <div className="stack" style={{ "--gap": "22px" }}>
      {cropModal}
      <div className="row-b">
        <div>
          <h1 className="h-page">Appearance</h1>
          <p className="mut sm" style={{ marginTop: 6 }}>Every change shows in the preview first. Nothing is public until you save.</p>
        </div>
        <Button onClick={saveAll} loading={busy} disabled={!dirty}>{dirty ? "Save changes" : "Saved"}</Button>
      </div>

      <div className="dash-split">
        <div className="stack" style={{ "--gap": "18px" }}>
          <div className="card pad-l">
            <h3 style={{ fontSize: 17 }}>Profile</h3>
            <div className="stack" style={{ "--gap": "16px", marginTop: 16 }}>
              <div className="row" style={{ gap: 16 }}>
                <Avatar src={p.avatar} name={p.displayName} size={64} />
                <div className="row" style={{ gap: 8 }}>
                  <label className="btn btn-g btn-sm" style={{ cursor: "pointer" }}>
                    {p.avatar ? "Replace" : "Upload photo"}
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!/^image\//.test(file.type)) { toast("Pick an image file.", "bad"); return; }
                      if (file.size > 6 * 1024 * 1024) { toast("Images need to be under 6MB.", "bad"); return; }
                      const cropped = await requestCrop(file, { aspect: 1, shape: "circle", maxOutput: 320 });
                      if (cropped) upd({ avatar: cropped });
                    }} />
                  </label>
                  {p.avatar && <Button variant="q" size="sm" onClick={() => upd({ avatar: null })}>Remove</Button>}
                </div>
              </div>
              <div>
                <label className="fld-lab">Cover photo</label>
                {p.cover && (
                  <div style={{ width: "100%", height: 110, borderRadius: 16, backgroundImage: `url(${p.cover})`, backgroundSize: "cover", backgroundPosition: "center", marginBottom: 10, border: "1px solid var(--line)", filter: p.coverBlur ? "blur(6px)" : "none" }} />
                )}
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <label className="btn btn-g btn-sm" style={{ cursor: "pointer" }}>
                    {p.cover ? "Replace" : "Upload cover"}
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!/^image\//.test(file.type)) { toast("Pick an image file.", "bad"); return; }
                      if (file.size > 8 * 1024 * 1024) { toast("Images need to be under 8MB.", "bad"); return; }
                      const cropped = await requestCrop(file, { aspect: 3, shape: "rect", maxOutput: 1200 });
                      if (cropped) upd({ cover: cropped });
                    }} />
                  </label>
                  {p.cover && <Button variant="q" size="sm" onClick={() => upd({ cover: null })}>Remove</Button>}
                  {p.cover && (
                    <label className="row" style={{ gap: 7, alignItems: "center", cursor: "pointer", marginLeft: 4 }}>
                      <button type="button" className="sw" role="switch" aria-checked={!!p.coverBlur} onClick={() => upd({ coverBlur: !p.coverBlur })}>
                        <i style={{ transform: p.coverBlur ? "translateX(18px)" : "none" }} />
                      </button>
                      <span className="sm mut">Blur cover photo</span>
                    </label>
                  )}
                </div>
              </div>
              <Field label="Display name" id="ap-name">
                <TextInput id="ap-name" value={p.displayName} maxLength={60} onChange={(e) => upd({ displayName: e.target.value })} />
              </Field>
              <Field label="Bio" id="ap-bio" hint={`${(p.bio || "").length}/160 characters`}>
                <textarea id="ap-bio" className="inp" maxLength={160} value={p.bio || ""} onChange={(e) => upd({ bio: e.target.value })} />
              </Field>
              <Field label="Phone number" id="ap-phone" hint="Shows a 'Save contact' button on your page.">
                <TextInput id="ap-phone" type="tel" value={p.phone || ""} placeholder="+1 555 123 4567" onChange={(e) => upd({ phone: clean(e.target.value, 30) })} />
              </Field>
            </div>
          </div>

          <div className="card pad-l">
            <h3 style={{ fontSize: 17 }}>Theme</h3>
            <p className="mut sm" style={{ marginTop: 5 }}>Background, text and card colours in one choice.</p>
            <div className="th-grid" style={{ marginTop: 16 }}>
              {THEMES.map((t) => (
                <button key={t.id} className="th" aria-pressed={p.theme === t.id} onClick={() => upd({ theme: t.id })}>
                  <div className="th-sw" style={{ background: t.bg }}>
                    <i style={{ background: t.card, border: `1px solid ${t.border}` }} />
                    <i style={{ background: t.card, border: `1px solid ${t.border}` }} />
                    <i style={{ background: t.accent, opacity: 0.9 }} />
                  </div>
                  <div className="th-name">{t.name}</div>
                </button>
              ))}
              <button className="th" aria-pressed={p.theme === "custom"} onClick={() => upd({ theme: "custom" })}>
                <div className="th-sw" style={{ background: p.customBgType === "gradient" ? `linear-gradient(${p.customBgAngle ?? 165}deg, ${p.customBg || "#FFFFFF"} 0%, ${p.customBg2 || "#6C5CE7"} 100%)` : (p.customBg || "#FFFFFF") }}>
                  <i style={{ background: p.customCard || "#FFFFFF", opacity: 0.9 }} />
                  <i style={{ background: p.customCard || "#FFFFFF", opacity: 0.5 }} />
                  <i style={{ background: p.customCard || "#FFFFFF", opacity: 0.9 }} />
                </div>
                <div className="th-name">Custom</div>
              </button>
              <button className="th" aria-pressed={p.theme === "photo"} onClick={() => upd({ theme: "photo" })}>
                <div className="th-sw" style={{ background: p.bgPhoto ? `linear-gradient(rgba(0,0,0,${(p.bgPhotoOverlay ?? 45) / 100}),rgba(0,0,0,${(p.bgPhotoOverlay ?? 45) / 100})), url(${p.bgPhoto})` : "#3A3A3A", backgroundSize: "cover", backgroundPosition: "center" }}>
                  {!p.bgPhoto && <span style={{ fontSize: 11, color: "#fff", opacity: 0.75, margin: "auto" }}>{I.image || "📷"}</span>}
                </div>
                <div className="th-name">Photo</div>
              </button>
            </div>
            {p.theme === "photo" && (
              <div className="stack" style={{ "--gap": "16px", marginTop: 16 }}>
                {p.bgPhoto && (
                  <div style={{ width: "100%", height: 140, borderRadius: 16, backgroundImage: `linear-gradient(rgba(0,0,0,${(p.bgPhotoOverlay ?? 45) / 100}),rgba(0,0,0,${(p.bgPhotoOverlay ?? 45) / 100})), url(${p.bgPhoto})`, backgroundSize: "cover", backgroundPosition: "center", border: "1px solid var(--line)", filter: p.bgPhotoBlur ? "blur(6px)" : "none" }} />
                )}
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <label className="btn btn-g btn-sm" style={{ cursor: "pointer" }}>
                    {p.bgPhoto ? "Replace photo" : "Upload photo"}
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!/^image\//.test(file.type)) { toast("Pick an image file.", "bad"); return; }
                      if (file.size > 10 * 1024 * 1024) { toast("Images need to be under 10MB.", "bad"); return; }
                      const cropped = await requestCrop(file, { aspect: 9 / 16, shape: "rect", maxOutput: 1600 });
                      if (cropped) upd({ bgPhoto: cropped, theme: "photo" });
                    }} />
                  </label>
                  {p.bgPhoto && <Button variant="q" size="sm" onClick={() => upd({ bgPhoto: null })}>Remove</Button>}
                  {p.bgPhoto && (
                    <label className="row" style={{ gap: 7, alignItems: "center", cursor: "pointer", marginLeft: 4 }}>
                      <button type="button" className="sw" role="switch" aria-checked={!!p.bgPhotoBlur} onClick={() => upd({ bgPhotoBlur: !p.bgPhotoBlur })}>
                        <i style={{ transform: p.bgPhotoBlur ? "translateX(18px)" : "none" }} />
                      </button>
                      <span className="sm mut">Blur photo</span>
                    </label>
                  )}
                </div>
                {p.bgPhoto && (
                  <>
                    <div>
                      <label className="fld-lab">Overlay darkness ({p.bgPhotoOverlay ?? 45}%)</label>
                      <input type="range" min="0" max="85" value={p.bgPhotoOverlay ?? 45}
                        onChange={(e) => upd({ bgPhotoOverlay: Number(e.target.value) })}
                        style={{ width: "100%", marginTop: 6 }} />
                      <p className="mut" style={{ fontSize: 12, marginTop: 4 }}>Darkens the photo so text stays readable.</p>
                    </div>
                    <div>
                      <label className="fld-lab">Text colour</label>
                      <div className="row" style={{ gap: 8, marginTop: 6 }}>
                        <Button variant={p.bgPhotoTextMode !== "dark" ? "p" : "g"} size="sm" onClick={() => upd({ bgPhotoTextMode: "light" })}>Light text</Button>
                        <Button variant={p.bgPhotoTextMode === "dark" ? "p" : "g"} size="sm" onClick={() => upd({ bgPhotoTextMode: "dark" })}>Dark text</Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            {p.theme === "custom" && (
              <div className="stack" style={{ "--gap": "16px", marginTop: 16 }}>
                <div>
                  <label className="fld-lab">Background style</label>
                  <div className="row" style={{ gap: 8, marginTop: 6 }}>
                    <Button variant={p.customBgType === "gradient" ? "p" : "g"} size="sm" onClick={() => upd({ customBgType: "solid" })}>Solid</Button>
                    <Button variant={p.customBgType === "gradient" ? "p" : "g"} size="sm" onClick={() => upd({ customBgType: "gradient" })}>Gradient</Button>
                  </div>
                </div>
                <div className="row" style={{ gap: 18, flexWrap: "wrap" }}>
                  <div>
                    <label className="fld-lab">{p.customBgType === "gradient" ? "Background (start)" : "Background"}</label>
                    <input type="color" value={/^#[0-9a-f]{6}$/i.test(p.customBg || "") ? p.customBg : "#FFFFFF"}
                      onChange={(e) => upd({ customBg: e.target.value })}
                      style={{ width: 48, height: 36, border: "1px solid var(--line)", borderRadius: 8, cursor: "pointer", padding: 2 }} />
                  </div>
                  {p.customBgType === "gradient" && (
                    <div>
                      <label className="fld-lab">Background (end)</label>
                      <input type="color" value={/^#[0-9a-f]{6}$/i.test(p.customBg2 || "") ? p.customBg2 : "#6C5CE7"}
                        onChange={(e) => upd({ customBg2: e.target.value })}
                        style={{ width: 48, height: 36, border: "1px solid var(--line)", borderRadius: 8, cursor: "pointer", padding: 2 }} />
                    </div>
                  )}
                  {[
                    { key: "customText", label: "Text", fallback: isLightColor(p.customBg || "#FFFFFF") ? "#17151F" : "#FFFFFF" },
                    { key: "customCard", label: "Card", fallback: "#FFFFFF" },
                    { key: "customCardText", label: "Card text", fallback: "#17151F" },
                  ].map(({ key, label, fallback }) => (
                    <div key={key}>
                      <label className="fld-lab">{label}</label>
                      <input type="color" value={/^#[0-9a-f]{6}$/i.test(p[key] || "") ? p[key] : fallback}
                        onChange={(e) => upd({ [key]: e.target.value })}
                        style={{ width: 48, height: 36, border: "1px solid var(--line)", borderRadius: 8, cursor: "pointer", padding: 2 }} />
                    </div>
                  ))}
                </div>
                {p.customBgType === "gradient" && (
                  <div>
                    <label className="fld-lab">Gradient angle ({p.customBgAngle ?? 165}°)</label>
                    <input type="range" min="0" max="360" value={p.customBgAngle ?? 165}
                      onChange={(e) => upd({ customBgAngle: Number(e.target.value) })}
                      style={{ width: "100%", marginTop: 6 }} />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card pad-l">
            <h3 style={{ fontSize: 17 }}>Buttons and type</h3>
            <div className="stack" style={{ "--gap": "18px", marginTop: 16 }}>
              <Chooser label="Button style" options={BUTTON_STYLES} value={p.buttonStyle || "soft"} onChange={(v) => upd({ buttonStyle: v })} />
              <Chooser label="Corners" options={RADII} value={p.radius || "round"} onChange={(v) => upd({ radius: v })} />
              <Chooser label="Typeface" options={FONTS} value={p.font || "manrope"} onChange={(v) => upd({ font: v })} render={(o) => <span style={{ fontFamily: o.stack }}>{o.name}</span>} />
              <div>
                <label className="fld-lab">Font size ({p.fontScale || 100}%)</label>
                <input type="range" min="80" max="140" step="5" value={p.fontScale || 100}
                  onChange={(e) => upd({ fontScale: Number(e.target.value) })}
                  style={{ width: "100%", marginTop: 6 }} />
                <p className="mut" style={{ fontSize: 12, marginTop: 4 }}>Scales your name, bio and link text on your page.</p>
              </div>
            </div>
          </div>

          <div className="card pad-l">
            <h3 style={{ fontSize: 17 }}>Social icons</h3>
            <p className="mut sm" style={{ marginTop: 5 }}>These sit under your bio as small icons, separate from your link list.</p>
            <div className="stack" style={{ "--gap": "10px", marginTop: 16 }}>
              {(p.socials || []).length === 0 && (
                <p className="mut sm" style={{ padding: "14px 0" }}>No social accounts connected yet.</p>
              )}
              {(p.socials || []).map((s) => (
                <div key={s.platform} className="row" style={{ border: "1px solid var(--line)", borderRadius: 13, padding: "10px 12px" }}>
                  <span style={{ color: "var(--p)", display: "flex" }}><SocialIcon name={s.platform} size={18} /></span>
                  <div className="grow" style={{ minWidth: 0 }}>
                    <div className="sm" style={{ fontWeight: 600 }}>{SOCIALS[s.platform].label}</div>
                    <div className="mut tiny trunc">{prettyUrl(s.url)}</div>
                  </div>
                  <button className="icobtn danger" aria-label={`Remove ${SOCIALS[s.platform].label}`} onClick={() => upd({ socials: p.socials.filter((x) => x.platform !== s.platform) })}>{I.trash}</button>
                </div>
              ))}
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <select
                  className="inp"
                  style={{ width: 150 }}
                  value={socialDraft.platform}
                  onChange={(e) => setSocialDraft((d) => ({ ...d, platform: e.target.value }))}
                  aria-label="Platform"
                >
                  {Object.keys(SOCIALS).map((k) => <option key={k} value={k}>{SOCIALS[k].label}</option>)}
                </select>
                <input
                  className="inp"
                  style={{ flex: 1, minWidth: 150 }}
                  placeholder={socialDraft.platform === "email" ? "you@example.com" : socialDraft.platform === "whatsapp" ? "+1 555 123 4567" : "yourhandle"}
                  inputMode={socialDraft.platform === "whatsapp" ? "tel" : undefined}
                  value={socialDraft.handle}
                  onChange={(e) => setSocialDraft((d) => ({ ...d, handle: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addSocial()}
                  aria-label={socialDraft.platform === "whatsapp" ? "Phone number" : "Handle"}
                />
                <Button variant="g" onClick={addSocial}>Add</Button>
              </div>
              {socialDraft.platform === "whatsapp" && (
                <p className="mut tiny">Include the country code, e.g. +1 for the US.</p>
              )}
            </div>
          </div>

          {dirty && (
            <div className="row" style={{ justifyContent: "flex-end", gap: 10 }}>
              <Button variant="q" onClick={() => setP(user.profile)}>Discard</Button>
              <Button onClick={saveAll} loading={busy}>Save changes</Button>
            </div>
          )}
        </div>
        <PreviewPane user={previewUser} title="Unsaved preview" />
      </div>

      <button
        className="btn btn-g only-sm"
        style={{ width: "100%" }}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(`https://tap-it-nu.vercel.app/#/${user.account.username}`);
            toast("Link copied.");
          } catch {
            toast("Copy didn't work in this browser.", "bad");
          }
        }}
      >
        {I.copy} Copy your page's link
      </button>
    </div>
  );
}

function Chooser({ label, options, value, onChange, render }) {
  return (
    <div>
      <div className="fld-lab">{label}</div>
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        {options.map((o) => (
          <button
            key={o.id}
            className="btn btn-g btn-sm"
            aria-pressed={value === o.id}
            style={{ borderColor: value === o.id ? "var(--p)" : undefined, color: value === o.id ? "var(--p-700)" : undefined, background: value === o.id ? "var(--tint)" : undefined }}
            onClick={() => onChange(o.id)}
          >
            {render ? render(o) : o.name}
          </button>
        ))}
      </div>
    </div>
  );
}

/* --- Analytics --- */
function summarize(analytics, links, days) {
  const now = new Date();
  const buckets = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    buckets.push({ key: dayKey(d), label: d.toLocaleDateString(undefined, { weekday: "short" }), date: d, views: 0, clicks: 0 });
  }
  const map = Object.fromEntries(buckets.map((b) => [b.key, b]));
  const since = buckets[0].date.setHours(0, 0, 0, 0);
  let views = 0, clicks = 0;
  const perLink = {};

  (analytics.views || []).forEach((v) => {
    if (v.t < since) return;
    views++;
    const b = map[dayKey(v.t)];
    if (b) b.views++;
  });
  (analytics.clicks || []).forEach((c) => {
    if (c.t < since) return;
    clicks++;
    const b = map[dayKey(c.t)];
    if (b) b.clicks++;
    perLink[c.linkId] = (perLink[c.linkId] || 0) + 1;
  });

  const maxLink = Math.max(1, ...Object.values(perLink));
  const top = Object.entries(perLink)
    .map(([id, count]) => ({
      id,
      count,
      pct: Math.round((count / maxLink) * 100),
      title: links.find((l) => l.id === id)?.title || (id.startsWith("social:") ? SOCIALS[id.slice(7)]?.label + " icon" : "Deleted link"),
    }))
    .sort((a, b) => b.count - a.count);

  return { views, clicks, buckets, top, max: Math.max(1, ...buckets.map((b) => Math.max(b.views, b.clicks))) };
}

function Analytics() {
  const { user } = useAuth();
  const [range, setRange] = useState(7);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 380);
    return () => clearTimeout(t);
  }, [range]);

  const a = useMemo(() => summarize(user.analytics, user.links, range), [user.analytics, user.links, range]);
  const hasData = (user.analytics.views || []).length > 0 || (user.analytics.clicks || []).length > 0;

  return (
    <div className="stack" style={{ "--gap": "22px" }}>
      <div className="row-b">
        <div>
          <h1 className="h-page">Analytics</h1>
          <p className="mut sm" style={{ marginTop: 6 }}>Views count page loads. Clicks count taps on your links and social icons.</p>
        </div>
        <div className="row" style={{ gap: 6 }}>
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              className="btn btn-g btn-sm"
              aria-pressed={range === d}
              style={{ borderColor: range === d ? "var(--p)" : undefined, background: range === d ? "var(--tint)" : undefined, color: range === d ? "var(--p-700)" : undefined }}
              onClick={() => setRange(d)}
            >{d}d</button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          icon={I.chart}
          title="No analytics yet"
          body="Open your public page or share the link. Views and clicks land here within seconds."
        />
      ) : (
        <>
          <div className="kpis">
            <Kpi label="Page views" value={a.views} sub={`last ${range} days`} />
            <Kpi label="Link clicks" value={a.clicks} sub={`last ${range} days`} />
            <Kpi label="Click rate" value={a.views ? Math.round((a.clicks / a.views) * 100) + "%" : "—"} sub="clicks per view" />
            <Kpi label="Best day" value={fmt(Math.max(...a.buckets.map((b) => b.clicks)))} sub="clicks in one day" />
          </div>

          <div className="card pad-l">
            <div className="row-b">
              <h3 style={{ fontSize: 17 }}>Views and clicks</h3>
              <div className="row" style={{ gap: 14 }}>
                <span className="row tiny mut" style={{ gap: 6 }}><i style={{ width: 10, height: 10, borderRadius: 3, background: "#B5B5B5", display: "block" }} />Views</span>
                <span className="row tiny mut" style={{ gap: 6 }}><i style={{ width: 10, height: 10, borderRadius: 3, background: "var(--p)", display: "block" }} />Clicks</span>
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              {loading ? (
                <div className="row" style={{ alignItems: "flex-end", gap: 7, height: 170 }}>
                  {a.buckets.map((b, i) => <Skeleton key={i} h={40 + ((i * 37) % 110)} w="100%" />)}
                </div>
              ) : (
                <div className="bars" role="img" aria-label={`Daily views and clicks over the last ${range} days`}>
                  {a.buckets.map((b) => (
                    <div className="bar-c" key={b.key} title={`${b.label}: ${b.views} views, ${b.clicks} clicks`}>
                      <div style={{ display: "flex", gap: 3, width: "100%", alignItems: "flex-end", height: "100%" }}>
                        <div className="bar alt" style={{ height: `${(b.views / a.max) * 100}%` }} />
                        <div className="bar" style={{ height: `${(b.clicks / a.max) * 100}%` }} />
                      </div>
                      {range <= 14 && <div className="bar-x">{b.label.slice(0, 2)}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card pad-l">
            <h3 style={{ fontSize: 17 }}>Which links earn the taps</h3>
            <div style={{ marginTop: 16, overflowX: "auto" }}>
              {a.top.length === 0 ? (
                <p className="mut sm" style={{ padding: "20px 0" }}>No clicks in this window. Try a longer range.</p>
              ) : (
                <table className="tbl">
                  <thead>
                    <tr><th>Link</th><th style={{ width: "34%" }}>Share of clicks</th><th style={{ textAlign: "right" }}>Clicks</th></tr>
                  </thead>
                  <tbody>
                    {a.top.map((t) => (
                      <tr key={t.id}>
                        <td className="trunc" style={{ maxWidth: 260 }}>{t.title}</td>
                        <td><div className="mini"><i style={{ width: `${t.pct}%` }} /></div></td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>{t.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* --- Settings --- */
function Settings({ go }) {
  const { user, patchUser, changeUsername, changePassword, changeEmail, deactivateLink, deleteAccount, logout } = useAuth();
  const toast = useToast();
  const [username, setUsername] = useState(user.account.username);
  const [uState, setUState] = useState({ status: "idle", msg: "" });
  const [uBusy, setUBusy] = useState(false);
  const [name, setName] = useState(user.account.name);
  const [email, setEmail] = useState(user.account.email);
  const [emailErr, setEmailErr] = useState(null);
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwErr, setPwErr] = useState({});
  const [pwBusy, setPwBusy] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [delText, setDelText] = useState("");
  const [delBusy, setDelBusy] = useState(false);
  const [deactBusy, setDeactBusy] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    const u = username.toLowerCase();
    if (u === user.account.username) { setUState({ status: "idle", msg: "" }); return; }
    const err = usernameError(u);
    if (err) { setUState({ status: "bad", msg: err }); return; }
    setUState({ status: "checking", msg: "Checking" });
    timer.current = setTimeout(async () => {
      const taken = await db.usernameTaken(u);
      setUState(taken ? { status: "bad", msg: "That username is taken" } : { status: "ok", msg: "Available" });
    }, 400);
    return () => clearTimeout(timer.current);
  }, [username, user.account.username]);

  const saveUsername = async () => {
    setUBusy(true);
    const res = await changeUsername(username.toLowerCase());
    setUBusy(false);
    if (!res.ok) { toast(res.error, "bad"); return; }
    toast(`Your page is now tap-it-nu.vercel.app/${res.username}.`);
  };

  const saveEmail = async () => {
    const err = emailError(email);
    if (err) { setEmailErr(err); return; }
    if (clean(email).toLowerCase() === user.account.email.toLowerCase()) return;
    setEmailErr(null);
    setEmailBusy(true);
    const res = await changeEmail(clean(email));
    setEmailBusy(false);
    if (!res.ok) { setEmailErr(res.error); return; }
    setEmailSent(true);
    toast(`Check ${clean(email)} for a link to confirm the change.`);
  };

  const savePassword = async () => {
    const next = {};
    if (!pw.current) next.current = "Enter your current password.";
    const pe = passwordError(pw.next);
    if (pe) next.next = pe;
    if (pw.confirm !== pw.next) next.confirm = "Passwords don't match.";
    setPwErr(next);
    if (Object.keys(next).length) return;
    setPwBusy(true);
    const res = await changePassword(pw.current, pw.next);
    setPwBusy(false);
    if (!res.ok) { setPwErr({ current: res.error }); return; }
    setPw({ current: "", next: "", confirm: "" });
    toast("Password updated.");
  };

  const doDeactivate = async () => {
    setDeactBusy(true);
    const res = await deactivateLink();
    setDeactBusy(false);
    if (!res.ok) { toast(res.error, "bad"); return; }
    toast("Your page is deactivated. Log back in anytime to bring it back.");
  };

  return (
    <div className="stack" style={{ "--gap": "22px", maxWidth: 680 }}>
      <div>
        <h1 className="h-page">Settings</h1>
        <p className="mut sm" style={{ marginTop: 6 }}>Account details, your URL, and the destructive stuff at the bottom.</p>
      </div>

      <div className="card pad-l">
        <h3 style={{ fontSize: 17 }}>Your URL</h3>
        <p className="mut sm" style={{ marginTop: 5 }}>Changing this breaks the old link everywhere you've shared it.</p>
        <div style={{ marginTop: 16 }}>
          <div className="pfx">
            <span className="pfx-tag">tap-it-nu.vercel.app/</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, "").slice(0, 20))}
              aria-label="Username"
              spellCheck="false"
            />
          </div>
          <div aria-live="polite" style={{ marginTop: 9, minHeight: 22 }}>
            {uState.status === "checking" && <span className="mut tiny">{uState.msg}…</span>}
            {uState.status === "ok" && <span className="pill pill-ok">{I.check} {uState.msg}</span>}
            {uState.status === "bad" && <span className="pill pill-bad">{I.x} {uState.msg}</span>}
          </div>
          <Button
            style={{ marginTop: 12 }}
            disabled={uState.status !== "ok"}
            loading={uBusy}
            onClick={saveUsername}
          >Change username</Button>
        </div>
      </div>

      <div className="card pad-l">
        <h3 style={{ fontSize: 17 }}>Account</h3>
        <div className="stack" style={{ "--gap": "15px", marginTop: 16 }}>
          <Field label="Account name" id="st-name">
            <TextInput id="st-name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field
            label="Email"
            id="st-email"
            error={emailErr}
            hint={emailSent ? `Confirmation link sent to ${clean(email)}. Your email won't change until you click it.` : "We'll send a confirmation link to the new address before it takes effect."}
          >
            <TextInput
              id="st-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailErr(null); setEmailSent(false); }}
            />
          </Field>
          <div className="row" style={{ gap: 10 }}>
            <Button
              variant="g"
              disabled={clean(name) === user.account.name || !clean(name)}
              onClick={async () => { await patchUser((rec) => { rec.account.name = clean(name, 60); }); toast("Account name saved."); }}
            >Save account name</Button>
            <Button
              variant="g"
              loading={emailBusy}
              disabled={clean(email).toLowerCase() === user.account.email.toLowerCase() || !clean(email)}
              onClick={saveEmail}
            >Update email</Button>
          </div>
        </div>
      </div>

      {!user.account.google && (
        <div className="card pad-l">
          <h3 style={{ fontSize: 17 }}>Password</h3>
          <div className="stack" style={{ "--gap": "15px", marginTop: 16 }}>
            <Field label="Current password" id="st-pw0" error={pwErr.current}>
              <PasswordInput id="st-pw0" autoComplete="current-password" value={pw.current} onChange={(e) => { setPw((p) => ({ ...p, current: e.target.value })); setPwErr({}); }} error={pwErr.current} />
            </Field>
            <Field label="New password" id="st-pw1" error={pwErr.next}>
              <PasswordInput id="st-pw1" autoComplete="new-password" value={pw.next} onChange={(e) => { setPw((p) => ({ ...p, next: e.target.value })); setPwErr({}); }} error={pwErr.next} />
            </Field>
            <Field label="Confirm new password" id="st-pw2" error={pwErr.confirm}>
              <PasswordInput id="st-pw2" autoComplete="new-password" value={pw.confirm} onChange={(e) => { setPw((p) => ({ ...p, confirm: e.target.value })); setPwErr({}); }} error={pwErr.confirm} />
            </Field>
            <div><Button variant="g" onClick={savePassword} loading={pwBusy}>Update password</Button></div>
          </div>
        </div>
      )}

      <div className="card pad-l">
        <h3 style={{ fontSize: 17 }}>Deactivate your page</h3>
        <p className="mut sm" style={{ marginTop: 5 }}>
          {user.account.deactivated
            ? "Your page is currently deactivated — visitors see an \"unavailable\" message instead of your links. Log out and log back in anytime to bring it right back."
            : `tap-it-nu.vercel.app/${user.account.username} will show as unavailable to visitors. Your links, page and account stay exactly as they are — just log back in anytime to reactivate it.`}
        </p>
        <Button
          variant="q"
          style={{ marginTop: 16 }}
          loading={deactBusy}
          disabled={user.account.deactivated}
          onClick={doDeactivate}
        >{user.account.deactivated ? "Page deactivated" : "Deactivate my page"}</Button>
      </div>

      <div className="card pad-l" style={{ borderColor: "#F3D7DB" }}>
        <h3 style={{ fontSize: 17 }}>Delete account</h3>
        <p className="mut sm" style={{ marginTop: 5 }}>
          Removes your page, links and analytics, and frees up tap-it-nu.vercel.app/{user.account.username} for someone else. There's no undo.
        </p>
        <Button variant="d" style={{ marginTop: 16 }} onClick={() => setDelOpen(true)}>Delete my account</Button>
      </div>

      <Button
        variant="g"
        className="only-sm"
        style={{ width: "100%" }}
        onClick={() => { logout(); go("/", { replace: true }); toast("Logged out."); }}
      >Log out</Button>

      <Modal
        open={delOpen}
        onClose={() => { setDelOpen(false); setDelText(""); }}
        title="Delete your account"
        footer={
          <>
            <Button variant="q" onClick={() => { setDelOpen(false); setDelText(""); }}>Cancel</Button>
            <Button
              variant="d"
              disabled={delText.trim().toLowerCase() !== user.account.username.toLowerCase()}
              loading={delBusy}
              onClick={async () => {
                setDelBusy(true);
                try {
                  await deleteAccount();
                  setDelOpen(false);
                  toast("Account deleted.");
                  go("/", { replace: true });
                } catch (err) {
                  toast(err?.message || "Couldn't delete your account. Try again.", "bad");
                } finally {
                  setDelBusy(false);
                }
              }}
            >Delete permanently</Button>
          </>
        }
      >
        <p className="mut sm">Type <b>{user.account.username}</b> to confirm.</p>
        <input className="inp" style={{ marginTop: 12 }} value={delText} onChange={(e) => setDelText(e.target.value)} aria-label="Confirm username" />
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------- 12. PUBLIC PROFILE */

function PublicProfile({ username, go }) {
  const [state, setState] = useState({ loading: true, rec: null });
  const { user: me, refresh } = useAuth();
  const toast = useToast();
  const counted = useRef(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setState({ loading: true, rec: null });
      const rec = await db.user(username);
      if (!alive) return;
      if (rec && !counted.current) {
        counted.current = true;
        await db.logView(rec.account.id);
        if (me?.account.username === rec.account.username) refresh();
      }
      setState({ loading: false, rec });
    })();
    return () => { alive = false; };
  }, [username]);

  const onLinkClick = useCallback(async (link) => {
    const rec = await db.user(username);
    if (!rec) return;
    await db.logClick(rec.account.id, link.id);
    if (me?.account.username === rec.account.username) refresh();
  }, [username, me, refresh]);

  if (state.loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 420 }} className="stack">
          <div style={{ display: "flex", justifyContent: "center" }}><Skeleton h={88} w={88} r={99} /></div>
          <div style={{ display: "flex", justifyContent: "center" }}><Skeleton h={20} w={160} /></div>
          <div style={{ display: "flex", justifyContent: "center" }}><Skeleton h={14} w={240} /></div>
          <div style={{ height: 10 }} />
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} h={52} r={16} />)}
        </div>
      </div>
    );
  }

  if (!state.rec) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
        <div>
          <Logo onClick={() => go("/")} />
          <h1 style={{ fontSize: 30, marginTop: 24 }}>tap-it-nu.vercel.app/{username} isn't taken</h1>
          <p className="mut" style={{ marginTop: 10, maxWidth: "40ch" }}>
            Nobody's claimed this username yet. It could be yours in about a minute.
          </p>
          <div className="row" style={{ justifyContent: "center", marginTop: 24, gap: 10 }}>
            <Button onClick={() => go("/signup")}>Claim this username</Button>
            <Button variant="g" onClick={() => go("/")}>Back to Tap-it</Button>
          </div>
        </div>
      </div>
    );
  }

  const rec = state.rec;
  const theme = getTheme(rec.profile);
  const isOwner = me?.account.username === rec.account.username;

  if (rec.account.deactivated && !isOwner) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
        <div>
          <Logo onClick={() => go("/")} />
          <h1 style={{ fontSize: 30, marginTop: 24 }}>This page isn't available right now</h1>
          <p className="mut" style={{ marginTop: 10, maxWidth: "40ch" }}>
            The owner has temporarily deactivated it.
          </p>
          <div className="row" style={{ justifyContent: "center", marginTop: 24, gap: 10 }}>
            <Button variant="g" onClick={() => go("/")}>Back to Tap-it</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: theme.bg }}>
      {isOwner && (
        <div style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(17,17,17,.92)", color: "#fff", padding: "9px 14px", backdropFilter: "blur(8px)" }}>
          <div className="row-b wrap" style={{ padding: 0 }}>
            <span className="sm">
              {rec.account.deactivated
                ? "Your page is deactivated — visitors see an unavailable message. Only you can see this preview."
                : "You're viewing your own page. Clicks here count in analytics."}
            </span>
            <Button size="sm" variant="g" onClick={() => go("/dashboard")}>Back to dashboard</Button>
          </div>
        </div>
      )}
      <div style={{ maxWidth: 520, margin: "0 auto", minHeight: "100vh" }}>
        <ProfileCanvas profile={rec.profile} links={rec.links} interactive onLinkClick={onLinkClick} username={rec.account.username} fillParentBg />
        <div style={{ textAlign: "center", padding: "10px 20px 42px" }}>
          <button
            onClick={() => go("/signup")}
            style={{ background: "rgba(127,127,127,.14)", border: `1px solid ${theme.border}`, color: theme.text, borderRadius: 999, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            {I.logo(15)} Create your own Tap-it page
          </button>
          <div style={{ marginTop: 14 }}>
            <button
              onClick={async () => {
                try { await navigator.clipboard.writeText(`https://tap-it-nu.vercel.app/#/${rec.account.username}`); toast("Link copied."); }
                catch { toast("Copy didn't work in this browser.", "bad"); }
              }}
              style={{ background: "none", border: 0, color: theme.text, opacity: 0.6, fontSize: 12.5, cursor: "pointer" }}
            >
              Copy this page's link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- APP */

export default function App() {
  const [route, go] = useHashRoute();
  const [toasts, setToasts] = useState([]);
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("tapit-app-theme") || "light"; } catch { return "light"; }
  });
  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      try { localStorage.setItem("tapit-app-theme", next); } catch {}
      return next;
    });
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const toast = useCallback((msg, kind = "ok", action) => {
    const id = uid();
    setToasts((t) => [...t, { id, msg, kind, action }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), action ? 7000 : 4200);
  }, []);
  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  /* boot: restore Supabase session, then keep it in sync */
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const authUser = data?.session?.user;
      if (authUser) {
        const { data: profileRow } = await supabase.from("profiles").select("username").eq("id", authUser.id).maybeSingle();
        if (profileRow) {
          const rec = await db.user(profileRow.username);
          if (alive && rec) setUser(rec);
        }
      }
      if (alive) setBooting(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setUser(null);
    });
    return () => { alive = false; sub?.subscription?.unsubscribe(); };
  }, []);

  const refresh = useCallback(async () => {
    if (!user) return;
    const rec = await db.user(user.account.username);
    if (rec) setUser(rec);
  }, [user?.account?.username]);

  const patchUser = useCallback(async (mutate) => {
    if (!user) return;
    const rec = await db.user(user.account.username);
    if (!rec) return;
    mutate(rec);
    try {
      await db.saveUser(rec);
      setUser(rec);
    } catch (err) {
      toast(err?.message || "Couldn't save that change. Try again.", "bad");
      throw err;
    }
  }, [user?.account?.username]);

  const auth = useMemo(() => ({
    user,
    refresh,
    patchUser,
    async login(email, password) {
      // supabase.auth.signInWithPassword() overwrites the active session only
      // on success, so calling it directly while already logged in safely
      // switches accounts without an explicit sign-out first — if the new
      // credentials fail, the original session is left untouched.
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        return { ok: false, error: "That email and password don't match an account." };
      }
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("username, deactivated")
        .eq("id", data.user.id)
        .maybeSingle();
      if (!profileRow) return { ok: false, error: "No profile found for this account." };
      if (profileRow.deactivated) {
        // Signing back in is what reactivates a deactivated page.
        await supabase.from("profiles").update({ deactivated: false }).eq("id", data.user.id);
      }
      const rec = await db.user(profileRow.username);
      setUser(rec);
      return { ok: true, user: { ...rec, onboarded: rec.account.onboarded } };
    },
    async signup(f) {
      const username = f.username.toLowerCase();
      const taken = await db.usernameTaken(username);
      if (taken) return { ok: false, field: "username", error: "That username was just taken." };

      const { data, error } = await supabase.auth.signUp({
        email: f.email.trim().toLowerCase(),
        password: f.password,
        options: {
          data: {
            username,
            display_name: clean(f.name, 60),
          },
        },
      });
      if (error) {
        const field = /email/i.test(error.message) ? "email" : undefined;
        return { ok: false, field, error: error.message };
      }
      if (!data.user) {
        return { ok: false, error: "Something went wrong creating your account." };
      }

      /* The profiles row is created server-side by a Postgres trigger
         (on_auth_user_created) that reads username/display_name from
         this signUp call's metadata — this works even before email
         confirmation, when the client has no session yet and RLS
         would otherwise block a client-side insert. */

      /* If your Supabase project has email confirmation ON (the default),
         data.session will be null here until the user clicks the emailed
         link — they can't be logged in yet. */
      if (!data.session) {
        return { ok: true, needsEmailConfirmation: true };
      }
      const rec = await db.user(username);
      setUser(rec);
      return { ok: true };
    },
    logout() {
      supabase.auth.signOut();
      setUser(null);
    },
    async changeUsername(next) {
      const err = usernameError(next);
      if (err) return { ok: false, error: err };
      const taken = await db.usernameTaken(next);
      if (taken) return { ok: false, error: "That username is taken." };
      const { error } = await supabase.from("profiles").update({ username: next }).eq("id", user.account.id);
      if (error) return { ok: false, error: error.message };
      const rec = await db.user(next);
      setUser(rec);
      return { ok: true, username: next };
    },
    async changePassword(current, next) {
      /* Supabase Auth doesn't re-verify the current password client-side;
         re-authenticate first so a stolen session can't silently change it. */
      const { error: reauthErr } = await supabase.auth.signInWithPassword({
        email: user.account.email,
        password: current,
      });
      if (reauthErr) return { ok: false, error: "That's not your current password." };
      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },
    async changeEmail(nextEmail) {
      /* Supabase sends a confirmation link to the NEW address; the email
         on the account only actually changes once that link is clicked.
         emailRedirectTo sends it back to a real hash route in this app
         (same pattern as resetPasswordForEmail below) instead of the bare
         Site URL, which the router doesn't recognise and 404s on.
         (If "Secure email change" is on in the Supabase project, it also
         sends a confirmation to the OLD address first.) */
      const { error } = await supabase.auth.updateUser(
        { email: nextEmail },
        { emailRedirectTo: `${window.location.origin}${window.location.pathname}#/settings` }
      );
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },
    async deactivateLink() {
      const { error } = await supabase.from("profiles").update({ deactivated: true }).eq("id", user.account.id);
      if (error) return { ok: false, error: error.message };
      const rec = await db.user(user.account.username);
      setUser(rec);
      return { ok: true };
    },
    async deleteAccount() {
      /* The anon key can't delete an auth.users row (by design — only a
         service-role key can, which must never live in frontend code).
         This removes the user's own data and signs them out; fully
         deleting the auth account needs a small server-side function
         (e.g. a Supabase Edge Function using the service role key). */
      const { error: linksErr } = await supabase.from("links").delete().eq("owner_id", user.account.id);
      if (linksErr) throw new Error("Couldn't delete your links: " + linksErr.message);
      const { error: profileErr } = await supabase.from("profiles").delete().eq("id", user.account.id);
      if (profileErr) throw new Error("Couldn't delete your profile: " + profileErr.message);
      const { error: signOutErr } = await supabase.auth.signOut();
      if (signOutErr) throw new Error(signOutErr.message);
      setUser(null);
    },
  }), [user, patchUser, refresh]);

  /* route guards */
  const path = route.path;
  const isDash = path.startsWith("/dashboard");
  const isOnboard = path === "/onboarding";
  const isAuthPage = ["/login", "/signup", "/forgot-password", "/reset-password"].includes(path);

  useEffect(() => {
    if (booting) return;
    if (!user && (isDash || isOnboard)) { go("/login", { replace: true }); return; }
    if (user && isAuthPage && path !== "/reset-password") {
      go(user.account.onboarded ? "/dashboard" : "/onboarding", { replace: true });
      return;
    }
    if (user && isDash && !user.account.onboarded) { go("/onboarding", { replace: true }); return; }
    if (user && isOnboard && user.account.onboarded) { go("/dashboard", { replace: true }); }
  }, [booting, user, path, isDash, isOnboard, isAuthPage, go]);

  let view;
  if (booting) {
    view = (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div className="stack center">
          <div style={{ display: "flex", justifyContent: "center" }}>{I.logo(34, theme === "dark")}</div>
          <div className="mut sm">Waking up your page…</div>
        </div>
      </div>
    );
  } else if (path === "/") view = <Landing go={go} user={user} />;
  else if (path === "/login") view = <Login go={go} />;
  else if (path === "/signup") view = <Signup go={go} />;
  else if (path === "/forgot-password") view = <ForgotPassword go={go} />;
  else if (path === "/reset-password") view = <ResetPassword go={go} query={route.query} />;
  else if (path === "/onboarding") view = user ? <Onboarding go={go} /> : null;
  else if (isDash && user?.account.onboarded) {
    const sec = path.replace(/^\/dashboard\/?/, "");
    const inner =
      sec === "links" ? <LinksPage /> :
      sec === "appearance" ? <Appearance /> :
      sec === "analytics" ? <Analytics /> :
      sec === "settings" ? <Settings go={go} /> :
      <Overview go={go} />;
    view = <DashboardShell go={go} route={route}>{inner}</DashboardShell>;
  } else if (isDash || isOnboard) {
    view = null;
  } else {
    const candidate = path.replace(/^\//, "").toLowerCase();
    view = /^[a-z0-9._]{1,20}$/.test(candidate)
      ? <PublicProfile key={candidate} username={candidate} go={go} />
      : <NotFound go={go} />;
  }
  const isPublicProfile = !booting && !isDash && !isOnboard && !isAuthPage && path !== "/" &&
    /^[a-z0-9._]{1,20}$/.test(path.replace(/^\//, "").toLowerCase());

  return (
    <div className="pch" data-theme={theme}>
      <style>{CSS}</style>
      <ToastCtx.Provider value={toast}>
        <ThemeCtx.Provider value={{ theme, toggleTheme }}>
          <AuthCtx.Provider value={auth}>
            {view}
            {!isPublicProfile && !isDash && (
              <button
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? I.sun : I.moon}
              </button>
            )}
            <ToastHost items={toasts} dismiss={dismiss} />
          </AuthCtx.Provider>
        </ThemeCtx.Provider>
      </ToastCtx.Provider>
    </div>
  );
}

function NotFound({ go }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
      <div>
        <Logo onClick={() => go("/")} />
        <h1 style={{ fontSize: 32, marginTop: 22 }}>That page doesn't exist</h1>
        <p className="mut" style={{ marginTop: 10 }}>Check the URL, or head back to the homepage.</p>
        <Button style={{ marginTop: 22 }} onClick={() => go("/")}>Back to Tap-it</Button>
      </div>
    </div>
  );
}

/** Strips the password hash before any record reaches component state. */
function shape(rec) {
  const { passHash, ...safeAccount } = rec.account;
  return {
    account: safeAccount,
    profile: rec.profile,
    links: rec.links || [],
    analytics: rec.analytics || { views: [], clicks: [] },
  };
}
