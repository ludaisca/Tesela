// Ciclo de vida: los componentes no dejan escuchas en document/window al salir del documento y
// vuelven a funcionar si se montan de nuevo (SPA que desmonta y remonta la misma vista).
const { chromium } = require('playwright');
const base = process.env.BASE_URL || 'http://localhost:24100';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto(`${base}/tests/fixtures/blank.html`);
  await p.waitForFunction(() => window.TeselaUI);

  // Registro de escuchas en document/window: las que se añaden después de este punto y siguen vivas
  await p.evaluate(() => {
    const log = [];
    window.__listeners = log;
    const add = EventTarget.prototype.addEventListener;
    const remove = EventTarget.prototype.removeEventListener;
    const capt = (o) => (typeof o === 'boolean' ? o : Boolean(o && o.capture));
    EventTarget.prototype.addEventListener = function (type, fn, opts) {
      if (this === document || this === window) log.push({ target: this === document ? 'document' : 'window', type, fn, capture: capt(opts), signal: opts && opts.signal, once: opts && opts.once, removed: false });
      return add.call(this, type, fn, opts);
    };
    EventTarget.prototype.removeEventListener = function (type, fn, opts) {
      if (this === document || this === window) log.filter((l) => l.type === type && l.fn === fn && l.capture === capt(opts)).forEach((l) => (l.removed = true));
      return remove.call(this, type, fn, opts);
    };
    window.__alive = () => log.filter((l) => !l.removed && !(l.signal && l.signal.aborted) && !l.once).map((l) => `${l.target}:${l.type}`);
    window.__resetListeners = () => (log.length = 0);
  });

  const mount = (html) => p.evaluate((h) => {
    window.__resetListeners();
    const box = document.createElement('div');
    box.id = 'zona';
    box.innerHTML = h;
    document.body.appendChild(box);
    return true;
  }, html);
  const unmount = () => p.evaluate(() => { const z = document.getElementById('zona'); window.__zona = z; z.remove(); return window.__alive(); });
  const remount = () => p.evaluate(() => { document.body.appendChild(window.__zona); return true; });

  const casos = [
    {
      name: '<tsl-command hotkey>',
      html: '<tsl-command hotkey="j" label="Paleta"><button class="tsl-command__item">Uno</button><button class="tsl-command__item">Dos</button></tsl-command>',
      act: async () => {}
    },
    {
      name: '<tsl-editor>',
      html: '<tsl-editor label="Notas"><p>Hola</p></tsl-editor>',
      act: async () => { await p.click('#zona .tsl-editor__content'); await p.keyboard.type('x'); }
    },
    {
      name: '<tsl-sidebar shortcut>',
      html: '<div class="tsl-sidebar-layout" style="height:200px"><tsl-sidebar shortcut="b" collapsible="icon"><div class="tsl-sidebar__content"><a class="tsl-sidebar__item" href="#a">A</a></div></tsl-sidebar><div class="tsl-sidebar-inset">x</div></div>',
      act: async () => {}
    },
    {
      name: '<tsl-menubar> con un menú abierto',
      html: '<tsl-menubar><div class="tsl-bar__item"><button type="button" data-tsl-trigger>Archivo</button><div class="tsl-menu__list"><button type="button" class="tsl-menu__item">Nuevo</button></div></div></tsl-menubar>',
      act: async () => { await p.click('#zona [data-tsl-trigger]'); }
    },
    {
      name: '<tsl-context-menu> abierto',
      html: '<tsl-context-menu><div class="tsl-context-zone" tabindex="0" style="height:60px">zona</div><div class="tsl-menu__list"><button type="button" class="tsl-menu__item">Copiar</button></div></tsl-context-menu>',
      act: async () => { await p.click('#zona .tsl-context-zone', { button: 'right' }); await p.waitForTimeout(50); }
    },
    {
      name: '<tsl-select> abierto',
      html: '<tsl-select label="Rol"><option value="a">A</option><option value="b">B</option></tsl-select>',
      act: async () => { await p.click('#zona .tsl-trigger'); }
    },
    {
      name: '<tsl-date-picker> abierto',
      html: '<tsl-date-picker label="Fecha"></tsl-date-picker>',
      act: async () => { await p.click('#zona .tsl-trigger'); }
    },
    {
      name: '<tsl-popover> abierto',
      html: '<tsl-popover><button data-tsl-trigger>Abrir</button><div class="tsl-popover__panel"><button>Dentro</button></div></tsl-popover>',
      act: async () => { await p.click('#zona [data-tsl-trigger]'); }
    }
  ];

  for (const c of casos) {
    await mount(c.html);
    await c.act();
    const alive = await unmount();
    ok(alive.length === 0, `${c.name}: al salir del documento no deja escuchas globales${alive.length ? ` (quedan ${alive.join(', ')})` : ''}`);
    await remount();
    await p.evaluate(() => { const z = document.getElementById('zona'); z.remove(); });
  }

  // ⌘K de un elemento desmontado no debe intentar abrir un <dialog> que ya no está en el documento
  await mount('<tsl-command hotkey="j"><button class="tsl-command__item">Uno</button></tsl-command>');
  await unmount();
  const before = errs.length;
  await p.keyboard.press('Control+j');
  ok(errs.length === before && !(await p.evaluate(() => window.__zona.querySelector('dialog').open)), 'el atajo de un <tsl-command> desmontado no hace nada ni lanza errores');
  await remount();
  await p.keyboard.press('Control+j');
  ok(await p.evaluate(() => document.querySelector('#zona dialog').open), 'al volver a montarlo, el atajo funciona otra vez');
  await p.keyboard.press('Escape');
  await p.evaluate(() => document.getElementById('zona').remove());

  // Remontar no repite el setup: un solo juego de controles y escuchas
  await mount('<tsl-carousel label="Fotos" dots><div class="tsl-carousel__track"><div class="tsl-carousel__slide">1</div><div class="tsl-carousel__slide">2</div><div class="tsl-carousel__slide">3</div></div></tsl-carousel>');
  await unmount();
  await remount();
  await p.waitForTimeout(50);
  ok(await p.evaluate(() => document.querySelectorAll('#zona .tsl-carousel__bar').length) === 1, '<tsl-carousel> remontado no duplica su barra de controles');
  await p.click('#zona .tsl-carousel__next');
  await p.waitForTimeout(600);
  ok(await p.evaluate(() => document.querySelector('#zona tsl-carousel').index) === 1, 'y «Siguiente» avanza una sola diapositiva');
  await p.evaluate(() => document.getElementById('zona').remove());

  // Avance automático: sigue al remontar si estaba en marcha y se respeta si la persona lo pausó
  await mount('<tsl-carousel label="Auto" autoplay="2000"><div class="tsl-carousel__track"><div class="tsl-carousel__slide">1</div><div class="tsl-carousel__slide">2</div></div></tsl-carousel>');
  const playing = () => p.evaluate(() => document.querySelector('#zona tsl-carousel').playing);
  await unmount();
  await remount();
  const resumed = await playing();
  await p.click('#zona .tsl-carousel__play');
  await unmount();
  await remount();
  ok(resumed === true && (await playing()) === false, '<tsl-carousel autoplay> remontado sigue avanzando, pero si se pausó sigue en pausa');
  await p.evaluate(() => document.getElementById('zona').remove());

  await mount('<div class="tsl-sidebar-layout" style="height:200px"><tsl-sidebar shortcut="b" collapsible="icon"><div class="tsl-sidebar__content"><a class="tsl-sidebar__item" href="#a">A</a></div></tsl-sidebar><div class="tsl-sidebar-inset">x</div></div>');
  await unmount();
  await remount();
  ok(await p.evaluate(() => document.querySelectorAll('#zona .tsl-sidebar__backdrop').length) === 1, '<tsl-sidebar> remontada recupera su fondo, sin duplicarlo');
  await p.keyboard.press('Control+b');
  ok(await p.evaluate(() => document.querySelector('#zona tsl-sidebar').hasAttribute('collapsed')), 'y su atajo Ctrl+B la contrae (una sola vez)');
  await p.evaluate(() => document.getElementById('zona').remove());

  await mount('<tsl-branch><div class="tsl-branch__item">A</div><div class="tsl-branch__item">B</div></tsl-branch>');
  await unmount();
  await remount();
  ok(await p.evaluate(() => document.querySelectorAll('#zona .tsl-branch__prev').length) === 1, '<tsl-branch> remontado no duplica sus flechas');
  await p.evaluate(() => { const br = document.querySelector('#zona tsl-branch'); const d = document.createElement('div'); d.className = 'tsl-branch__item'; d.textContent = 'C'; br.prepend(d); });
  await p.waitForTimeout(50);
  ok(await p.evaluate(() => document.querySelector('#zona tsl-branch').index) === 2, 'y sigue saltando a la versión nueva que llega');
  await p.evaluate(() => document.getElementById('zona').remove());

  ok(errs.length === 0, 'sin errores de página' + (errs.length ? `: ${errs.slice(0, 3).join(' | ')}` : ''));
  await b.close();
  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
