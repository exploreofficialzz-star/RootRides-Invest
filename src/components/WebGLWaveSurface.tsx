import { useRef, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const fragmentShader = `
precision mediump float;

uniform float u_time;
uniform vec2 u_res;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform vec3 u_color4;
uniform float u_waveSpeed;
uniform float u_waveFreq;
uniform float u_waveAmp;
uniform float u_lineCount;

varying vec2 vUv;

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 uv = vUv;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_res.x / u_res.y;
  p = rot(0.2) * p;
  vec2 t = p + vec2(u_time * u_waveSpeed);
  float y = sin(t.x * u_waveFreq + t.y) * u_waveAmp + snoise(t * 0.5) * 0.3;
  float c = 10.0 * u_lineCount;
  float wave = asin(sin(y * c)) / (3.14159 / 2.0);
  wave = (wave + 1.0) / 2.0;
  vec3 col = mix(u_color1, u_color2, wave);
  col = mix(col, u_color3, smoothstep(0.3, 0.7, wave));
  col = mix(col, u_color4, smoothstep(0.6, 1.0, wave));
  gl_FragColor = vec4(col, 1.0);
}
`;

function WavePlane() {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_res: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_color1: { value: new THREE.Color("#02231c") },
      u_color2: { value: new THREE.Color("#004d40") },
      u_color3: { value: new THREE.Color("#0F766E") },
      u_color4: { value: new THREE.Color("#F59E0B") },
      u_waveSpeed: { value: 0.15 },
      u_waveFreq: { value: 1.2 },
      u_waveAmp: { value: 0.3 },
      u_lineCount: { value: 1.0 },
    }),
    []
  );

  useEffect(() => {
    const handleResize = () => {
      if (meshRef.current) {
        const mat = meshRef.current.material as THREE.ShaderMaterial;
        mat.uniforms.u_res.value.set(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.u_time.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

export default function WebGLWaveSurface() {
  return (
    <Canvas
      orthographic
      camera={{ zoom: 1, position: [0, 0, 1] }}
      gl={{ alpha: true }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        background: "#02231c",
      }}
    >
      <Suspense fallback={null}>
        <WavePlane />
      </Suspense>
    </Canvas>
  );
}
