// ============================================================================
// Tesela — Shaders procedurales (WebGL + Canvas 2D) y sintetizador de audio para UI con Web Audio
// Código 100% propio — cero dependencias externas
// ============================================================================

(function () {
  // --------------------------------------------------------------------------
  // 1. Motor procedural de sonidos táctiles con Web Audio API
  // --------------------------------------------------------------------------
  class TactileAudioEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      if (this.enabled) {
        this.init();
        this.play("chime");
      }
      return this.enabled;
    }

    play(type = "tick") {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        if (type === "tick") {
          // Micro-tic mecánico sutil y agudo al pasar sobre tarjetas o navegar
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(1400, now);
          osc.frequency.exponentialRampToValueAtTime(280, now + 0.018);
          gain.gain.setValueAtTime(0.018, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.02);
        } else if (type === "click") {
          // Sonido nítido de interruptor de tecla
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(620, now);
          osc.frequency.exponentialRampToValueAtTime(180, now + 0.035);
          gain.gain.setValueAtTime(0.045, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.038);
        } else if (type === "open") {
          // Subida armónica suave al abrir el modal o el sandbox
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(760, now + 0.09);
          gain.gain.setValueAtTime(0.035, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.095);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.1);
        } else if (type === "close") {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(580, now);
          osc.frequency.exponentialRampToValueAtTime(220, now + 0.07);
          gain.gain.setValueAtTime(0.03, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.08);
        } else if (type === "chime") {
          [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "sine";
            const t = now + idx * 0.032;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.025, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.19);
          });
        }
      } catch (_) {
        // Ignorar errores de audio antes del primer gesto del usuario
      }
    }
  }

  window.TESELA_AUDIO = new TactileAudioEngine();

  // --------------------------------------------------------------------------
  // 2. Campo ambiental de shader WebGL / Canvas2D
  // --------------------------------------------------------------------------
  class AmbientShaderField {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.mouseX = 0.5;
      this.mouseY = 0.2;
      this.targetMouseX = 0.5;
      this.targetMouseY = 0.2;
      this.scrollY = 0;
      this.startTime = performance.now();
      this.gl = null;
      this.program = null;
      this.uniforms = {};
      this.isWebGL = false;
      this.reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");

      this.init();
      this.bindEvents();
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
    }

    init() {
      try {
        const gl =
          this.canvas.getContext("webgl", { alpha: true, antialias: false, depth: false }) ||
          this.canvas.getContext("experimental-webgl");
        if (gl) {
          this.setupWebGL(gl);
        }
      } catch (_) {
        this.isWebGL = false;
      }

      if (!this.isWebGL) {
        this.ctx2d = this.canvas.getContext("2d");
      }
      this.resize();
    }

    setupWebGL(gl) {
      const vsSource = `
        attribute vec2 a_position;
        varying vec2 v_uv;
        void main() {
          v_uv = a_position * 0.5 + 0.5;
          gl_Position = vec4(a_position, 0.0, 1.0);
        }
      `;

      const fsSource = `
        precision mediump float;
        varying vec2 v_uv;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        uniform float u_time;
        uniform float u_scroll;
        uniform float u_lightMode;
        uniform float u_blueprint;

        // Hash y ruido de valor 2D estilo simplex
        float hash(vec2 p) {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        void main() {
          vec2 uv = v_uv;
          float aspect = u_resolution.x / max(u_resolution.y, 1.0);
          vec2 p = vec2(uv.x * aspect, uv.y);
          vec2 m = vec2(u_mouse.x * aspect, 1.0 - u_mouse.y);

          // Campo de ondas orgánicas sutil
          float t = u_time * 0.18;
          float n1 = noise(p * 2.4 + vec2(t, -t * 0.6 + u_scroll * 0.0002));
          float n2 = noise(p * 4.8 - vec2(t * 0.7, t * 0.4));
          float field = n1 * 0.65 + n2 * 0.35;

          // Foco radial que sigue al mouse
          float dist = length(p - m);
          float spot = exp(-dist * 2.6) * 0.55;

          // Resplandor de horizonte en la parte superior del hero
          float topGlow = exp(-pow((1.0 - uv.y) * 2.3, 2.0)) * 0.45;

          // Cuadrícula fina de plano en modo blueprint o cerca del cursor
          vec2 gridUV = fract(p * 28.0);
          float gridLine = step(0.965, gridUV.x) + step(0.965, gridUV.y);
          float gridMask = clamp(gridLine, 0.0, 1.0) * (spot * 0.65 + u_blueprint * 0.35);

          // Colores
          vec3 indigo = vec3(0.39, 0.40, 0.95);
          vec3 amber  = vec3(0.96, 0.62, 0.04);
          vec3 sky    = vec3(0.06, 0.65, 0.91);

          vec3 accentMix = mix(indigo, sky, sin(uv.x * 3.14159 + t) * 0.5 + 0.5);
          accentMix = mix(accentMix, amber, smoothstep(0.25, 0.85, n2) * 0.35);

          // Grano
          float grain = (hash(uv * u_resolution + fract(u_time)) - 0.5) * 0.025;

          float alpha = (topGlow * 0.14 + spot * 0.12 + field * 0.04 + gridMask * 0.12) + grain;
          if (u_lightMode > 0.5) {
            alpha *= 0.65;
          }

          // El canvas usa alfa premultiplicado: hay que escalar el color por el alfa o se compone como un velo brillante
          float a = clamp(alpha, 0.0, 0.28);
          gl_FragColor = vec4(accentMix * a, a);
        }
      `;

      const compile = (type, src) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          gl.deleteShader(shader);
          return null;
        }
        return shader;
      };

      const vs = compile(gl.VERTEX_SHADER, vsSource);
      const fs = compile(gl.FRAGMENT_SHADER, fsSource);
      if (!vs || !fs) return;

      const prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW
      );

      const posLoc = gl.getAttribLocation(prog, "a_position");
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      this.gl = gl;
      this.program = prog;
      this.uniforms = {
        resolution: gl.getUniformLocation(prog, "u_resolution"),
        mouse: gl.getUniformLocation(prog, "u_mouse"),
        time: gl.getUniformLocation(prog, "u_time"),
        scroll: gl.getUniformLocation(prog, "u_scroll"),
        lightMode: gl.getUniformLocation(prog, "u_lightMode"),
        blueprint: gl.getUniformLocation(prog, "u_blueprint")
      };
      this.isWebGL = true;
    }

    resize() {
      if (!this.canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (this.canvas.width !== w || this.canvas.height !== h) {
        this.canvas.width = w;
        this.canvas.height = h;
        if (this.isWebGL && this.gl) {
          this.gl.viewport(0, 0, w, h);
        }
      }
    }

    bindEvents() {
      window.addEventListener("resize", () => this.resize(), { passive: true });
      window.addEventListener(
        "pointermove",
        (e) => {
          this.targetMouseX = e.clientX / Math.max(window.innerWidth, 1);
          this.targetMouseY = e.clientY / Math.max(window.innerHeight, 1);
        },
        { passive: true }
      );
      window.addEventListener(
        "scroll",
        () => {
          this.scrollY = window.scrollY || 0;
        },
        { passive: true }
      );
    }

    loop(now) {
      // Interpolación suave tipo resorte para seguir el cursor
      this.mouseX += (this.targetMouseX - this.mouseX) * 0.08;
      this.mouseY += (this.targetMouseY - this.mouseY) * 0.08;

      // Congelar el campo de ruido en movimiento si el usuario prefiere reducir el movimiento
      const t = this.reducedMotion?.matches ? 0 : (now - this.startTime) * 0.001;
      const isLight = document.documentElement.getAttribute("data-theme") === "light" ? 1.0 : 0.0;
      const isBlueprint = document.documentElement.hasAttribute("data-blueprint") ? 1.0 : 0.0;

      if (this.isWebGL && this.gl) {
        const gl = this.gl;
        gl.useProgram(this.program);
        gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
        gl.uniform2f(this.uniforms.mouse, this.mouseX, this.mouseY);
        gl.uniform1f(this.uniforms.time, t);
        gl.uniform1f(this.uniforms.scroll, this.scrollY);
        gl.uniform1f(this.uniforms.lightMode, isLight);
        gl.uniform1f(this.uniforms.blueprint, isBlueprint);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      } else if (this.ctx2d) {
        const ctx = this.ctx2d;
        const w = this.canvas.width;
        const h = this.canvas.height;
        ctx.clearRect(0, 0, w, h);
        const grad = ctx.createRadialGradient(
          this.mouseX * w,
          this.mouseY * h,
          10,
          this.mouseX * w,
          this.mouseY * h,
          Math.max(w, h) * 0.45
        );
        grad.addColorStop(0, isLight ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.12)");
        grad.addColorStop(0.5, isLight ? "rgba(14,165,233,0.04)" : "rgba(14,165,233,0.05)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      requestAnimationFrame(this.loop);
    }
  }

  window.TESELA_SHADER = AmbientShaderField;
})();
