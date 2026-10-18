// ============================================================================
// Tesela — Catálogo de 24 carpetas y 212 experimentos
// 18 carpetas originales (158 archivos) + 6 carpetas nuevas (54 archivos)
// Implementación propia, 100% sin dependencias
// ============================================================================

window.TESELA_DATA = {
  meta: {
    title: "TESELA",
    totalFiles: 212,
    totalFolders: 24,
    description:
      "212 experimentos de diseño en 24 carpetas. Construidos desde cero con tokens CSS, shaders WebGL, SVG procedurales, síntesis de audio en vivo y canvas interactivos. Cero librerías externas."
  },

  categories: [
    {
      id: "layouts",
      title: "Layouts",
      description: "Estructuras de app, barras laterales, paneles divididos, modo foco y lienzos.",
      accent: "#6366f1",
      isNew: false,
      items: [
        { slug: "workspace-rail", title: "Barra de espacio de trabajo", file: "workspace-rail.tsx", wip: false, tags: ["barra-lateral", "navegación", "estructura", "equipos"] },
        { slug: "mini-rail", title: "Mini barra de íconos", file: "mini-rail.tsx", wip: false, tags: ["compacto", "íconos", "barra", "tooltips"] },
        { slug: "docs-tree", title: "Árbol de documentos", file: "docs-tree.tsx", wip: false, tags: ["jerarquía", "documentación", "plegable", "índice"] },
        { slug: "inbox-rail", title: "Barra de bandeja", file: "inbox-rail.tsx", wip: false, tags: ["correo", "división", "no-leídos", "lista"] },
        { slug: "app-shell", title: "Estructura de la app", file: "app-shell.tsx", wip: false, tags: ["encabezado", "migas-de-pan", "espacio-de-trabajo", "cuadrícula"] },
        { slug: "two-pane", title: "Dos paneles", file: "two-pane.tsx", wip: false, tags: ["maestro-detalle", "división", "inspector"] },
        { slug: "three-pane", title: "Tres paneles", file: "three-pane.tsx", wip: false, tags: ["columnas", "triaje", "inspector", "ide"] },
        { slug: "split-resizable", title: "División redimensionable", file: "split-resizable.tsx", wip: false, tags: ["arrastrar", "alias", "paneles", "redimensionable"] },
        { slug: "focus-mode", title: "Modo de enfoque", file: "focus-mode.tsx", wip: false, tags: ["zen", "escritura", "minimalista", "sin-distracciones"] },
        { slug: "floating-toolbar", title: "Barra de herramientas flotante", file: "floating-toolbar.tsx", wip: false, tags: ["hud", "dock", "vidrio", "acciones"] },
        { slug: "canvas-tools", title: "Herramientas de lienzo", file: "canvas-tools.tsx", wip: false, tags: ["lienzo-infinito", "zoom", "nodos", "capas"] },
        { slug: "bottom-nav", title: "Navegación inferior", file: "bottom-nav.tsx", wip: false, tags: ["móvil", "dock", "pestañas", "adaptable"] }
      ]
    },
    {
      id: "ai-agents",
      title: "IA y agentes",
      description: "Trazas en streaming, inspectores de herramientas, medidores de contexto y grafos multi-agente.",
      accent: "#a855f7",
      isNew: true,
      items: [
        { slug: "prompt-composer", title: "Compositor de prompts", file: "prompt-composer.tsx", wip: false, tags: ["adjuntos", "selector-de-modelo", "comandos-slash", "tokens"] },
        { slug: "streaming-trace", title: "Traza en streaming", file: "streaming-trace.tsx", wip: false, tags: ["cadena-de-pensamiento", "razonamiento", "tokens-por-seg", "plegable"] },
        { slug: "tool-call-inspector", title: "Inspector de llamadas a herramientas", file: "tool-call-inspector.tsx", wip: false, tags: ["json-rpc", "argumentos", "stdout", "latencia"] },
        { slug: "model-arena-selector", title: "Selector de arena de modelos", file: "model-arena-selector.tsx", wip: false, tags: ["lado-a-lado", "elo", "latencia", "costo"] },
        { slug: "token-budget-meter", title: "Medidor de presupuesto de tokens", file: "token-budget-meter.tsx", wip: false, tags: ["ventana-de-contexto", "acierto-de-caché", "segmentos", "128k"] },
        { slug: "context-window-stack", title: "Pila de ventana de contexto", file: "context-window-stack.tsx", wip: false, tags: ["archivos", "fragmentos-rag", "fijados", "poda"] },
        { slug: "agent-handoff-graph", title: "Grafo de traspaso entre agentes", file: "agent-handoff-graph.tsx", wip: false, tags: ["orquestador", "subagentes", "dag", "arista-en-vivo"] },
        { slug: "citation-popover", title: "Popover de citas", file: "citation-popover.tsx", wip: false, tags: ["fundamentación", "fuentes", "confianza", "vista-previa"] },
        { slug: "voice-waveform-hud", title: "HUD de forma de onda de voz", file: "voice-waveform-hud.tsx", wip: false, tags: ["vad", "audio-en-tiempo-real", "esfera", "interrupción"] },
        { slug: "diff-apply-review", title: "Revisión y aplicación de diff", file: "diff-apply-review.tsx", wip: false, tags: ["diff-en-línea", "aceptar-rechazar", "fragmentos", "parche"] }
      ]
    },
    {
      id: "shaders-canvas",
      title: "Shaders y canvas",
      description: "Campos procedurales, cuadrículas magnéticas, matrices ASCII y nodos bezier.",
      accent: "#ec4899",
      isNew: true,
      items: [
        { slug: "magnetic-cursor-grid", title: "Cuadrícula de cursor magnético", file: "magnetic-cursor-grid.tsx", wip: false, tags: ["vectores", "dipolo", "interactivo", "canvas2d"] },
        { slug: "ascii-matrix-field", title: "Campo de matriz ASCII", file: "ascii-matrix-field.tsx", wip: false, tags: ["glifos", "luminancia", "procedural", "monoespaciada"] },
        { slug: "simplex-flow-lines", title: "Líneas de flujo simplex", file: "simplex-flow-lines.tsx", wip: false, tags: ["ruido-curl", "líneas-de-corriente", "partículas", "60fps"] },
        { slug: "dither-halftone-shader", title: "Shader de tramado y semitono", file: "dither-halftone-shader.tsx", wip: false, tags: ["matriz-de-bayer", "1-bit", "tramado-ordenado", "webgl"] },
        { slug: "interactive-cloth-mesh", title: "Malla de tela interactiva", file: "interactive-cloth-mesh.tsx", wip: false, tags: ["verlet", "resortes", "restricciones", "rasgable"] },
        { slug: "raymarched-sdf-orb", title: "Esfera SDF con raymarching", file: "raymarched-sdf-orb.tsx", wip: false, tags: ["distancia-con-signo", "mínimo-suave", "especular", "glsl"] },
        { slug: "audio-fft-spectrum", title: "Espectro de audio FFT", file: "audio-fft-spectrum.tsx", wip: false, tags: ["frecuencias", "decibeles", "armónico", "barras"] },
        { slug: "bezier-node-graph", title: "Grafo de nodos bezier", file: "bezier-node-graph.tsx", wip: false, tags: ["cables-de-conexión", "puertos", "arrastrable", "señal"] },
        { slug: "voronoi-cell-reactor", title: "Reactor de celdas Voronoi", file: "voronoi-cell-reactor.tsx", wip: false, tags: ["teselación", "centroides", "relajación", "malla"] },
        { slug: "crt-scanline-terminal", title: "Terminal CRT con líneas de barrido", file: "crt-scanline-terminal.tsx", wip: false, tags: ["fósforo", "aberración", "curvatura", "retro"] }
      ]
    },
    {
      id: "forms",
      title: "Formularios",
      description: "Ajustes, invitaciones, preferencias y claves de API.",
      accent: "#10b981",
      isNew: false,
      items: [
        { slug: "workspace-settings", title: "Ajustes del espacio de trabajo", file: "workspace-settings.tsx", wip: false, tags: ["general", "slug", "avatar", "zona-de-peligro"] },
        { slug: "invite-teammates", title: "Invitar compañeros", file: "invite-teammates.tsx", wip: false, tags: ["correos", "roles", "varias-filas", "asientos"] },
        { slug: "notifications", title: "Preferencias de notificaciones", file: "notifications.tsx", wip: false, tags: ["interruptores", "matriz", "canales", "resumen"] },
        { slug: "api-key", title: "Crear clave de API", file: "api-key.tsx", wip: false, tags: ["alcances", "permisos", "expiración", "secreto"] }
      ]
    },
    {
      id: "auth",
      title: "Acceso e incorporación",
      description: "Inicio de sesión, enlace mágico, OAuth y lista de espera.",
      accent: "#8b5cf6",
      isNew: false,
      items: [
        { slug: "login", title: "Inicio de sesión", file: "login.tsx", wip: false, tags: ["oauth", "contraseña", "sesión"] },
        { slug: "onboarding", title: "Incorporación", file: "onboarding.tsx", wip: false, tags: ["pasos", "asistente", "configuración"] },
        { slug: "waitlist", title: "Página de lista de espera", file: "waitlist.tsx", wip: false, tags: ["acceso-anticipado", "contador", "referidos"] },
        { slug: "check-email", title: "Revisa tu correo", file: "check-email.tsx", wip: false, tags: ["verificación", "bandeja", "reenviar"] },
        { slug: "inset-login", title: "Inicio de sesión enmarcado", file: "inset-login.tsx", wip: false, tags: ["tarjeta", "enmarcado", "testimonio"] },
        { slug: "centered-signin", title: "Inicio de sesión centrado", file: "centered-signin.tsx", wip: false, tags: ["minimalista", "sso", "centrado"] },
        { slug: "centered-signup", title: "Registro centrado", file: "centered-signup.tsx", wip: false, tags: ["registro", "medidor-de-seguridad", "términos"] },
        { slug: "left-signin", title: "Inicio de sesión a la izquierda", file: "left-signin.tsx", wip: false, tags: ["pantalla-dividida", "ilustración", "marca"] },
        { slug: "right-signin", title: "Inicio de sesión a la derecha", file: "right-signin.tsx", wip: false, tags: ["pantalla-dividida", "invertido", "vista-previa"] },
        { slug: "glass-signup", title: "Registro de vidrio", file: "glass-signup.tsx", wip: false, tags: ["esmerilado", "fondo", "shader"] },
        { slug: "otp-verify", title: "Verificación OTP", file: "otp-verify.tsx", wip: false, tags: ["6-dígitos", "pin", "código"] },
        { slug: "reset-password", title: "Restablecer contraseña", file: "reset-password.tsx", wip: false, tags: ["recuperación", "reglas", "validación"] },
        { slug: "two-factor", title: "Doble factor", file: "two-factor.tsx", wip: false, tags: ["totp", "autenticador", "códigos-de-respaldo"] },
        { slug: "magic-link-sent", title: "Enlace mágico enviado", file: "magic-link-sent.tsx", wip: false, tags: ["sin-contraseña", "token", "cuenta-regresiva"] }
      ]
    },
    {
      id: "dashboards",
      title: "Paneles de control",
      description: "Cuadrículas de métricas, sparklines, actividad y uso del plan.",
      accent: "#3b82f6",
      isNew: false,
      items: [
        { slug: "metrics-overview", title: "Resumen de métricas", file: "metrics-overview.tsx", wip: false, tags: ["kpi", "minigráficos", "variaciones", "ejecutivo"] },
        { slug: "usage", title: "Uso del plan", file: "usage.tsx", wip: false, tags: ["cuotas", "medidores", "ancho-de-banda", "cómputo"] },
        { slug: "analytics", title: "Analítica", file: "analytics.tsx", wip: false, tags: ["tráfico", "referidos", "países", "visitantes"] },
        { slug: "home", title: "Inicio personal", file: "home.tsx", wip: false, tags: ["saludo", "recientes", "tareas", "bandeja"] },
        { slug: "revenue", title: "Ingresos", file: "revenue.tsx", wip: false, tags: ["mrr", "arr", "cancelaciones", "retención-neta"] },
        { slug: "services", title: "Estado del servicio", file: "services.tsx", wip: false, tags: ["disponibilidad", "latencia", "clústeres", "incidentes"] },
        { slug: "engineering", title: "Velocidad de ingeniería", file: "engineering.tsx", wip: false, tags: ["tiempo-de-ciclo", "rendimiento", "deploys", "prs"] },
        { slug: "support", title: "Cola de soporte", file: "support.tsx", wip: false, tags: ["sla", "tickets", "csat", "tiempo-de-respuesta"] },
        { slug: "market", title: "Mercados", file: "market.tsx", wip: false, tags: ["cotizaciones", "libro-de-órdenes", "velas", "portafolio"] }
      ]
    },
    {
      id: "devtools",
      title: "DevTools y logs",
      description: "Cascadas de red, flamegraphs, exploradores JSON y consolas SQL.",
      accent: "#06b6d4",
      isNew: true,
      items: [
        { slug: "network-waterfall", title: "Cascada de red", file: "network-waterfall.tsx", wip: false, tags: ["har", "dns-tls-ttfb", "tiempos", "cabeceras"] },
        { slug: "flamegraph-profiler", title: "Perfilador de flamegraph", file: "flamegraph-profiler.tsx", wip: false, tags: ["pila-de-cpu", "tiempo-propio", "rutas-críticas", "zoom"] },
        { slug: "json-tree-explorer", title: "Explorador de árbol JSON", file: "json-tree-explorer.tsx", wip: false, tags: ["plegable", "copiar-ruta", "esquema", "tipos"] },
        { slug: "sql-query-workbench", title: "Banco de consultas SQL", file: "sql-query-workbench.tsx", wip: false, tags: ["explain-analyze", "filas", "explorador-de-esquema", "cte"] },
        { slug: "env-secrets-vault", title: "Bóveda de secretos de entorno", file: "env-secrets-vault.tsx", wip: false, tags: ["cifrado", "entornos", "revelar", "dotenv"] },
        { slug: "webhook-payload-diff", title: "Diff de payload de webhook", file: "webhook-payload-diff.tsx", wip: false, tags: ["hmac", "reenviar", "estado-200", "cabeceras"] },
        { slug: "cron-schedule-visualizer", title: "Visualizador de cron", file: "cron-schedule-visualizer.tsx", wip: false, tags: ["crontab", "próximas-ejecuciones", "utc", "sintaxis"] },
        { slug: "memory-heap-map", title: "Mapa del heap de memoria", file: "memory-heap-map.tsx", wip: false, tags: ["retenedores", "asignaciones", "mapa-de-árbol", "gc"] },
        { slug: "regex-ast-tester", title: "Probador de regex con AST", file: "regex-ast-tester.tsx", wip: false, tags: ["grupos-de-captura", "anticipación", "coincidencias", "diagrama-de-sintaxis"] }
      ]
    },
    {
      id: "tables",
      title: "Tablas",
      description: "Filas ordenables, densidad y acciones masivas.",
      accent: "#06b6d4",
      isNew: false,
      items: [
        { slug: "invoices", title: "Facturas", file: "invoices.tsx", wip: false, tags: ["facturación", "estado", "pdf", "ordenable"] },
        { slug: "members", title: "Miembros del equipo", file: "members.tsx", wip: false, tags: ["avatares", "roles", "estado-2fa", "última-conexión"] },
        { slug: "orders", title: "Pedidos", file: "orders.tsx", wip: false, tags: ["comercio-electrónico", "cumplimiento", "cliente", "total"] },
        { slug: "logs", title: "Registros del servidor", file: "logs.tsx", wip: false, tags: ["monoespaciada", "seguimiento", "severidad", "latencia"] },
        { slug: "api-keys", title: "Claves de API", file: "api-keys.tsx", wip: false, tags: ["tokens", "enmascarado", "uso", "revocar"] },
        { slug: "inventory", title: "Inventario", file: "inventory.tsx", wip: false, tags: ["sku", "nivel-de-stock", "almacén", "reabastecer"] },
        { slug: "issues", title: "Seguimiento de incidencias", file: "issues.tsx", wip: false, tags: ["prioridad", "responsable", "etiquetas", "estilo-linear"] },
        { slug: "transactions", title: "Transacciones", file: "transactions.tsx", wip: false, tags: ["libro-mayor", "comercio", "categoría", "monto"] },
        { slug: "audit-log", title: "Registro de auditoría", file: "audit-log.tsx", wip: false, tags: ["seguridad", "actor", "dirección-ip", "diff"] }
      ]
    },
    {
      id: "filters",
      title: "Filtros",
      description: "Barras de herramientas, popovers por facetas, chips y filtros laterales.",
      accent: "#f59e0b",
      isNew: false,
      items: [
        { slug: "toolbar", title: "Barra de filtros", file: "toolbar.tsx", wip: false, tags: ["búsqueda", "ordenar", "agrupar-por", "visualización"] },
        { slug: "faceted", title: "Popover con facetas", file: "faceted.tsx", wip: false, tags: ["selección-múltiple", "conteos", "casillas", "combobox"] },
        { slug: "chips", title: "Chips de filtros activos", file: "chips.tsx", wip: false, tags: ["operadores", "es-cualquiera-de", "removible", "tokens"] },
        { slug: "sidebar", title: "Barra lateral de filtros", file: "sidebar.tsx", wip: false, tags: ["acordeones", "rango-de-precio", "facetas", "atributos"] }
      ]
    },
    {
      id: "command-menus",
      title: "Comandos y menús",
      description: "Menús radiales, barras de acciones, editores con slash y HUD de atajos.",
      accent: "#f97316",
      isNew: true,
      items: [
        { slug: "radial-pie-menu", title: "Menú radial circular", file: "radial-pie-menu.tsx", wip: false, tags: ["gesto", "sectores-polares", "cursor", "svg"] },
        { slug: "raycast-action-bar", title: "Barra de acciones estilo Raycast", file: "raycast-action-bar.tsx", wip: false, tags: ["lanzador", "subacciones", "difusa", "atajos"] },
        { slug: "breadcrumb-dropdown-tree", title: "Menú de árbol de migas de pan", file: "breadcrumb-dropdown-tree.tsx", wip: false, tags: ["jerarquía", "hermanos", "selector-de-ruta"] },
        { slug: "context-menu-nested", title: "Menú contextual anidado", file: "context-menu-nested.tsx", wip: false, tags: ["clic-derecho", "submenús", "elementos-marcables", "teclas"] },
        { slug: "floating-slash-menu", title: "Menú flotante de barra diagonal", file: "floating-slash-menu.tsx", wip: false, tags: ["editor", "bloques", "autocompletado", "estilo-notion"] },
        { slug: "multi-step-omni-search", title: "Búsqueda omni de varios pasos", file: "multi-step-omni-search.tsx", wip: false, tags: ["parametrizada", "tokens", "alcances", "vista-previa"] },
        { slug: "keyboard-chord-hud", title: "HUD de combinaciones de teclado", file: "keyboard-chord-hud.tsx", wip: false, tags: ["tecla-líder", "combinaciones-vim", "hoja-de-referencia", "superposición"] },
        { slug: "dock-magnifier-bar", title: "Barra dock con lupa", file: "dock-magnifier-bar.tsx", wip: false, tags: ["escala-gaussiana", "resorte", "indicadores-de-apertura"] },
        { slug: "tab-switcher-expose", title: "Selector de pestañas estilo exposé", file: "tab-switcher-expose.tsx", wip: false, tags: ["miniaturas", "orden-mru", "alt-tab", "cuadrícula"] }
      ]
    },
    {
      id: "empty-states",
      title: "Estados vacíos",
      description: "Primer uso, sin datos y fin de lista.",
      accent: "#a855f7",
      isNew: false,
      items: [
        { slug: "inbox-zero", title: "Bandeja vacía", file: "inbox-zero.tsx", wip: false, tags: ["zen", "al-día", "atajo"] },
        { slug: "no-results", title: "Sin resultados", file: "no-results.tsx", wip: false, tags: ["búsqueda", "borrar-filtros", "sugerencias"] },
        { slug: "first-project", title: "Primer proyecto", file: "first-project.tsx", wip: false, tags: ["incorporación", "plantillas", "cta"] },
        { slug: "end-of-feed", title: "Fin del feed", file: "end-of-feed.tsx", wip: false, tags: ["paginación", "archivo", "hito"] },
        { slug: "no-team", title: "Sin compañeros", file: "no-team.tsx", wip: false, tags: ["colaboración", "invitar", "avatares"] },
        { slug: "trash", title: "Papelera vacía", file: "trash.tsx", wip: false, tags: ["eliminados", "retención", "limpiar"] },
        { slug: "404", title: "404", file: "404.tsx", wip: false, tags: ["no-encontrado", "enlace-roto", "brújula"] },
        { slug: "maintenance", title: "Mantenimiento", file: "maintenance.tsx", wip: false, tags: ["programado", "estado", "tiempo-estimado"] },
        { slug: "no-files", title: "Sin archivos", file: "no-files.tsx", wip: false, tags: ["zona-de-carga", "subir", "carpeta"] },
        { slug: "offline", title: "Sin conexión", file: "offline.tsx", wip: false, tags: ["red", "reconectar", "en-caché"] }
      ]
    },
    {
      id: "settings",
      title: "Ajustes",
      description: "Perfil, apariencia, facturación e integraciones.",
      accent: "#ec4899",
      isNew: false,
      items: [
        { slug: "profile", title: "Perfil", file: "profile.tsx", wip: false, tags: ["avatar", "biografía", "alias", "zona-horaria"] },
        { slug: "appearance", title: "Apariencia", file: "appearance.tsx", wip: false, tags: ["tema", "densidad", "color-de-acento", "tipografía"] },
        { slug: "billing", title: "Facturación", file: "billing.tsx", wip: false, tags: ["plan", "método-de-pago", "facturas", "asientos"] },
        { slug: "integrations", title: "Integraciones", file: "integrations.tsx", wip: false, tags: ["github", "slack", "linear", "oauth"] },
        { slug: "security", title: "Seguridad", file: "security.tsx", wip: false, tags: ["sesiones", "dispositivos", "passkeys", "2fa"] },
        { slug: "permissions", title: "Roles y permisos", file: "permissions.tsx", wip: false, tags: ["rbac", "matriz", "administrador", "alcances"] },
        { slug: "branding", title: "Marca del espacio de trabajo", file: "branding.tsx", wip: false, tags: ["logotipo", "dominio-personalizado", "colores", "marca-blanca"] },
        { slug: "localization", title: "Localización", file: "localization.tsx", wip: false, tags: ["idioma", "formato-de-fecha", "divisa", "región"] },
        { slug: "webhooks", title: "Webhooks", file: "webhooks.tsx", wip: false, tags: ["endpoints", "eventos", "secreto-de-firma", "entregas"] },
        { slug: "privacy", title: "Privacidad y datos", file: "privacy.tsx", wip: false, tags: ["rgpd", "exportar", "retención", "telemetría"] },
        { slug: "developer", title: "Desarrollador", file: "developer.tsx", wip: false, tags: ["sdk", "modo-sandbox", "límites-de-tasa", "registros"] },
        { slug: "sso", title: "Inicio de sesión único", file: "sso.tsx", wip: false, tags: ["saml", "oidc", "scim", "verificación-de-dominio"] }
      ]
    },
    {
      id: "cards",
      title: "Tarjetas",
      description: "Tarjetas de métricas, elementos de lista y contenedores.",
      accent: "#14b8a6",
      isNew: false,
      items: [
        { slug: "stat-tile", title: "Tarjeta de métrica", file: "stat-tile.tsx", wip: false, tags: ["métrica", "variación", "minigráfico"] },
        { slug: "profile", title: "Tarjeta de perfil", file: "profile.tsx", wip: false, tags: ["usuario", "insignias", "seguir", "estadísticas"] },
        { slug: "pricing", title: "Niveles de precios", file: "pricing.tsx", wip: false, tags: ["pro", "funciones", "cta"] },
        { slug: "product", title: "Tarjeta de producto", file: "product.tsx", wip: false, tags: ["comercio", "variantes", "precio"] },
        { slug: "invoice", title: "Línea de factura", file: "invoice.tsx", wip: false, tags: ["recibo", "desglose", "pagado"] },
        { slug: "task", title: "Tarea kanban", file: "task.tsx", wip: false, tags: ["subtareas", "prioridad", "fecha-límite"] },
        { slug: "event", title: "Evento de calendario", file: "event.tsx", wip: false, tags: ["reunión", "asistentes", "unirse-a-llamada"] },
        { slug: "integration", title: "Integración", file: "integration.tsx", wip: false, tags: ["conectado", "sincronización", "webhook"] },
        { slug: "media", title: "Vista previa de artículo", file: "media.tsx", wip: false, tags: ["editorial", "tiempo-de-lectura", "autor"] },
        { slug: "payment-method", title: "Método de pago", file: "payment-method.tsx", wip: false, tags: ["tarjeta-de-crédito", "vencimiento", "predeterminado"] }
      ]
    },
    {
      id: "modals",
      title: "Modales",
      description: "Diálogos, drawers, paletas de comandos y confirmaciones.",
      accent: "#f43f5e",
      isNew: false,
      items: [
        { slug: "confirm-delete", title: "Confirmar eliminación", file: "confirm-delete.tsx", wip: false, tags: ["destructivo", "escribir-para-confirmar", "advertencia"] },
        { slug: "share-link", title: "Compartir enlace", file: "share-link.tsx", wip: false, tags: ["permisos", "copiar-enlace", "invitar"] },
        { slug: "upload-files", title: "Subir archivos", file: "upload-files.tsx", wip: false, tags: ["arrastrar-y-soltar", "progreso", "cola"] },
        { slug: "command-palette", title: "Paleta de comandos", file: "command-palette.tsx", wip: false, tags: ["cmdk", "difusa", "atajos"] },
        { slug: "feedback", title: "Comentarios", file: "feedback.tsx", wip: false, tags: ["sentimiento", "captura-de-pantalla", "reporte-de-error"] },
        { slug: "shortcuts", title: "Atajos de teclado", file: "shortcuts.tsx", wip: false, tags: ["atajos", "hoja-de-referencia", "teclas"] },
        { slug: "upgrade", title: "Mejorar plan", file: "upgrade.tsx", wip: false, tags: ["venta-adicional", "desbloquear", "comparación"] },
        { slug: "export", title: "Exportar datos", file: "export.tsx", wip: false, tags: ["csv", "json", "rango-de-fechas", "columnas"] },
        { slug: "create-workspace", title: "Crear espacio de trabajo", file: "create-workspace.tsx", wip: false, tags: ["región", "slug", "ícono"] },
        { slug: "two-factor", title: "Configuración de doble factor", file: "two-factor.tsx", wip: false, tags: ["código-qr", "secreto", "verificar"] }
      ]
    },
    {
      id: "charts",
      title: "Gráficas",
      description: "Área, barras, dona, embudo, mapa de calor y medidor — SVG puro.",
      accent: "#22c55e",
      isNew: false,
      items: [
        { slug: "revenue-area", title: "Área de ingresos", file: "revenue-area.tsx", wip: false, tags: ["degradado", "retícula", "mrr", "svg"] },
        { slug: "cohort-heatmap", title: "Mapa de calor de cohortes", file: "cohort-heatmap.tsx", wip: false, tags: ["retención", "matriz", "celdas", "porcentaje"] },
        { slug: "funnel", title: "Embudo", file: "funnel.tsx", wip: false, tags: ["conversión", "abandono", "etapas"] },
        { slug: "gauges", title: "Medidores radiales", file: "gauges.tsx", wip: false, tags: ["arco", "cpu", "memoria", "apdex"] },
        { slug: "bar-grouped", title: "Barras agrupadas", file: "bar-grouped.tsx", wip: false, tags: ["comparación", "trimestres", "leyenda"] },
        { slug: "line-multi", title: "Líneas de varias series", file: "line-multi.tsx", wip: false, tags: ["latencia", "p50-p95-p99", "interpolación"] },
        { slug: "donut", title: "Desglose en dona", file: "donut.tsx", wip: false, tags: ["segmentos", "asignación", "anillo"] },
        { slug: "scatter", title: "Gráfico de dispersión", file: "scatter.tsx", wip: false, tags: ["clústeres", "correlación", "cuadrantes"] },
        { slug: "waterfall", title: "Cascada", file: "waterfall.tsx", wip: false, tags: ["flujo-de-caja", "puente", "varianza"] }
      ]
    },
    {
      id: "media-audio",
      title: "Medios y herramientas creativas",
      description: "Editores de easing, secuenciadores, scrubbers de onda y selectores OKLCH.",
      accent: "#10b981",
      isNew: true,
      items: [
        { slug: "bezier-easing-editor", title: "Editor de cubic-bezier", file: "bezier-easing-editor.tsx", wip: false, tags: ["puntos-de-control", "resorte", "curva", "animación"] },
        { slug: "synth-step-sequencer", title: "Secuenciador de sintetizador de 8 pasos", file: "synth-step-sequencer.tsx", wip: false, tags: ["webaudio", "bpm", "oscilador", "matriz"] },
        { slug: "waveform-scrubber", title: "Navegador de forma de onda", file: "waveform-scrubber.tsx", wip: false, tags: ["picos", "cabezal", "regiones", "marcadores"] },
        { slug: "color-oklch-picker", title: "Espacio de color OKLCH", file: "color-oklch-picker.tsx", wip: false, tags: ["perceptual", "croma", "luminosidad", "gamut"] },
        { slug: "video-timeline-trimmer", title: "Recortador de línea de tiempo de video", file: "video-timeline-trimmer.tsx", wip: false, tags: ["fotogramas-clave", "pistas", "tiradores", "código-de-tiempo"] },
        { slug: "spatial-eq-parametric", title: "Curva de ecualizador paramétrico", file: "spatial-eq-parametric.tsx", wip: false, tags: ["bandas", "factor-q", "biquad", "frecuencia"] },
        { slug: "sprite-frame-inspector", title: "Inspector de fotogramas de sprite", file: "sprite-frame-inspector.tsx", wip: false, tags: ["papel-cebolla", "fps", "corte-de-cuadrícula", "hitbox"] },
        { slug: "camera-pip-controller", title: "HUD de cámara en PiP", file: "camera-pip-controller.tsx", wip: false, tags: ["grabación", "ganancia-de-micrófono", "teleprompter", "flotante"] }
      ]
    },
    {
      id: "timelines",
      title: "Líneas de tiempo",
      description: "Auditoría, changelogs, despliegues, estados y menciones.",
      accent: "#eab308",
      isNew: false,
      items: [
        { slug: "audit", title: "Rastro de auditoría", file: "audit.tsx", wip: false, tags: ["eventos", "actores", "cronológico"] },
        { slug: "notifications", title: "Panel de notificaciones", file: "notifications.tsx", wip: false, tags: ["no-leídos", "menciones", "pestañas"] },
        { slug: "changelog", title: "Registro de cambios", file: "changelog.tsx", wip: false, tags: ["versiones", "semver", "insignias"] },
        { slug: "commits", title: "Historial de commits", file: "commits.tsx", wip: false, tags: ["git", "sha", "rama", "verificado"] },
        { slug: "approvals", title: "Aprobaciones", file: "approvals.tsx", wip: false, tags: ["flujo-de-trabajo", "revisores", "visto-bueno"] },
        { slug: "pull-request", title: "Pull request", file: "pull-request.tsx", wip: false, tags: ["verificaciones", "diff", "fusión", "conversación"] },
        { slug: "pr-ops-console", title: "Consola de operaciones de PR", file: "pr-ops-console.tsx", wip: false, tags: ["ci-cd", "pipeline", "bot", "despliegue"] },
        { slug: "releases", title: "Línea de tiempo de versiones", file: "releases.tsx", wip: false, tags: ["etiquetas-de-versión", "artefactos", "reversión"] },
        { slug: "status-page", title: "Página de estado", file: "status-page.tsx", wip: false, tags: ["barras-de-90-días", "disponibilidad", "incidentes"] },
        { slug: "deploys", title: "Historial de deploys", file: "deploys.tsx", wip: false, tags: ["producción", "vista-previa", "duración", "commit"] },
        { slug: "inbox-thread", title: "Hilo de bandeja", file: "inbox-thread.tsx", wip: false, tags: ["mensajes", "respuestas", "adjuntos"] },
        { slug: "activity-feed", title: "Feed de actividad", file: "activity-feed.tsx", wip: false, tags: ["tiempo-real", "flujo", "equipo"] }
      ]
    },
    {
      id: "calendars",
      title: "Calendarios",
      description: "Vistas de mes, horarios semanales, agendas y mapas de calor.",
      accent: "#0ea5e9",
      isNew: false,
      items: [
        { slug: "month", title: "Vista mensual", file: "month.tsx", wip: false, tags: ["cuadrícula", "eventos", "píldoras"] },
        { slug: "week", title: "Horario semanal", file: "week.tsx", wip: false, tags: ["bloques-de-tiempo", "hora-actual", "espacios"] },
        { slug: "agenda", title: "Lista de agenda", file: "agenda.tsx", wip: false, tags: ["próximos", "agrupado", "cronológico"] },
        { slug: "date-range", title: "Selector de rango de fechas", file: "date-range.tsx", wip: false, tags: ["dos-meses", "preajustes", "selección"] },
        { slug: "timezone", title: "Planificador de zonas horarias", file: "timezone.tsx", wip: false, tags: ["reloj-mundial", "traslape", "control-deslizante"] },
        { slug: "mini", title: "Minicalendario", file: "mini.tsx", wip: false, tags: ["compacto", "popover", "selector-de-fecha"] },
        { slug: "year-heatmap", title: "Mapa de calor de contribuciones", file: "year-heatmap.tsx", wip: false, tags: ["52-semanas", "rachas", "actividad"] },
        { slug: "recurring", title: "Evento recurrente", file: "recurring.tsx", wip: false, tags: ["rrule", "cadencia", "excepciones"] },
        { slug: "holidays", title: "Festivos y ausencias", file: "holidays.tsx", wip: false, tags: ["ausencias", "disponibilidad-del-equipo", "saldos"] }
      ]
    },
    {
      id: "profile",
      title: "Perfil",
      description: "Páginas de usuario, hover cards, equipos y presencia.",
      accent: "#d946ef",
      isNew: false,
      items: [
        { slug: "hero", title: "Encabezado de perfil", file: "hero.tsx", wip: false, tags: ["banner", "avatar", "contribuciones", "enlaces"] },
        { slug: "hover-card", title: "Tarjeta al pasar el cursor", file: "hover-card.tsx", wip: false, tags: ["popover", "contactos-en-común", "seguimiento-rápido"] },
        { slug: "team-grid", title: "Cuadrícula de equipo", file: "team-grid.tsx", wip: false, tags: ["departamentos", "tarjetas", "organización"] },
        { slug: "directory", title: "Directorio de contactos", file: "directory.tsx", wip: false, tags: ["alfabético", "búsqueda", "división"] },
        { slug: "compact-card", title: "Tarjeta de usuario compacta", file: "compact-card.tsx", wip: false, tags: ["en-línea", "estado", "rol"] },
        { slug: "org-chart", title: "Organigrama", file: "org-chart.tsx", wip: false, tags: ["árbol", "líneas-de-reporte", "nodos"] },
        { slug: "skills", title: "Matriz de habilidades", file: "skills.tsx", wip: false, tags: ["dominio", "recomendaciones", "radar"] },
        { slug: "presence-rail", title: "Barra de presencia", file: "presence-rail.tsx", wip: false, tags: ["en-línea", "sala-de-voz", "estado"] },
        { slug: "introductions", title: "Presentaciones sugeridas", file: "introductions.tsx", wip: false, tags: ["red", "conectar", "en-común"] },
        { slug: "credentials", title: "Credenciales de seguridad", file: "credentials.tsx", wip: false, tags: ["gpg", "claves-ssh", "certificados"] }
      ]
    },
    {
      id: "crypto-fintech",
      title: "Fintech y tesorería",
      description: "Profundidad de órdenes, cambio de divisas, tarjetas virtuales y simuladores de runway.",
      accent: "#14b8a6",
      isNew: true,
      items: [
        { slug: "orderbook-depth-wall", title: "Muro de profundidad del libro de órdenes", file: "orderbook-depth-wall.tsx", wip: false, tags: ["oferta-demanda", "diferencial", "acumulado", "tiempo-real"] },
        { slug: "virtual-card-vault", title: "Bóveda de tarjetas virtuales", file: "virtual-card-vault.tsx", wip: false, tags: ["límites-de-gasto", "revelar-cvv", "congelar", "bloqueo-por-comercio"] },
        { slug: "fx-currency-swap", title: "Intercambio de divisas FX", file: "fx-currency-swap.tsx", wip: false, tags: ["deslizamiento", "tasa-fija", "multisalto", "cotización"] },
        { slug: "treasury-runway-burn", title: "Tesorería: consumo y runway", file: "treasury-runway-burn.tsx", wip: false, tags: ["fecha-de-caja-cero", "consumo-neto", "escenarios", "arr"] },
        { slug: "liquidity-pool-range", title: "Rango de liquidez concentrada", file: "liquidity-pool-range.tsx", wip: false, tags: ["ticks", "apr", "límites-de-precio", "histograma"] },
        { slug: "wire-transfer-stepper", title: "Asistente de transferencia bancaria", file: "wire-transfer-stepper.tsx", wip: false, tags: ["swift-iban", "enrutamiento", "cumplimiento-normativo", "aprobación"] },
        { slug: "tax-lot-harvester", title: "Cosecha de lotes fiscales", file: "tax-lot-harvester.tsx", wip: false, tags: ["fifo-lifo", "corto-largo", "no-realizado", "costo-base"] },
        { slug: "multi-sig-quorum", title: "Quórum multifirma", file: "multi-sig-quorum.tsx", wip: false, tags: ["3-de-5", "firmantes-de-hardware", "umbral", "nonce"] }
      ]
    },
    {
      id: "toasts",
      title: "Toasts y banners",
      description: "Retroalimentación efímera: confirmaciones, errores, deshacer y progreso.",
      accent: "#f97316",
      isNew: false,
      items: [
        { slug: "success", title: "Toast de éxito", file: "success.tsx", wip: false, tags: ["marca", "descartar", "pila"] },
        { slug: "error-retry", title: "Error con reintento", file: "error-retry.tsx", wip: false, tags: ["alerta", "botón-reintentar", "traza"] },
        { slug: "info-banner", title: "Banner del sistema", file: "info-banner.tsx", wip: false, tags: ["anuncio", "barra-superior", "cta"] },
        { slug: "progress", title: "Toast de progreso", file: "progress.tsx", wip: false, tags: ["subiendo", "porcentaje", "cancelar"] },
        { slug: "undo", title: "Toast de deshacer", file: "undo.tsx", wip: false, tags: ["cuenta-regresiva", "revertir", "teclado-z"] },
        { slug: "rich", title: "Toast enriquecido", file: "rich.tsx", wip: false, tags: ["avatar", "respuesta-en-línea", "vista-previa"] }
      ]
    },
    {
      id: "pricing",
      title: "Precios",
      description: "Comparativas de planes, sliders, contacto de ventas y cambio de facturación.",
      accent: "#84cc16",
      isNew: false,
      items: [
        { slug: "three-tier", title: "Tres niveles", file: "three-tier.tsx", wip: false, tags: ["hobby-pro-enterprise", "popular", "tarjetas"] },
        { slug: "comparison-table", title: "Matriz de funciones", file: "comparison-table.tsx", wip: false, tags: ["encabezado-fijo", "marcas-de-verificación", "niveles"] },
        { slug: "slider-seats", title: "Control deslizante de asientos", file: "slider-seats.tsx", wip: false, tags: ["calculadora", "descuento-por-volumen", "interactivo"] },
        { slug: "simple-card", title: "Plan único", file: "simple-card.tsx", wip: false, tags: ["todo-en-uno", "tarifa-plana", "garantía"] },
        { slug: "contact-sales", title: "Contactar a ventas", file: "contact-sales.tsx", wip: false, tags: ["empresarial", "cotización-personalizada", "sla"] },
        { slug: "monthly-yearly", title: "Selector de facturación", file: "monthly-yearly.tsx", wip: false, tags: ["descuento-anual", "interruptor-píldora", "ahorro"] }
      ]
    },
    {
      id: "tours",
      title: "Tours y coachmarks",
      description: "Modales de bienvenida, spotlights, balizas y checklists de incorporación.",
      accent: "#38bdf8",
      isNew: false,
      items: [
        { slug: "welcome-carousel", title: "Carrusel de bienvenida", file: "welcome-carousel.tsx", wip: false, tags: ["diapositivas", "puntos", "novedades"] },
        { slug: "spotlight", title: "Recorrido con foco", file: "spotlight.tsx", wip: false, tags: ["máscara", "recorte", "contador-de-pasos"] },
        { slug: "arrow-tooltip", title: "Tooltip con flecha", file: "arrow-tooltip.tsx", wip: false, tags: ["guía", "puntero", "descartar"] },
        { slug: "beacon", title: "Pista con baliza", file: "beacon.tsx", wip: false, tags: ["pulso", "punto-activo", "descubrimiento-de-funciones"] },
        { slug: "inline-hint", title: "Pista en línea", file: "inline-hint.tsx", wip: false, tags: ["destacado", "consejo-pro", "contextual"] },
        { slug: "checklist", title: "Lista de incorporación", file: "checklist.tsx", wip: false, tags: ["anillo-de-progreso", "pasos", "recompensa"] }
      ]
    },
    {
      id: "threads",
      title: "Hilos y comentarios",
      description: "Hilos en línea, paneles laterales, reacciones y menciones.",
      accent: "#fb7185",
      isNew: false,
      items: [
        { slug: "inline-thread", title: "Hilo en línea", file: "inline-thread.tsx", wip: false, tags: ["anidado", "conectores", "colapsar"] },
        { slug: "side-panel", title: "Panel lateral", file: "side-panel.tsx", wip: false, tags: ["comentarios-del-documento", "anclas", "cajón"] },
        { slug: "comment-row", title: "Fila de comentario", file: "comment-row.tsx", wip: false, tags: ["reacciones", "marca-de-tiempo", "markdown"] },
        { slug: "mention-popover", title: "Popover de @menciones", file: "mention-popover.tsx", wip: false, tags: ["autocompletado", "usuarios", "cursor-de-texto"] },
        { slug: "resolved", title: "Hilo resuelto", file: "resolved.tsx", wip: false, tags: ["resumen", "reabrir", "auditoría"] },
        { slug: "compose-rich", title: "Compositor enriquecido", file: "compose-rich.tsx", wip: false, tags: ["formato", "adjuntos", "pestaña-de-vista-previa"] }
      ]
    }
  ]
};

window.TESELA_FLAT_ITEMS = [];
window.TESELA_DATA.categories.forEach((cat, catIdx) => {
  cat.items.forEach((item, itemIdx) => {
    const flatItem = {
      ...item,
      isNewCategory: Boolean(cat.isNew),
      categoryId: cat.id,
      categoryTitle: cat.title,
      categoryDescription: cat.description,
      categoryAccent: cat.accent,
      categoryIndex: catIdx,
      itemIndex: itemIdx,
      globalIndex: window.TESELA_FLAT_ITEMS.length,
      path: `/c/${cat.id}/${item.slug}`
    };
    window.TESELA_FLAT_ITEMS.push(flatItem);
  });
});
