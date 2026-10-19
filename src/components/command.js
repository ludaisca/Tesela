import { TslElement, define, emit, nextId } from "../core/base.js";

// Substring matches win; otherwise a compact in-order subsequence (e.g. "cmdp" → "command palette")
function fuzzyScore(text, query) {
  if (!query) return 1;
  const t = text.toLowerCase();
  const q = query.toLowerCase().trim();
  const at = t.indexOf(q);
  if (at !== -1) return 1000 - at;
  let qi = 0;
  let first = -1;
  let lastHit = -1;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      if (first === -1) first = ti;
      lastHit = ti;
      qi++;
    }
  }
  if (qi < q.length) return 0;
  const span = lastHit - first + 1;
  return span <= q.length * 3 ? 100 - span : 0;
}

export class TslCommand extends TslElement {
  static get observedAttributes() {
    return [...super.observedAttributes, "label", "placeholder", "empty"];
  }

  setup() {
    const items = Array.from(this.querySelectorAll(":scope > .tsl-command__item"));

    this.dialog = document.createElement("dialog");
    this.dialog.className = "tsl-dialog tsl-command";
    this.dialog.innerHTML = `
      <div class="tsl-command__search">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input class="tsl-command__input" type="text" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" />
        <kbd class="tsl-kbd">ESC</kbd>
      </div>
      <div class="tsl-command__list" role="listbox"></div>
      <div class="tsl-command__empty" hidden></div>
      <div class="tsl-command__footer"><span><kbd class="tsl-kbd">↑</kbd> <kbd class="tsl-kbd">↓</kbd> navegar · <kbd class="tsl-kbd">↵</kbd> elegir</span><span></span></div>`;

    this.input = this.dialog.querySelector(".tsl-command__input");
    this.listEl = this.dialog.querySelector(".tsl-command__list");
    this.emptyEl = this.dialog.querySelector(".tsl-command__empty");
    this.paintLabels();
    this.listEl.id = nextId("tsl-cmdlist");
    this.input.setAttribute("aria-controls", this.listEl.id);

    // Move declared items into the dialog, grouped by data-group (in order of appearance)
    this.groups = [];
    items.forEach((item) => {
      item.type = "button";
      item.id = item.id || nextId("tsl-cmd");
      item.setAttribute("role", "option");
      item.tabIndex = -1;
      const groupName = item.dataset.group || "";
      let group = this.groups.find((g) => g.name === groupName);
      if (!group) {
        const header = document.createElement("div");
        header.className = "tsl-command__group";
        header.textContent = groupName;
        header.hidden = !groupName;
        group = { name: groupName, header, items: [] };
        this.groups.push(group);
      }
      group.items.push(item);
    });
    this.groups.forEach((g) => {
      this.listEl.appendChild(g.header);
      g.items.forEach((i) => this.listEl.appendChild(i));
    });
    this.appendChild(this.dialog);

    this.input.addEventListener("input", () => this.filter());
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        this.moveActive(e.key === "ArrowDown" ? 1 : -1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (this.active) this.choose(this.active);
      }
    });
    this.listEl.addEventListener("click", (e) => {
      const item = e.target.closest(".tsl-command__item");
      if (item) this.choose(item);
    });
    this.listEl.addEventListener("pointermove", (e) => {
      const item = e.target.closest(".tsl-command__item");
      if (item && item !== this.active) this.setActive(item);
    });
    this.dialog.addEventListener("click", (e) => {
      if (e.target === this.dialog) this.close();
    });

    // El atajo se lee en cada pulsación: cambiar `hotkey` después del montaje también vale
    this.listen(document, "keydown", (e) => {
      const hotkey = this.getAttribute("hotkey");
      // Si otro componente ya usó la combinación (p. ej. Ctrl+K para enlazar en <tsl-editor>), se respeta
      if (!hotkey || e.defaultPrevented) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === hotkey.toLowerCase()) {
        e.preventDefault();
        this.dialog.open ? this.close() : this.open();
      }
    });
  }

  attributeChanged() {
    this.paintLabels();
  }

  paintLabels() {
    this.dialog.setAttribute("aria-label", this.getAttribute("label") || "Paleta de comandos");
    this.input.placeholder = this.getAttribute("placeholder") || "Escribe un comando o busca…";
    this.emptyEl.textContent = this.getAttribute("empty") || "Sin resultados.";
  }

  visibleItems() {
    return Array.from(this.listEl.querySelectorAll(".tsl-command__item:not([hidden])"));
  }

  // Hides non-matches and reorders by relevance (groups by their best item)
  filter() {
    const q = this.input.value.trim();
    const scoreOf = (item, g) =>
      Math.max(
        fuzzyScore(item.textContent, q) * 2,
        fuzzyScore(`${item.dataset.keywords || ""} ${g.name}`, q)
      );
    const ranked = this.groups.map((g, gi) => {
      const items = g.items.map((item, ii) => ({ item, ii, score: q ? scoreOf(item, g) : 1 }));
      items.forEach((x) => (x.item.hidden = x.score === 0));
      if (q) items.sort((a, b) => b.score - a.score || a.ii - b.ii);
      const best = Math.max(0, ...items.map((x) => x.score));
      g.header.hidden = !g.name || best === 0;
      return { g, gi, items, best };
    });
    if (q) ranked.sort((a, b) => b.best - a.best || a.gi - b.gi);
    ranked.forEach(({ g, items }) => {
      this.listEl.appendChild(g.header);
      items.forEach((x) => this.listEl.appendChild(x.item));
    });
    const first = ranked.flatMap((r) => r.items).find((x) => !x.item.hidden);
    this.emptyEl.hidden = Boolean(first);
    this.setActive(first ? first.item : null);
    this.listEl.scrollTop = 0;
  }

  setActive(item) {
    if (this.active) this.active.setAttribute("aria-selected", "false");
    this.active = item;
    if (item) {
      item.setAttribute("aria-selected", "true");
      item.scrollIntoView({ block: "nearest" });
      this.input.setAttribute("aria-activedescendant", item.id);
    } else {
      this.input.removeAttribute("aria-activedescendant");
    }
  }

  moveActive(delta) {
    const visible = this.visibleItems();
    if (!visible.length) return;
    const idx = visible.indexOf(this.active);
    this.setActive(visible[(idx + delta + visible.length) % visible.length]);
  }

  choose(item) {
    emit(this, "tsl-select", { value: item.dataset.value || item.textContent.trim(), item });
    this.close();
  }

  open() {
    if (!this.dialog || this.dialog.open) return;
    this.input.value = "";
    this.filter();
    this.dialog.showModal();
    this.input.focus();
  }

  close() {
    if (this.dialog && this.dialog.open) this.dialog.close();
  }
}

define("tsl-command", TslCommand);
