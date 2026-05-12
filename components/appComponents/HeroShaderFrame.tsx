"use client";

import { useEffect, useRef } from "react";

const vertexShaderSource = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;

float softCircle(vec2 uv, vec2 center, float radius, float blur) {
  float distanceToCenter = length((uv - center) * vec2(uResolution.x / uResolution.y, 1.0));
  return 1.0 - smoothstep(radius, radius + blur, distanceToCenter);
}

void main() {
  vec2 uv = vUv;
  float time = uTime * 0.11;

  vec2 driftA = vec2(0.08 * sin(time * 0.9), 0.07 * cos(time * 1.1));
  vec2 driftB = vec2(0.07 * cos(time * 0.7), 0.06 * sin(time * 1.3));
  vec2 driftC = vec2(0.05 * sin(time * 1.2 + 1.4), 0.05 * cos(time * 0.8));

  vec3 base = vec3(0.985, 0.990, 0.995);
  vec3 blue = vec3(0.58, 0.71, 1.0);
  vec3 amber = vec3(1.0, 0.82, 0.48);
  vec3 rose = vec3(1.0, 0.63, 0.75);
  vec3 mint = vec3(0.60, 0.90, 0.76);

  float blueGlow = softCircle(uv, vec2(0.25, 0.28) + driftA, 0.46, 0.42);
  float amberGlow = softCircle(uv, vec2(0.80, 0.72) + driftB, 0.34, 0.36);
  float roseGlow = softCircle(uv, vec2(0.52, 0.45) + driftC, 0.40, 0.44);
  float mintGlow = softCircle(uv, vec2(0.16, 0.78) - driftB * 0.6, 0.30, 0.34);

  vec3 color = base;
  color = mix(color, blue, blueGlow * 0.28);
  color = mix(color, amber, amberGlow * 0.18);
  color = mix(color, rose, roseGlow * 0.16);
  color = mix(color, mint, mintGlow * 0.15);

  float wave = sin((uv.x * 2.5 + uv.y * 1.2 + time) * 3.14159) * 0.5 + 0.5;
  color += vec3(wave) * 0.018;

  float vignette = smoothstep(0.95, 0.25, length(uv - 0.5));
  color = mix(vec3(0.96, 0.97, 0.98), color, vignette);

  gl_FragColor = vec4(color, 1.0);
}
`;

const createShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) => {
  const shader = gl.createShader(type);

  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
};

const HeroShaderFrame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: "low-power",
    });

    if (!gl) {
      return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource,
    );

    if (!vertexShader || !fragmentShader) {
      return;
    }

    const program = gl.createProgram();

    if (!program) {
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }

    const positionLocation = gl.getAttribLocation(program, "aPosition");
    const timeLocation = gl.getUniformLocation(program, "uTime");
    const resolutionLocation = gl.getUniformLocation(program, "uResolution");
    const buffer = gl.createBuffer();

    if (!buffer) {
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    const startTime = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const nextWidth = Math.max(1, Math.floor(rect.width * dpr));
      const nextHeight = Math.max(1, Math.floor(rect.height * dpr));

      if (nextWidth === width && nextHeight === height) {
        return;
      }

      width = nextWidth;
      height = nextHeight;
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    };

    const render = (now: number) => {
      resize();
      gl.useProgram(program);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(
        timeLocation,
        reducedMotionQuery.matches ? 0 : (now - startTime) / 1000,
      );
      gl.uniform2f(resolutionLocation, width, height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!reducedMotionQuery.matches) {
        animationFrame = requestAnimationFrame(render);
      }
    };

    const observer = new ResizeObserver(() => resize());
    observer.observe(canvas);
    render(performance.now());

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 size-full bg-[radial-gradient(circle_at_20%_30%,rgba(96,165,250,0.25),transparent_32%),radial-gradient(circle_at_78%_72%,rgba(251,191,36,0.20),transparent_30%),linear-gradient(135deg,rgba(248,250,252,1),rgba(241,245,249,1))]"
    />
  );
};

export default HeroShaderFrame;
