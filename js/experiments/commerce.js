// ============================================================================
// Experimentos funcionales — Fintech y Tesorería (8), Precios (6), Toasts y banners (6),
// Medios y Herramientas Creativas (8)
// ============================================================================

(function () {
  "use strict";
  const X = window.TESELA_XP;
  const { head, esc, field } = X;

  // ==========================================================================
  // FINTECH Y TESORERÍA
  // ==========================================================================
  X.addMany("crypto-fintech", {
    "orderbook-depth-wall": {
      html: `
        ${head("Fintech · orderbook-depth-wall.tsx", "Muro de profundidad del libro de órdenes", "Libro en vivo con barras de profundidad acumulada y gráfica de profundidad. Haz clic en un nivel para rellenar el formulario; tus órdenes límite se suman al libro.")}
        <div class="tsl-row"><strong class="xp-mono">TSLX/USD</strong><span class="xp-num xp-mono" style="font-size:22px" data-mid></span><span class="tsl-badge" data-spread></span></div>
        <div class="tsl-grid" style="--min:300px;align-items:start">
          <div class="xp-panel" style="padding:8px"><table class="tsl-table tsl-table--compact"><thead><tr><th>Precio</th><th class="is-num">Tamaño</th><th class="is-num">Total</th></tr></thead><tbody data-asks></tbody><tbody data-bids></tbody></table></div>
          <div class="tsl-stack">
            <div class="xp-panel"><svg class="xp-chart" viewBox="0 0 400 180" data-depth></svg></div>
            <form class="xp-panel tsl-stack" data-form><tsl-segmented value="buy" data-side><button class="tsl-segmented__item" value="buy">Comprar</button><button class="tsl-segmented__item" value="sell">Vender</button></tsl-segmented><div class="tsl-row"><label class="tsl-field" style="flex:1"><span class="tsl-label">Precio límite</span><input class="tsl-input xp-mono" type="number" step="0.01" data-price required /></label><label class="tsl-field" style="flex:1"><span class="tsl-label">Tamaño</span><input class="tsl-input xp-mono" type="number" step="0.1" min="0.1" value="1" data-size required /></label></div><button type="submit" class="tsl-btn tsl-btn--primary">Colocar orden</button></form>
          </div>
        </div>`,
      setup(root, ctx) {
        let mid = 142.3;
        const mine = [];
        const levels = (side) => Array.from({ length: 10 }, (_, i) => ({ p: +(mid + (side === "ask" ? 1 : -1) * (0.05 + i * 0.06)).toFixed(2), s: +(0.5 + Math.random() * 8).toFixed(2) }));
        let asks = levels("ask");
        let bids = levels("bid");
        const render = () => {
          // Fusiona mis órdenes pendientes en copias de los últimos niveles del mercado
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
          const row = (l, c, side) => `<tr data-p="${l.p}" style="cursor:pointer;background:linear-gradient(to left, color-mix(in srgb,var(--tsl-${side === "ask" ? "danger" : "success"}) 18%,transparent) ${(c / max) * 100}%, transparent 0)"><td class="xp-mono" style="color:var(--tsl-${side === "ask" ? "danger" : "success"})">${l.p.toFixed(2)}${l.mine ? ' <tsl-icon name="circle-dot" label="Tu orden"></tsl-icon>' : ""}</td><td class="is-num">${l.s.toFixed(2)}</td><td class="is-num tsl-muted">${c.toFixed(2)}</td></tr>`;
          ctx.$("[data-asks]").innerHTML = A.slice(0, 10).map((l, i) => row(l, ca[i], "ask")).reverse().join("");
          ctx.$("[data-bids]").innerHTML = B.slice(0, 10).map((l, i) => row(l, cb[i], "bid")).join("");
          const spread = A[0].p - B[0].p;
          ctx.$("[data-mid]").textContent = ((A[0].p + B[0].p) / 2).toFixed(2);
          ctx.$("[data-spread]").textContent = `diferencial ${spread.toFixed(2)} (${((spread / mid) * 1e4).toFixed(1)} bps)`;
          const lo = B[9] ? B[9].p : mid - 1;
          const hi = A[9] ? A[9].p : mid + 1;
          const X0 = (p) => ((p - lo) / (hi - lo)) * 380 + 10;
          const Y = (c) => 170 - (c / max) * 150;
          const step = (list, cumu) => list.slice(0, 10).map((l, i) => `L${X0(l.p).toFixed(1)},${Y(cumu[i - 1] || 0).toFixed(1)} L${X0(l.p).toFixed(1)},${Y(cumu[i]).toFixed(1)}`).join(" ");
          ctx.$("[data-depth]").innerHTML = `<path d="M${X0(B[0].p)},170 ${step(B, cb)} L${X0(B[9].p)},170 Z" fill="var(--tsl-success)" fill-opacity=".2" stroke="var(--tsl-success)"/><path d="M${X0(A[0].p)},170 ${step(A, ca)} L${X0(A[9].p)},170 Z" fill="var(--tsl-danger)" fill-opacity=".2" stroke="var(--tsl-danger)"/><line x1="${X0(mid)}" x2="${X0(mid)}" y1="10" y2="170" stroke="currentColor" stroke-dasharray="3 3" opacity=".4"/>`;
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
          if (crosses) ctx.toast({ title: `Ejecutada ${s} @ ${(side === "buy" ? asks[0].p : bids[0].p).toFixed(2)}`, description: "La orden cruzó el diferencial" });
          else {
            mine.push({ side, p, s });
            ctx.toast({ title: `Orden límite de ${side === "buy" ? "compra" : "venta"} ${s} @ ${p.toFixed(2)} colocada`, variant: "info" });
          }
          render();
        });
        ctx.$("[data-price]").value = mid.toFixed(2);
        render();
      }
    },

    "virtual-card-vault": {
      html: `
        ${head("Fintech · virtual-card-vault.tsx", "Bóveda de tarjeta virtual", "Revela los datos por 10 segundos, congela la tarjeta, fija un límite de gasto y bloquea comercios; luego simula compras contra esas reglas.")}
        <div class="tsl-grid" style="--min:300px;align-items:start">
          <div data-card style="aspect-ratio:1.586;border-radius:16px;padding:22px;color:#fff;background:linear-gradient(135deg,var(--xp-accent),#0ea5e9);box-shadow:var(--tsl-shadow-lg);display:flex;flex-direction:column;justify-content:space-between;transition:filter .3s;max-width:400px">
            <div class="tsl-row"><strong>Acme · Presupuesto de anuncios</strong><span class="tsl-spacer"></span><span data-frozen-tag hidden class="tsl-badge" style="background:rgba(0,0,0,.3);color:#fff"><tsl-icon name=snowflake></tsl-icon> Congelada</span></div>
            <div class="xp-mono" style="font-size:20px;letter-spacing:.12em" data-num>•••• •••• •••• 4821</div>
            <div class="tsl-row xp-mono" style="font-size:12px"><span>VENC <span data-exp>••/••</span></span><span>CVV <span data-cvv>•••</span></span><span class="tsl-spacer"></span><strong>VISA</strong></div>
          </div>
          <div class="tsl-stack">
            <div class="tsl-row"><button type="button" class="tsl-btn" data-reveal><tsl-icon name=eye></tsl-icon> Revelar</button><label class="tsl-choice">Congelar <input type="checkbox" role="switch" class="tsl-switch" data-freeze /></label><span class="tsl-muted" data-timer></span></div>
            <div class="xp-panel tsl-stack" style="--gap:6px"><div class="tsl-row"><span class="tsl-label">Límite mensual</span><span class="tsl-spacer"></span><strong class="xp-mono" id="vc-limit">$2,000</strong></div><input type="range" class="tsl-range" min="100" max="10000" step="100" value="2000" data-limit aria-label="Límite mensual" /><div class="tsl-meter"><span data-spent></span></div><span class="tsl-hint" data-spent-t></span></div>
            <div class="xp-panel tsl-stack" style="--gap:6px"><span class="tsl-label">Comercios permitidos</span><div class="tsl-row" data-merch>${["Google Ads", "Meta", "LinkedIn", "Amazon"].map((m, i) => `<button type="button" class="tsl-chip" data-m="${m}" aria-pressed="${i < 2}">${m}</button>`).join("")}</div></div>
            <div class="tsl-row"><select class="tsl-select" style="width:auto" data-buy-m aria-label="Comercio"><option>Google Ads</option><option>Meta</option><option>LinkedIn</option><option>Amazon</option></select><input class="tsl-input xp-mono" type="number" value="250" style="width:110px" data-amt aria-label="Monto" /><button type="button" class="tsl-btn tsl-btn--primary" data-buy>Simular compra</button></div>
            <ul class="tsl-list" data-log style="font-size:12px"></ul>
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
          s.style.setProperty("--c", spent > limit * 0.9 ? "var(--tsl-danger)" : "var(--xp-accent)");
          ctx.$("[data-spent-t]").textContent = `${ctx.fmt.money(spent, "USD", 0)} gastados · ${ctx.fmt.money(Math.max(0, limit - spent), "USD", 0)} disponibles`;
          const frozen = ctx.$("[data-freeze]").checked;
          ctx.$("[data-card]").style.filter = frozen ? "grayscale(1) brightness(.7)" : "";
          ctx.$("[data-frozen-tag]").hidden = !frozen;
          ctx.$("[data-num]").textContent = reveal ? "4532 7781 0934 4821" : "•••• •••• •••• 4821";
          ctx.$("[data-exp]").textContent = reveal ? "09/29" : "••/••";
          ctx.$("[data-cvv]").textContent = reveal ? "318" : "•••";
          ctx.$("[data-timer]").textContent = reveal ? `Se ocultará en ${reveal}s` : "";
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
          if (ctx.$("[data-freeze]").checked) reason = "tarjeta congelada";
          else if (!allowed) reason = "comercio no permitido";
          else if (spent + amt > Number(ctx.$("[data-limit]").value)) reason = "excede el límite mensual";
          if (!reason) spent += amt;
          ctx.$("[data-log]").insertAdjacentHTML("afterbegin", `<li><span class="tsl-badge tsl-badge--${reason ? "danger" : "success"}">${reason ? "Rechazada" : "Aprobada"}</span><span>${esc(m)}</span><span class="xp-mono">${ctx.fmt.money(amt)}</span><span class="tsl-list__end tsl-muted">${reason}</span></li>`);
          sync();
        });
        sync();
      }
    },

    "fx-currency-swap": {
      html: `
        ${head("Fintech · fx-currency-swap.tsx", "Cambio de divisas FX", "Tasas en tiempo real, dirección del cambio, tolerancia de deslizamiento y una cotización bloqueada de 15 segundos que se renueva al expirar.")}
        <div class="tsl-card" style="max-width:480px;width:100%;margin:0 auto"><div class="tsl-card__body tsl-stack">
          <div class="tsl-row" style="flex-wrap:nowrap"><input class="tsl-input xp-mono" style="font-size:20px;height:48px" type="number" min="0" value="2500" data-amt aria-label="Monto" /><select class="tsl-select" style="width:110px;height:48px" data-from aria-label="De">${["USD", "EUR", "MXN", "GBP", "JPY"].map((c) => `<option>${c}</option>`).join("")}</select></div>
          <button type="button" class="tsl-btn tsl-btn--icon" style="align-self:center" data-swap aria-label="Invertir dirección"><tsl-icon name="arrow-up-down"></tsl-icon></button>
          <div class="tsl-row" style="flex-wrap:nowrap"><div class="tsl-input xp-mono" style="font-size:20px;height:48px;display:flex;align-items:center" data-out></div><select class="tsl-select" style="width:110px;height:48px" data-to aria-label="A">${["EUR", "USD", "MXN", "GBP", "JPY"].map((c) => `<option>${c}</option>`).join("")}</select></div>
          <div class="tsl-row"><span class="tsl-label">Deslizamiento</span><tsl-segmented value="0.5" data-slip><button class="tsl-segmented__item" value="0.1">0.1%</button><button class="tsl-segmented__item" value="0.5">0.5%</button><button class="tsl-segmented__item" value="1">1%</button></tsl-segmented></div>
          <dl class="xp-kv xp-mono" data-quote></dl>
          <progress class="tsl-progress" max="15" value="15" data-lock></progress>
          <button type="button" class="tsl-btn tsl-btn--primary tsl-btn--block" data-go>Cambiar</button>
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
          const fmt = (v, c) => new Intl.NumberFormat("es-MX", { style: "currency", currency: c, currencyDisplay: "narrowSymbol", maximumFractionDigits: c === "JPY" ? 0 : 2 }).format(v);
          ctx.$("[data-out]").textContent = fmt(out, to);
          ctx.$("[data-quote]").innerHTML = `<dt>Tasa</dt><dd>1 ${from} = ${r.toFixed(4)} ${to}</dd><dt>Comisión (0.2%)</dt><dd>${fmt(fee, from)}</dd><dt>Mín. recibido</dt><dd>${fmt(out * (1 - slip), to)}</dd><dt>Cotización</dt><dd>${left ? `bloqueada · ${left}s` : "actualizando…"}</dd>`;
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
        ctx.on(ctx.$("[data-slip]"), "tsl-change", render);
        ctx.on(ctx.$("[data-swap]"), "click", () => {
          const f = ctx.$("[data-from]");
          const t = ctx.$("[data-to]");
          [f.value, t.value] = [t.value, f.value];
          render();
        });
        ctx.on(ctx.$("[data-go]"), "click", () => {
          if (ctx.$("[data-from]").value === ctx.$("[data-to]").value) return ctx.toast({ title: "Elige dos divisas distintas", variant: "warning" });
          ctx.toast({ title: "Cambio ejecutado", description: `${ctx.$("[data-amt]").value} ${ctx.$("[data-from]").value} → ${ctx.$("[data-out]").textContent}` });
        });
        render();
      }
    },

    "treasury-runway-burn": {
      html: `
        ${head("Fintech · treasury-runway-burn.tsx", "Quema y runway de tesorería", "Proyección de caja mes a mes a partir de ingresos, costos y tasas de crecimiento. Mira cómo se mueven el runway y la fecha de caja cero al cambiar los supuestos o elegir un escenario.")}
        <div class="tsl-row" data-scen>${["Base", "Austero", "Contratar 5", "Levantar $2M"].map((s, i) => `<button type="button" class="tsl-chip" data-s="${s}" aria-pressed="${!i}">${s}</button>`).join("")}</div>
        <div class="tsl-grid" style="--min:300px;align-items:start">
          <div class="xp-panel tsl-stack" data-form>
            ${[["cash", "Efectivo en banco ($k)", 1800], ["rev", "Ingresos mensuales ($k)", 85], ["cost", "Costos mensuales ($k)", 190], ["rg", "Crecimiento de ingresos %/mes", 6], ["cg", "Crecimiento de costos %/mes", 1.5]].map(([k, l, v]) => `<label class="tsl-row" style="justify-content:space-between"><span>${l}</span><input class="tsl-input xp-mono" type="number" step="0.5" style="width:110px" data-k="${k}" value="${v}" /></label>`).join("")}
          </div>
          <div class="tsl-stack"><div class="tsl-grid" style="--min:140px"><div class="tsl-stat"><span class="tsl-eyebrow">Runway</span><span class="tsl-stat__value" data-runway></span></div><div class="tsl-stat"><span class="tsl-eyebrow">Caja cero</span><span class="tsl-stat__value" style="font-size:18px" data-zero></span></div><div class="tsl-stat"><span class="tsl-eyebrow">Quema neta actual</span><span class="tsl-stat__value" data-burn></span></div></div><div class="xp-panel"><svg class="xp-chart" viewBox="0 0 400 180" data-chart></svg></div></div>
        </div>`,
      setup(root, ctx) {
        const scen = { Base: { cash: 1800, rev: 85, cost: 190, rg: 6, cg: 1.5 }, Austero: { cash: 1800, rev: 85, cost: 140, rg: 5, cg: 0.5 }, "Contratar 5": { cash: 1800, rev: 85, cost: 255, rg: 8, cg: 1.5 }, "Levantar $2M": { cash: 3800, rev: 85, cost: 210, rg: 7, cg: 2 } };
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
          ctx.$("[data-runway]").textContent = profitable ? "∞" : `${zero} m`;
          ctx.$("[data-zero]").textContent = profitable ? "Rentable por defecto" : new Date(new Date().getFullYear(), new Date().getMonth() + zero, 1).toLocaleDateString("es-MX", { month: "short", year: "numeric" });
          ctx.$("[data-burn]").textContent = `$${Math.max(0, v.cost - v.rev).toFixed(0)}k`;
          const C = TESELA_XP.chart;
          const max = C.niceMax(Math.max(...pts));
          const min = Math.min(0, ...pts);
          const x = C.scale(0, 48, 30, 395);
          const y = C.scale(min, max, 165, 10);
          ctx.$("[data-chart]").innerHTML = `<line x1="30" x2="395" y1="${y(0)}" y2="${y(0)}" stroke="var(--tsl-danger)" stroke-dasharray="4 3" opacity=".6"/><path d="${C.path(pts.map((p, i) => [x(i), y(p)]))}" fill="none" stroke="var(--xp-accent)" stroke-width="2"/>${zero > 0 ? `<circle cx="${x(zero)}" cy="${y(0)}" r="4" fill="var(--tsl-danger)"/><text x="${x(zero)}" y="${y(0) - 8}" text-anchor="middle">mes ${zero}</text>` : ""}<text x="30" y="178">hoy</text><text x="395" y="178" text-anchor="end">+48 m</text>`;
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
        ${head("Fintech · liquidity-pool-range.tsx", "Rango de liquidez concentrada", "Define un rango de precios sobre el histograma de liquidez. Los rangos más estrechos ganan más comisiones mientras el precio esté dentro, y nada cuando sale.")}
        <div class="xp-panel"><svg class="xp-chart" viewBox="0 0 600 200" data-hist></svg></div>
        <div class="tsl-grid" style="--min:240px">
          <label class="tsl-field"><span class="tsl-label">Precio mín. <strong class="xp-mono" id="lp-min">$1,700</strong></span><input type="range" class="tsl-range" min="1000" max="3000" step="10" value="1700" data-min data-tsl-output="#lp-min" aria-label="Precio mínimo" /></label>
          <label class="tsl-field"><span class="tsl-label">Precio máx. <strong class="xp-mono" id="lp-max">$2,300</strong></span><input type="range" class="tsl-range" min="1000" max="3000" step="10" value="2300" data-max data-tsl-output="#lp-max" aria-label="Precio máximo" /></label>
        </div>
        <div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--sm" data-drift>Simular movimiento de precio</button><div class="tsl-grid" style="--min:150px;flex:1"><div class="tsl-stat"><span class="tsl-eyebrow">Estado</span><span data-status></span></div><div class="tsl-stat"><span class="tsl-eyebrow">APR est.</span><span class="tsl-stat__value" data-apr></span></div><div class="tsl-stat"><span class="tsl-eyebrow">Eficiencia de capital</span><span class="tsl-stat__value" data-eff></span></div></div></div>`,
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
          ctx.$("#lp-min").textContent = `$${lo.toLocaleString("es-MX")}`;
          ctx.$("#lp-max").textContent = `$${hi.toLocaleString("es-MX")}`;
          const max = Math.max(...bins.map((b) => b.l));
          const X0 = (p) => ((p - 1000) / 2000) * 580 + 10;
          ctx.$("[data-hist]").innerHTML =
            `<rect x="${X0(lo)}" y="0" width="${X0(hi) - X0(lo)}" height="180" fill="var(--xp-accent)" opacity=".1"/>` +
            bins.map((b) => `<rect x="${X0(b.p) + 1}" y="${180 - (b.l / max) * 160}" width="${(580 / 40) - 2}" height="${(b.l / max) * 160}" fill="${b.p >= lo && b.p < hi ? "var(--xp-accent)" : "var(--tsl-fg-subtle)"}" opacity=".8"/>`).join("") +
            `<line x1="${X0(price)}" x2="${X0(price)}" y1="0" y2="180" stroke="var(--tsl-warning)" stroke-width="2"/><text x="${X0(price)}" y="196" text-anchor="middle">$${price.toFixed(0)}</text>`;
          const inRange = price >= lo && price <= hi;
          const eff = Math.sqrt(hi / lo) / (Math.sqrt(hi / lo) - 1);
          ctx.$("[data-status]").innerHTML = inRange ? '<span class="tsl-badge tsl-badge--success">En rango · generando</span>' : '<span class="tsl-badge tsl-badge--danger">Fuera de rango · 0 comisiones</span>';
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
        ${head("Fintech · wire-transfer-stepper.tsx", "Asistente de transferencia bancaria", "Destinatario → monto → revisión → enviada. El IBAN se valida con la suma de verificación real mod-97 de ISO 13616 (prueba GB82 WEST 1234 5698 7654 32).")}
        <div class="xp-panel tsl-stack" style="max-width:560px;width:100%;margin:0 auto">
          <ol class="tsl-steps" data-steps><li aria-current="step">Destinatario</li><li>Monto</li><li>Revisión</li><li>Enviada</li></ol>
          <section data-p="0" class="tsl-stack"><label class="tsl-field"><span class="tsl-label">Nombre del beneficiario</span><input class="tsl-input" data-name value="Globex GmbH" /></label><label class="tsl-field"><span class="tsl-label">IBAN</span><input class="tsl-input xp-mono" data-iban placeholder="DE89 3704 0044 0532 0130 00" /><span class="tsl-hint" data-iban-hint></span></label><label class="tsl-field"><span class="tsl-label">BIC / SWIFT</span><input class="tsl-input xp-mono" data-bic value="COBADEFFXXX" /></label></section>
          <section data-p="1" class="tsl-stack" hidden><div class="tsl-row" style="flex-wrap:nowrap"><input class="tsl-input xp-mono" type="number" min="1" value="12500" data-amt aria-label="Monto" style="font-size:18px" /><select class="tsl-select" style="width:100px" data-cur aria-label="Divisa"><option>EUR</option><option>USD</option><option>GBP</option></select></div><label class="tsl-field"><span class="tsl-label">Referencia</span><input class="tsl-input" data-ref value="INV-2094" /></label><dl class="xp-kv xp-mono" data-fees></dl></section>
          <section data-p="2" class="tsl-stack" hidden><dl class="xp-kv" data-review></dl><label class="tsl-choice"><input type="checkbox" class="tsl-check" data-confirm /> Confirmo que los datos son correctos</label></section>
          <section data-p="3" class="tsl-stack" hidden><div class="tsl-alert tsl-alert--success"><div><div class="tsl-alert__title">Transferencia enviada</div><div class="tsl-alert__desc" data-done></div></div></div></section>
          <span class="tsl-error" data-err></span>
          <div class="tsl-row"><button type="button" class="tsl-btn" data-back disabled>Atrás</button><span class="tsl-spacer"></span><button type="button" class="tsl-btn tsl-btn--primary" data-next>Continuar</button></div>
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
          ctx.$("[data-iban-hint]").innerHTML = s.length < 15 ? "" : ok ? '<span style="color:var(--tsl-success)"><tsl-icon name=check></tsl-icon> Suma de verificación válida</span>' : '<span style="color:var(--tsl-danger)"><tsl-icon name=x></tsl-icon> Suma de verificación inválida</span>';
        });
        const fees = () => {
          const amt = Number(ctx.$("[data-amt]").value) || 0;
          const cur = ctx.$("[data-cur]").value;
          const fee = cur === "EUR" ? 0 : 15;
          ctx.$("[data-fees]").innerHTML = `<dt>Comisión de transferencia</dt><dd>${fee ? `${fee} ${cur} (SWIFT)` : "Gratis (SEPA)"}</dd><dt>Total debitado</dt><dd>${(amt + fee).toLocaleString("es-MX")} ${cur}</dd><dt>Llega</dt><dd>${fee ? "1–2 días hábiles" : "Hoy (SEPA Instant)"}</dd>`;
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
          ctx.$("[data-next]").textContent = n === 2 ? "Enviar transferencia" : n === 3 ? "Nueva transferencia" : "Continuar";
          ctx.$("[data-err]").textContent = "";
          if (n === 2) ctx.$("[data-review]").innerHTML = `<dt>Para</dt><dd>${esc(ctx.$("[data-name]").value)}</dd><dt>IBAN</dt><dd class="xp-mono">${esc(iban.value)}</dd><dt>BIC</dt><dd class="xp-mono">${esc(ctx.$("[data-bic]").value)}</dd><dt>Monto</dt><dd>${Number(ctx.$("[data-amt]").value).toLocaleString("es-MX")} ${ctx.$("[data-cur]").value}</dd><dt>Referencia</dt><dd>${esc(ctx.$("[data-ref]").value)}</dd>`;
          if (n === 1) fees();
        };
        ctx.on(ctx.$("[data-next]"), "click", (e) => {
          let err = "";
          if (step === 0) {
            if (!ctx.$("[data-name]").value.trim()) err = "Ingresa el nombre del beneficiario.";
            else if (!ibanOk(iban.value)) err = "El IBAN no es válido.";
            else if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(ctx.$("[data-bic]").value.toUpperCase())) err = "El BIC debe tener 8 u 11 caracteres.";
          } else if (step === 1 && !(Number(ctx.$("[data-amt]").value) > 0)) err = "Ingresa un monto.";
          else if (step === 2 && !ctx.$("[data-confirm]").checked) err = "Confirma los datos.";
          if (err) return (ctx.$("[data-err]").textContent = err);
          if (step === 2) {
            e.target.setAttribute("aria-busy", "true");
            return ctx.timeout(900, () => {
              e.target.removeAttribute("aria-busy");
              ctx.$("[data-done]").textContent = `Referencia WT-${Date.now().toString(36).toUpperCase()} · síguela en Transacciones.`;
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
        ${head("Fintech · tax-lot-harvester.tsx", "Cosecha de lotes fiscales", "Elige una cantidad y un método de selección de lotes (FIFO / LIFO / HIFO) o marca los lotes a mano; las ganancias realizadas a corto y largo plazo y el impuesto estimado se recalculan.")}
        <div class="tsl-row"><span class="tsl-label">Vender</span><input class="tsl-input xp-mono" type="number" min="0" value="60" style="width:90px" data-qty aria-label="Cantidad" /><span>acciones a</span><input class="tsl-input xp-mono" type="number" value="182" style="width:90px" data-price aria-label="Precio" /><tsl-segmented value="hifo" data-method><button class="tsl-segmented__item" value="fifo">FIFO</button><button class="tsl-segmented__item" value="lifo">LIFO</button><button class="tsl-segmented__item" value="hifo">HIFO</button><button class="tsl-segmented__item" value="manual">Manual</button></tsl-segmented></div>
        <div class="tsl-table-wrap"><table class="tsl-table"><thead><tr><th></th><th>Adquirido</th><th class="is-num">Acciones</th><th class="is-num">Costo/acción</th><th>Plazo</th><th class="is-num">Vender</th><th class="is-num">Ganancia/pérdida</th></tr></thead><tbody data-lots></tbody></table></div>
        <div class="tsl-grid" style="--min:170px"><div class="tsl-stat"><span class="tsl-eyebrow">Corto plazo</span><span class="tsl-stat__value" data-st></span></div><div class="tsl-stat"><span class="tsl-eyebrow">Largo plazo</span><span class="tsl-stat__value" data-lt></span></div><div class="tsl-stat"><span class="tsl-eyebrow">Impuesto est.</span><span class="tsl-stat__value" data-tax></span></div></div>`,
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
              return `<tr><td><input type="checkbox" class="tsl-check" data-i="${i}"${l.pick ? " checked" : ""}${method === "manual" ? "" : " disabled"} aria-label="Vender lote ${i + 1}" /></td><td class="xp-mono">${l.d}</td><td class="is-num">${l.n}</td><td class="is-num">$${l.c}</td><td><span class="tsl-badge tsl-badge--${longTerm(l.d) ? "success" : "warning"}">${longTerm(l.d) ? "Largo" : "Corto"}</span></td><td class="is-num">${l.pick}</td><td class="is-num" style="color:${g >= 0 ? "var(--tsl-success)" : "var(--tsl-danger)"}">${g ? ctx.fmt.money(g, "USD", 0) : "—"}</td></tr>`;
            })
            .join("");
          const color = (v) => `<span style="color:${v >= 0 ? "var(--tsl-success)" : "var(--tsl-danger)"}">${ctx.fmt.money(v, "USD", 0)}</span>`;
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
        ctx.on(ctx.$("[data-method]"), "tsl-change", render);
        render();
      }
    },

    "multi-sig-quorum": {
      html: `
        ${head("Fintech · multi-sig-quorum.tsx", "Quórum multifirma", "Reúne firmas de firmantes con hardware hasta alcanzar el umbral y luego ejecuta. Cambia el umbral para ver cómo reacciona la política.")}
        <div class="tsl-grid" style="--min:300px;align-items:start">
          <div class="xp-panel tsl-stack"><span class="tsl-eyebrow">Transacción · nonce <span data-nonce>41</span></span><dl class="xp-kv xp-mono"><dt>Para</dt><dd>0x9F2a…71E0</dd><dt>Monto</dt><dd>25,000 USDC</dd><dt>Concepto</dt><dd>Nómina T4</dd></dl><div class="tsl-row"><span class="tsl-label">Umbral</span><div class="tsl-number"><button type="button" data-step="-1" aria-label="Reducir">−</button><input type="number" min="1" max="5" value="3" data-th aria-label="Umbral" /><button type="button" data-step="1" aria-label="Aumentar">+</button></div><span class="tsl-muted">de 5</span></div><progress class="tsl-progress" max="3" value="0" data-bar></progress><button type="button" class="tsl-btn tsl-btn--primary" data-exec disabled>Ejecutar transacción</button></div>
          <ul class="tsl-list" data-signers></ul>
        </div>`,
      setup(root, ctx) {
        const signers = [["Luis", "Ledger"], ["Ana", "Trezor"], ["Leo", "GridPlus"], ["Sara", "Ledger"], ["Bóveda CFO", "HSM"]].map(([n, d]) => ({ n, d, state: "pending" }));
        let nonce = 41;
        const render = () => {
          const th = Math.max(1, Math.min(5, Number(ctx.$("[data-th]").value) || 1));
          const signed = signers.filter((s) => s.state === "signed").length;
          ctx.$("[data-bar]").max = th;
          ctx.$("[data-bar]").value = Math.min(th, signed);
          ctx.$("[data-exec]").disabled = signed < th;
          ctx.$("[data-exec]").textContent = signed < th ? `Faltan ${th - signed} firma${th - signed > 1 ? "s" : ""}` : "Ejecutar transacción";
          ctx.$("[data-signers]").innerHTML = signers.map((s, i) => `<li><span class="tsl-avatar tsl-avatar--sm">${s.n[0]}</span><div style="flex:1"><div class="tsl-list__title">${s.n}</div><div class="tsl-list__desc">${s.d}</div></div>${s.state === "signed" ? '<span class="tsl-badge tsl-badge--success"><tsl-icon name=check></tsl-icon> Firmada</span>' : s.state === "signing" ? '<span class="tsl-badge tsl-badge--info"><span class="tsl-spinner" style="--size:10px;margin-right:4px"></span>Confirma en el dispositivo…</span>' : `<button type="button" class="tsl-btn tsl-btn--sm" data-sign="${i}">Firmar</button>`}</li>`).join("");
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
          ctx.toast({ title: "Transacción ejecutada", description: `nonce ${nonce} · 25,000 USDC enviados` });
          nonce++;
          signers.forEach((s) => (s.state = "pending"));
          render();
        });
        render();
      }
    }
  });

  // ==========================================================================
  // PRECIOS
  // ==========================================================================
  const currencies = { USD: 1, EUR: 0.93, MXN: 18 };
  const fmtCur = (v, c) => new Intl.NumberFormat("es-MX", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(v * currencies[c]);
  X.fmtCur = fmtCur;

  X.addMany("pricing", {
    "three-tier": {
      html: `
        ${head("Pricing · three-tier.tsx", "Tres niveles", "Personal / Pro / Enterprise con selector de facturación, cambio de divisa y tooltips de funciones. Los botones funcionan de verdad.")}
        <div class="tsl-row" style="justify-content:center"><tsl-segmented value="year" data-period><button class="tsl-segmented__item" value="month">Mensual</button><button class="tsl-segmented__item" value="year">Anual −20%</button></tsl-segmented><select class="tsl-select" style="width:auto" data-cur aria-label="Divisa"><option>USD</option><option>EUR</option><option>MXN</option></select></div>
        <div class="tsl-grid" style="--min:230px;align-items:stretch" data-tiers></div>`,
      setup(root, ctx) {
        const tiers = [["Personal", 0, ["1 espacio de trabajo", "3 proyectos", "Soporte de la comunidad"], "Empieza gratis"], ["Pro", 24, ["Proyectos ilimitados", "Dominios personalizados", "Historial de versiones", "Soporte prioritario"], "Iniciar prueba"], ["Enterprise", null, ["SSO y SCIM", "Registro de auditoría", "SLA del 99.99%", "CSM dedicado"], "Contactar a ventas"]];
        const tips = { "Dominios personalizados": "Sirve tu documentación en docs.tuempresa.com", "Historial de versiones": "90 días de respaldos", "SSO y SCIM": "Okta, Azure AD, Google", "SLA del 99.99%": "Créditos si no lo cumplimos" };
        const render = () => {
          const y = (ctx.$("[data-period]").value || "year") === "year";
          const c = ctx.$("[data-cur]").value;
          ctx.$("[data-tiers]").innerHTML = tiers.map(([n, p, feats, cta], i) => `<div class="tsl-card${i === 1 ? "" : " tsl-card--flat"}" style="${i === 1 ? "border-color:var(--xp-accent)" : ""}"><div class="tsl-card__body tsl-stack" style="height:100%"><div class="tsl-row"><span class="tsl-eyebrow">${n}</span>${i === 1 ? '<span class="tsl-badge tsl-badge--accent">Más popular</span>' : ""}</div><div class="xp-num">${p === null ? "A medida" : fmtCur(y ? p * 0.8 : p, c)}${p ? '<span class="tsl-muted" style="font-size:12px">/mes</span>' : ""}</div><span class="tsl-hint">${p ? (y ? `${fmtCur(p * 0.8 * 12, c)} facturado anualmente` : "Facturado mensualmente") : p === 0 ? "Gratis para siempre" : "Contrato anual"}</span><ul class="tsl-stack" style="--gap:6px;list-style:none;padding:0;font-size:12px;flex:1">${feats.map((f) => `<li><tsl-icon name=check></tsl-icon> ${tips[f] ? `<span data-tsl-tooltip="${tips[f]}" style="border-bottom:1px dotted var(--tsl-fg-subtle);cursor:help">${f}</span>` : f}</li>`).join("")}</ul><button type="button" class="tsl-btn tsl-btn--block ${i === 1 ? "tsl-btn--primary" : ""}" data-cta="${n}">${cta}</button></div></div>`).join("");
        };
        ctx.on(ctx.$("[data-period]"), "tsl-change", render);
        ctx.on(ctx.$("[data-cur]"), "change", render);
        ctx.on(ctx.$("[data-tiers]"), "click", (e) => {
          const b = e.target.closest("[data-cta]");
          if (!b) return;
          b.setAttribute("aria-busy", "true");
          ctx.timeout(600, () => {
            b.removeAttribute("aria-busy");
            ctx.toast({ title: b.dataset.cta === "Enterprise" ? "Ventas te contactará en menos de 24 h" : `Plan ${b.dataset.cta} seleccionado` });
          });
        });
        render();
      }
    },

    "comparison-table": {
      html: `
        ${head("Pricing · comparison-table.tsx", "Matriz de funciones", "Encabezado fijo, categorías plegables, filtro de «solo diferencias» y una columna de plan seleccionable.")}
        <div class="tsl-row"><label class="tsl-choice">Mostrar solo diferencias <input type="checkbox" role="switch" class="tsl-switch" data-diff /></label><span class="tsl-spacer"></span><span class="tsl-badge tsl-badge--accent" data-sel>Seleccionado: Pro</span></div>
        <div class="tsl-table-wrap" style="max-height:440px;overflow:auto"><table class="tsl-table" data-t></table></div>`,
      setup(root, ctx) {
        const plans = ["Gratis", "Pro", "Team", "Enterprise"];
        const cats = { Básico: [["Proyectos", "3", "∞", "∞", "∞"], ["Miembros", "1", "5", "25", "∞"], ["Almacenamiento", "1 GB", "50 GB", "500 GB", "A medida"]], Colaboración: [["Comentarios", true, true, true, true], ["Acceso de invitados", "—", true, true, true], ["Historial de versiones", "7 días", "90 días", "1 año", "∞"]], Seguridad: [["2FA", true, true, true, true], ["SSO", "—", "—", true, true], ["Registro de auditoría", "—", "—", "—", true]] };
        const closed = new Set();
        let sel = 1;
        const render = () => {
          const diff = ctx.$("[data-diff]").checked;
          ctx.$("[data-t]").innerHTML = `<thead style="position:sticky;top:0;z-index:1"><tr><th>Función</th>${plans.map((p, i) => `<th style="text-align:center;cursor:pointer;${i === sel ? "color:var(--xp-accent)" : ""}" data-plan="${i}">${p}</th>`).join("")}</tr></thead><tbody>${Object.entries(cats)
            .map(([c, rows]) => `<tr><td colspan="5" style="background:var(--tsl-surface)"><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-cat="${c}"><tsl-icon name="${closed.has(c) ? "chevron-right" : "chevron-down"}" flip-rtl></tsl-icon> ${c}</button></td></tr>${closed.has(c) ? "" : rows.filter((r) => !diff || new Set(r.slice(1)).size > 1).map((r) => `<tr><td>${r[0]}</td>${r.slice(1).map((v, i) => `<td style="text-align:center;${i === sel ? "background:color-mix(in srgb,var(--xp-accent) 9%,transparent)" : ""};color:${v === "—" ? "var(--tsl-fg-subtle)" : v === true ? "var(--tsl-success)" : ""}">${v === true ? '<tsl-icon name="check" label="Incluido"></tsl-icon>' : v === "—" ? '<tsl-icon name="minus" label="No incluido"></tsl-icon>' : v}</td>`).join("")}</tr>`).join("")}`)
            .join("")}</tbody>`;
          ctx.$("[data-sel]").textContent = `Seleccionado: ${plans[sel]}`;
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
        ${head("Pricing · slider-seats.tsx", "Control deslizante de asientos", "Precio escalonado por volumen: cada tramo de asientos tiene su propio precio. El desglose y el ahorro frente al precio de lista se actualizan en vivo.")}
        <div class="xp-panel tsl-stack" style="max-width:640px;width:100%;margin:0 auto">
          <div class="tsl-row"><span class="tsl-label">Asientos</span><strong class="xp-num" style="font-size:28px" data-n>25</strong><span class="tsl-spacer"></span><label class="tsl-choice">Anual (−15%) <input type="checkbox" role="switch" class="tsl-switch" data-annual checked /></label></div>
          <input type="range" class="tsl-range" min="1" max="200" value="25" data-seats aria-label="Asientos" />
          <div class="tsl-table-wrap"><table class="tsl-table tsl-table--compact" data-break></table></div>
          <div class="tsl-row"><span class="tsl-badge tsl-badge--success" data-save></span><span class="tsl-spacer"></span><span class="tsl-muted">Total / mes</span><strong class="xp-num" style="font-size:26px" data-total></strong></div>
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
            return `<tr style="opacity:${q ? 1 : 0.4}"><td>Asientos ${a}–${b}</td><td class="is-num">${q} × $${(p * k).toFixed(2)}</td><td class="is-num">${ctx.fmt.money(q * p * k)}</td></tr>`;
          });
          ctx.$("[data-break]").innerHTML = rows.join("");
          ctx.$("[data-total]").textContent = ctx.fmt.money(total);
          ctx.$("[data-save]").textContent = `Ahorras ${ctx.fmt.money(n * 12 - total)} / mes vs. precio de lista`;
        };
        ctx.on(ctx.$("[data-seats]"), "input", render);
        ctx.on(ctx.$("[data-annual]"), "change", render);
        render();
      }
    },

    "simple-card": {
      html: `
        ${head("Pricing · simple-card.tsx", "Plan único", "Un plan con complementos opcionales; el total se actualiza y el pago abre un diálogo de confirmación.")}
        <div class="xp-center" style="min-height:0"><div class="tsl-card" style="width:min(400px,100%)"><div class="tsl-card__body tsl-stack">
          <span class="tsl-badge tsl-badge--accent tsl-badge--upper" style="align-self:flex-start">Todo en uno</span><div class="xp-num" data-total>$29<span class="tsl-muted" style="font-size:12px">/mes</span></div>
          <ul class="tsl-stack" style="--gap:6px;list-style:none;padding:0;font-size:12px"><li><tsl-icon name=check></tsl-icon> Proyectos ilimitados</li><li><tsl-icon name=check></tsl-icon> Los 43 componentes</li><li><tsl-icon name=check></tsl-icon> Soporte por correo</li></ul>
          <div class="tsl-divider">Complementos</div>
          ${[["Soporte prioritario", 15], ["100 GB extra", 8], ["Marca blanca", 40]].map(([n, p]) => `<label class="tsl-choice" style="justify-content:space-between;width:100%"><span><input type="checkbox" class="tsl-check" data-add="${p}" data-n="${n}" /> ${n}</span><span class="tsl-muted xp-mono">+$${p}</span></label>`).join("")}
          <button type="button" class="tsl-btn tsl-btn--primary tsl-btn--block" data-tsl-open="sc-dlg">Pagar</button><span class="tsl-hint" style="text-align:center">Garantía de devolución de 30 días</span>
        </div></div></div>
        <dialog class="tsl-dialog" id="sc-dlg"><div class="tsl-dialog__header"><h3 class="tsl-dialog__title">Confirmar suscripción</h3></div><div class="tsl-dialog__body"><dl class="xp-kv" data-summary></dl></div><div class="tsl-dialog__footer"><button type="button" class="tsl-btn" data-tsl-close>Atrás</button><button type="button" class="tsl-btn tsl-btn--primary" data-tsl-close="ok">Suscribirme</button></div></dialog>`,
      setup(root, ctx) {
        const total = () => 29 + ctx.$$("[data-add]:checked").reduce((s, c) => s + Number(c.dataset.add), 0);
        const render = () => {
          ctx.$("[data-total]").innerHTML = `$${total()}<span class="tsl-muted" style="font-size:12px">/mes</span>`;
          ctx.$("[data-summary]").innerHTML = `<dt>Plan</dt><dd>Todo en uno · $29</dd>${ctx.$$("[data-add]:checked").map((c) => `<dt>${c.dataset.n}</dt><dd>+$${c.dataset.add}</dd>`).join("")}<dt><strong>Total</strong></dt><dd><strong>$${total()}/mo</strong></dd>`;
        };
        ctx.$$("[data-add]").forEach((c) => ctx.on(c, "change", render));
        ctx.on(ctx.$("#sc-dlg"), "close", (e) => {
          if (e.target.returnValue === "ok") ctx.toast({ title: "Suscripción confirmada", description: `$${total()}/mes` });
          e.target.returnValue = "";
        });
        render();
      }
    },

    "contact-sales": {
      html: () => `
        ${head("Pricing · contact-sales.tsx", "Contactar a ventas", "Solo correos de trabajo (se rechazan los dominios gratuitos); al enviar podrás elegir un horario de llamada.")}
        <div class="tsl-grid" style="--min:300px;align-items:start">
          <form class="xp-panel tsl-stack" data-xp-form data-success="¡Gracias {fullname}! Elige un horario." data-next="[data-slots]" novalidate>
            ${field({ name: "fullname", label: "Nombre completo" })}
            ${field({ name: "email", label: "Correo de trabajo", type: "email", placeholder: "tu@empresa.com" })}
            <label class="tsl-field"><span class="tsl-label">Tamaño de la empresa</span><select class="tsl-select" name="size"><option>1–50</option><option>51–200</option><option>201–1000</option><option>1000+</option></select></label>
            <label class="tsl-field"><span class="tsl-label">¿Qué necesitas?</span><textarea class="tsl-textarea" name="msg" required minlength="10"></textarea></label>
            <button type="submit" class="tsl-btn tsl-btn--primary">Hablar con ventas</button>
          </form>
          <div class="xp-panel tsl-stack" data-slots data-panel hidden><strong>Elige un horario</strong><div class="tsl-grid" style="--min:110px" data-grid></div><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-back><tsl-icon name=arrow-left flip-rtl></tsl-icon> Editar datos</button></div>
          <div class="tsl-stack"><span class="tsl-eyebrow">Por qué los equipos nos eligen</span><ul class="tsl-list"><li><tsl-icon name=lock></tsl-icon> SOC 2 Type II</li><li><tsl-icon name=zap></tsl-icon> SLA de disponibilidad del 99.99%</li><li><tsl-icon name=handshake></tsl-icon> Gerente de éxito dedicado</li></ul></div>
        </div>`,
      setup(root, ctx) {
        TESELA_XP.formSetup(root, ctx);
        const email = ctx.$('[name="email"]');
        const free = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];
        // Se ejecuta antes del validador genérico (fase de captura) para rechazar proveedores de correo gratuitos
        ctx.on(ctx.$("form"), "submit", (e) => {
          const domain = (email.value.split("@")[1] || "").toLowerCase();
          if (!free.includes(domain)) return;
          e.preventDefault();
          e.stopImmediatePropagation();
          email.setAttribute("aria-invalid", "true");
          let err = email.closest(".tsl-field").querySelector(".tsl-error");
          if (!err) {
            err = document.createElement("span");
            err.className = "tsl-error";
            email.closest(".tsl-field").appendChild(err);
          }
          err.textContent = "Usa tu correo de trabajo.";
          email.focus();
        }, true);
        const days = Array.from({ length: 6 }, (_, i) => new Date(Date.now() + (i + 1) * 864e5));
        ctx.$("[data-grid]").innerHTML = days.map((d, i) => `<button type="button" class="tsl-btn tsl-btn--sm" data-slot="${i}">${d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric" })} · ${["10:00", "13:30", "16:00"][i % 3]}</button>`).join("");
        ctx.on(ctx.$("[data-grid]"), "click", (e) => {
          const b = e.target.closest("[data-slot]");
          if (!b) return;
          ctx.$$("[data-slot]").forEach((x) => (x.className = `tsl-btn tsl-btn--sm${x === b ? " tsl-btn--primary" : ""}`));
          ctx.toast({ title: "Llamada agendada", description: b.textContent });
        });
      }
    },

    "monthly-yearly": {
      html: `
        ${head("Pricing · monthly-yearly.tsx", "Selector de facturación", "Un interruptor tipo píldora con control deslizante; los precios suben o bajan hasta sus nuevos valores y aparecen insignias de ahorro.")}
        <div class="xp-center" style="min-height:0"><div class="tsl-stack" style="align-items:center;--gap:24px">
          <button type="button" role="switch" aria-checked="false" data-sw style="position:relative;display:flex;width:240px;padding:4px;border-radius:999px;border:1px solid var(--tsl-border);background:var(--tsl-surface);cursor:pointer;font:inherit;color:inherit"><span data-thumb style="position:absolute;top:4px;left:4px;width:calc(50% - 4px);height:calc(100% - 8px);border-radius:999px;background:var(--tsl-fg);transition:transform .3s var(--tsl-ease)"></span><span data-l1 style="position:relative;flex:1;padding:8px;font-size:12px;color:var(--tsl-bg);transition:color .3s">Mensual</span><span data-l2 style="position:relative;flex:1;padding:8px;font-size:12px;transition:color .3s">Anual</span></button>
          <div class="tsl-grid" style="--min:180px;width:min(640px,100%)" data-cards></div>
        </div></div>`,
      setup(root, ctx) {
        const plans = [["Inicial", 9], ["Pro", 29], ["Team", 79]];
        let yearly = false;
        const shown = plans.map(([, p]) => p);
        ctx.$("[data-cards]").innerHTML = plans.map(([n], i) => `<div class="tsl-stat" style="align-items:center;text-align:center"><span class="tsl-eyebrow">${n}</span><span class="xp-num" data-p="${i}"></span><span class="tsl-badge tsl-badge--success" data-b="${i}" hidden></span></div>`).join("");
        const paint = () => shown.forEach((v, i) => (ctx.$(`[data-p="${i}"]`).innerHTML = `$${v.toFixed(0)}<span class="tsl-muted" style="font-size:12px">/mes</span>`));
        const toggle = () => {
          yearly = !yearly;
          const sw = ctx.$("[data-sw]");
          sw.setAttribute("aria-checked", String(yearly));
          ctx.$("[data-thumb]").style.transform = yearly ? "translateX(100%)" : "";
          ctx.$("[data-l1]").style.color = yearly ? "" : "var(--tsl-bg)";
          ctx.$("[data-l2]").style.color = yearly ? "var(--tsl-bg)" : "";
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
            b.textContent = `Ahorra $${(p * 0.2 * 12).toFixed(0)}/año`;
          });
        };
        ctx.on(ctx.$("[data-sw]"), "click", toggle);
        paint();
      }
    }
  });

  // ==========================================================================
  // TOASTS Y BANNERS
  // ==========================================================================
  // Contenedor de toasts propio del experimento (para toasts personalizados que TeselaUI.toast no puede renderizar)
  X.toastHost = function (ctx) {
    const host = document.createElement("div");
    host.className = "tsl-toast-region";
    host.style.bottom = "auto";
    host.style.top = "80px";
    document.body.appendChild(host);
    ctx.onCleanup(() => host.remove());
    return host;
  };

  X.addMany("toasts", {
    success: {
      html: `
        ${head("Toasts · success.tsx", "Toast de éxito", "Lanza toasts de éxito apilados; ajusta la duración (0 = fijo) y mira cómo se pausan al pasar el cursor.")}
        <div class="xp-panel tsl-stack" style="max-width:520px">
          <label class="tsl-row"><span class="tsl-label">Duración</span><input type="range" class="tsl-range" min="0" max="8000" step="500" value="3000" data-dur style="flex:1" data-tsl-output="#t-dur" data-tsl-suffix=" ms" aria-label="Duración" /><strong class="xp-mono" id="t-dur">3000 ms</strong></label>
          <div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--primary" data-fire>Guardar cambios</button><button type="button" class="tsl-btn" data-burst>Lanzar 3</button><span class="tsl-muted" data-count>0 lanzados</span></div>
        </div>`,
      setup(root, ctx) {
        let n = 0;
        const msgs = ["Cambios guardados", "Proyecto publicado", "Invitación enviada", "Deploy listo", "Ajustes actualizados"];
        const fire = () => {
          n++;
          ctx.$("[data-count]").textContent = `${n} lanzados`;
          ctx.toast({ title: msgs[n % msgs.length], description: `#${n} · ${new Date().toLocaleTimeString("es-MX")}`, duration: Number(ctx.$("[data-dur]").value) });
        };
        ctx.on(ctx.$("[data-fire]"), "click", fire);
        ctx.on(ctx.$("[data-burst]"), "click", () => [0, 150, 300].forEach((t) => ctx.timeout(t, fire)));
      }
    },

    "error-retry": {
      html: `
        ${head("Toasts · error-retry.tsx", "Error con reintento", "Una solicitud inestable falla y muestra un toast con Reintentar (con backoff exponencial) y un ID de traza copiable. Tiene éxito tras unos intentos.")}
        <div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--primary" data-go>Sincronizar datos</button><span class="tsl-badge" data-state>inactivo</span></div>
        <ol class="tsl-timeline" data-log></ol>`,
      setup(root, ctx) {
        let attempt = 0;
        const log = (t, c) => {
          const li = document.createElement("li");
          li.style.setProperty("--c", c);
          li.innerHTML = `<span></span><div class="tsl-timeline__meta">${new Date().toLocaleTimeString("es-MX")}</div>`;
          li.firstChild.textContent = t;
          ctx.$("[data-log]").prepend(li);
        };
        const run = () => {
          attempt++;
          const state = ctx.$("[data-state]");
          state.className = "tsl-badge tsl-badge--info";
          state.textContent = `intento ${attempt}…`;
          ctx.timeout(700, () => {
            if (attempt < 3) {
              const trace = `trc_${Math.random().toString(16).slice(2, 10)}`;
              const wait = 2 ** attempt;
              state.className = "tsl-badge tsl-badge--danger";
              state.textContent = "falló";
              log(`El intento ${attempt} falló: 503 upstream (${trace})`, "var(--tsl-danger)");
              ctx.toast({ title: "Falló la sincronización", description: `503 · ${trace} · reintento en ${wait}s`, variant: "danger", duration: 0, action: { label: "Reintentar", onClick: () => ctx.timeout(wait * 1000, run) } });
              TeselaUI.copy(trace);
            } else {
              state.className = "tsl-badge tsl-badge--success";
              state.textContent = "sincronizado";
              log(`El intento ${attempt} tuvo éxito`, "var(--tsl-success)");
              ctx.toast({ title: "Datos sincronizados", description: `tras ${attempt} intentos` });
              attempt = 0;
            }
          });
        };
        ctx.on(ctx.$("[data-go]"), "click", run);
      }
    },

    "info-banner": {
      html: `
        ${head("Toasts · info-banner.tsx", "Banner del sistema", "Banners en la parte superior para información, avisos y promociones con cuenta regresiva en vivo. Al cerrarlos se ocultan durante esta sesión; restablece para recuperarlos.")}
        <div class="tsl-stack" data-banners></div>
        <div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--sm" data-reset>Mostrar todos los banners de nuevo</button></div>`,
      setup(root, ctx) {
        const banners = [["promo", "<tsl-icon name=sparkles></tsl-icon> Semana de lanzamiento: 30% de descuento en Pro — termina en <strong data-cd></strong>", "Aprovechar oferta"], ["info", "Novedad: la galería es totalmente funcional. Presiona C para ver el código fuente.", "Más información"], ["warning", "Mantenimiento programado el domingo a las 02:00 UTC.", "Detalles"]];
        const closed = new Set();
        const end = Date.now() + 3 * 3600e3 + 12 * 60e3;
        const render = () => {
          ctx.$("[data-banners]").innerHTML = banners
            .filter(([k]) => !closed.has(k))
            .map(([k, html, cta]) => `<div class="${k === "promo" ? "tsl-banner" : `tsl-alert tsl-alert--${k}`}" style="border-radius:var(--tsl-radius);justify-content:space-between"><span>${html}</span><span class="tsl-row" style="--gap:6px"><button type="button" class="tsl-btn tsl-btn--sm" data-cta="${k}">${cta}</button><button type="button" class="tsl-btn tsl-btn--icon tsl-btn--sm tsl-btn--subtle" data-x="${k}" aria-label="Descartar" style="${k === "promo" ? "color:inherit" : ""}"><tsl-icon name=x></tsl-icon></button></span></div>`)
            .join("") || '<p class="tsl-muted">Todos los banners fueron descartados.</p>';
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
        ${head("Toasts · progress.tsx", "Toast de progreso", "Las cargas largas muestran un toast con barra de progreso en vivo, velocidad, tiempo estimado y un botón para cancelar.")}
        <div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--primary" data-go>Subir 3 archivos</button><button type="button" class="tsl-btn" data-fail>Subir (fallará)</button></div>`,
      setup(root, ctx) {
        const host = TESELA_XP.toastHost(ctx);
        const start = (fail) => {
          const total = 48;
          let done = 0;
          const el = document.createElement("div");
          el.className = "tsl-toast tsl-toast--info";
          el.innerHTML = `<div class="tsl-toast__body"><div class="tsl-toast__title">Subiendo 3 archivos…</div><progress class="tsl-progress" max="${total}" value="0" style="margin:6px 0"></progress><div class="tsl-toast__desc xp-mono" data-meta></div></div><button type="button" class="tsl-btn tsl-btn--sm tsl-toast__action">Cancelar</button>`;
          host.appendChild(el);
          const bar = el.querySelector("progress");
          const id = ctx.every(150, () => {
            done = Math.min(total, done + 0.6 + Math.random() * 1.4);
            bar.value = done;
            el.querySelector("[data-meta]").textContent = `${done.toFixed(1)} / ${total} MB · ${(8 + Math.random() * 4).toFixed(1)} MB/s · ${Math.ceil((total - done) / 10)}s restantes`;
            if (fail && done > total * 0.6) {
              clearInterval(id);
              el.className = "tsl-toast tsl-toast--danger";
              el.querySelector(".tsl-toast__title").textContent = "Falló la subida: se perdió la conexión";
              el.querySelector(".tsl-toast__action").textContent = "Descartar";
            } else if (done >= total) {
              clearInterval(id);
              el.className = "tsl-toast tsl-toast--success";
              el.querySelector(".tsl-toast__title").textContent = "3 archivos subidos";
              el.querySelector(".tsl-toast__action").textContent = "Listo";
              ctx.timeout(2500, () => el.remove());
            }
          });
          el.querySelector(".tsl-toast__action").addEventListener("click", () => {
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
        ${head("Toasts · undo.tsx", "Toast para deshacer", "Elimina cualquier elemento: desaparece de inmediato y un toast cuenta 5 segundos para deshacer (o presiona ⌘/Ctrl+Z).")}
        <ul class="tsl-list" data-list style="max-width:520px;width:100%"></ul>`,
      setup(root, ctx) {
        const host = TESELA_XP.toastHost(ctx);
        let items = ["Hoja de ruta T3.pdf", "Guía de marca", "Flujo de incorporación", "Experimento de precios", "Lista de lanzamiento"];
        const stack = [];
        const render = () => (ctx.$("[data-list]").innerHTML = items.map((t, i) => `<li><span style="flex:1">${esc(t)}</span><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-del="${i}">Eliminar</button></li>`).join("") || '<li class="tsl-muted">No queda nada.</li>');
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
          entry.el.className = "tsl-toast tsl-toast--neutral";
          entry.el.innerHTML = `<div class="tsl-toast__body"><div class="tsl-toast__title"></div><div class="tsl-toast__desc">Eliminado</div></div><button type="button" class="tsl-btn tsl-btn--sm tsl-toast__action">Deshacer (5)</button>`;
          entry.el.querySelector(".tsl-toast__title").textContent = entry.item;
          entry.el.querySelector("button").addEventListener("click", () => undo(entry));
          host.appendChild(entry.el);
          stack.push(entry);
          entry.timer = setInterval(() => {
            entry.left--;
            entry.el.querySelector("button").textContent = `Deshacer (${entry.left})`;
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
        ${head("Toasts · rich.tsx", "Toast enriquecido", "Notificaciones de mensajes con avatar, vista previa y un cuadro de respuesta integrado: responde sin salir de la página.")}
        <div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--primary" data-go>Simular mensaje entrante</button></div>
        <ol class="tsl-timeline" data-sent></ol>`,
      setup(root, ctx) {
        const host = TESELA_XP.toastHost(ctx);
        const msgs = [["Ana López", "¿Puedes revisar el PR de los tokens antes de las 5?"], ["Leo Kim", "El deploy está en verde, ¿lo anuncio?"], ["Sara Ruiz", "La sincronización del roadmap pasó a las 3 pm"]];
        let k = 0;
        ctx.on(ctx.$("[data-go]"), "click", () => {
          const [who, text] = msgs[k++ % msgs.length];
          const el = document.createElement("div");
          el.className = "tsl-toast tsl-toast--neutral";
          el.style.flexWrap = "wrap";
          el.innerHTML = `<span class="tsl-avatar tsl-avatar--sm">${who.split(" ").map((w) => w[0]).join("")}</span><div class="tsl-toast__body"><div class="tsl-toast__title"></div><div class="tsl-toast__desc"></div></div><button type="button" class="tsl-toast__close" aria-label="Descartar"><tsl-icon name=x></tsl-icon></button><form class="tsl-row" style="flex-basis:100%;flex-wrap:nowrap;margin-top:6px"><input class="tsl-input" style="height:28px" placeholder="Responder…" aria-label="Responder" required /><button type="submit" class="tsl-btn tsl-btn--sm tsl-btn--primary">Enviar</button></form>`;
          el.querySelector(".tsl-toast__title").textContent = who;
          el.querySelector(".tsl-toast__desc").textContent = text;
          el.querySelector(".tsl-toast__close").addEventListener("click", () => el.remove());
          el.querySelector("form").addEventListener("submit", (e) => {
            e.preventDefault();
            const reply = e.target.querySelector("input").value;
            const li = document.createElement("li");
            li.style.setProperty("--c", "var(--xp-accent)");
            li.textContent = `Tú → ${who}: ${reply}`;
            ctx.$("[data-sent]").prepend(li);
            el.innerHTML = `<div class="tsl-toast__body"><div class="tsl-toast__title">Respuesta enviada a ${esc(who)}</div></div>`;
            el.className = "tsl-toast tsl-toast--success";
            setTimeout(() => el.remove(), 1500);
          });
          host.appendChild(el);
          el.querySelector("input").focus();
        });
      }
    }
  });

  // ==========================================================================
  // MEDIOS Y HERRAMIENTAS CREATIVAS
  // ==========================================================================
  X.addMany("media-audio", {
    "bezier-easing-editor": {
      html: `
        ${head("Media · bezier-easing-editor.tsx", "Editor de cubic-bezier", "Arrastra los dos controles (y puede sobrepasar el rango para curvas elásticas), elige un preajuste, copia el CSS y previsualízalo en la pelota.")}
        <div class="tsl-grid" style="--min:300px;align-items:start">
          <svg viewBox="-20 -80 340 460" style="max-width:360px;touch-action:none" data-svg></svg>
          <div class="tsl-stack">
            <div class="tsl-row" data-presets>${[["ease", ".25,.1,.25,1"], ["ease-in-out", ".42,0,.58,1"], ["out-expo", ".16,1,.3,1"], ["back-out", ".34,1.56,.64,1"], ["anticipate", ".68,-0.6,.32,1.6"]].map(([n, v]) => `<button type="button" class="tsl-chip" data-v="${v}">${n}</button>`).join("")}</div>
            <div class="tsl-input-group"><input class="tsl-input xp-mono" readonly id="bz-out" data-out aria-label="Easing CSS" /><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" style="margin:3px" data-tsl-copy data-tsl-copy-target="#bz-out">Copiar</button></div>
            <div class="xp-panel" style="position:relative;height:70px"><span data-ball style="position:absolute;left:10px;top:20px;width:30px;height:30px;border-radius:50%;background:var(--xp-accent)"></span></div>
            <div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--primary" data-play><tsl-icon name=play></tsl-icon> Reproducir</button><label class="tsl-choice">Duración <input type="range" class="tsl-range" min="200" max="2000" step="100" value="900" data-dur style="width:140px" aria-label="Duración" /></label></div>
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
          svg.innerHTML = `<rect x="0" y="0" width="${S}" height="${S}" fill="var(--tsl-surface)" stroke="var(--tsl-border)"/>${[0.25, 0.5, 0.75].map((g) => `<line x1="${g * S}" x2="${g * S}" y1="0" y2="${S}" stroke="var(--tsl-border)"/><line y1="${g * S}" y2="${g * S}" x1="0" x2="${S}" stroke="var(--tsl-border)"/>`).join("")}<line x1="${a[0]}" y1="${a[1]}" x2="${c1[0]}" y2="${c1[1]}" stroke="var(--tsl-fg-subtle)"/><line x1="${b[0]}" y1="${b[1]}" x2="${c2[0]}" y2="${c2[1]}" stroke="var(--tsl-fg-subtle)"/><path d="M${a} C${c1} ${c2} ${b}" fill="none" stroke="var(--xp-accent)" stroke-width="3"/><circle data-h="0" cx="${c1[0]}" cy="${c1[1]}" r="9" fill="var(--tsl-bg)" stroke="var(--xp-accent)" stroke-width="3" style="cursor:grab"/><circle data-h="1" cx="${c2[0]}" cy="${c2[1]}" r="9" fill="var(--tsl-bg)" stroke="var(--tsl-warning)" stroke-width="3" style="cursor:grab"/>`;
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
        ${head("Media · synth-step-sequencer.tsx", "Secuenciador de sintetizador de 16 pasos", "Una caja de ritmos real con Web Audio y programación anticipada: bombo, caja, hi-hat y bajo sintetizados con osciladores y ruido.")}
        <div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--primary" data-play><tsl-icon name=play></tsl-icon> Reproducir</button><label class="tsl-choice">BPM <input type="range" class="tsl-range" min="60" max="180" value="112" data-bpm style="width:140px" data-tsl-output="#seq-bpm" aria-label="BPM" /><strong class="xp-mono" id="seq-bpm">112</strong></label><button type="button" class="tsl-btn tsl-btn--sm" data-rand>Aleatorizar</button><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-clear>Borrar</button></div>
        <div class="xp-panel tsl-stack" style="--gap:6px;overflow:auto" data-grid></div>`,
      setup(root, ctx) {
        const rows = ["Bombo", "Caja", "Hi-hat", "Bajo"];
        const pattern = [[0, 4, 8, 12], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14], [0, 3, 7, 10]].map((on) => Array.from({ length: 16 }, (_, i) => on.includes(i)));
        const grid = ctx.$("[data-grid]");
        let current = -1;
        const render = () => {
          grid.innerHTML = rows.map((r, ri) => `<div class="tsl-row" style="flex-wrap:nowrap;--gap:4px"><span style="width:50px;font-size:11px" class="tsl-muted">${r}</span>${pattern[ri].map((on, si) => `<button type="button" data-r="${ri}" data-s="${si}" aria-pressed="${on}" aria-label="${r} paso ${si + 1}" style="flex:0 0 30px;height:30px;border-radius:5px;border:1px solid ${si === current ? "var(--tsl-fg)" : "var(--tsl-border)"};background:${on ? "var(--xp-accent)" : si % 4 === 0 ? "var(--tsl-surface-strong)" : "var(--tsl-surface)"};cursor:pointer"></button>`).join("")}</div>`).join("");
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
          ctx.$("[data-play]").innerHTML = "<tsl-icon name=play></tsl-icon> Reproducir";
          render();
        };
        ctx.on(ctx.$("[data-play]"), "click", () => {
          if (ac) return stop();
          const AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return ctx.toast({ title: "Web Audio no es compatible", variant: "warning" });
          ac = new AC();
          noise = ac.createBuffer(1, ac.sampleRate * 0.3, ac.sampleRate);
          const d = noise.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
          next = ac.currentTime + 0.05;
          step = 0;
          timer = setInterval(schedule, 25);
          ctx.$("[data-play]").innerHTML = "<tsl-icon name=square></tsl-icon> Detener";
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
        ${head("Media · waveform-scrubber.tsx", "Explorador de forma de onda", "Una melodía se sintetiza en un AudioBuffer real y se dibuja como picos. Haz clic o arrastra para buscar, reprodúcela y coloca marcadores en el cabezal.")}
        <div class="xp-panel xp-rel" style="padding:0;overflow:hidden"><canvas class="xp-canvas" data-wave style="height:140px;border:0;cursor:pointer"></canvas></div>
        <div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--primary" data-play><tsl-icon name=play></tsl-icon> Reproducir</button><span class="xp-mono" data-time>0:00.0 / 0:00.0</span><button type="button" class="tsl-btn tsl-btn--sm" data-mark>+ Marcador</button><span class="tsl-spacer"></span><div class="tsl-row" data-markers></div></div>`,
      setup(root, ctx) {
        const cv = ctx.$("[data-wave]");
        const g = cv.getContext("2d");
        const size = TESELA_XP.fitCanvas(ctx, cv);
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
          g.fillStyle = getComputedStyle(root).getPropertyValue("--tsl-fg").trim();
          g.fillRect(px - 1, 0, 2, h);
          ctx.$("[data-time]").textContent = `${fmt(pos)} / ${fmt(DUR)}`;
        });
        const stop = () => {
          playing = false;
          if (src) src.stop();
          src = null;
          ctx.$("[data-play]").innerHTML = "<tsl-icon name=play></tsl-icon> Reproducir";
        };
        const play = () => {
          if (!ac) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return ctx.toast({ title: "Web Audio no es compatible", variant: "warning" });
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
          ctx.$("[data-play]").innerHTML = "<tsl-icon name=pause></tsl-icon> Pausar";
        };
        ctx.on(ctx.$("[data-play]"), "click", () => (playing ? stop() : play()));
        let scrub = false;
        const seek = (e) => {
          const p = TESELA_XP.pointer(cv, e);
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
          ctx.$("[data-markers]").innerHTML = markers.map((m, i) => `<button type="button" class="tsl-chip" data-m="${i}">M${i + 1} · ${fmt(m)}</button>`).join("");
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
        ${head("Media · color-oklch-picker.tsx", "Espacio de color OKLCH", "Luminosidad, croma y matiz perceptuales con conversión real de OKLCH a sRGB, aviso de gamut y una escala generada de tintes y sombras.")}
        <div class="tsl-grid" style="--min:300px;align-items:start">
          <div class="tsl-stack">
            <div data-swatch style="height:160px;border-radius:var(--tsl-radius);border:1px solid var(--tsl-border)"></div>
            ${[["l", "Luminosidad", 0, 1, 0.01, 0.65], ["c", "Croma", 0, 0.37, 0.005, 0.18], ["h", "Matiz", 0, 360, 1, 265]].map(([k, l, a, b, s, v]) => `<label class="tsl-row" style="flex-wrap:nowrap"><span style="width:96px">${l}</span><input type="range" class="tsl-range" min="${a}" max="${b}" step="${s}" value="${v}" data-${k} aria-label="${l}" /><span class="xp-mono" style="width:56px;text-align:right" data-${k}v></span></label>`).join("")}
          </div>
          <div class="tsl-stack">
            <dl class="xp-kv xp-mono" data-out></dl>
            <span class="tsl-badge tsl-badge--warning" data-gamut hidden><tsl-icon name=triangle-alert></tsl-icon> Fuera del gamut sRGB: recortado</span>
            <div class="tsl-row" style="--gap:0;border-radius:var(--tsl-radius);overflow:hidden" data-scale></div>
            <div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--sm" data-copy="oklch">Copiar oklch()</button><button type="button" class="tsl-btn tsl-btn--sm" data-copy="hex">Copiar HEX</button><button type="button" class="tsl-btn tsl-btn--sm" data-apply>Usar como acento</button></div>
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
          ctx.$("[data-out]").innerHTML = `<dt>OKLCH</dt><dd>${cur.oklch}</dd><dt>HEX</dt><dd>${cur.hex}</dd><dt>RGB</dt><dd>rgb(${rgb.join(", ")})</dd><dt>Texto</dt><dd>${L > 0.62 ? "usar texto oscuro" : "usar texto claro"}</dd>`;
          ctx.$("[data-scale]").innerHTML = [0.95, 0.85, 0.75, 0.65, 0.55, 0.45, 0.35, 0.25].map((l) => {
            const hx = hex(toRgb(l, Math.min(C, 0.37 * (1 - Math.abs(l - 0.6))), H).rgb);
            return `<button type="button" data-hx="${hx}" title="${hx}" style="flex:1;height:44px;border:0;background:${hx};cursor:pointer"></button>`;
          }).join("");
        };
        ctx.$$("input").forEach((i) => ctx.on(i, "input", render));
        ctx.on(root, "click", (e) => {
          const c = e.target.closest("[data-copy]");
          const hx = e.target.closest("[data-hx]");
          if (c) TeselaUI.copy(cur[c.dataset.copy]).then(() => ctx.toast({ title: `Copiado ${cur[c.dataset.copy]}` }));
          if (hx) TeselaUI.copy(hx.dataset.hx).then(() => ctx.toast({ title: `Copiado ${hx.dataset.hx}` }));
          if (e.target.closest("[data-apply]")) {
            root.style.setProperty("--xp-accent", cur.hex);
            root.style.setProperty("--tsl-accent", cur.hex);
          }
        });
        render();
      }
    },

    "video-timeline-trimmer": {
      html: `
        ${head("Media · video-timeline-trimmer.tsx", "Recortador de línea de tiempo de video", "Arrastra los controles de entrada y salida para recortar, mueve el cabezal y reproduce la selección en bucle. Los códigos de tiempo tienen precisión de fotograma a 30 fps.")}
        <div data-screen style="height:200px;border-radius:var(--tsl-radius);display:grid;place-items:center;font-size:42px;color:#fff;font-family:var(--tsl-font-mono)"></div>
        <div class="xp-rel" data-track style="height:64px;border-radius:8px;overflow:hidden;background:var(--tsl-surface);touch-action:none;user-select:none">
          <div data-thumbs style="display:flex;height:100%"></div>
          <div data-shade-l style="position:absolute;top:0;bottom:0;left:0;background:rgba(0,0,0,.6)"></div><div data-shade-r style="position:absolute;top:0;bottom:0;right:0;background:rgba(0,0,0,.6)"></div>
          <div data-h="in" style="position:absolute;top:0;bottom:0;width:12px;margin-left:-6px;background:var(--tsl-warning);border-radius:4px;cursor:ew-resize"></div><div data-h="out" style="position:absolute;top:0;bottom:0;width:12px;margin-left:-6px;background:var(--tsl-warning);border-radius:4px;cursor:ew-resize"></div>
          <div data-ph style="position:absolute;top:-4px;bottom:-4px;width:2px;background:#fff;pointer-events:none"></div>
        </div>
        <div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--primary" data-play><tsl-icon name=play></tsl-icon> Reproducir selección</button><span class="xp-mono" data-tc></span><span class="tsl-spacer"></span><span class="tsl-badge" data-dur></span><button type="button" class="tsl-btn tsl-btn--sm" data-export>Exportar clip</button></div>`,
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
          ctx.$("[data-dur]").textContent = `${(b - a).toFixed(2)}s · ${Math.round((b - a) * FPS)} fotogramas`;
          ctx.$("[data-screen]").style.background = `linear-gradient(135deg,hsl(${(t / LEN) * 336} 70% 45%),hsl(${(t / LEN) * 336 + 40} 70% 30%))`;
          ctx.$("[data-screen]").textContent = tc(t);
        };
        let drag = null;
        const at = (e) => Math.max(0, Math.min(LEN, (TESELA_XP.pointer(track, e).x / track.clientWidth) * LEN));
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
          e.target.innerHTML = playing ? "<tsl-icon name=pause></tsl-icon> Pausar" : "<tsl-icon name=play></tsl-icon> Reproducir selección";
        });
        ctx.raf((now, dt) => {
          if (!playing) return;
          t += dt / 1000;
          if (t > b) t = a;
          render();
        });
        ctx.on(ctx.$("[data-export]"), "click", () => ctx.toast({ title: "Clip exportado", description: `${tc(a)} → ${tc(b)} · ${(b - a).toFixed(2)}s` }));
        render();
      }
    },

    "spatial-eq-parametric": {
      html: `
        ${head("Media · spatial-eq-parametric.tsx", "Curva de EQ paramétrico", "Cuatro bandas de pico calculadas con la respuesta de magnitud biquad real. Arrastra los nodos (frecuencia × ganancia), usa la rueda para cambiar Q y escucha con filtros de Web Audio.")}
        <div class="xp-panel"><svg viewBox="0 0 700 260" class="xp-chart" data-eq style="touch-action:none"></svg></div>
        <div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--primary" data-listen><tsl-icon name=play></tsl-icon> Escuchar (ruido rosa)</button><span class="tsl-badge" data-sel>Banda 1</span><label class="tsl-choice">Q <input type="range" class="tsl-range" min="0.3" max="10" step="0.1" value="1" data-q style="width:140px" aria-label="Q" /><span class="xp-mono" data-qv></span></label><button type="button" class="tsl-btn tsl-btn--sm tsl-btn--subtle" data-flat>Aplanar</button></div>`,
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
            `<path d="${TESELA_XP.chart.path(pts)} L${W - 10},${H / 2} L30,${H / 2} Z" fill="var(--xp-accent)" opacity=".15"/><path d="${TESELA_XP.chart.path(pts)}" fill="none" stroke="var(--xp-accent)" stroke-width="2.5"/>` +
            bands.map((b, i) => `<circle data-b="${i}" cx="${fx(b.f)}" cy="${gy(b.g)}" r="${i === sel ? 10 : 8}" fill="${["#6366f1", "#10b981", "#f59e0b", "#ec4899"][i]}" stroke="var(--tsl-bg)" stroke-width="2" style="cursor:grab"/><text x="${fx(b.f)}" y="${gy(b.g) - 14}" text-anchor="middle">${b.f >= 1000 ? `${(b.f / 1000).toFixed(1)}k` : Math.round(b.f)} · ${b.g > 0 ? "+" : ""}${b.g.toFixed(1)}dB</text>`).join("");
          ctx.$("[data-sel]").textContent = `Banda ${sel + 1}`;
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
            e.target.innerHTML = "<tsl-icon name=play></tsl-icon> Escuchar (ruido rosa)";
            return;
          }
          const AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return ctx.toast({ title: "Web Audio no es compatible", variant: "warning" });
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
          e.target.innerHTML = "<tsl-icon name=square></tsl-icon> Detener";
          render();
        });
        ctx.onCleanup(() => ac && ac.close());
        render();
      }
    },

    "sprite-frame-inspector": {
      html: `
        ${head("Media · sprite-frame-inspector.tsx", "Inspector de fotogramas de sprite", "Un ciclo de carrera de 8 fotogramas dibujado de forma procedural. Reprodúcelo a cualquier FPS, avanza fotograma a fotograma, activa el onion skin y las hitboxes, o haz clic en un fotograma de la tira.")}
        <div class="tsl-grid" style="--min:280px;align-items:start">
          <canvas class="xp-canvas" data-stage style="height:260px;image-rendering:pixelated"></canvas>
          <div class="tsl-stack">
            <div class="tsl-row"><button type="button" class="tsl-btn tsl-btn--sm" data-step="-1" aria-label="Fotograma anterior"><tsl-icon name="skip-back"></tsl-icon></button><button type="button" class="tsl-btn tsl-btn--primary tsl-btn--sm" data-play><tsl-icon name=pause></tsl-icon> Pausar</button><button type="button" class="tsl-btn tsl-btn--sm" data-step="1" aria-label="Fotograma siguiente"><tsl-icon name="skip-forward"></tsl-icon></button><span class="xp-mono" data-f></span></div>
            <label class="tsl-choice">FPS <input type="range" class="tsl-range" min="1" max="24" value="10" data-fps style="width:140px" data-tsl-output="#sp-fps" aria-label="FPS" /><strong class="xp-mono" id="sp-fps">10</strong></label>
            <label class="tsl-choice">Piel de cebolla <input type="checkbox" role="switch" class="tsl-switch" data-onion checked /></label>
            <label class="tsl-choice">Hitbox <input type="checkbox" role="switch" class="tsl-switch" data-hit /></label>
          </div>
        </div>
        <div class="tsl-row" style="--gap:4px" data-strip></div>`,
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
        const size = TESELA_XP.fitCanvas(ctx, cv);
        let frame = 0;
        let playing = true;
        let acc = 0;
        ctx.$("[data-strip]").innerHTML = Array.from({ length: N }, (_, i) => `<button type="button" data-i="${i}" aria-label="Fotograma ${i + 1}" style="width:56px;height:56px;border-radius:6px;border:2px solid var(--tsl-border);background:var(--tsl-bg-elevated);padding:0;cursor:pointer"><canvas width="${FW}" height="${FH}" style="width:100%;height:100%;image-rendering:pixelated"></canvas></button>`).join("");
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
          ctx.$("[data-f]").textContent = `fotograma ${frame + 1}/${N}`;
          ctx.$$("[data-strip] button").forEach((b, i) => (b.style.borderColor = i === frame ? "var(--xp-accent)" : "var(--tsl-border)"));
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
          e.target.innerHTML = playing ? "<tsl-icon name=pause></tsl-icon> Pausar" : "<tsl-icon name=play></tsl-icon> Reproducir";
        });
        ctx.$$("[data-step]").forEach((b) => ctx.on(b, "click", () => ((playing = false), (ctx.$("[data-play]").innerHTML = "<tsl-icon name=play></tsl-icon> Reproducir"), (frame = (frame + Number(b.dataset.step) + N) % N))));
        ctx.on(ctx.$("[data-strip]"), "click", (e) => {
          const b = e.target.closest("[data-i]");
          if (!b) return;
          playing = false;
          ctx.$("[data-play]").innerHTML = "<tsl-icon name=play></tsl-icon> Reproducir";
          frame = Number(b.dataset.i);
        });
      }
    },

    "camera-pip-controller": {
      html: `
        ${head("Media · camera-pip-controller.tsx", "HUD de cámara PiP", "Imagen en imagen arrastrable que se ajusta a las esquinas, cámara real opcional, temporizador de grabación con nivel de micrófono y un teleprompter con desplazamiento.")}
        <div class="xp-board" data-stage style="height:420px;background:linear-gradient(160deg,var(--tsl-bg-elevated),var(--tsl-bg))">
          <div data-prompter style="position:absolute;inset:20px 20px 80px;overflow:hidden;font-size:22px;line-height:1.6;text-align:center;color:var(--tsl-fg)"><div data-text style="padding-top:260px">Hola a todos: hoy les presento la nueva galería de tesela-ui. Cada experimento ahora es un componente real y funcional. Pueden abrir el panel de código para copiar el HTML y el JavaScript, cambiar los tokens para rediseñarlo todo e incorporar la biblioteca en cualquier proyecto. Sin dependencias, solo la plataforma.</div></div>
          <div data-pip style="position:absolute;width:200px;height:130px;right:16px;bottom:16px;border-radius:14px;overflow:hidden;box-shadow:var(--tsl-shadow-lg);border:2px solid var(--tsl-border-strong);cursor:grab;touch-action:none;transition:left .25s var(--tsl-ease),top .25s var(--tsl-ease)">
            <video data-video autoplay muted playsinline style="width:100%;height:100%;object-fit:cover;display:none"></video>
            <div data-fallback style="width:100%;height:100%;display:grid;place-items:center;background:radial-gradient(circle at 50% 40%,var(--xp-accent),#111);color:#fff;font-size:30px"><tsl-icon name="user"></tsl-icon></div>
            <span data-rec hidden class="tsl-badge tsl-badge--danger" style="position:absolute;top:6px;left:6px"><span class="tsl-dot tsl-dot--danger tsl-dot--pulse" style="--_c:#fff"></span> <span data-time>00:00</span></span>
          </div>
        </div>
        <div class="tsl-row"><button type="button" class="tsl-btn" data-cam><tsl-icon name=camera></tsl-icon> Usar cámara</button><button type="button" class="tsl-btn tsl-btn--danger" data-record><tsl-icon name=circle-dot></tsl-icon> Grabar</button><label class="tsl-choice">Velocidad del teleprompter <input type="range" class="tsl-range" min="0" max="60" value="20" data-speed style="width:120px" aria-label="Velocidad del teleprompter" /></label><label class="tsl-choice">Micrófono <div class="tsl-meter" style="width:100px;height:8px"><span data-level style="--w:0%;--c:var(--tsl-success)"></span></div></label></div>`,
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
            ctx.toast({ title: "Cámara no disponible", description: "Permiso denegado o sin dispositivo; se usa el marcador de posición.", variant: "warning" });
          }
        });
        let rec = false;
        let secs = 0;
        ctx.on(ctx.$("[data-record]"), "click", (e) => {
          rec = !rec;
          if (rec) secs = 0;
          ctx.$("[data-rec]").hidden = !rec;
          e.target.innerHTML = rec ? "<tsl-icon name=square></tsl-icon> Detener" : "<tsl-icon name=circle-dot></tsl-icon> Grabar";
          if (!rec) ctx.toast({ title: "Grabación guardada", description: `${secs}s · toma-${Date.now().toString(36)}.webm` });
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
          lv.style.setProperty("--c", level > 0.8 ? "var(--tsl-danger)" : "var(--tsl-success)");
        });
      }
    }
  });
})();
