// ============================================================================
// Functional experiments — Fintech & Treasury (8), Pricing (6), Toasts & banners (6),
// Media & Creative Tools (8)
// ============================================================================

(function () {
  "use strict";
  const X = window.DEVL_XP;
  const { head, esc, field } = X;

  // ==========================================================================
  // FINTECH & TREASURY
  // ==========================================================================
  X.addMany("crypto-fintech", {
    "orderbook-depth-wall": {
      html: `
        ${head("Fintech · orderbook-depth-wall.tsx", "Orderbook depth wall", "Live book with cumulative depth bars and a depth chart. Click a level to prefill the order form; your limit orders join the book.")}
        <div class="dv-row"><strong class="xp-mono">DEVL/USD</strong><span class="xp-num xp-mono" style="font-size:22px" data-mid></span><span class="dv-badge" data-spread></span></div>
        <div class="dv-grid" style="--min:300px;align-items:start">
          <div class="xp-panel" style="padding:8px"><table class="dv-table dv-table--compact"><thead><tr><th>Price</th><th class="is-num">Size</th><th class="is-num">Total</th></tr></thead><tbody data-asks></tbody><tbody data-bids></tbody></table></div>
          <div class="dv-stack">
            <div class="xp-panel"><svg class="xp-chart" viewBox="0 0 400 180" data-depth></svg></div>
            <form class="xp-panel dv-stack" data-form><dv-segmented value="buy" data-side><button class="dv-segmented__item" value="buy">Buy</button><button class="dv-segmented__item" value="sell">Sell</button></dv-segmented><div class="dv-row"><label class="dv-field" style="flex:1"><span class="dv-label">Limit price</span><input class="dv-input xp-mono" type="number" step="0.01" data-price required /></label><label class="dv-field" style="flex:1"><span class="dv-label">Size</span><input class="dv-input xp-mono" type="number" step="0.1" min="0.1" value="1" data-size required /></label></div><button type="submit" class="dv-btn dv-btn--primary">Place order</button></form>
          </div>
        </div>`,
      setup(root, ctx) {
        let mid = 142.3;
        const mine = [];
        const levels = (side) => Array.from({ length: 10 }, (_, i) => ({ p: +(mid + (side === "ask" ? 1 : -1) * (0.05 + i * 0.06)).toFixed(2), s: +(0.5 + Math.random() * 8).toFixed(2) }));
        let asks = levels("ask");
        let bids = levels("bid");
        const render = () => {
          // Merge my resting orders into copies of the latest market levels
          const A = asks.map((l) => ({ ...l }));
          const B = bids.map((l) => ({ ...l }));
          mine.forEach((o) => {
            const book = o.side === "buy" ? B : A;
            const lvl = book.find((l) => l.p === o.p);
            if (lvl) lvl.s = +(lvl.s + o.s).toFixed(2);
            else book.push({ p: o.p, s: o.s, mine: true });
          });
          A.sort((a, b) => a.p - b.p);
          B.sort((a, b) => b.p - a.p);
          const cum = (list) => list.reduce((acc, l) => (acc.push((acc[acc.length - 1] || 0) + l.s), acc), []);
          const ca = cum(A.slice(0, 10));
          const cb = cum(B.slice(0, 10));
          const max = Math.max(ca[ca.length - 1], cb[cb.length - 1]);
          const row = (l, c, side) => `<tr data-p="${l.p}" style="cursor:pointer;background:linear-gradient(to left, color-mix(in srgb,var(--dv-${side === "ask" ? "danger" : "success"}) 18%,transparent) ${(c / max) * 100}%, transparent 0)"><td class="xp-mono" style="color:var(--dv-${side === "ask" ? "danger" : "success"})">${l.p.toFixed(2)}${l.mine ? " ●" : ""}</td><td class="is-num">${l.s.toFixed(2)}</td><td class="is-num dv-muted">${c.toFixed(2)}</td></tr>`;
          ctx.$("[data-asks]").innerHTML = A.slice(0, 10).map((l, i) => row(l, ca[i], "ask")).reverse().join("");
          ctx.$("[data-bids]").innerHTML = B.slice(0, 10).map((l, i) => row(l, cb[i], "bid")).join("");
          const spread = A[0].p - B[0].p;
          ctx.$("[data-mid]").textContent = ((A[0].p + B[0].p) / 2).toFixed(2);
          ctx.$("[data-spread]").textContent = `spread ${spread.toFixed(2)} (${((spread / mid) * 1e4).toFixed(1)} bps)`;
          const lo = B[9] ? B[9].p : mid - 1;
          const hi = A[9] ? A[9].p : mid + 1;
          const X0 = (p) => ((p - lo) / (hi - lo)) * 380 + 10;
          const Y = (c) => 170 - (c / max) * 150;
          const step = (list, cumu) => list.slice(0, 10).map((l, i) => `L${X0(l.p).toFixed(1)},${Y(cumu[i - 1] || 0).toFixed(1)} L${X0(l.p).toFixed(1)},${Y(cumu[i]).toFixed(1)}`).join(" ");
          ctx.$("[data-depth]").innerHTML = `<path d="M${X0(B[0].p)},170 ${step(B, cb)} L${X0(B[9].p)},170 Z" fill="var(--dv-success)" fill-opacity=".2" stroke="var(--dv-success)"/><path d="M${X0(A[0].p)},170 ${step(A, ca)} L${X0(A[9].p)},170 Z" fill="var(--dv-danger)" fill-opacity=".2" stroke="var(--dv-danger)"/><line x1="${X0(mid)}" x2="${X0(mid)}" y1="10" y2="170" stroke="currentColor" stroke-dasharray="3 3" opacity=".4"/>`;
        };
        ctx.every(700, () => {
          mid = Math.max(1, mid + (Math.random() - 0.5) * 0.08);
          asks = levels("ask");
          bids = levels("bid");
          render();
        });
        ctx.on(root, "click", (e) => {
          const tr = e.target.closest("tr[data-p]");
          if (!tr) return;
          ctx.$("[data-price]").value = tr.dataset.p;
          ctx.$("[data-side]").value = tr.closest("[data-asks]") ? "buy" : "sell";
        });
        ctx.on(ctx.$("[data-form]"), "submit", (e) => {
          e.preventDefault();
          const side = ctx.$("[data-side]").value || "buy";
          const p = +Number(ctx.$("[data-price]").value).toFixed(2);
          const s = Number(ctx.$("[data-size]").value);
          if (!(p > 0 && s > 0)) return;
          const crosses = side === "buy" ? p >= asks[0].p : p <= bids[0].p;
          if (crosses) ctx.toast({ title: `Filled ${s} @ ${(side === "buy" ? asks[0].p : bids[0].p).toFixed(2)}`, description: "Order crossed the spread" });
          else {
            mine.push({ side, p, s });
            ctx.toast({ title: `Limit ${side} ${s} @ ${p.toFixed(2)} placed`, variant: "info" });
          }
          render();
        });
        ctx.$("[data-price]").value = mid.toFixed(2);
        render();
      }
    },

    "virtual-card-vault": {
      html: `
        ${head("Fintech · virtual-card-vault.tsx", "Virtual card vault", "Reveal details for 10 seconds, freeze the card, set a spend limit and lock merchants — then simulate purchases against those rules.")}
        <div class="dv-grid" style="--min:300px;align-items:start">
          <div data-card style="aspect-ratio:1.586;border-radius:16px;padding:22px;color:#fff;background:linear-gradient(135deg,var(--xp-accent),#0ea5e9);box-shadow:var(--dv-shadow-lg);display:flex;flex-direction:column;justify-content:space-between;transition:filter .3s;max-width:400px">
            <div class="dv-row"><strong>Acme · Ads budget</strong><span class="dv-spacer"></span><span data-frozen-tag hidden class="dv-badge" style="background:rgba(0,0,0,.3);color:#fff">❄ Frozen</span></div>
            <div class="xp-mono" style="font-size:20px;letter-spacing:.12em" data-num>•••• •••• •••• 4821</div>
            <div class="dv-row xp-mono" style="font-size:12px"><span>EXP <span data-exp>••/••</span></span><span>CVV <span data-cvv>•••</span></span><span class="dv-spacer"></span><strong>VISA</strong></div>
          </div>
          <div class="dv-stack">
            <div class="dv-row"><button type="button" class="dv-btn" data-reveal>👁 Reveal</button><label class="dv-choice">Freeze <input type="checkbox" role="switch" class="dv-switch" data-freeze /></label><span class="dv-muted" data-timer></span></div>
            <div class="xp-panel dv-stack" style="--gap:6px"><div class="dv-row"><span class="dv-label">Monthly limit</span><span class="dv-spacer"></span><strong class="xp-mono" id="vc-limit">$2,000</strong></div><input type="range" class="dv-range" min="100" max="10000" step="100" value="2000" data-limit aria-label="Monthly limit" /><div class="dv-meter"><span data-spent></span></div><span class="dv-hint" data-spent-t></span></div>
            <div class="xp-panel dv-stack" style="--gap:6px"><span class="dv-label">Allowed merchants</span><div class="dv-row" data-merch>${["Google Ads", "Meta", "LinkedIn", "Amazon"].map((m, i) => `<button type="button" class="dv-chip" data-m="${m}" aria-pressed="${i < 2}">${m}</button>`).join("")}</div></div>
            <div class="dv-row"><select class="dv-select" style="width:auto" data-buy-m aria-label="Merchant"><option>Google Ads</option><option>Meta</option><option>LinkedIn</option><option>Amazon</option></select><input class="dv-input xp-mono" type="number" value="250" style="width:110px" data-amt aria-label="Amount" /><button type="button" class="dv-btn dv-btn--primary" data-buy>Simulate purchase</button></div>
            <ul class="dv-list" data-log style="font-size:12px"></ul>
          </div>
        </div>`,
      setup(root, ctx) {
        let spent = 640;
        let reveal = 0;
        const sync = () => {
          const limit = Number(ctx.$("[data-limit]").value);
          ctx.$("#vc-limit").textContent = ctx.fmt.money(limit, "USD", 0);
          const s = ctx.$("[data-spent]");
          s.style.setProperty("--w", `${Math.min(100, (spent / limit) * 100)}%`);
          s.style.setProperty("--c", spent > limit * 0.9 ? "var(--dv-danger)" : "var(--xp-accent)");
          ctx.$("[data-spent-t]").textContent = `${ctx.fmt.money(spent, "USD", 0)} spent · ${ctx.fmt.money(Math.max(0, limit - spent), "USD", 0)} left`;
          const frozen = ctx.$("[data-freeze]").checked;
          ctx.$("[data-card]").style.filter = frozen ? "grayscale(1) brightness(.7)" : "";
          ctx.$("[data-frozen-tag]").hidden = !frozen;
          ctx.$("[data-num]").textContent = reveal ? "4532 7781 0934 4821" : "•••• •••• •••• 4821";
          ctx.$("[data-exp]").textContent = reveal ? "09/29" : "••/••";
          ctx.$("[data-cvv]").textContent = reveal ? "318" : "•••";
          ctx.$("[data-timer]").textContent = reveal ? `Hiding in ${reveal}s` : "";
        };
        ctx.on(ctx.$("[data-reveal]"), "click", () => ((reveal = 10), sync()));
        ctx.every(1000, () => reveal && (reveal--, sync()));
        ctx.on(ctx.$("[data-limit]"), "input", sync);
        ctx.on(ctx.$("[data-freeze]"), "change", sync);
        ctx.on(ctx.$("[data-merch]"), "click", (e) => {
          const b = e.target.closest("[data-m]");
          if (b) b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
        });
        ctx.on(ctx.$("[data-buy]"), "click", () => {
          const m = ctx.$("[data-buy-m]").value;
          const amt = Number(ctx.$("[data-amt]").value) || 0;
          const allowed = ctx.$(`[data-m="${m}"]`).getAttribute("aria-pressed") === "true";
          let reason = "";
          if (ctx.$("[data-freeze]").checked) reason = "card frozen";
          else if (!allowed) reason = "merchant not allowed";
          else if (spent + amt > Number(ctx.$("[data-limit]").value)) reason = "over monthly limit";
          if (!reason) spent += amt;
          ctx.$("[data-log]").insertAdjacentHTML("afterbegin", `<li><span class="dv-badge dv-badge--${reason ? "danger" : "success"}">${reason ? "Declined" : "Approved"}</span><span>${esc(m)}</span><span class="xp-mono">${ctx.fmt.money(amt)}</span><span class="dv-list__end dv-muted">${reason}</span></li>`);
          sync();
        });
        sync();
      }
    },

    "fx-currency-swap": {
      html: `
        ${head("Fintech · fx-currency-swap.tsx", "FX currency swap", "Live-ticking rates, swap direction, slippage tolerance and a 15-second locked quote that refreshes when it expires.")}
        <div class="dv-card" style="max-width:480px;width:100%;margin:0 auto"><div class="dv-card__body dv-stack">
          <div class="dv-row" style="flex-wrap:nowrap"><input class="dv-input xp-mono" style="font-size:20px;height:48px" type="number" min="0" value="2500" data-amt aria-label="Amount" /><select class="dv-select" style="width:110px;height:48px" data-from aria-label="From">${["USD", "EUR", "MXN", "GBP", "JPY"].map((c) => `<option>${c}</option>`).join("")}</select></div>
          <button type="button" class="dv-btn dv-btn--icon" style="align-self:center" data-swap aria-label="Swap direction">⇅</button>
          <div class="dv-row" style="flex-wrap:nowrap"><div class="dv-input xp-mono" style="font-size:20px;height:48px;display:flex;align-items:center" data-out></div><select class="dv-select" style="width:110px;height:48px" data-to aria-label="To">${["EUR", "USD", "MXN", "GBP", "JPY"].map((c) => `<option>${c}</option>`).join("")}</select></div>
          <div class="dv-row"><span class="dv-label">Slippage</span><dv-segmented value="0.5" data-slip><button class="dv-segmented__item" value="0.1">0.1%</button><button class="dv-segmented__item" value="0.5">0.5%</button><button class="dv-segmented__item" value="1">1%</button></dv-segmented></div>
          <dl class="xp-kv xp-mono" data-quote></dl>
          <progress class="dv-progress" max="15" value="15" data-lock></progress>
          <button type="button" class="dv-btn dv-btn--primary dv-btn--block" data-go>Swap</button>
        </div></div>`,
      setup(root, ctx) {
        const base = { USD: 1, EUR: 0.925, MXN: 18.42, GBP: 0.79, JPY: 149.8 };
        let locked = { ...base };
        let left = 15;
        const rate = (a, b, src) => src[b] / src[a];
        const render = () => {
          const amt = Number(ctx.$("[data-amt]").value) || 0;
          const from = ctx.$("[data-from]").value;
          const to = ctx.$("[data-to]").value;
          const r = rate(from, to, locked);
          const fee = amt * 0.002;
          const out = (amt - fee) * r;
          const slip = Number(ctx.$("[data-slip]").value || 0.5) / 100;
          const fmt = (v, c) => new Intl.NumberFormat("en-US", { style: "currency", currency: c, maximumFractionDigits: c === "JPY" ? 0 : 2 }).format(v);
          ctx.$("[data-out]").textContent = fmt(out, to);
          ctx.$("[data-quote]").innerHTML = `<dt>Rate</dt><dd>1 ${from} = ${r.toFixed(4)} ${to}</dd><dt>Fee (0.2%)</dt><dd>${fmt(fee, from)}</dd><dt>Min. received</dt><dd>${fmt(out * (1 - slip), to)}</dd><dt>Quote</dt><dd>${left ? `locked · ${left}s` : "refreshing…"}</dd>`;
          ctx.$("[data-lock]").value = left;
        };
        ctx.every(1000, () => {
          left--;
          if (left <= 0) {
            Object.keys(base).forEach((k) => k !== "USD" && (base[k] *= 1 + (Math.random() - 0.5) * 0.004));
            locked = { ...base };
            left = 15;
          }
          render();
        });
        ["[data-amt]", "[data-from]", "[data-to]"].forEach((s) => ctx.on(ctx.$(s), "input", render));
        ctx.on(ctx.$("[data-slip]"), "dv-change", render);
        ctx.on(ctx.$("[data-swap]"), "click", () => {
          const f = ctx.$("[data-from]");
          const t = ctx.$("[data-to]");
          [f.value, t.value] = [t.value, f.value];
          render();
        });
        ctx.on(ctx.$("[data-go]"), "click", () => {
          if (ctx.$("[data-from]").value === ctx.$("[data-to]").value) return ctx.toast({ title: "Pick two different currencies", variant: "warning" });
          ctx.toast({ title: "Swap executed", description: `${ctx.$("[data-amt]").value} ${ctx.$("[data-from]").value} → ${ctx.$("[data-out]").textContent}` });
        });
        render();
      }
    },

    "treasury-runway-burn": {
      html: `
        ${head("Fintech · treasury-runway-burn.tsx", "Treasury runway burn", "Month-by-month cash projection from revenue, costs and growth rates. See the runway and zero-cash date move as you change assumptions or pick a scenario.")}
        <div class="dv-row" data-scen>${["Base", "Lean", "Hire 5", "Raise $2M"].map((s, i) => `<button type="button" class="dv-chip" data-s="${s}" aria-pressed="${!i}">${s}</button>`).join("")}</div>
        <div class="dv-grid" style="--min:300px;align-items:start">
          <div class="xp-panel dv-stack" data-form>
            ${[["cash", "Cash in bank ($k)", 1800], ["rev", "Monthly revenue ($k)", 85], ["cost", "Monthly costs ($k)", 190], ["rg", "Revenue growth %/mo", 6], ["cg", "Cost growth %/mo", 1.5]].map(([k, l, v]) => `<label class="dv-row" style="justify-content:space-between"><span>${l}</span><input class="dv-input xp-mono" type="number" step="0.5" style="width:110px" data-k="${k}" value="${v}" /></label>`).join("")}
          </div>
          <div class="dv-stack"><div class="dv-grid" style="--min:140px"><div class="dv-stat"><span class="dv-eyebrow">Runway</span><span class="dv-stat__value" data-runway></span></div><div class="dv-stat"><span class="dv-eyebrow">Zero-cash</span><span class="dv-stat__value" style="font-size:18px" data-zero></span></div><div class="dv-stat"><span class="dv-eyebrow">Net burn now</span><span class="dv-stat__value" data-burn></span></div></div><div class="xp-panel"><svg class="xp-chart" viewBox="0 0 400 180" data-chart></svg></div></div>
        </div>`,
      setup(root, ctx) {
        const scen = { Base: { cash: 1800, rev: 85, cost: 190, rg: 6, cg: 1.5 }, Lean: { cash: 1800, rev: 85, cost: 140, rg: 5, cg: 0.5 }, "Hire 5": { cash: 1800, rev: 85, cost: 255, rg: 8, cg: 1.5 }, "Raise $2M": { cash: 3800, rev: 85, cost: 210, rg: 7, cg: 2 } };
        const render = () => {
          const v = Object.fromEntries(ctx.$$("[data-k]").map((i) => [i.dataset.k, Number(i.value) || 0]));
          let cash = v.cash;
          let rev = v.rev;
          let cost = v.cost;
          const pts = [cash];
          let zero = -1;
          for (let m = 1; m <= 48; m++) {
            cash += rev - cost;
            rev *= 1 + v.rg / 100;
            cost *= 1 + v.cg / 100;
            pts.push(cash);
            if (cash <= 0 && zero < 0) zero = m;
          }
          const profitable = zero < 0;
          ctx.$("[data-runway]").textContent = profitable ? "∞" : `${zero} mo`;
          ctx.$("[data-zero]").textContent = profitable ? "Default alive ✓" : new Date(new Date().getFullYear(), new Date().getMonth() + zero, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
          ctx.$("[data-burn]").textContent = `$${Math.max(0, v.cost - v.rev).toFixed(0)}k`;
          const C = DEVL_XP.chart;
          const max = C.niceMax(Math.max(...pts));
          const min = Math.min(0, ...pts);
          const x = C.scale(0, 48, 30, 395);
          const y = C.scale(min, max, 165, 10);
          ctx.$("[data-chart]").innerHTML = `<line x1="30" x2="395" y1="${y(0)}" y2="${y(0)}" stroke="var(--dv-danger)" stroke-dasharray="4 3" opacity=".6"/><path d="${C.path(pts.map((p, i) => [x(i), y(p)]))}" fill="none" stroke="var(--xp-accent)" stroke-width="2"/>${zero > 0 ? `<circle cx="${x(zero)}" cy="${y(0)}" r="4" fill="var(--dv-danger)"/><text x="${x(zero)}" y="${y(0) - 8}" text-anchor="middle">month ${zero}</text>` : ""}<text x="30" y="178">now</text><text x="395" y="178" text-anchor="end">+48 mo</text>`;
        };
        ctx.on(ctx.$("[data-form]"), "input", render);
        ctx.on(ctx.$("[data-scen]"), "click", (e) => {
          const b = e.target.closest("[data-s]");
          if (!b) return;
          ctx.$$("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
          Object.entries(scen[b.dataset.s]).forEach(([k, v]) => (ctx.$(`[data-k="${k}"]`).value = v));
          render();
        });
        render();
      }
    },

    "liquidity-pool-range": {
      html: `
        ${head("Fintech · liquidity-pool-range.tsx", "Liquidity range concentrated", "Set a price range over the liquidity histogram. Narrower ranges earn more fees while in range — and nothing once price leaves it.")}
        <div class="xp-panel"><svg class="xp-chart" viewBox="0 0 600 200" data-hist></svg></div>
        <div class="dv-grid" style="--min:240px">
          <label class="dv-field"><span class="dv-label">Min price <strong class="xp-mono" id="lp-min">$1,700</strong></span><input type="range" class="dv-range" min="1000" max="3000" step="10" value="1700" data-min data-dv-output="#lp-min" aria-label="Min price" /></label>
          <label class="dv-field"><span class="dv-label">Max price <strong class="xp-mono" id="lp-max">$2,300</strong></span><input type="range" class="dv-range" min="1000" max="3000" step="10" value="2300" data-max data-dv-output="#lp-max" aria-label="Max price" /></label>
        </div>
        <div class="dv-row"><button type="button" class="dv-btn dv-btn--sm" data-drift>Simulate price move</button><div class="dv-grid" style="--min:150px;flex:1"><div class="dv-stat"><span class="dv-eyebrow">Status</span><span data-status></span></div><div class="dv-stat"><span class="dv-eyebrow">Est. APR</span><span class="dv-stat__value" data-apr></span></div><div class="dv-stat"><span class="dv-eyebrow">Capital efficiency</span><span class="dv-stat__value" data-eff></span></div></div></div>`,
      setup(root, ctx) {
        let price = 2000;
        const bins = Array.from({ length: 40 }, (_, i) => {
          const p = 1000 + i * 50;
          return { p, l: Math.exp(-((p - 2000) ** 2) / (2 * 380 ** 2)) * 100 + Math.random() * 12 };
        });
        const render = () => {
          let lo = Number(ctx.$("[data-min]").value);
          let hi = Number(ctx.$("[data-max]").value);
          if (lo >= hi) {
            hi = lo + 10;
            ctx.$("[data-max]").value = String(hi);
          }
          ctx.$("#lp-min").textContent = `$${lo.toLocaleString("en-US")}`;
          ctx.$("#lp-max").textContent = `$${hi.toLocaleString("en-US")}`;
          const max = Math.max(...bins.map((b) => b.l));
          const X0 = (p) => ((p - 1000) / 2000) * 580 + 10;
          ctx.$("[data-hist]").innerHTML =
            `<rect x="${X0(lo)}" y="0" width="${X0(hi) - X0(lo)}" height="180" fill="var(--xp-accent)" opacity=".1"/>` +
            bins.map((b) => `<rect x="${X0(b.p) + 1}" y="${180 - (b.l / max) * 160}" width="${(580 / 40) - 2}" height="${(b.l / max) * 160}" fill="${b.p >= lo && b.p < hi ? "var(--xp-accent)" : "var(--dv-fg-subtle)"}" opacity=".8"/>`).join("") +
            `<line x1="${X0(price)}" x2="${X0(price)}" y1="0" y2="180" stroke="var(--dv-warning)" stroke-width="2"/><text x="${X0(price)}" y="196" text-anchor="middle">$${price.toFixed(0)}</text>`;
          const inRange = price >= lo && price <= hi;
          const eff = Math.sqrt(hi / lo) / (Math.sqrt(hi / lo) - 1);
          ctx.$("[data-status]").innerHTML = inRange ? '<span class="dv-badge dv-badge--success">In range · earning</span>' : '<span class="dv-badge dv-badge--danger">Out of range · 0 fees</span>';
          ctx.$("[data-apr]").textContent = inRange ? `${Math.min(999, 4.2 * eff).toFixed(1)}%` : "0%";
          ctx.$("[data-eff]").textContent = `${eff.toFixed(1)}×`;
        };
        ctx.on(ctx.$("[data-min]"), "input", render);
        ctx.on(ctx.$("[data-max]"), "input", render);
        ctx.on(ctx.$("[data-drift]"), "click", () => {
          const target = price + (Math.random() - 0.5) * 900;
          const start = price;
          const t0 = performance.now();
          ctx.raf((t) => {
            const k = Math.min(1, (t - t0) / 900);
            price = Math.max(1000, Math.min(3000, start + (target - start) * (1 - (1 - k) ** 3)));
            render();
            if (k === 1) return false;
          });
        });
        render();
      }
    },

    "wire-transfer-stepper": {
      html: `
        ${head("Fintech · wire-transfer-stepper.tsx", "Wire transfer stepper", "Recipient → amount → review → sent. The IBAN is validated with the real ISO 13616 mod-97 checksum (try GB82 WEST 1234 5698 7654 32).")}
        <div class="xp-panel dv-stack" style="max-width:560px;width:100%;margin:0 auto">
          <ol class="dv-steps" data-steps><li aria-current="step">Recipient</li><li>Amount</li><li>Review</li><li>Sent</li></ol>
          <section data-p="0" class="dv-stack"><label class="dv-field"><span class="dv-label">Beneficiary name</span><input class="dv-input" data-name value="Globex GmbH" /></label><label class="dv-field"><span class="dv-label">IBAN</span><input class="dv-input xp-mono" data-iban placeholder="DE89 3704 0044 0532 0130 00" /><span class="dv-hint" data-iban-hint></span></label><label class="dv-field"><span class="dv-label">BIC / SWIFT</span><input class="dv-input xp-mono" data-bic value="COBADEFFXXX" /></label></section>
          <section data-p="1" class="dv-stack" hidden><div class="dv-row" style="flex-wrap:nowrap"><input class="dv-input xp-mono" type="number" min="1" value="12500" data-amt aria-label="Amount" style="font-size:18px" /><select class="dv-select" style="width:100px" data-cur aria-label="Currency"><option>EUR</option><option>USD</option><option>GBP</option></select></div><label class="dv-field"><span class="dv-label">Reference</span><input class="dv-input" data-ref value="INV-2094" /></label><dl class="xp-kv xp-mono" data-fees></dl></section>
          <section data-p="2" class="dv-stack" hidden><dl class="xp-kv" data-review></dl><label class="dv-choice"><input type="checkbox" class="dv-check" data-confirm /> I confirm the details are correct</label></section>
          <section data-p="3" class="dv-stack" hidden><div class="dv-alert dv-alert--success"><div><div class="dv-alert__title">Transfer submitted</div><div class="dv-alert__desc" data-done></div></div></div></section>
          <span class="dv-error" data-err></span>
          <div class="dv-row"><button type="button" class="dv-btn" data-back disabled>Back</button><span class="dv-spacer"></span><button type="button" class="dv-btn dv-btn--primary" data-next>Continue</button></div>
        </div>`,
      setup(root, ctx) {
        let step = 0;
        const ibanOk = (raw) => {
          const s = raw.replace(/\s+/g, "").toUpperCase();
          if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(s)) return false;
          const moved = s.slice(4) + s.slice(0, 4);
          const digits = moved.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
          let rem = 0;
          for (const d of digits) rem = (rem * 10 + Number(d)) % 97;
          return rem === 1;
        };
        const iban = ctx.$("[data-iban]");
        ctx.on(iban, "input", () => {
          const s = iban.value.replace(/\s+/g, "").toUpperCase();
          iban.value = s.replace(/(.{4})/g, "$1 ").trim();
          const ok = ibanOk(s);
          ctx.$("[data-iban-hint]").innerHTML = s.length < 15 ? "" : ok ? '<span style="color:var(--dv-success)">✓ Valid checksum</span>' : '<span style="color:var(--dv-danger)">✕ Checksum failed</span>';
        });
        const fees = () => {
          const amt = Number(ctx.$("[data-amt]").value) || 0;
          const cur = ctx.$("[data-cur]").value;
          const fee = cur === "EUR" ? 0 : 15;
          ctx.$("[data-fees]").innerHTML = `<dt>Transfer fee</dt><dd>${fee ? `${fee} ${cur} (SWIFT)` : "Free (SEPA)"}</dd><dt>Total debited</dt><dd>${(amt + fee).toLocaleString("en-US")} ${cur}</dd><dt>Arrives</dt><dd>${fee ? "1–2 business days" : "Today (SEPA Instant)"}</dd>`;
        };
        ctx.on(ctx.$("[data-amt]"), "input", fees);
        ctx.on(ctx.$("[data-cur]"), "change", fees);
        const go = (n) => {
          step = n;
          ctx.$$("[data-p]").forEach((p) => (p.hidden = Number(p.dataset.p) !== n));
          ctx.$$("[data-steps] li").forEach((li, i) => {
            li.removeAttribute("aria-current");
            li.removeAttribute("data-state");
            if (i < n) li.dataset.state = "done";
            if (i === n) li.setAttribute("aria-current", "step");
          });
          ctx.$("[data-back]").disabled = n === 0 || n === 3;
          ctx.$("[data-next]").textContent = n === 2 ? "Send transfer" : n === 3 ? "New transfer" : "Continue";
          ctx.$("[data-err]").textContent = "";
          if (n === 2) ctx.$("[data-review]").innerHTML = `<dt>To</dt><dd>${esc(ctx.$("[data-name]").value)}</dd><dt>IBAN</dt><dd class="xp-mono">${esc(iban.value)}</dd><dt>BIC</dt><dd class="xp-mono">${esc(ctx.$("[data-bic]").value)}</dd><dt>Amount</dt><dd>${Number(ctx.$("[data-amt]").value).toLocaleString("en-US")} ${ctx.$("[data-cur]").value}</dd><dt>Reference</dt><dd>${esc(ctx.$("[data-ref]").value)}</dd>`;
          if (n === 1) fees();
        };
        ctx.on(ctx.$("[data-next]"), "click", (e) => {
          let err = "";
          if (step === 0) {
            if (!ctx.$("[data-name]").value.trim()) err = "Enter the beneficiary name.";
            else if (!ibanOk(iban.value)) err = "IBAN is invalid.";
            else if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(ctx.$("[data-bic]").value.toUpperCase())) err = "BIC must be 8 or 11 characters.";
          } else if (step === 1 && !(Number(ctx.$("[data-amt]").value) > 0)) err = "Enter an amount.";
          else if (step === 2 && !ctx.$("[data-confirm]").checked) err = "Please confirm the details.";
          if (err) return (ctx.$("[data-err]").textContent = err);
          if (step === 2) {
            e.target.setAttribute("aria-busy", "true");
            return ctx.timeout(900, () => {
              e.target.removeAttribute("aria-busy");
              ctx.$("[data-done]").textContent = `Reference WT-${Date.now().toString(36).toUpperCase()} · track it in Transactions.`;
              go(3);
            });
          }
          if (step === 3) {
            ctx.$("[data-confirm]").checked = false;
            return go(0);
          }
          go(step + 1);
        });
        ctx.on(ctx.$("[data-back]"), "click", () => go(Math.max(0, step - 1)));
        go(0);
      }
    },

    "tax-lot-harvester": {
      html: `
        ${head("Fintech · tax-lot-harvester.tsx", "Tax lot harvester", "Choose a quantity and a lot-selection method (FIFO / LIFO / HIFO) or tick lots by hand; realized short- and long-term gains and estimated tax recompute.")}
        <div class="dv-row"><span class="dv-label">Sell</span><input class="dv-input xp-mono" type="number" min="0" value="60" style="width:90px" data-qty aria-label="Quantity" /><span>shares at</span><input class="dv-input xp-mono" type="number" value="182" style="width:90px" data-price aria-label="Price" /><dv-segmented value="hifo" data-method><button class="dv-segmented__item" value="fifo">FIFO</button><button class="dv-segmented__item" value="lifo">LIFO</button><button class="dv-segmented__item" value="hifo">HIFO</button><button class="dv-segmented__item" value="manual">Manual</button></dv-segmented></div>
        <div class="dv-table-wrap"><table class="dv-table"><thead><tr><th></th><th>Acquired</th><th class="is-num">Shares</th><th class="is-num">Cost/share</th><th>Term</th><th class="is-num">Sell</th><th class="is-num">Gain/loss</th></tr></thead><tbody data-lots></tbody></table></div>
        <div class="dv-grid" style="--min:170px"><div class="dv-stat"><span class="dv-eyebrow">Short-term</span><span class="dv-stat__value" data-st></span></div><div class="dv-stat"><span class="dv-eyebrow">Long-term</span><span class="dv-stat__value" data-lt></span></div><div class="dv-stat"><span class="dv-eyebrow">Est. tax</span><span class="dv-stat__value" data-tax></span></div></div>`,
      setup(root, ctx) {
        const today = new Date();
        const lots = [["2023-03-14", 40, 121], ["2024-01-08", 25, 168], ["2025-06-20", 30, 201], ["2025-11-02", 20, 155], ["2026-04-11", 35, 190]].map(([d, n, c]) => ({ d, n, c, pick: 0 }));
        const longTerm = (d) => (today - new Date(d)) / 864e5 > 365;
        const render = () => {
          const qty = Math.max(0, Number(ctx.$("[data-qty]").value) || 0);
          const price = Number(ctx.$("[data-price]").value) || 0;
          const method = ctx.$("[data-method]").value || "hifo";
          if (method !== "manual") {
            const order = lots.slice().sort((a, b) => (method === "fifo" ? a.d.localeCompare(b.d) : method === "lifo" ? b.d.localeCompare(a.d) : b.c - a.c));
            let left = qty;
            lots.forEach((l) => (l.pick = 0));
            order.forEach((l) => {
              l.pick = Math.min(l.n, left);
              left -= l.pick;
            });
          }
          let st = 0;
          let lt = 0;
          ctx.$("[data-lots]").innerHTML = lots
            .map((l, i) => {
              const g = (price - l.c) * l.pick;
              longTerm(l.d) ? (lt += g) : (st += g);
              return `<tr><td><input type="checkbox" class="dv-check" data-i="${i}"${l.pick ? " checked" : ""}${method === "manual" ? "" : " disabled"} aria-label="Sell lot ${i + 1}" /></td><td class="xp-mono">${l.d}</td><td class="is-num">${l.n}</td><td class="is-num">$${l.c}</td><td><span class="dv-badge dv-badge--${longTerm(l.d) ? "success" : "warning"}">${longTerm(l.d) ? "Long" : "Short"}</span></td><td class="is-num">${l.pick}</td><td class="is-num" style="color:${g >= 0 ? "var(--dv-success)" : "var(--dv-danger)"}">${g ? ctx.fmt.money(g, "USD", 0) : "—"}</td></tr>`;
            })
            .join("");
          const color = (v) => `<span style="color:${v >= 0 ? "var(--dv-success)" : "var(--dv-danger)"}">${ctx.fmt.money(v, "USD", 0)}</span>`;
          ctx.$("[data-st]").innerHTML = color(st);
          ctx.$("[data-lt]").innerHTML = color(lt);
          ctx.$("[data-tax]").textContent = ctx.fmt.money(Math.max(0, st) * 0.37 + Math.max(0, lt) * 0.2 + Math.min(0, st + lt) * 0.37, "USD", 0);
        };
        ctx.on(ctx.$("[data-lots]"), "change", (e) => {
          const c = e.target.closest("[data-i]");
          if (!c) return;
          const l = lots[c.dataset.i];
          l.pick = c.checked ? l.n : 0;
          ctx.$("[data-qty]").value = String(lots.reduce((s, x) => s + x.pick, 0));
          render();
        });
        ctx.on(ctx.$("[data-qty]"), "input", render);
        ctx.on(ctx.$("[data-price]"), "input", render);
        ctx.on(ctx.$("[data-method]"), "dv-change", render);
        render();
      }
    },

    "multi-sig-quorum": {
      html: `
        ${head("Fintech · multi-sig-quorum.tsx", "Multi-sig quorum", "Collect signatures from hardware signers until the threshold is met, then execute. Change the threshold to see the policy react.")}
        <div class="dv-grid" style="--min:300px;align-items:start">
          <div class="xp-panel dv-stack"><span class="dv-eyebrow">Transaction · nonce <span data-nonce>41</span></span><dl class="xp-kv xp-mono"><dt>To</dt><dd>0x9F2a…71E0</dd><dt>Amount</dt><dd>25,000 USDC</dd><dt>Memo</dt><dd>Q4 payroll</dd></dl><div class="dv-row"><span class="dv-label">Threshold</span><div class="dv-number"><button type="button" data-step="-1" aria-label="Lower">−</button><input type="number" min="1" max="5" value="3" data-th aria-label="Threshold" /><button type="button" data-step="1" aria-label="Raise">+</button></div><span class="dv-muted">of 5</span></div><progress class="dv-progress" max="3" value="0" data-bar></progress><button type="button" class="dv-btn dv-btn--primary" data-exec disabled>Execute transaction</button></div>
          <ul class="dv-list" data-signers></ul>
        </div>`,
      setup(root, ctx) {
        const signers = [["Luis", "Ledger"], ["Ana", "Trezor"], ["Leo", "GridPlus"], ["Sara", "Ledger"], ["CFO vault", "HSM"]].map(([n, d]) => ({ n, d, state: "pending" }));
        let nonce = 41;
        const render = () => {
          const th = Math.max(1, Math.min(5, Number(ctx.$("[data-th]").value) || 1));
          const signed = signers.filter((s) => s.state === "signed").length;
          ctx.$("[data-bar]").max = th;
          ctx.$("[data-bar]").value = Math.min(th, signed);
          ctx.$("[data-exec]").disabled = signed < th;
          ctx.$("[data-exec]").textContent = signed < th ? `Need ${th - signed} more signature${th - signed > 1 ? "s" : ""}` : "Execute transaction";
          ctx.$("[data-signers]").innerHTML = signers.map((s, i) => `<li><span class="dv-avatar dv-avatar--sm">${s.n[0]}</span><div style="flex:1"><div class="dv-list__title">${s.n}</div><div class="dv-list__desc">${s.d}</div></div>${s.state === "signed" ? '<span class="dv-badge dv-badge--success">✓ Signed</span>' : s.state === "signing" ? '<span class="dv-badge dv-badge--info"><span class="dv-spinner" style="--size:10px;margin-right:4px"></span>Confirm on device…</span>' : `<button type="button" class="dv-btn dv-btn--sm" data-sign="${i}">Sign</button>`}</li>`).join("");
          ctx.$("[data-nonce]").textContent = String(nonce);
        };
        ctx.on(ctx.$("[data-signers]"), "click", (e) => {
          const b = e.target.closest("[data-sign]");
          if (!b) return;
          const s = signers[b.dataset.sign];
          s.state = "signing";
          render();
          ctx.timeout(900 + Math.random() * 800, () => {
            s.state = "signed";
            render();
          });
        });
        ctx.on(ctx.$("[data-th]"), "input", render);
        ctx.on(root, "click", (e) => e.target.closest("[data-step]") && ctx.timeout(0, render));
        ctx.on(ctx.$("[data-exec]"), "click", () => {
          ctx.toast({ title: "Transaction executed", description: `nonce ${nonce} · 25,000 USDC sent` });
          nonce++;
          signers.forEach((s) => (s.state = "pending"));
          render();
        });
        render();
      }
    }
  });

  // ==========================================================================
  // PRICING
  // ==========================================================================
  const currencies = { USD: 1, EUR: 0.93, MXN: 18 };
  const fmtCur = (v, c) => new Intl.NumberFormat("en-US", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(v * currencies[c]);
  X.fmtCur = fmtCur;

  X.addMany("pricing", {
    "three-tier": {
      html: `
        ${head("Pricing · three-tier.tsx", "Three-tier", "Hobby / Pro / Enterprise with billing toggle, currency switch and feature tooltips. CTAs act for real.")}
        <div class="dv-row" style="justify-content:center"><dv-segmented value="year" data-period><button class="dv-segmented__item" value="month">Monthly</button><button class="dv-segmented__item" value="year">Yearly −20%</button></dv-segmented><select class="dv-select" style="width:auto" data-cur aria-label="Currency"><option>USD</option><option>EUR</option><option>MXN</option></select></div>
        <div class="dv-grid" style="--min:230px;align-items:stretch" data-tiers></div>`,
      setup(root, ctx) {
        const tiers = [["Hobby", 0, ["1 workspace", "3 projects", "Community support"], "Start free"], ["Pro", 24, ["Unlimited projects", "Custom domains", "Version history", "Priority support"], "Start trial"], ["Enterprise", null, ["SSO & SCIM", "Audit log", "99.99% SLA", "Dedicated CSM"], "Contact sales"]];
        const tips = { "Custom domains": "Serve docs at docs.yourco.com", "Version history": "90 days of snapshots", "SSO & SCIM": "Okta, Azure AD, Google", "99.99% SLA": "Credits if we miss it" };
        const render = () => {
          const y = (ctx.$("[data-period]").value || "year") === "year";
          const c = ctx.$("[data-cur]").value;
          ctx.$("[data-tiers]").innerHTML = tiers.map(([n, p, feats, cta], i) => `<div class="dv-card${i === 1 ? "" : " dv-card--flat"}" style="${i === 1 ? "border-color:var(--xp-accent)" : ""}"><div class="dv-card__body dv-stack" style="height:100%"><div class="dv-row"><span class="dv-eyebrow">${n}</span>${i === 1 ? '<span class="dv-badge dv-badge--accent">Most popular</span>' : ""}</div><div class="xp-num">${p === null ? "Custom" : fmtCur(y ? p * 0.8 : p, c)}${p ? '<span class="dv-muted" style="font-size:12px">/mo</span>' : ""}</div><span class="dv-hint">${p ? (y ? `${fmtCur(p * 0.8 * 12, c)} billed yearly` : "Billed monthly") : p === 0 ? "Free forever" : "Annual contract"}</span><ul class="dv-stack" style="--gap:6px;list-style:none;padding:0;font-size:12px;flex:1">${feats.map((f) => `<li>✓ ${tips[f] ? `<span data-dv-tooltip="${tips[f]}" style="border-bottom:1px dotted var(--dv-fg-subtle);cursor:help">${f}</span>` : f}</li>`).join("")}</ul><button type="button" class="dv-btn dv-btn--block ${i === 1 ? "dv-btn--primary" : ""}" data-cta="${n}">${cta}</button></div></div>`).join("");
        };
        ctx.on(ctx.$("[data-period]"), "dv-change", render);
        ctx.on(ctx.$("[data-cur]"), "change", render);
        ctx.on(ctx.$("[data-tiers]"), "click", (e) => {
          const b = e.target.closest("[data-cta]");
          if (!b) return;
          b.setAttribute("aria-busy", "true");
          ctx.timeout(600, () => {
            b.removeAttribute("aria-busy");
            ctx.toast({ title: b.dataset.cta === "Enterprise" ? "Sales will reach out within 24h" : `${b.dataset.cta} plan selected` });
          });
        });
        render();
      }
    },

    "comparison-table": {
      html: `
        ${head("Pricing · comparison-table.tsx", "Feature matrix", "Sticky header, collapsible categories, “only differences” filter and a selectable plan column.")}
        <div class="dv-row"><label class="dv-choice">Only show differences <input type="checkbox" role="switch" class="dv-switch" data-diff /></label><span class="dv-spacer"></span><span class="dv-badge dv-badge--accent" data-sel>Selected: Pro</span></div>
        <div class="dv-table-wrap" style="max-height:440px;overflow:auto"><table class="dv-table" data-t></table></div>`,
      setup(root, ctx) {
        const plans = ["Free", "Pro", "Team", "Enterprise"];
        const cats = { Core: [["Projects", "3", "∞", "∞", "∞"], ["Members", "1", "5", "25", "∞"], ["Storage", "1 GB", "50 GB", "500 GB", "Custom"]], Collaboration: [["Comments", "✓", "✓", "✓", "✓"], ["Guest access", "—", "✓", "✓", "✓"], ["Version history", "7 days", "90 days", "1 year", "∞"]], Security: [["2FA", "✓", "✓", "✓", "✓"], ["SSO", "—", "—", "✓", "✓"], ["Audit log", "—", "—", "—", "✓"]] };
        const closed = new Set();
        let sel = 1;
        const render = () => {
          const diff = ctx.$("[data-diff]").checked;
          ctx.$("[data-t]").innerHTML = `<thead style="position:sticky;top:0;z-index:1"><tr><th>Feature</th>${plans.map((p, i) => `<th style="text-align:center;cursor:pointer;${i === sel ? "color:var(--xp-accent)" : ""}" data-plan="${i}">${p}</th>`).join("")}</tr></thead><tbody>${Object.entries(cats)
            .map(([c, rows]) => `<tr><td colspan="5" style="background:var(--dv-surface)"><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-cat="${c}">${closed.has(c) ? "▸" : "▾"} ${c}</button></td></tr>${closed.has(c) ? "" : rows.filter((r) => !diff || new Set(r.slice(1)).size > 1).map((r) => `<tr><td>${r[0]}</td>${r.slice(1).map((v, i) => `<td style="text-align:center;${i === sel ? "background:color-mix(in srgb,var(--xp-accent) 9%,transparent)" : ""};color:${v === "—" ? "var(--dv-fg-subtle)" : v === "✓" ? "var(--dv-success)" : ""}">${v}</td>`).join("")}</tr>`).join("")}`)
            .join("")}</tbody>`;
          ctx.$("[data-sel]").textContent = `Selected: ${plans[sel]}`;
        };
        ctx.on(ctx.$("[data-t]"), "click", (e) => {
          const c = e.target.closest("[data-cat]");
          const p = e.target.closest("[data-plan]");
          if (c) closed.has(c.dataset.cat) ? closed.delete(c.dataset.cat) : closed.add(c.dataset.cat);
          if (p) sel = Number(p.dataset.plan);
          if (c || p) render();
        });
        ctx.on(ctx.$("[data-diff]"), "change", render);
        render();
      }
    },

    "slider-seats": {
      html: `
        ${head("Pricing · slider-seats.tsx", "Seat slider", "Graduated volume pricing: each tier of seats has its own price. The breakdown and savings vs. list price update live.")}
        <div class="xp-panel dv-stack" style="max-width:640px;width:100%;margin:0 auto">
          <div class="dv-row"><span class="dv-label">Seats</span><strong class="xp-num" style="font-size:28px" data-n>25</strong><span class="dv-spacer"></span><label class="dv-choice">Annual (−15%) <input type="checkbox" role="switch" class="dv-switch" data-annual checked /></label></div>
          <input type="range" class="dv-range" min="1" max="200" value="25" data-seats aria-label="Seats" />
          <table class="dv-table dv-table--compact" data-break></table>
          <div class="dv-row"><span class="dv-badge dv-badge--success" data-save></span><span class="dv-spacer"></span><span class="dv-muted">Total / month</span><strong class="xp-num" style="font-size:26px" data-total></strong></div>
        </div>`,
      setup(root, ctx) {
        const tiers = [[1, 10, 12], [11, 50, 10], [51, 200, 8]];
        const render = () => {
          const n = Number(ctx.$("[data-seats]").value);
          const k = ctx.$("[data-annual]").checked ? 0.85 : 1;
          ctx.$("[data-n]").textContent = String(n);
          let total = 0;
          const rows = tiers.map(([a, b, p]) => {
            const q = Math.max(0, Math.min(n, b) - a + 1);
            total += q * p * k;
            return `<tr style="opacity:${q ? 1 : 0.4}"><td>Seats ${a}–${b}</td><td class="is-num">${q} × $${(p * k).toFixed(2)}</td><td class="is-num">${ctx.fmt.money(q * p * k)}</td></tr>`;
          });
          ctx.$("[data-break]").innerHTML = rows.join("");
          ctx.$("[data-total]").textContent = ctx.fmt.money(total);
          ctx.$("[data-save]").textContent = `You save ${ctx.fmt.money(n * 12 - total)} / mo vs list`;
        };
        ctx.on(ctx.$("[data-seats]"), "input", render);
        ctx.on(ctx.$("[data-annual]"), "change", render);
        render();
      }
    },

    "simple-card": {
      html: `
        ${head("Pricing · simple-card.tsx", "Single plan", "One plan with optional add-ons; the total updates and checkout opens a confirmation dialog.")}
        <div class="xp-center" style="min-height:0"><div class="dv-card" style="width:min(400px,100%)"><div class="dv-card__body dv-stack">
          <span class="dv-badge dv-badge--accent dv-badge--upper" style="align-self:flex-start">All-in-one</span><div class="xp-num" data-total>$29<span class="dv-muted" style="font-size:12px">/mo</span></div>
          <ul class="dv-stack" style="--gap:6px;list-style:none;padding:0;font-size:12px"><li>✓ Unlimited projects</li><li>✓ All 43 components</li><li>✓ Email support</li></ul>
          <div class="dv-divider">Add-ons</div>
          ${[["Priority support", 15], ["Extra 100 GB", 8], ["White-label", 40]].map(([n, p]) => `<label class="dv-choice" style="justify-content:space-between;width:100%"><span><input type="checkbox" class="dv-check" data-add="${p}" data-n="${n}" /> ${n}</span><span class="dv-muted xp-mono">+$${p}</span></label>`).join("")}
          <button type="button" class="dv-btn dv-btn--primary dv-btn--block" data-dv-open="sc-dlg">Checkout</button><span class="dv-hint" style="text-align:center">30-day money-back guarantee</span>
        </div></div></div>
        <dialog class="dv-dialog" id="sc-dlg"><div class="dv-dialog__header"><h3 class="dv-dialog__title">Confirm subscription</h3></div><div class="dv-dialog__body"><dl class="xp-kv" data-summary></dl></div><div class="dv-dialog__footer"><button type="button" class="dv-btn" data-dv-close>Back</button><button type="button" class="dv-btn dv-btn--primary" data-dv-close="ok">Subscribe</button></div></dialog>`,
      setup(root, ctx) {
        const total = () => 29 + ctx.$$("[data-add]:checked").reduce((s, c) => s + Number(c.dataset.add), 0);
        const render = () => {
          ctx.$("[data-total]").innerHTML = `$${total()}<span class="dv-muted" style="font-size:12px">/mo</span>`;
          ctx.$("[data-summary]").innerHTML = `<dt>Plan</dt><dd>All-in-one · $29</dd>${ctx.$$("[data-add]:checked").map((c) => `<dt>${c.dataset.n}</dt><dd>+$${c.dataset.add}</dd>`).join("")}<dt><strong>Total</strong></dt><dd><strong>$${total()}/mo</strong></dd>`;
        };
        ctx.$$("[data-add]").forEach((c) => ctx.on(c, "change", render));
        ctx.on(ctx.$("#sc-dlg"), "close", (e) => {
          if (e.target.returnValue === "ok") ctx.toast({ title: "Subscribed 🎉", description: `$${total()}/month` });
          e.target.returnValue = "";
        });
        render();
      }
    },

    "contact-sales": {
      html: () => `
        ${head("Pricing · contact-sales.tsx", "Contact sales", "Work emails only (free domains are rejected); after submitting you can pick a call slot.")}
        <div class="dv-grid" style="--min:300px;align-items:start">
          <form class="xp-panel dv-stack" data-xp-form data-success="Thanks {fullname}! Pick a slot." data-next="[data-slots]" novalidate>
            ${field({ name: "fullname", label: "Full name" })}
            ${field({ name: "email", label: "Work email", type: "email", placeholder: "you@company.com" })}
            <label class="dv-field"><span class="dv-label">Company size</span><select class="dv-select" name="size"><option>1–50</option><option>51–200</option><option>201–1000</option><option>1000+</option></select></label>
            <label class="dv-field"><span class="dv-label">What do you need?</span><textarea class="dv-textarea" name="msg" required minlength="10"></textarea></label>
            <button type="submit" class="dv-btn dv-btn--primary">Talk to sales</button>
          </form>
          <div class="xp-panel dv-stack" data-slots data-panel hidden><strong>Pick a time</strong><div class="dv-grid" style="--min:110px" data-grid></div><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-back>← Edit details</button></div>
          <div class="dv-stack"><span class="dv-eyebrow">Why teams choose us</span><ul class="dv-list"><li>🔒 SOC 2 Type II</li><li>⚡ 99.99% uptime SLA</li><li>🤝 Dedicated success manager</li></ul></div>
        </div>`,
      setup(root, ctx) {
        DEVL_XP.formSetup(root, ctx);
        const email = ctx.$('[name="email"]');
        const free = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];
        // Runs before the generic validator (capture phase) to reject free email providers
        ctx.on(ctx.$("form"), "submit", (e) => {
          const domain = (email.value.split("@")[1] || "").toLowerCase();
          if (!free.includes(domain)) return;
          e.preventDefault();
          e.stopImmediatePropagation();
          email.setAttribute("aria-invalid", "true");
          let err = email.closest(".dv-field").querySelector(".dv-error");
          if (!err) {
            err = document.createElement("span");
            err.className = "dv-error";
            email.closest(".dv-field").appendChild(err);
          }
          err.textContent = "Please use your work email.";
          email.focus();
        }, true);
        const days = Array.from({ length: 6 }, (_, i) => new Date(Date.now() + (i + 1) * 864e5));
        ctx.$("[data-grid]").innerHTML = days.map((d, i) => `<button type="button" class="dv-btn dv-btn--sm" data-slot="${i}">${d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })} · ${["10:00", "13:30", "16:00"][i % 3]}</button>`).join("");
        ctx.on(ctx.$("[data-grid]"), "click", (e) => {
          const b = e.target.closest("[data-slot]");
          if (!b) return;
          ctx.$$("[data-slot]").forEach((x) => (x.className = `dv-btn dv-btn--sm${x === b ? " dv-btn--primary" : ""}`));
          ctx.toast({ title: "Call booked", description: b.textContent });
        });
      }
    },

    "monthly-yearly": {
      html: `
        ${head("Pricing · monthly-yearly.tsx", "Billing toggle", "A pill switch with a sliding thumb; prices count up/down to their new values and savings badges appear.")}
        <div class="xp-center" style="min-height:0"><div class="dv-stack" style="align-items:center;--gap:24px">
          <button type="button" role="switch" aria-checked="false" data-sw style="position:relative;display:flex;width:240px;padding:4px;border-radius:999px;border:1px solid var(--dv-border);background:var(--dv-surface);cursor:pointer;font:inherit;color:inherit"><span data-thumb style="position:absolute;top:4px;left:4px;width:calc(50% - 4px);height:calc(100% - 8px);border-radius:999px;background:var(--dv-fg);transition:transform .3s var(--dv-ease)"></span><span data-l1 style="position:relative;flex:1;padding:8px;font-size:12px;color:var(--dv-bg);transition:color .3s">Monthly</span><span data-l2 style="position:relative;flex:1;padding:8px;font-size:12px;transition:color .3s">Yearly</span></button>
          <div class="dv-grid" style="--min:180px;width:min(640px,100%)" data-cards></div>
        </div></div>`,
      setup(root, ctx) {
        const plans = [["Starter", 9], ["Pro", 29], ["Team", 79]];
        let yearly = false;
        const shown = plans.map(([, p]) => p);
        ctx.$("[data-cards]").innerHTML = plans.map(([n], i) => `<div class="dv-stat" style="align-items:center;text-align:center"><span class="dv-eyebrow">${n}</span><span class="xp-num" data-p="${i}"></span><span class="dv-badge dv-badge--success" data-b="${i}" hidden></span></div>`).join("");
        const paint = () => shown.forEach((v, i) => (ctx.$(`[data-p="${i}"]`).innerHTML = `$${v.toFixed(0)}<span class="dv-muted" style="font-size:12px">/mo</span>`));
        const toggle = () => {
          yearly = !yearly;
          const sw = ctx.$("[data-sw]");
          sw.setAttribute("aria-checked", String(yearly));
          ctx.$("[data-thumb]").style.transform = yearly ? "translateX(100%)" : "";
          ctx.$("[data-l1]").style.color = yearly ? "" : "var(--dv-bg)";
          ctx.$("[data-l2]").style.color = yearly ? "var(--dv-bg)" : "";
          const from = shown.slice();
          const to = plans.map(([, p]) => (yearly ? p * 0.8 : p));
          const t0 = performance.now();
          ctx.raf((t) => {
            const k = Math.min(1, (t - t0) / 500);
            to.forEach((v, i) => (shown[i] = from[i] + (v - from[i]) * (1 - (1 - k) ** 3)));
            paint();
            if (k === 1) return false;
          });
          plans.forEach(([, p], i) => {
            const b = ctx.$(`[data-b="${i}"]`);
            b.hidden = !yearly;
            b.textContent = `Save $${(p * 0.2 * 12).toFixed(0)}/yr`;
          });
        };
        ctx.on(ctx.$("[data-sw]"), "click", toggle);
        paint();
      }
    }
  });

  // ==========================================================================
  // TOASTS & BANNERS
  // ==========================================================================
  // Experiment-owned toast host (for custom toasts DevlUI.toast can't render)
  X.toastHost = function (ctx) {
    const host = document.createElement("div");
    host.className = "dv-toast-region";
    host.style.bottom = "auto";
    host.style.top = "80px";
    document.body.appendChild(host);
    ctx.onCleanup(() => host.remove());
    return host;
  };

  X.addMany("toasts", {
    success: {
      html: `
        ${head("Toasts · success.tsx", "Success toast", "Fire stacked success toasts; tune duration (0 = sticky) and watch them pause while hovered.")}
        <div class="xp-panel dv-stack" style="max-width:520px">
          <label class="dv-row"><span class="dv-label">Duration</span><input type="range" class="dv-range" min="0" max="8000" step="500" value="3000" data-dur style="flex:1" data-dv-output="#t-dur" data-dv-suffix=" ms" aria-label="Duration" /><strong class="xp-mono" id="t-dur">3000 ms</strong></label>
          <div class="dv-row"><button type="button" class="dv-btn dv-btn--primary" data-fire>Save changes</button><button type="button" class="dv-btn" data-burst>Fire 3</button><span class="dv-muted" data-count>0 fired</span></div>
        </div>`,
      setup(root, ctx) {
        let n = 0;
        const msgs = ["Changes saved", "Project published", "Invite sent", "Deployment ready", "Settings updated"];
        const fire = () => {
          n++;
          ctx.$("[data-count]").textContent = `${n} fired`;
          ctx.toast({ title: msgs[n % msgs.length], description: `#${n} · ${new Date().toLocaleTimeString()}`, duration: Number(ctx.$("[data-dur]").value) });
        };
        ctx.on(ctx.$("[data-fire]"), "click", fire);
        ctx.on(ctx.$("[data-burst]"), "click", () => [0, 150, 300].forEach((t) => ctx.timeout(t, fire)));
      }
    },

    "error-retry": {
      html: `
        ${head("Toasts · error-retry.tsx", "Error with retry", "A flaky request fails with a toast offering Retry (with exponential backoff) and a copyable trace ID. It succeeds after a few tries.")}
        <div class="dv-row"><button type="button" class="dv-btn dv-btn--primary" data-go>Sync data</button><span class="dv-badge" data-state>idle</span></div>
        <ol class="dv-timeline" data-log></ol>`,
      setup(root, ctx) {
        let attempt = 0;
        const log = (t, c) => {
          const li = document.createElement("li");
          li.style.setProperty("--c", c);
          li.innerHTML = `<span></span><div class="dv-timeline__meta">${new Date().toLocaleTimeString()}</div>`;
          li.firstChild.textContent = t;
          ctx.$("[data-log]").prepend(li);
        };
        const run = () => {
          attempt++;
          const state = ctx.$("[data-state]");
          state.className = "dv-badge dv-badge--info";
          state.textContent = `attempt ${attempt}…`;
          ctx.timeout(700, () => {
            if (attempt < 3) {
              const trace = `trc_${Math.random().toString(16).slice(2, 10)}`;
              const wait = 2 ** attempt;
              state.className = "dv-badge dv-badge--danger";
              state.textContent = "failed";
              log(`Attempt ${attempt} failed: 503 upstream (${trace})`, "var(--dv-danger)");
              ctx.toast({ title: "Sync failed", description: `503 · ${trace} · retry in ${wait}s`, variant: "danger", duration: 0, action: { label: "Retry", onClick: () => ctx.timeout(wait * 1000, run) } });
              DevlUI.copy(trace);
            } else {
              state.className = "dv-badge dv-badge--success";
              state.textContent = "synced";
              log(`Attempt ${attempt} succeeded`, "var(--dv-success)");
              ctx.toast({ title: "Data synced", description: `after ${attempt} attempts` });
              attempt = 0;
            }
          });
        };
        ctx.on(ctx.$("[data-go]"), "click", run);
      }
    },

    "info-banner": {
      html: `
        ${head("Toasts · info-banner.tsx", "System banner", "Top-of-page banners for info, warnings and promos with a live countdown. Dismissals last for this session; reset to bring them back.")}
        <div class="dv-stack" data-banners></div>
        <div class="dv-row"><button type="button" class="dv-btn dv-btn--sm" data-reset>Show all banners again</button></div>`,
      setup(root, ctx) {
        const banners = [["promo", "✦ Launch week: 30% off Pro — ends in <strong data-cd></strong>", "Claim offer"], ["info", "New: the gallery is fully functional. Press C to view source.", "Learn more"], ["warning", "Scheduled maintenance Sunday 02:00 UTC.", "Details"]];
        const closed = new Set();
        const end = Date.now() + 3 * 3600e3 + 12 * 60e3;
        const render = () => {
          ctx.$("[data-banners]").innerHTML = banners
            .filter(([k]) => !closed.has(k))
            .map(([k, html, cta]) => `<div class="${k === "promo" ? "dv-banner" : `dv-alert dv-alert--${k}`}" style="border-radius:var(--dv-radius);justify-content:space-between"><span>${html}</span><span class="dv-row" style="--gap:6px"><button type="button" class="dv-btn dv-btn--sm" data-cta="${k}">${cta}</button><button type="button" class="dv-btn dv-btn--icon dv-btn--sm dv-btn--subtle" data-x="${k}" aria-label="Dismiss" style="${k === "promo" ? "color:inherit" : ""}">✕</button></span></div>`)
            .join("") || '<p class="dv-muted">All banners dismissed.</p>';
          tick();
        };
        const tick = () => {
          const el = ctx.$("[data-cd]");
          if (!el) return;
          const s = Math.max(0, Math.floor((end - Date.now()) / 1000));
          el.textContent = `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}m ${String(s % 60).padStart(2, "0")}s`;
        };
        ctx.on(ctx.$("[data-banners]"), "click", (e) => {
          const x = e.target.closest("[data-x]");
          const c = e.target.closest("[data-cta]");
          if (x) closed.add(x.dataset.x);
          if (c) ctx.toast({ title: c.textContent, variant: "info" });
          render();
        });
        ctx.on(ctx.$("[data-reset]"), "click", () => (closed.clear(), render()));
        ctx.every(1000, tick);
        render();
      }
    },

    progress: {
      html: `
        ${head("Toasts · progress.tsx", "Progress toast", "Long-running uploads get a toast with a live progress bar, speed, ETA and a cancel button.")}
        <div class="dv-row"><button type="button" class="dv-btn dv-btn--primary" data-go>Upload 3 files</button><button type="button" class="dv-btn" data-fail>Upload (will fail)</button></div>`,
      setup(root, ctx) {
        const host = DEVL_XP.toastHost(ctx);
        const start = (fail) => {
          const total = 48;
          let done = 0;
          const el = document.createElement("div");
          el.className = "dv-toast dv-toast--info";
          el.innerHTML = `<div class="dv-toast__body"><div class="dv-toast__title">Uploading 3 files…</div><progress class="dv-progress" max="${total}" value="0" style="margin:6px 0"></progress><div class="dv-toast__desc xp-mono" data-meta></div></div><button type="button" class="dv-btn dv-btn--sm dv-toast__action">Cancel</button>`;
          host.appendChild(el);
          const bar = el.querySelector("progress");
          const id = ctx.every(150, () => {
            done = Math.min(total, done + 0.6 + Math.random() * 1.4);
            bar.value = done;
            el.querySelector("[data-meta]").textContent = `${done.toFixed(1)} / ${total} MB · ${(8 + Math.random() * 4).toFixed(1)} MB/s · ${Math.ceil((total - done) / 10)}s left`;
            if (fail && done > total * 0.6) {
              clearInterval(id);
              el.className = "dv-toast dv-toast--danger";
              el.querySelector(".dv-toast__title").textContent = "Upload failed — connection lost";
              el.querySelector(".dv-toast__action").textContent = "Dismiss";
            } else if (done >= total) {
              clearInterval(id);
              el.className = "dv-toast dv-toast--success";
              el.querySelector(".dv-toast__title").textContent = "3 files uploaded";
              el.querySelector(".dv-toast__action").textContent = "Done";
              ctx.timeout(2500, () => el.remove());
            }
          });
          el.querySelector(".dv-toast__action").addEventListener("click", () => {
            clearInterval(id);
            el.remove();
          });
        };
        ctx.on(ctx.$("[data-go]"), "click", () => start(false));
        ctx.on(ctx.$("[data-fail]"), "click", () => start(true));
      }
    },

    undo: {
      html: `
        ${head("Toasts · undo.tsx", "Undo toast", "Delete any item: it disappears immediately and a toast counts down 5 seconds to undo (or press ⌘/Ctrl+Z).")}
        <ul class="dv-list" data-list style="max-width:520px;width:100%"></ul>`,
      setup(root, ctx) {
        const host = DEVL_XP.toastHost(ctx);
        let items = ["Q3 roadmap.pdf", "Brand guidelines", "Onboarding flow", "Pricing experiment", "Launch checklist"];
        const stack = [];
        const render = () => (ctx.$("[data-list]").innerHTML = items.map((t, i) => `<li><span style="flex:1">${esc(t)}</span><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-del="${i}">Delete</button></li>`).join("") || '<li class="dv-muted">Nothing left.</li>');
        const undo = (entry) => {
          if (!entry || entry.done) return;
          entry.done = true;
          clearInterval(entry.timer);
          entry.el.remove();
          items.splice(entry.i, 0, entry.item);
          stack.splice(stack.indexOf(entry), 1);
          render();
        };
        ctx.on(ctx.$("[data-list]"), "click", (e) => {
          const b = e.target.closest("[data-del]");
          if (!b) return;
          const i = Number(b.dataset.del);
          const entry = { i, item: items.splice(i, 1)[0], left: 5, done: false };
          render();
          entry.el = document.createElement("div");
          entry.el.className = "dv-toast dv-toast--neutral";
          entry.el.innerHTML = `<div class="dv-toast__body"><div class="dv-toast__title"></div><div class="dv-toast__desc">Deleted</div></div><button type="button" class="dv-btn dv-btn--sm dv-toast__action">Undo (5)</button>`;
          entry.el.querySelector(".dv-toast__title").textContent = entry.item;
          entry.el.querySelector("button").addEventListener("click", () => undo(entry));
          host.appendChild(entry.el);
          stack.push(entry);
          entry.timer = setInterval(() => {
            entry.left--;
            entry.el.querySelector("button").textContent = `Undo (${entry.left})`;
            if (entry.left <= 0) {
              clearInterval(entry.timer);
              entry.done = true;
              entry.el.remove();
              stack.splice(stack.indexOf(entry), 1);
            }
          }, 1000);
        });
        ctx.on(document, "keydown", (e) => {
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && stack.length) {
            e.preventDefault();
            undo(stack[stack.length - 1]);
          }
        });
        ctx.onCleanup(() => stack.forEach((s) => clearInterval(s.timer)));
        render();
      }
    },

    rich: {
      html: `
        ${head("Toasts · rich.tsx", "Rich toast", "Message notifications with avatar, preview and an inline reply box — answer without leaving the page.")}
        <div class="dv-row"><button type="button" class="dv-btn dv-btn--primary" data-go>Simulate incoming message</button></div>
        <ol class="dv-timeline" data-sent></ol>`,
      setup(root, ctx) {
        const host = DEVL_XP.toastHost(ctx);
        const msgs = [["Ana López", "Can you review the tokens PR before 5?"], ["Leo Kim", "Deploy is green, want me to announce it?"], ["Sara Ruiz", "Roadmap sync moved to 3pm"]];
        let k = 0;
        ctx.on(ctx.$("[data-go]"), "click", () => {
          const [who, text] = msgs[k++ % msgs.length];
          const el = document.createElement("div");
          el.className = "dv-toast dv-toast--neutral";
          el.style.flexWrap = "wrap";
          el.innerHTML = `<span class="dv-avatar dv-avatar--sm">${who.split(" ").map((w) => w[0]).join("")}</span><div class="dv-toast__body"><div class="dv-toast__title"></div><div class="dv-toast__desc"></div></div><button type="button" class="dv-toast__close" aria-label="Dismiss">✕</button><form class="dv-row" style="flex-basis:100%;flex-wrap:nowrap;margin-top:6px"><input class="dv-input" style="height:28px" placeholder="Reply…" aria-label="Reply" required /><button type="submit" class="dv-btn dv-btn--sm dv-btn--primary">Send</button></form>`;
          el.querySelector(".dv-toast__title").textContent = who;
          el.querySelector(".dv-toast__desc").textContent = text;
          el.querySelector(".dv-toast__close").addEventListener("click", () => el.remove());
          el.querySelector("form").addEventListener("submit", (e) => {
            e.preventDefault();
            const reply = e.target.querySelector("input").value;
            const li = document.createElement("li");
            li.style.setProperty("--c", "var(--xp-accent)");
            li.textContent = `You → ${who}: ${reply}`;
            ctx.$("[data-sent]").prepend(li);
            el.innerHTML = `<div class="dv-toast__body"><div class="dv-toast__title">Reply sent to ${esc(who)}</div></div>`;
            el.className = "dv-toast dv-toast--success";
            setTimeout(() => el.remove(), 1500);
          });
          host.appendChild(el);
          el.querySelector("input").focus();
        });
      }
    }
  });

  // ==========================================================================
  // MEDIA & CREATIVE TOOLS
  // ==========================================================================
  X.addMany("media-audio", {
    "bezier-easing-editor": {
      html: `
        ${head("Media · bezier-easing-editor.tsx", "Cubic-bezier editor", "Drag the two handles (y can overshoot for springy curves), pick a preset, copy the CSS and preview it on the ball.")}
        <div class="dv-grid" style="--min:300px;align-items:start">
          <svg viewBox="-20 -80 340 460" style="max-width:360px;touch-action:none" data-svg></svg>
          <div class="dv-stack">
            <div class="dv-row" data-presets>${[["ease", ".25,.1,.25,1"], ["ease-in-out", ".42,0,.58,1"], ["out-expo", ".16,1,.3,1"], ["back-out", ".34,1.56,.64,1"], ["anticipate", ".68,-0.6,.32,1.6"]].map(([n, v]) => `<button type="button" class="dv-chip" data-v="${v}">${n}</button>`).join("")}</div>
            <div class="dv-input-group"><input class="dv-input xp-mono" readonly id="bz-out" data-out aria-label="CSS easing" /><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" style="margin:3px" data-dv-copy data-dv-copy-target="#bz-out">Copy</button></div>
            <div class="xp-panel" style="position:relative;height:70px"><span data-ball style="position:absolute;left:10px;top:20px;width:30px;height:30px;border-radius:50%;background:var(--xp-accent)"></span></div>
            <div class="dv-row"><button type="button" class="dv-btn dv-btn--primary" data-play>▶ Play</button><label class="dv-choice">Duration <input type="range" class="dv-range" min="200" max="2000" step="100" value="900" data-dur style="width:140px" aria-label="Duration" /></label></div>
          </div>
        </div>`,
      setup(root, ctx) {
        const svg = ctx.$("[data-svg]");
        let p = [0.16, 1, 0.3, 1];
        let drag = -1;
        const S = 300;
        const toXY = (x, y) => [x * S, S - y * S];
        const render = () => {
          const [x1, y1, x2, y2] = p;
          const a = toXY(0, 0);
          const b = toXY(1, 1);
          const c1 = toXY(x1, y1);
          const c2 = toXY(x2, y2);
          svg.innerHTML = `<rect x="0" y="0" width="${S}" height="${S}" fill="var(--dv-surface)" stroke="var(--dv-border)"/>${[0.25, 0.5, 0.75].map((g) => `<line x1="${g * S}" x2="${g * S}" y1="0" y2="${S}" stroke="var(--dv-border)"/><line y1="${g * S}" y2="${g * S}" x1="0" x2="${S}" stroke="var(--dv-border)"/>`).join("")}<line x1="${a[0]}" y1="${a[1]}" x2="${c1[0]}" y2="${c1[1]}" stroke="var(--dv-fg-subtle)"/><line x1="${b[0]}" y1="${b[1]}" x2="${c2[0]}" y2="${c2[1]}" stroke="var(--dv-fg-subtle)"/><path d="M${a} C${c1} ${c2} ${b}" fill="none" stroke="var(--xp-accent)" stroke-width="3"/><circle data-h="0" cx="${c1[0]}" cy="${c1[1]}" r="9" fill="var(--dv-bg)" stroke="var(--xp-accent)" stroke-width="3" style="cursor:grab"/><circle data-h="1" cx="${c2[0]}" cy="${c2[1]}" r="9" fill="var(--dv-bg)" stroke="var(--dv-warning)" stroke-width="3" style="cursor:grab"/>`;
          ctx.$("[data-out]").value = `cubic-bezier(${p.map((v) => +v.toFixed(2)).join(", ")})`;
        };
        ctx.on(svg, "pointerdown", (e) => {
          const h = e.target.closest("[data-h]");
          if (!h) return;
          drag = Number(h.dataset.h);
          svg.setPointerCapture(e.pointerId);
        });
        ctx.on(svg, "pointermove", (e) => {
          if (drag < 0) return;
          const pt = svg.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
          const x = Math.max(0, Math.min(1, loc.x / S));
          const y = Math.max(-0.8, Math.min(1.8, (S - loc.y) / S));
          p[drag * 2] = x;
          p[drag * 2 + 1] = y;
          render();
        });
        ctx.on(svg, "pointerup", () => (drag = -1));
        ctx.on(ctx.$("[data-presets]"), "click", (e) => {
          const b = e.target.closest("[data-v]");
          if (!b) return;
          p = b.dataset.v.split(",").map(Number);
          render();
        });
        let right = false;
        ctx.on(ctx.$("[data-play]"), "click", () => {
          const ball = ctx.$("[data-ball]");
          const track = ball.parentElement.clientWidth - 50;
          right = !right;
          ball.animate([{ transform: `translateX(${right ? 0 : track}px)` }, { transform: `translateX(${right ? track : 0}px)` }], { duration: Number(ctx.$("[data-dur]").value), easing: ctx.$("[data-out]").value, fill: "forwards" });
        });
        render();
      }
    },

    "synth-step-sequencer": {
      html: `
        ${head("Media · synth-step-sequencer.tsx", "16-step synth sequencer", "A real Web Audio drum machine with look-ahead scheduling: kick, snare, hat and bass voices synthesized from oscillators and noise.")}
        <div class="dv-row"><button type="button" class="dv-btn dv-btn--primary" data-play>▶ Play</button><label class="dv-choice">BPM <input type="range" class="dv-range" min="60" max="180" value="112" data-bpm style="width:140px" data-dv-output="#seq-bpm" aria-label="BPM" /><strong class="xp-mono" id="seq-bpm">112</strong></label><button type="button" class="dv-btn dv-btn--sm" data-rand>Randomize</button><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-clear>Clear</button></div>
        <div class="xp-panel dv-stack" style="--gap:6px;overflow:auto" data-grid></div>`,
      setup(root, ctx) {
        const rows = ["Kick", "Snare", "Hat", "Bass"];
        const pattern = [[0, 4, 8, 12], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14], [0, 3, 7, 10]].map((on) => Array.from({ length: 16 }, (_, i) => on.includes(i)));
        const grid = ctx.$("[data-grid]");
        let current = -1;
        const render = () => {
          grid.innerHTML = rows.map((r, ri) => `<div class="dv-row" style="flex-wrap:nowrap;--gap:4px"><span style="width:50px;font-size:11px" class="dv-muted">${r}</span>${pattern[ri].map((on, si) => `<button type="button" data-r="${ri}" data-s="${si}" aria-pressed="${on}" aria-label="${r} step ${si + 1}" style="flex:0 0 30px;height:30px;border-radius:5px;border:1px solid ${si === current ? "var(--dv-fg)" : "var(--dv-border)"};background:${on ? "var(--xp-accent)" : si % 4 === 0 ? "var(--dv-surface-strong)" : "var(--dv-surface)"};cursor:pointer"></button>`).join("")}</div>`).join("");
        };
        ctx.on(grid, "click", (e) => {
          const b = e.target.closest("[data-r]");
          if (!b) return;
          pattern[b.dataset.r][b.dataset.s] = !pattern[b.dataset.r][b.dataset.s];
          render();
        });
        let ac = null;
        let noise = null;
        let next = 0;
        let step = 0;
        let timer = 0;
        const voice = (row, t) => {
          const g = ac.createGain();
          g.connect(ac.destination);
          if (row === 0) {
            const o = ac.createOscillator();
            o.frequency.setValueAtTime(150, t);
            o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
            g.gain.setValueAtTime(0.9, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            o.connect(g);
            o.start(t);
            o.stop(t + 0.3);
          } else if (row === 1 || row === 2) {
            const s = ac.createBufferSource();
            s.buffer = noise;
            const f = ac.createBiquadFilter();
            f.type = row === 1 ? "bandpass" : "highpass";
            f.frequency.value = row === 1 ? 1800 : 7000;
            g.gain.setValueAtTime(row === 1 ? 0.5 : 0.25, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + (row === 1 ? 0.18 : 0.05));
            s.connect(f).connect(g);
            s.start(t);
            s.stop(t + 0.2);
          } else {
            const o = ac.createOscillator();
            o.type = "sawtooth";
            o.frequency.value = [55, 55, 65.4, 49][step % 4];
            const f = ac.createBiquadFilter();
            f.frequency.setValueAtTime(900, t);
            f.frequency.exponentialRampToValueAtTime(200, t + 0.2);
            g.gain.setValueAtTime(0.25, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            o.connect(f).connect(g);
            o.start(t);
            o.stop(t + 0.26);
          }
        };
        const schedule = () => {
          const spb = 60 / Number(ctx.$("[data-bpm]").value) / 4;
          while (next < ac.currentTime + 0.1) {
            const s = step;
            rows.forEach((_, r) => pattern[r][s] && voice(r, next));
            const delay = Math.max(0, (next - ac.currentTime) * 1000);
            ctx.timeout(delay, () => {
              current = s;
              render();
            });
            next += spb;
            step = (step + 1) % 16;
          }
        };
        const stop = () => {
          clearInterval(timer);
          timer = 0;
          if (ac) ac.close();
          ac = null;
          current = -1;
          ctx.$("[data-play]").textContent = "▶ Play";
          render();
        };
        ctx.on(ctx.$("[data-play]"), "click", () => {
          if (ac) return stop();
          const AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return ctx.toast({ title: "Web Audio not supported", variant: "warning" });
          ac = new AC();
          noise = ac.createBuffer(1, ac.sampleRate * 0.3, ac.sampleRate);
          const d = noise.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
          next = ac.currentTime + 0.05;
          step = 0;
          timer = setInterval(schedule, 25);
          ctx.$("[data-play]").textContent = "■ Stop";
        });
        ctx.on(ctx.$("[data-rand]"), "click", () => {
          pattern.forEach((row, r) => row.forEach((_, i) => (row[i] = Math.random() < [0.3, 0.2, 0.55, 0.3][r])));
          render();
        });
        ctx.on(ctx.$("[data-clear]"), "click", () => (pattern.forEach((row) => row.fill(false)), render()));
        ctx.onCleanup(stop);
        render();
      }
    },

    "waveform-scrubber": {
      html: `
        ${head("Media · waveform-scrubber.tsx", "Waveform scrubber", "A melody is synthesized into a real AudioBuffer, drawn as peaks. Click or drag to seek, play it, and drop markers at the playhead.")}
        <div class="xp-panel xp-rel" style="padding:0;overflow:hidden"><canvas class="xp-canvas" data-wave style="height:140px;border:0;cursor:pointer"></canvas></div>
        <div class="dv-row"><button type="button" class="dv-btn dv-btn--primary" data-play>▶ Play</button><span class="xp-mono" data-time>0:00.0 / 0:00.0</span><button type="button" class="dv-btn dv-btn--sm" data-mark>+ Marker</button><span class="dv-spacer"></span><div class="dv-row" data-markers></div></div>`,
      setup(root, ctx) {
        const cv = ctx.$("[data-wave]");
        const g = cv.getContext("2d");
        const size = DEVL_XP.fitCanvas(ctx, cv);
        const SR = 22050;
        const DUR = 6;
        const data = new Float32Array(SR * DUR);
        const notes = [261.6, 329.6, 392, 523.3, 392, 329.6, 293.7, 349.2, 440, 349.2, 293.7, 246.9];
        const per = data.length / notes.length;
        for (let i = 0; i < data.length; i++) {
          const n = Math.floor(i / per);
          const t = (i % per) / SR;
          data[i] = Math.sin(2 * Math.PI * notes[n] * t) * Math.exp(-t * 3) * 0.6 + Math.sin(2 * Math.PI * notes[n] * 2 * t) * Math.exp(-t * 6) * 0.2;
        }
        const peaks = [];
        let pos = 0;
        let playing = false;
        let ac = null;
        let src = null;
        let startedAt = 0;
        const markers = [];
        const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;
        ctx.raf(() => {
          if (playing && ac) pos = Math.min(DUR, ac.currentTime - startedAt);
          if (pos >= DUR && playing) stop();
          const { w, h, dpr } = size;
          if (peaks.length !== Math.floor(w / 3)) {
            peaks.length = 0;
            const n = Math.floor(w / 3);
            const step = Math.floor(data.length / n);
            for (let i = 0; i < n; i++) {
              let m = 0;
              for (let j = 0; j < step; j++) m = Math.max(m, Math.abs(data[i * step + j]));
              peaks.push(m);
            }
          }
          g.setTransform(dpr, 0, 0, dpr, 0, 0);
          g.clearRect(0, 0, w, h);
          const accent = getComputedStyle(root).getPropertyValue("--xp-accent").trim();
          const px = (pos / DUR) * w;
          peaks.forEach((p, i) => {
            const bh = Math.max(2, p * h * 0.9);
            g.fillStyle = i * 3 < px ? accent : "rgba(150,150,160,.45)";
            g.fillRect(i * 3, (h - bh) / 2, 2, bh);
          });
          g.fillStyle = "#f59e0b";
          markers.forEach((m) => g.fillRect((m / DUR) * w - 1, 0, 2, h));
          g.fillStyle = getComputedStyle(root).getPropertyValue("--dv-fg").trim();
          g.fillRect(px - 1, 0, 2, h);
          ctx.$("[data-time]").textContent = `${fmt(pos)} / ${fmt(DUR)}`;
        });
        const stop = () => {
          playing = false;
          if (src) src.stop();
          src = null;
          ctx.$("[data-play]").textContent = "▶ Play";
        };
        const play = () => {
          if (!ac) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return ctx.toast({ title: "Web Audio not supported", variant: "warning" });
            ac = new AC();
            ctx.onCleanup(() => ac.close());
          }
          if (pos >= DUR) pos = 0;
          const buf = ac.createBuffer(1, data.length, SR);
          buf.copyToChannel(data, 0);
          src = ac.createBufferSource();
          src.buffer = buf;
          src.connect(ac.destination);
          src.start(0, pos);
          startedAt = ac.currentTime - pos;
          playing = true;
          ctx.$("[data-play]").textContent = "❚❚ Pause";
        };
        ctx.on(ctx.$("[data-play]"), "click", () => (playing ? stop() : play()));
        let scrub = false;
        const seek = (e) => {
          const p = DEVL_XP.pointer(cv, e);
          pos = Math.max(0, Math.min(DUR, (p.x / p.w) * DUR));
          if (playing) {
            stop();
            play();
          }
        };
        ctx.on(cv, "pointerdown", (e) => ((scrub = true), cv.setPointerCapture(e.pointerId), seek(e)));
        ctx.on(cv, "pointermove", (e) => scrub && seek(e));
        ctx.on(cv, "pointerup", () => (scrub = false));
        ctx.on(ctx.$("[data-mark]"), "click", () => {
          markers.push(pos);
          ctx.$("[data-markers]").innerHTML = markers.map((m, i) => `<button type="button" class="dv-chip" data-m="${i}">M${i + 1} · ${fmt(m)}</button>`).join("");
        });
        ctx.on(ctx.$("[data-markers]"), "click", (e) => {
          const b = e.target.closest("[data-m]");
          if (b) pos = markers[b.dataset.m];
        });
        ctx.onCleanup(stop);
      }
    },

    "color-oklch-picker": {
      html: `
        ${head("Media · color-oklch-picker.tsx", "OKLCH color space", "Perceptual lightness, chroma and hue with a real OKLCH → sRGB conversion, gamut warning and a generated tint/shade scale.")}
        <div class="dv-grid" style="--min:300px;align-items:start">
          <div class="dv-stack">
            <div data-swatch style="height:160px;border-radius:var(--dv-radius);border:1px solid var(--dv-border)"></div>
            ${[["l", "Lightness", 0, 1, 0.01, 0.65], ["c", "Chroma", 0, 0.37, 0.005, 0.18], ["h", "Hue", 0, 360, 1, 265]].map(([k, l, a, b, s, v]) => `<label class="dv-row" style="flex-wrap:nowrap"><span style="width:80px">${l}</span><input type="range" class="dv-range" min="${a}" max="${b}" step="${s}" value="${v}" data-${k} aria-label="${l}" /><span class="xp-mono" style="width:56px;text-align:right" data-${k}v></span></label>`).join("")}
          </div>
          <div class="dv-stack">
            <dl class="xp-kv xp-mono" data-out></dl>
            <span class="dv-badge dv-badge--warning" data-gamut hidden>⚠ Out of sRGB gamut — clamped</span>
            <div class="dv-row" style="--gap:0;border-radius:var(--dv-radius);overflow:hidden" data-scale></div>
            <div class="dv-row"><button type="button" class="dv-btn dv-btn--sm" data-copy="oklch">Copy oklch()</button><button type="button" class="dv-btn dv-btn--sm" data-copy="hex">Copy HEX</button><button type="button" class="dv-btn dv-btn--sm" data-apply>Use as accent</button></div>
          </div>
        </div>`,
      setup(root, ctx) {
        const toRgb = (L, C, H) => {
          const a = C * Math.cos((H * Math.PI) / 180);
          const b = C * Math.sin((H * Math.PI) / 180);
          const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
          const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
          const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
          const lin = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
          const out = lin.some((v) => v < -0.0005 || v > 1.0005);
          const gam = lin.map((v) => {
            const c = Math.max(0, Math.min(1, v));
            return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
          });
          return { rgb: gam.map((v) => Math.round(v * 255)), out };
        };
        const hex = (rgb) => `#${rgb.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
        let cur = {};
        const render = () => {
          const L = Number(ctx.$("[data-l]").value);
          const C = Number(ctx.$("[data-c]").value);
          const H = Number(ctx.$("[data-h]").value);
          ctx.$("[data-lv]").textContent = L.toFixed(2);
          ctx.$("[data-cv]").textContent = C.toFixed(3);
          ctx.$("[data-hv]").textContent = `${H}°`;
          const { rgb, out } = toRgb(L, C, H);
          cur = { oklch: `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(3)} ${H})`, hex: hex(rgb) };
          ctx.$("[data-swatch]").style.background = cur.hex;
          ctx.$("[data-gamut]").hidden = !out;
          ctx.$("[data-out]").innerHTML = `<dt>OKLCH</dt><dd>${cur.oklch}</dd><dt>HEX</dt><dd>${cur.hex}</dd><dt>RGB</dt><dd>rgb(${rgb.join(", ")})</dd><dt>Text</dt><dd>${L > 0.62 ? "use dark text" : "use light text"}</dd>`;
          ctx.$("[data-scale]").innerHTML = [0.95, 0.85, 0.75, 0.65, 0.55, 0.45, 0.35, 0.25].map((l) => {
            const hx = hex(toRgb(l, Math.min(C, 0.37 * (1 - Math.abs(l - 0.6))), H).rgb);
            return `<button type="button" data-hx="${hx}" title="${hx}" style="flex:1;height:44px;border:0;background:${hx};cursor:pointer"></button>`;
          }).join("");
        };
        ctx.$$("input").forEach((i) => ctx.on(i, "input", render));
        ctx.on(root, "click", (e) => {
          const c = e.target.closest("[data-copy]");
          const hx = e.target.closest("[data-hx]");
          if (c) DevlUI.copy(cur[c.dataset.copy]).then(() => ctx.toast({ title: `Copied ${cur[c.dataset.copy]}` }));
          if (hx) DevlUI.copy(hx.dataset.hx).then(() => ctx.toast({ title: `Copied ${hx.dataset.hx}` }));
          if (e.target.closest("[data-apply]")) {
            root.style.setProperty("--xp-accent", cur.hex);
            root.style.setProperty("--dv-accent", cur.hex);
          }
        });
        render();
      }
    },

    "video-timeline-trimmer": {
      html: `
        ${head("Media · video-timeline-trimmer.tsx", "Video timeline trimmer", "Drag the in/out handles to trim, scrub the playhead, and play the selection in a loop. Timecodes are frame-accurate at 30 fps.")}
        <div data-screen style="height:200px;border-radius:var(--dv-radius);display:grid;place-items:center;font-size:42px;color:#fff;font-family:var(--dv-font-mono)"></div>
        <div class="xp-rel" data-track style="height:64px;border-radius:8px;overflow:hidden;background:var(--dv-surface);touch-action:none;user-select:none">
          <div data-thumbs style="display:flex;height:100%"></div>
          <div data-shade-l style="position:absolute;top:0;bottom:0;left:0;background:rgba(0,0,0,.6)"></div><div data-shade-r style="position:absolute;top:0;bottom:0;right:0;background:rgba(0,0,0,.6)"></div>
          <div data-h="in" style="position:absolute;top:0;bottom:0;width:12px;margin-left:-6px;background:var(--dv-warning);border-radius:4px;cursor:ew-resize"></div><div data-h="out" style="position:absolute;top:0;bottom:0;width:12px;margin-left:-6px;background:var(--dv-warning);border-radius:4px;cursor:ew-resize"></div>
          <div data-ph style="position:absolute;top:-4px;bottom:-4px;width:2px;background:#fff;pointer-events:none"></div>
        </div>
        <div class="dv-row"><button type="button" class="dv-btn dv-btn--primary" data-play>▶ Play selection</button><span class="xp-mono" data-tc></span><span class="dv-spacer"></span><span class="dv-badge" data-dur></span><button type="button" class="dv-btn dv-btn--sm" data-export>Export clip</button></div>`,
      setup(root, ctx) {
        const LEN = 12;
        const FPS = 30;
        let a = 2;
        let b = 8.5;
        let t = 2;
        let playing = false;
        const track = ctx.$("[data-track]");
        ctx.$("[data-thumbs]").innerHTML = Array.from({ length: 12 }, (_, i) => `<div style="flex:1;background:linear-gradient(135deg,hsl(${i * 28} 70% 45%),hsl(${i * 28 + 40} 70% 30%));border-right:1px solid rgba(0,0,0,.4)"></div>`).join("");
        const tc = (s) => {
          const f = Math.round(s * FPS);
          return `${String(Math.floor(f / FPS / 60)).padStart(2, "0")}:${String(Math.floor(f / FPS) % 60).padStart(2, "0")}:${String(f % FPS).padStart(2, "0")}`;
        };
        const render = () => {
          const pct = (s) => `${(s / LEN) * 100}%`;
          ctx.$('[data-h="in"]').style.left = pct(a);
          ctx.$('[data-h="out"]').style.left = pct(b);
          ctx.$("[data-shade-l]").style.width = pct(a);
          ctx.$("[data-shade-r]").style.width = `${100 - (b / LEN) * 100}%`;
          ctx.$("[data-ph]").style.left = pct(t);
          ctx.$("[data-tc]").textContent = `${tc(t)}  [${tc(a)} → ${tc(b)}]`;
          ctx.$("[data-dur]").textContent = `${(b - a).toFixed(2)}s · ${Math.round((b - a) * FPS)} frames`;
          ctx.$("[data-screen]").style.background = `linear-gradient(135deg,hsl(${(t / LEN) * 336} 70% 45%),hsl(${(t / LEN) * 336 + 40} 70% 30%))`;
          ctx.$("[data-screen]").textContent = tc(t);
        };
        let drag = null;
        const at = (e) => Math.max(0, Math.min(LEN, (DEVL_XP.pointer(track, e).x / track.clientWidth) * LEN));
        ctx.on(track, "pointerdown", (e) => {
          const h = e.target.closest("[data-h]");
          drag = h ? h.dataset.h : "ph";
          track.setPointerCapture(e.pointerId);
          if (!h) t = Math.max(a, Math.min(b, at(e)));
          render();
        });
        ctx.on(track, "pointermove", (e) => {
          if (!drag) return;
          const v = at(e);
          if (drag === "in") a = Math.min(v, b - 0.5);
          else if (drag === "out") b = Math.max(v, a + 0.5);
          else t = Math.max(a, Math.min(b, v));
          t = Math.max(a, Math.min(b, t));
          render();
        });
        ctx.on(track, "pointerup", () => (drag = null));
        ctx.on(ctx.$("[data-play]"), "click", (e) => {
          playing = !playing;
          e.target.textContent = playing ? "❚❚ Pause" : "▶ Play selection";
        });
        ctx.raf((now, dt) => {
          if (!playing) return;
          t += dt / 1000;
          if (t > b) t = a;
          render();
        });
        ctx.on(ctx.$("[data-export]"), "click", () => ctx.toast({ title: "Clip exported", description: `${tc(a)} → ${tc(b)} · ${(b - a).toFixed(2)}s` }));
        render();
      }
    },

    "spatial-eq-parametric": {
      html: `
        ${head("Media · spatial-eq-parametric.tsx", "Parametric EQ curve", "Four peaking bands computed with the real biquad magnitude response. Drag nodes (frequency × gain), scroll to change Q, and listen through Web Audio filters.")}
        <div class="xp-panel"><svg viewBox="0 0 700 260" class="xp-chart" data-eq style="touch-action:none"></svg></div>
        <div class="dv-row"><button type="button" class="dv-btn dv-btn--primary" data-listen>▶ Listen (pink noise)</button><span class="dv-badge" data-sel>Band 1</span><label class="dv-choice">Q <input type="range" class="dv-range" min="0.3" max="10" step="0.1" value="1" data-q style="width:140px" aria-label="Q" /><span class="xp-mono" data-qv></span></label><button type="button" class="dv-btn dv-btn--sm dv-btn--subtle" data-flat>Flatten</button></div>`,
      setup(root, ctx) {
        const SR = 48000;
        const bands = [[80, 3, 1], [400, -2, 1.2], [2500, 4, 0.9], [9000, -3, 1.5]].map(([f, g, q]) => ({ f, g, q }));
        let sel = 0;
        const svg = ctx.$("[data-eq]");
        const W = 700;
        const H = 260;
        const fx = (f) => ((Math.log10(f) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20))) * (W - 40) + 30;
        const xf = (x) => 10 ** (((x - 30) / (W - 40)) * (Math.log10(20000) - Math.log10(20)) + Math.log10(20));
        const gy = (g) => H / 2 - (g / 15) * (H / 2 - 20);
        const yg = (y) => -((y - H / 2) / (H / 2 - 20)) * 15;
        const mag = (b, f) => {
          const A = 10 ** (b.g / 40);
          const w0 = (2 * Math.PI * b.f) / SR;
          const alpha = Math.sin(w0) / (2 * b.q);
          const [b0, b1, b2, a0, a1, a2] = [1 + alpha * A, -2 * Math.cos(w0), 1 - alpha * A, 1 + alpha / A, -2 * Math.cos(w0), 1 - alpha / A];
          const w = (2 * Math.PI * f) / SR;
          const re = (c0, c1, c2) => c0 + c1 * Math.cos(w) + c2 * Math.cos(2 * w);
          const im = (c1, c2) => -(c1 * Math.sin(w) + c2 * Math.sin(2 * w));
          const num = Math.hypot(re(b0, b1, b2), im(b1, b2));
          const den = Math.hypot(re(a0, a1, a2), im(a1, a2));
          return 20 * Math.log10(num / den);
        };
        let filters = null;
        const render = () => {
          const pts = [];
          for (let x = 30; x <= W - 10; x += 3) {
            const f = xf(x);
            pts.push([x, gy(bands.reduce((s, b) => s + mag(b, f), 0))]);
          }
          svg.innerHTML =
            [-12, -6, 0, 6, 12].map((g) => `<line x1="30" x2="${W - 10}" y1="${gy(g)}" y2="${gy(g)}" stroke="currentColor" stroke-opacity="${g ? 0.08 : 0.25}"/><text x="24" y="${gy(g) + 3}" text-anchor="end">${g}</text>`).join("") +
            [50, 100, 500, 1000, 5000, 10000].map((f) => `<line x1="${fx(f)}" x2="${fx(f)}" y1="10" y2="${H - 10}" stroke="currentColor" stroke-opacity="0.08"/><text x="${fx(f)}" y="${H - 2}" text-anchor="middle">${f >= 1000 ? `${f / 1000}k` : f}</text>`).join("") +
            `<path d="${DEVL_XP.chart.path(pts)} L${W - 10},${H / 2} L30,${H / 2} Z" fill="var(--xp-accent)" opacity=".15"/><path d="${DEVL_XP.chart.path(pts)}" fill="none" stroke="var(--xp-accent)" stroke-width="2.5"/>` +
            bands.map((b, i) => `<circle data-b="${i}" cx="${fx(b.f)}" cy="${gy(b.g)}" r="${i === sel ? 10 : 8}" fill="${["#6366f1", "#10b981", "#f59e0b", "#ec4899"][i]}" stroke="var(--dv-bg)" stroke-width="2" style="cursor:grab"/><text x="${fx(b.f)}" y="${gy(b.g) - 14}" text-anchor="middle">${b.f >= 1000 ? `${(b.f / 1000).toFixed(1)}k` : Math.round(b.f)} · ${b.g > 0 ? "+" : ""}${b.g.toFixed(1)}dB</text>`).join("");
          ctx.$("[data-sel]").textContent = `Band ${sel + 1}`;
          ctx.$("[data-q]").value = String(bands[sel].q);
          ctx.$("[data-qv]").textContent = bands[sel].q.toFixed(1);
          if (filters) filters.forEach((fl, i) => {
            fl.frequency.value = bands[i].f;
            fl.gain.value = bands[i].g;
            fl.Q.value = bands[i].q;
          });
        };
        let drag = -1;
        const loc = (e) => {
          const pt = svg.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          return pt.matrixTransform(svg.getScreenCTM().inverse());
        };
        ctx.on(svg, "pointerdown", (e) => {
          const c = e.target.closest("[data-b]");
          if (!c) return;
          drag = sel = Number(c.dataset.b);
          svg.setPointerCapture(e.pointerId);
          render();
        });
        ctx.on(svg, "pointermove", (e) => {
          if (drag < 0) return;
          const p = loc(e);
          bands[drag].f = Math.max(20, Math.min(20000, xf(p.x)));
          bands[drag].g = Math.max(-15, Math.min(15, yg(p.y)));
          render();
        });
        ctx.on(svg, "pointerup", () => (drag = -1));
        ctx.on(svg, "wheel", (e) => {
          e.preventDefault();
          bands[sel].q = Math.max(0.3, Math.min(10, bands[sel].q * (e.deltaY < 0 ? 1.1 : 0.9)));
          render();
        }, { passive: false });
        ctx.on(ctx.$("[data-q]"), "input", (e) => ((bands[sel].q = Number(e.target.value)), render()));
        ctx.on(ctx.$("[data-flat]"), "click", () => (bands.forEach((b) => (b.g = 0)), render()));
        let ac = null;
        ctx.on(ctx.$("[data-listen]"), "click", (e) => {
          if (ac) {
            ac.close();
            ac = null;
            filters = null;
            e.target.textContent = "▶ Listen (pink noise)";
            return;
          }
          const AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return ctx.toast({ title: "Web Audio not supported", variant: "warning" });
          ac = new AC();
          const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
          const d = buf.getChannelData(0);
          let b0 = 0;
          let b1 = 0;
          let b2 = 0;
          for (let i = 0; i < d.length; i++) {
            const w = Math.random() * 2 - 1;
            b0 = 0.99765 * b0 + w * 0.099046;
            b1 = 0.963 * b1 + w * 0.2965164;
            b2 = 0.57 * b2 + w * 1.0526913;
            d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.05;
          }
          const src = ac.createBufferSource();
          src.buffer = buf;
          src.loop = true;
          filters = bands.map(() => {
            const f = ac.createBiquadFilter();
            f.type = "peaking";
            return f;
          });
          filters.reduce((n, f) => n.connect(f), src).connect(ac.destination);
          src.start();
          e.target.textContent = "■ Stop";
          render();
        });
        ctx.onCleanup(() => ac && ac.close());
        render();
      }
    },

    "sprite-frame-inspector": {
      html: `
        ${head("Media · sprite-frame-inspector.tsx", "Sprite frame inspector", "A procedurally drawn 8-frame run cycle. Play at any FPS, step frames, toggle onion skin and hitboxes, or click a frame in the strip.")}
        <div class="dv-grid" style="--min:280px;align-items:start">
          <canvas class="xp-canvas" data-stage style="height:260px;image-rendering:pixelated"></canvas>
          <div class="dv-stack">
            <div class="dv-row"><button type="button" class="dv-btn dv-btn--sm" data-step="-1">◀</button><button type="button" class="dv-btn dv-btn--primary dv-btn--sm" data-play>❚❚ Pause</button><button type="button" class="dv-btn dv-btn--sm" data-step="1">▶</button><span class="xp-mono" data-f></span></div>
            <label class="dv-choice">FPS <input type="range" class="dv-range" min="1" max="24" value="10" data-fps style="width:140px" data-dv-output="#sp-fps" aria-label="FPS" /><strong class="xp-mono" id="sp-fps">10</strong></label>
            <label class="dv-choice">Onion skin <input type="checkbox" role="switch" class="dv-switch" data-onion checked /></label>
            <label class="dv-choice">Hitbox <input type="checkbox" role="switch" class="dv-switch" data-hit /></label>
          </div>
        </div>
        <div class="dv-row" style="--gap:4px" data-strip></div>`,
      setup(root, ctx) {
        const N = 8;
        const FW = 32;
        const FH = 32;
        const sheet = document.createElement("canvas");
        sheet.width = FW * N;
        sheet.height = FH;
        const sg = sheet.getContext("2d");
        for (let i = 0; i < N; i++) {
          const ph = (i / N) * Math.PI * 2;
          const ox = i * FW;
          const bob = Math.abs(Math.sin(ph)) * 2;
          sg.fillStyle = "#6366f1";
          sg.fillRect(ox + 12, 8 - bob, 8, 10);
          sg.fillStyle = "#fde68a";
          sg.fillRect(ox + 13, 2 - bob, 6, 6);
          sg.fillStyle = "#111";
          sg.fillRect(ox + 17, 4 - bob, 1, 1);
          const leg = (s) => {
            const a = Math.sin(ph + s) * 5;
            sg.fillStyle = "#0ea5e9";
            sg.fillRect(ox + 14 + a, 18 - bob, 3, 8);
            sg.fillRect(ox + 14 + a * 1.4, 26 - bob, 4, 2);
          };
          leg(0);
          leg(Math.PI);
          sg.fillStyle = "#f59e0b";
          sg.fillRect(ox + 15 + Math.sin(ph + Math.PI) * 4, 10 - bob, 3, 6);
        }
        const cv = ctx.$("[data-stage]");
        const g = cv.getContext("2d");
        const size = DEVL_XP.fitCanvas(ctx, cv);
        let frame = 0;
        let playing = true;
        let acc = 0;
        ctx.$("[data-strip]").innerHTML = Array.from({ length: N }, (_, i) => `<button type="button" data-i="${i}" aria-label="Frame ${i + 1}" style="width:56px;height:56px;border-radius:6px;border:2px solid var(--dv-border);background:var(--dv-bg-elevated);padding:0;cursor:pointer"><canvas width="${FW}" height="${FH}" style="width:100%;height:100%;image-rendering:pixelated"></canvas></button>`).join("");
        ctx.$$("[data-strip] canvas").forEach((c, i) => c.getContext("2d").drawImage(sheet, i * FW, 0, FW, FH, 0, 0, FW, FH));
        const draw = () => {
          const { w, h, dpr } = size;
          g.setTransform(dpr, 0, 0, dpr, 0, 0);
          g.clearRect(0, 0, w, h);
          g.imageSmoothingEnabled = false;
          const scale = Math.floor(Math.min(w, h) / FH * 0.8);
          const x = (w - FW * scale) / 2;
          const y = (h - FH * scale) / 2;
          if (ctx.$("[data-onion]").checked) {
            g.globalAlpha = 0.25;
            g.drawImage(sheet, ((frame + N - 1) % N) * FW, 0, FW, FH, x, y, FW * scale, FH * scale);
            g.globalAlpha = 1;
          }
          g.drawImage(sheet, frame * FW, 0, FW, FH, x, y, FW * scale, FH * scale);
          if (ctx.$("[data-hit]").checked) {
            g.strokeStyle = "#ef4444";
            g.lineWidth = 2;
            g.strokeRect(x + 11 * scale, y + 1 * scale, 10 * scale, 27 * scale);
          }
          ctx.$("[data-f]").textContent = `frame ${frame + 1}/${N}`;
          ctx.$$("[data-strip] button").forEach((b, i) => (b.style.borderColor = i === frame ? "var(--xp-accent)" : "var(--dv-border)"));
        };
        ctx.raf((t, dt) => {
          if (playing) {
            acc += dt;
            const step = 1000 / Number(ctx.$("[data-fps]").value);
            while (acc > step) {
              acc -= step;
              frame = (frame + 1) % N;
            }
          }
          draw();
        });
        ctx.on(ctx.$("[data-play]"), "click", (e) => {
          playing = !playing;
          e.target.textContent = playing ? "❚❚ Pause" : "▶ Play";
        });
        ctx.$$("[data-step]").forEach((b) => ctx.on(b, "click", () => ((playing = false), (ctx.$("[data-play]").textContent = "▶ Play"), (frame = (frame + Number(b.dataset.step) + N) % N))));
        ctx.on(ctx.$("[data-strip]"), "click", (e) => {
          const b = e.target.closest("[data-i]");
          if (!b) return;
          playing = false;
          ctx.$("[data-play]").textContent = "▶ Play";
          frame = Number(b.dataset.i);
        });
      }
    },

    "camera-pip-controller": {
      html: `
        ${head("Media · camera-pip-controller.tsx", "Camera PiP HUD", "Draggable picture-in-picture that snaps to corners, optional real camera, a recording timer with mic level and a scrolling teleprompter.")}
        <div class="xp-board" data-stage style="height:420px;background:linear-gradient(160deg,var(--dv-bg-elevated),var(--dv-bg))">
          <div data-prompter style="position:absolute;inset:20px 20px 80px;overflow:hidden;font-size:22px;line-height:1.6;text-align:center;color:var(--dv-fg)"><div data-text style="padding-top:260px">Hi everyone — today I'm showing the new devl-ui gallery. Every experiment is now a real, working component. You can open the code drawer to copy the HTML and JavaScript, change tokens to restyle everything, and drop the library into any project. No dependencies, just the platform.</div></div>
          <div data-pip style="position:absolute;width:200px;height:130px;right:16px;bottom:16px;border-radius:14px;overflow:hidden;box-shadow:var(--dv-shadow-lg);border:2px solid var(--dv-border-strong);cursor:grab;touch-action:none;transition:left .25s var(--dv-ease),top .25s var(--dv-ease)">
            <video data-video autoplay muted playsinline style="width:100%;height:100%;object-fit:cover;display:none"></video>
            <div data-fallback style="width:100%;height:100%;display:grid;place-items:center;background:radial-gradient(circle at 50% 40%,var(--xp-accent),#111);color:#fff;font-size:30px">🙂</div>
            <span data-rec hidden class="dv-badge dv-badge--danger" style="position:absolute;top:6px;left:6px"><span class="dv-dot dv-dot--danger dv-dot--pulse" style="--_c:#fff"></span> <span data-time>00:00</span></span>
          </div>
        </div>
        <div class="dv-row"><button type="button" class="dv-btn" data-cam>📷 Use camera</button><button type="button" class="dv-btn dv-btn--danger" data-record>● Record</button><label class="dv-choice">Prompter speed <input type="range" class="dv-range" min="0" max="60" value="20" data-speed style="width:120px" aria-label="Prompter speed" /></label><label class="dv-choice">Mic <div class="dv-meter" style="width:100px;height:8px"><span data-level style="--w:0%;--c:var(--dv-success)"></span></div></label></div>`,
      setup(root, ctx) {
        const stage = ctx.$("[data-stage]");
        const pip = ctx.$("[data-pip]");
        let drag = null;
        ctx.on(pip, "pointerdown", (e) => {
          drag = { x: e.clientX, y: e.clientY, l: pip.offsetLeft, t: pip.offsetTop };
          pip.style.transition = "none";
          pip.style.right = "auto";
          pip.style.bottom = "auto";
          pip.style.left = `${drag.l}px`;
          pip.style.top = `${drag.t}px`;
          pip.setPointerCapture(e.pointerId);
        });
        ctx.on(pip, "pointermove", (e) => {
          if (!drag) return;
          pip.style.left = `${drag.l + e.clientX - drag.x}px`;
          pip.style.top = `${drag.t + e.clientY - drag.y}px`;
        });
        ctx.on(pip, "pointerup", () => {
          if (!drag) return;
          drag = null;
          pip.style.transition = "";
          const m = 16;
          const left = pip.offsetLeft + pip.offsetWidth / 2 < stage.clientWidth / 2 ? m : stage.clientWidth - pip.offsetWidth - m;
          const top = pip.offsetTop + pip.offsetHeight / 2 < stage.clientHeight / 2 ? m : stage.clientHeight - pip.offsetHeight - m;
          pip.style.left = `${left}px`;
          pip.style.top = `${top}px`;
        });
        let analyser = null;
        let buf = null;
        ctx.on(ctx.$("[data-cam]"), "click", async (e) => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const v = ctx.$("[data-video]");
            v.srcObject = stream;
            v.style.display = "block";
            ctx.$("[data-fallback]").hidden = true;
            const ac = new (window.AudioContext || window.webkitAudioContext)();
            analyser = ac.createAnalyser();
            buf = new Uint8Array(analyser.fftSize);
            ac.createMediaStreamSource(stream).connect(analyser);
            ctx.onCleanup(() => {
              stream.getTracks().forEach((t) => t.stop());
              ac.close();
            });
            e.target.disabled = true;
          } catch (_) {
            ctx.toast({ title: "Camera unavailable", description: "Permission denied or no device — using the placeholder.", variant: "warning" });
          }
        });
        let rec = false;
        let secs = 0;
        ctx.on(ctx.$("[data-record]"), "click", (e) => {
          rec = !rec;
          if (rec) secs = 0;
          ctx.$("[data-rec]").hidden = !rec;
          e.target.textContent = rec ? "■ Stop" : "● Record";
          if (!rec) ctx.toast({ title: "Recording saved", description: `${secs}s · take-${Date.now().toString(36)}.webm` });
        });
        ctx.every(1000, () => {
          if (!rec) return;
          secs++;
          ctx.$("[data-time]").textContent = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
        });
        let y = 0;
        ctx.raf((t, dt) => {
          const text = ctx.$("[data-text]");
          y += (Number(ctx.$("[data-speed]").value) * dt) / 1000;
          if (y > text.scrollHeight) y = 0;
          text.style.transform = `translateY(${-y}px)`;
          let level = rec ? 0.2 + Math.random() * 0.5 : 0.05;
          if (analyser) {
            analyser.getByteTimeDomainData(buf);
            let s = 0;
            for (let i = 0; i < buf.length; i++) s += ((buf[i] - 128) / 128) ** 2;
            level = Math.min(1, Math.sqrt(s / buf.length) * 5);
          }
          const lv = ctx.$("[data-level]");
          lv.style.setProperty("--w", `${level * 100}%`);
          lv.style.setProperty("--c", level > 0.8 ? "var(--dv-danger)" : "var(--dv-success)");
        });
      }
    }
  });
})();
