// Uso de los tipos generados. Se compila con `strict`; las líneas `@ts-expect-error` deben fallar
// (si dejaran de fallar, tsc lo reportaría), así que también se comprueba que los tipos rechazan usos erróneos.
import { toast, confirm, copy, position, setTheme, getTheme, init, VERSION, TslSelect } from "../../lib/types/tesela-ui";
import type { TslTabsElement, TslSelectElement, TslDataTableElement, TslSliderElement, TeselaUIGlobal } from "../../lib/types/tesela-ui";

// HTMLElementTagNameMap: los elementos salen tipados sin conversión
const tabs = document.querySelector("tsl-tabs")!;
const tabsTyped: TslTabsElement = tabs;
tabs.select("a", true);
tabs.addEventListener("tsl-change", (e) => {
  const value: string = e.detail.value;
  void value;
});

const select = document.createElement("tsl-select");
select.value = ["a", "b"];
select.disabled = true;
select.setOptions([{ value: "1", label: "Uno", hint: "primero" }]);
select.addEventListener("tsl-change", (e) => {
  const values: string[] = e.detail.values;
  void values;
});
const combo: TslSelectElement = document.createElement("tsl-combobox"); // el combobox es un select
void combo;
const ctor: typeof TslSelect = TslSelect;
void ctor;

const table = document.createElement("tsl-data-table");
table.columns = [{ key: "id", label: "ID", sort: "number", align: "end", format: (v) => String(v) }];
table.rows = [{ id: 1, nombre: "Ana" }];
table.addEventListener("tsl-selection", (e) => {
  const ids: string[] = e.detail.ids;
  void ids;
});
table.addEventListener("click", (e: MouseEvent) => void e); // los eventos nativos siguen tipados
const dt: TslDataTableElement = table;
void dt;

const slider: TslSliderElement = document.createElement("tsl-slider");
slider.addEventListener("tsl-input", (e) => {
  const first: number = e.detail.values[0];
  void first;
});

const chart = document.createElement("tsl-chart");
chart.data = { labels: ["A"], series: [{ name: "S", values: [1] }] };
chart.render();

const tree = document.createElement("tsl-tree");
tree.addEventListener("tsl-toggle", (e) => {
  const expanded: boolean = e.detail.expanded;
  void expanded;
});

const sortable = document.createElement("tsl-sortable");
sortable.addEventListener("tsl-sort", (e) => {
  const index: number = e.detail.to.index;
  void index;
});

const list = document.createElement("tsl-virtual-list");
list.items = [1, 2, 3];
list.renderItem = (item, i) => `${item}-${i}`;

const closer: () => void = toast({ title: "Hola", variant: "info", duration: 2000, action: { label: "Deshacer", onClick: () => {} } });
closer();
toast("texto simple");
const accepted: Promise<boolean> = confirm({ title: "¿Seguro?", variant: "danger", cancelLabel: null });
void accepted;
const side: "top" | "bottom" | "left" | "right" = position(null, document.body, { point: { x: 1, y: 2 } });
void side;
const copied: Promise<boolean> = copy("x");
void copied;
setTheme("light");
const theme: "dark" | "light" = getTheme();
void theme;
init();
const version: string = VERSION;
void version;
const global: TeselaUIGlobal = window.TeselaUI;
global.toast("desde el global");
void tabsTyped;

// --- Usos que los tipos deben rechazar ---
// @ts-expect-error propiedad que no existe
tabs.noExiste;
// @ts-expect-error variante de toast no admitida
toast({ variant: "rojo" });
tabs.addEventListener("tsl-change", (e) => {
  // @ts-expect-error el detalle de las pestañas es string, no number
  const n: number = e.detail.value;
  void n;
});
// @ts-expect-error `values` del slider es de solo lectura
slider.values = [1, 2];
// @ts-expect-error `disabled` es booleano
select.disabled = "sí";
// @ts-expect-error evento que el elemento no emite (usa el listener genérico de string, pero sin detalle tipado)
select.addEventListener("tsl-change", (e) => e.detail.nope);
// @ts-expect-error la densidad de la tabla no admite este valor
table.density = "enorme";
