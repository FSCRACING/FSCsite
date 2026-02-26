import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

type Props = {
    modelUrl?: string;            // default "/car.glb"
    className?: string;
    style?: React.CSSProperties;
    captureWheel?: boolean;       // default true (come index: blocca scroll)
    captureKeys?: boolean;        // default true (0 reset, r refit, f flip rear, v flip side)
    enabled?: boolean; // ✅ nuovo: cattura input solo quando true
    onRequestExit?: (dir: "up" | "down") => void; // ✅ nuovo
    showProgressBar?: boolean;    // nuovo: mostra barra progresso con checkpoint
};

type Stage = { label: string; s0: number; s1: number };

type WheelData = {
    FL: THREE.Vector3;
    FR: THREE.Vector3;
    RL: THREE.Vector3;
    RR: THREE.Vector3;
    frontAxleMid: THREE.Vector3;
    rearAxleMid: THREE.Vector3;
    wheelbase: number;
    trackWidthF: number;
    trackWidthR: number;
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ease = (t: number) => t * t * (3 - 2 * t);
const smoothstep01 = (a: number, b: number, x: number) => {
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
};

function axisVec(idx: number, s = 1) {
    if (idx === 0) return new THREE.Vector3(s, 0, 0);
    if (idx === 1) return new THREE.Vector3(0, s, 0);
    return new THREE.Vector3(0, 0, s);
}

function disposeMaterial(mat: THREE.Material) {
    // dispose textures if present
    Object.values(mat as any).forEach((v) => {
        if (v && typeof v === "object" && "dispose" in v && typeof (v as any).dispose === "function") {
            (v as any).dispose();
        }
    });
    mat.dispose();
}

function disposeObject3D(root: THREE.Object3D) {
    root.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
            obj.geometry?.dispose?.();
            const m = obj.material;
            if (Array.isArray(m)) m.forEach(disposeMaterial);
            else if (m) disposeMaterial(m);
        }
    });
}

function ProgressBar({
    stages,
    progress,
    onProgressChange,
    className
}: {
    stages: Stage[];
    progress: number;
    onProgressChange: (progress: number) => void;
    className?: string;
}) {
    const [isDragging, setIsDragging] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newProgress = x / rect.width;
        onProgressChange(Math.max(0, Math.min(1, newProgress)));
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        handleClick(e);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isDragging) {
            handleClick(e);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove as any);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove as any);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging]);

    return (
        <div
            className={className}
            style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                right: '20px',
                height: '40px',
                background: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '20px',
                padding: '0 10px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                userSelect: 'none'
            }}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
        >
            {/* Track */}
            <div
                style={{
                    position: 'relative',
                    flex: 1,
                    height: '4px',
                    background: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '2px'
                }}
            >
                {/* Progress fill */}
                <div
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: `${progress * 100}%`,
                        background: 'linear-gradient(90deg, #00d4ff, #0099cc)',
                        borderRadius: '2px',
                        transition: isDragging ? 'none' : 'width 0.1s ease'
                    }}
                />

                {/* Checkpoints */}
                {stages.map((stage, index) => (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            left: `${stage.s0 * 100}%`,
                            top: '-6px',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: progress >= stage.s0 ? '#00d4ff' : 'rgba(255, 255, 255, 0.5)',
                            border: '2px solid rgba(0, 0, 0, 0.8)',
                            transform: 'translateX(-50%)',
                            zIndex: 1
                        }}
                        title={stage.label}
                    />
                ))}
            </div>

            {/* Progress text */}
            <div
                style={{
                    marginLeft: '15px',
                    color: 'white',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    minWidth: '60px'
                }}
            >
                {Math.round(progress * 100)}%
            </div>
        </div>
    );
}

export default function CarBlueprintIndex({
    modelUrl = "/car.glb",
    className,
    style,
    captureWheel = true,
    captureKeys = true,
    enabled = true,                  // ✅
    onRequestExit,                   // ✅
    showProgressBar = false,         // nuovo
}: Props) {
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const glHostRef = useRef<HTMLDivElement | null>(null);
    const overlayRef = useRef<HTMLCanvasElement | null>(null);
    const enabledRef = useRef(enabled);
    const progressRef = useRef<{ setProgress: (progress: number) => void } | null>(null);
    const onExitRef = useRef(onRequestExit);
    const [progressBarValue, setProgressBarValue] = useState(0);
    useEffect(() => { enabledRef.current = enabled; }, [enabled]);
    useEffect(() => { onExitRef.current = onRequestExit; }, [onRequestExit]);

    const handleProgressChange = (newProgress: number) => {
        if (progressRef.current) {
            progressRef.current.setProgress(newProgress);
        }
    };

    const cfg = useMemo(
        () => ({
            // match index.html :contentReference[oaicite:1]{index=1}
            PROGRESS_MAX: 200,
            CAM_SEG: 0.2,
            HOLD_IN: 0.1,
            HOLD_OUT: 0.2,
            VISUAL_TRIM: 0.01,
            VISUAL_SAMPLES: 60000,

            SPRING_K: 95,
            SPRING_C: 22,
            GOAL_IMPULSE: 0.00115,
            GOAL_FRICTION: 0.84,
            GOAL_MAX: 1.15,

            TOP_STAGES: [
                { label: "AERODINAMICA", s0: 0.0, s1: 0.2 },
                { label: "DINAMICA / MECCANICA", s0: 0.2, s1: 0.4 },
                { label: "TRAZIONE", s0: 0.4, s1: 0.6 },
                { label: "CONTROL / TELEMETRY", s0: 0.6, s1: 0.8 },
                { label: "MANAGEMENT", s0: 0.8, s1: 1.0 },
            ] satisfies Stage[],
        }),
        []
    );

    useEffect(() => {
        const wrap = wrapRef.current;
        const glHost = glHostRef.current;
        const overlay = overlayRef.current;
        if (!wrap || !glHost || !overlay) return;

        THREE.Cache.enabled = true;

        // ===== sizes =====
        let W = 1;
        let H = 1;
        const getSize = () => {
            const r = wrap.getBoundingClientRect();
            W = Math.max(1, Math.floor(r.width));
            H = Math.max(1, Math.floor(r.height));
            return { w: W, h: H };
        };
        getSize();

        // ===== overlay canvas =====
        const ctx = overlay.getContext("2d");
        if (ctx === null) return;

        const resizeOverlay = () => {
            const { w, h } = getSize();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            overlay.width = Math.floor(w * dpr);
            overlay.height = Math.floor(h * dpr);
            overlay.style.width = `${w}px`;
            overlay.style.height = `${h}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resizeOverlay();

        // ===== three =====
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(W, H);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        glHost.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x5c5c5c);

        const camera = new THREE.PerspectiveCamera(50, W / H, 0.01, 5000);

        scene.add(new THREE.HemisphereLight(0xffffff, 0x0b0d10, 1.0));
        scene.add(new THREE.AmbientLight(0xffffff, 0.35));
        const key = new THREE.DirectionalLight(0xffffff, 1.2);
        key.position.set(6, 10, 6);
        scene.add(key);

        const grid = new THREE.GridHelper(24, 48, 0x223344, 0x111820);
        (grid.material as THREE.Material).transparent = true;
        (grid.material as THREE.Material).opacity = 0.22;
        scene.add(grid);

        // management ring (3D torus under the car) :contentReference[oaicite:2]{index=2}
        const mgmtRing = new THREE.Mesh(
            new THREE.TorusGeometry(1, 0.03, 16, 160),
            new THREE.MeshStandardMaterial({
                color: 0xb18cff,
                emissive: 0x3b2a66,
                emissiveIntensity: 0.9,
                transparent: true,
                opacity: 0.0,
                metalness: 0.2,
                roughness: 0.25,
                depthWrite: false,
            })
        );
        mgmtRing.rotation.x = Math.PI / 2;
        mgmtRing.visible = false;
        scene.add(mgmtRing);

        const rebuildMgmtRing = (radius: number, y: number) => {
            mgmtRing.geometry.dispose();
            const tube = Math.max(0.002, radius * 0.018);
            mgmtRing.geometry = new THREE.TorusGeometry(radius, tube, 18, 200);
            mgmtRing.position.set(0, y + 0.01, 0);
            mgmtRing.rotation.x = Math.PI / 2;
        };

        // ===== MODEL STATE =====
        let disposed = false;
        let isLoaded = false;

        let root: THREE.Object3D | null = null;

        let rawBox: THREE.Box3 | null = null;
        let visualBox: THREE.Box3 | null = null;
        let centerV = new THREE.Vector3();
        let extV = new THREE.Vector3();

        let longIdx = 2,
            latIdx = 0,
            upIdx = 1;

        // toggles (match index defaults: rearIsMax true, sideSign +1 => RIGHT)
        let rearIsMax = true;
        let sideSign = 1;

        // scrub
        let p = 0;
        let pGoal = 0;
        let pVel = 0;
        let completed = false; // ✅ trigger una volta sola
        let goalV = 0;

        // progress bar state
        let currentProgress = 0;

        // expose progress setter
        progressRef.current = {
            setProgress: (progress: number) => {
                pGoal = clamp01(progress);
                goalV = 0; // stop any momentum
            }
        };

        // camera keyframes
        let camSide = new THREE.Vector3();
        let camTopA = new THREE.Vector3();
        let camTopB = new THREE.Vector3();
        let lookAt = new THREE.Vector3(0, 0, 0);

        // wheel detection
        let wheelData: WheelData | null = null;

        // ===== UTIL: CSS vars (colors) =====
        const getCss = (varName: string) => getComputedStyle(document.documentElement).getPropertyValue(varName).trim();

        // ===== BOUNDS / CENTERING =====
        function computeTrimmedVisualBox(obj: THREE.Object3D, trim = cfg.VISUAL_TRIM, maxSamples = cfg.VISUAL_SAMPLES) {
            const xs: number[] = [],
                ys: number[] = [],
                zs: number[] = [];
            const v = new THREE.Vector3();
            obj.updateWorldMatrix(true, true);

            obj.traverse((o) => {
                if (!(o instanceof THREE.Mesh)) return;
                const geo = o.geometry;
                if (!(geo instanceof THREE.BufferGeometry)) return;
                const pos = geo.attributes.position;
                if (!pos) return;

                const step = Math.max(1, Math.floor(pos.count / Math.max(1, Math.floor(maxSamples / 12))));
                for (let i = 0; i < pos.count; i += step) {
                    v.fromBufferAttribute(pos, i);
                    v.applyMatrix4(o.matrixWorld);
                    xs.push(v.x);
                    ys.push(v.y);
                    zs.push(v.z);
                }
            });

            if (xs.length < 10) return new THREE.Box3().setFromObject(obj);

            xs.sort((a, b) => a - b);
            ys.sort((a, b) => a - b);
            zs.sort((a, b) => a - b);

            const lo = (arr: number[]) => arr[Math.floor(arr.length * trim)];
            const hi = (arr: number[]) => arr[Math.floor(arr.length * (1 - trim))];

            return new THREE.Box3(new THREE.Vector3(lo(xs), lo(ys), lo(zs)), new THREE.Vector3(hi(xs), hi(ys), hi(zs)));
        }

        function normalizeUsingVisualCenterAndGround(obj: THREE.Object3D) {
            obj.updateWorldMatrix(true, true);

            const vbox = computeTrimmedVisualBox(obj);
            const cW = vbox.getCenter(new THREE.Vector3());
            const cL = obj.worldToLocal(cW.clone());

            obj.position.sub(cL);
            obj.updateWorldMatrix(true, true);

            const rbox = new THREE.Box3().setFromObject(obj);
            obj.position.y -= rbox.min.y;
            obj.updateWorldMatrix(true, true);
        }

        let _prevLong: THREE.Vector3 | null = null;

        function getCarAxes() {
            const up = new THREE.Vector3(0, 1, 0);

            let lat = axisVec(latIdx, 1);
            let long = axisVec(longIdx, 1);

            if (wheelData?.FL && wheelData?.FR && wheelData?.RL && wheelData?.RR) {
                const leftMid = wheelData.FL.clone().add(wheelData.RL).multiplyScalar(0.5);
                const rightMid = wheelData.FR.clone().add(wheelData.RR).multiplyScalar(0.5);

                lat = rightMid.sub(leftMid);
                lat.y = 0;
                if (lat.lengthSq() < 1e-8) lat = axisVec(latIdx, 1);
                lat.normalize();

                long = new THREE.Vector3().crossVectors(up, lat);
                long.y = 0;
                if (long.lengthSq() < 1e-8) long = axisVec(longIdx, 1);
                long.normalize();

                if (wheelData.frontAxleMid && wheelData.rearAxleMid) {
                    const want = wheelData.frontAxleMid.clone().sub(wheelData.rearAxleMid);
                    want.y = 0;
                    if (want.lengthSq() > 1e-8) {
                        want.normalize();
                        if (long.dot(want) < 0) long.negate();
                    }
                }

                lat = new THREE.Vector3().crossVectors(up, long).normalize();
            }

            if (_prevLong && long.dot(_prevLong) < 0) {
                long.negate();
                lat.negate();
            }
            _prevLong = long.clone();

            return { long, lat, up };
        }

        function fitCameraKeyframes() {
            if (!visualBox) return;

            const sphere = visualBox.getBoundingSphere(new THREE.Sphere());
            const r = Math.max(sphere.radius, 1e-6);
            const dist = (r / Math.sin(THREE.MathUtils.degToRad(camera.fov) / 2)) * 1.18;

            const { long, lat, up } = getCarAxes();
            camera.up.copy(up);

            camSide = centerV.clone().addScaledVector(lat, dist * sideSign).addScaledVector(up, r * 0.12);
            camTopA = centerV.clone().addScaledVector(up, dist * 1.22);
            camTopB = centerV
                .clone()
                .addScaledVector(up, dist * 1.34)
                .addScaledVector(long, dist * 0.06)
                .addScaledVector(lat, dist * 0.03 * sideSign);
        }

        function rebuildDerived() {
            if (!root) return;

            root.updateWorldMatrix(true, true);

            rawBox = new THREE.Box3().setFromObject(root);
            visualBox = computeTrimmedVisualBox(root);

            // copy "real y"
            visualBox.min.y = rawBox.min.y;
            visualBox.max.y = rawBox.max.y;

            centerV = visualBox.getCenter(centerV);
            extV = visualBox.getSize(extV);

            upIdx = 1;

            const xz = [
                { idx: 0, len: extV.x },
                { idx: 2, len: extV.z },
            ].sort((a, b) => b.len - a.len);

            longIdx = xz[0].idx;
            latIdx = xz[1].idx;

            grid.position.y = rawBox.min.y;

            const sphere = visualBox.getBoundingSphere(new THREE.Sphere());
            const r = Math.max(sphere.radius, 1e-6);
            const dist = (r / Math.sin(THREE.MathUtils.degToRad(camera.fov) / 2)) * 1.15;

            camera.near = Math.max(0.01, dist / 200);
            camera.far = dist * 60;
            camera.updateProjectionMatrix();

            lookAt.copy(centerV);

            fitCameraKeyframes();

            const rad = 0.62 * Math.max(extV.getComponent(latIdx), extV.getComponent(longIdx));
            rebuildMgmtRing(rad, rawBox.min.y);
        }

        // ===== WHEEL DETECTION (ONE SHOT) =====
        function buildWheelData(): WheelData | null {
            if (!root || !visualBox) return null;
            const detected = detectWheelsFromGLB(root);
            if (!detected) return estimateWheelsFromBox();
            return detected.result;
        }

        function detectWheelsFromGLB(obj: THREE.Object3D): { result: WheelData } | null {
            const modelBox = new THREE.Box3().setFromObject(obj);
            const modelSize = modelBox.getSize(new THREE.Vector3());
            const modelMax = Math.max(modelSize.x, modelSize.y, modelSize.z);
            const groundY = modelBox.min.y;

            const latSpan = extV.getComponent(latIdx) || modelSize.getComponent(latIdx) || modelMax;
            const longSpan = extV.getComponent(longIdx) || modelSize.getComponent(longIdx) || modelMax;

            type Cand = { mesh: THREE.Mesh; score: number; centerW: THREE.Vector3; centerL: THREE.Vector3 };
            const candidates: Cand[] = [];

            const tmpBox = new THREE.Box3();
            const tmpC = new THREE.Vector3();
            const tmpS = new THREE.Vector3();

            obj.updateWorldMatrix(true, true);

            obj.traverse((o) => {
                if (!(o instanceof THREE.Mesh)) return;

                tmpBox.setFromObject(o);
                tmpBox.getCenter(tmpC);
                tmpBox.getSize(tmpS);

                const dims = [tmpS.x, tmpS.y, tmpS.z].sort((a, b) => b - a);
                const a = dims[0],
                    b = dims[1],
                    c = dims[2];
                if (!isFinite(a) || !isFinite(b) || !isFinite(c) || a <= 0 || b <= 0 || c <= 0) return;

                const diameter = (a + b) * 0.5;
                if (diameter < modelMax * 0.02 || diameter > modelMax * 0.4) return;

                const ratio = c > 0 ? b / c : 0;
                const ratio2 = c > 0 ? a / c : 0;
                const ab = a / b;

                const gDist = Math.max(0, tmpBox.min.y - groundY);
                const gScale = Math.max(1e-6, modelSize.y * 0.18 + modelMax * 0.02);
                const groundScore = Math.exp(-gDist / gScale);

                const cLocal = obj.worldToLocal(tmpC.clone());
                const latAbs = Math.abs(cLocal.getComponent(latIdx));
                const latNorm = latAbs / Math.max(1e-6, latSpan * 0.5);
                const latScore = smoothstep01(0.35, 0.95, latNorm);

                const cylScore = clamp01((ratio - 2.2) / 4.2) * clamp01((ratio2 - 2.6) / 5.0);
                const roundScore = 1.0 - clamp01(Math.abs(ab - 1.0) / 0.65);

                const name = (o.name || "").toLowerCase();
                const nameBoost =
                    name.includes("wheel") || name.includes("tire") || name.includes("tyre") || name.includes("rim") ? 0.18 : 0;

                const score =
                    0.42 * (cylScore * 0.65 + roundScore * 0.35) +
                    0.24 * groundScore +
                    0.22 * latScore +
                    0.12 * clamp01(diameter / (modelMax * 0.16));

                if (score < 0.33) return;

                candidates.push({
                    mesh: o,
                    score: score + nameBoost,
                    centerW: tmpC.clone(),
                    centerL: cLocal,
                });
            });

            candidates.sort((a, b) => b.score - a.score);
            if (candidates.length < 4) return null;

            const left = candidates.filter((c) => c.centerL.getComponent(latIdx) > 0);
            const right = candidates.filter((c) => c.centerL.getComponent(latIdx) < 0);
            if (left.length < 2 || right.length < 2) return null;

            const longs = candidates.map((c) => c.centerL.getComponent(longIdx)).sort((a, b) => a - b);
            const q = (t: number) => longs[Math.floor(clamp01(t) * (longs.length - 1))];
            const frontRef = q(0.15);
            const rearRef = q(0.85);

            const pickNear = (list: Cand[], ref: number) => {
                let best: Cand | null = null;
                let bestCost = Infinity;
                for (const c of list.slice(0, 40)) {
                    const d = Math.abs(c.centerL.getComponent(longIdx) - ref);
                    const cost = d * (1.0 / Math.max(0.15, c.score));
                    if (cost < bestCost) {
                        bestCost = cost;
                        best = c;
                    }
                }
                return best;
            };

            const Lf = pickNear(left, frontRef);
            const Lr = pickNear(left, rearRef);
            const Rf = pickNear(right, frontRef);
            const Rr = pickNear(right, rearRef);
            if (!Lf || !Lr || !Rf || !Rr) return null;

            const assignSide = (frontCand: Cand, rearCand: Cand) => {
                const a = frontCand.centerL.getComponent(longIdx);
                const b = rearCand.centerL.getComponent(longIdx);
                if (rearIsMax) return a <= b ? { front: frontCand, rear: rearCand } : { front: rearCand, rear: frontCand };
                return a >= b ? { front: frontCand, rear: rearCand } : { front: rearCand, rear: frontCand };
            };

            const L = assignSide(Lf, Lr);
            const R = assignSide(Rf, Rr);

            const frontMid = L.front.centerW.clone().add(R.front.centerW).multiplyScalar(0.5);
            const rearMid = L.rear.centerW.clone().add(R.rear.centerW).multiplyScalar(0.5);

            const longAxis = axisVec(longIdx, 1);
            const wb = Math.abs(rearMid.clone().sub(frontMid).dot(longAxis));
            if (!isFinite(wb) || wb < longSpan * 0.25) return null;

            const trackF = L.front.centerW.distanceTo(R.front.centerW);
            const trackR = L.rear.centerW.distanceTo(R.rear.centerW);

            return {
                result: {
                    FL: L.front.centerW.clone(),
                    FR: R.front.centerW.clone(),
                    RL: L.rear.centerW.clone(),
                    RR: R.rear.centerW.clone(),
                    frontAxleMid: frontMid,
                    rearAxleMid: rearMid,
                    wheelbase: wb,
                    trackWidthF: trackF,
                    trackWidthR: trackR,
                },
            };
        }

        function estimateWheelsFromBox(): WheelData {
            if (!visualBox) {
                const z = new THREE.Vector3();
                return {
                    FL: z.clone(),
                    FR: z.clone(),
                    RL: z.clone(),
                    RR: z.clone(),
                    frontAxleMid: z.clone(),
                    rearAxleMid: z.clone(),
                    wheelbase: 1,
                    trackWidthF: 1,
                    trackWidthR: 1,
                };
            }

            const long = axisVec(longIdx, 1);
            const lat = axisVec(latIdx, 1);

            const L = extV.getComponent(longIdx);
            const Ww = extV.getComponent(latIdx);
            const Hh = extV.y;

            const minL = visualBox.min.getComponent(longIdx);
            const maxL = visualBox.max.getComponent(longIdx);

            const frontL = rearIsMax ? minL : maxL;
            const rearL = rearIsMax ? maxL : minL;

            const frontAx = frontL + (rearIsMax ? +0.11 * L : -0.11 * L);
            const rearAx = rearL + (rearIsMax ? -0.11 * L : +0.11 * L);

            const y = visualBox.min.y + 0.24 * Hh;
            const off = 0.36 * Ww;

            const frontMid = centerV.clone();
            frontMid.setComponent(longIdx, frontAx);
            frontMid.y = y;

            const rearMid = centerV.clone();
            rearMid.setComponent(longIdx, rearAx);
            rearMid.y = y;

            const FL = frontMid.clone().addScaledVector(lat, +off);
            const FR = frontMid.clone().addScaledVector(lat, -off);
            const RL = rearMid.clone().addScaledVector(lat, +off);
            const RR = rearMid.clone().addScaledVector(lat, -off);

            const wb = Math.abs(rearMid.clone().sub(frontMid).dot(long));
            const trackF = FL.distanceTo(FR);
            const trackR = RL.distanceTo(RR);

            return { FL, FR, RL, RR, frontAxleMid: frontMid, rearAxleMid: rearMid, wheelbase: wb, trackWidthF: trackF, trackWidthR: trackR };
        }

        // ===== OVERLAY HELPERS (match index) =====
        const projectToScreen = (v3: THREE.Vector3) => {
            const v = v3.clone().project(camera);
            return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H };
        };

        const rectFromBox = (box: THREE.Box3) => {
            const min = box.min,
                max = box.max;
            const corners: { x: number; y: number }[] = [];
            for (const dx of [min.x, max.x]) {
                for (const dy of [min.y, max.y]) {
                    for (const dz of [min.z, max.z]) corners.push(projectToScreen(new THREE.Vector3(dx, dy, dz)));
                }
            }
            let minX = Infinity,
                minY = Infinity,
                maxX = -Infinity,
                maxY = -Infinity;
            for (const p of corners) {
                minX = Math.min(minX, p.x);
                minY = Math.min(minY, p.y);
                maxX = Math.max(maxX, p.x);
                maxY = Math.max(maxY, p.y);
            }
            return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
        };

        const getMasterBoxPos = () => {
            if (!visualBox) return { bx: 18, by: 18 };
            const full = rectFromBox(visualBox);
            const shiftLeft = 70;
            const yAbove = 64;
            const bx = Math.max(18, Math.min(W - 420, full.x + full.w * 0.1 - shiftLeft));
            const by = Math.max(18, full.y - yAbove);
            return { bx, by };
        };

        const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
            const rr = Math.min(r, w / 2, h / 2);
            ctx.beginPath();
            ctx.moveTo(x + rr, y);
            ctx.arcTo(x + w, y, x + w, y + h, rr);
            ctx.arcTo(x + w, y + h, x, y + h, rr);
            ctx.arcTo(x, y + h, x, y, rr);
            ctx.arcTo(x, y, x + w, y, rr);
            ctx.closePath();
        };

        const drawLabelBoxSimple = (label: string, x: number, y: number, color: string, alpha: number) => {
            if (alpha <= 0.001) return { x, y, w: 0, h: 0 };

            ctx.save();
            ctx.globalAlpha = alpha;

            ctx.font = "800 14px system-ui";
            const padX = 16;
            const tw = ctx.measureText(label).width;
            const w = tw + padX * 2;
            const h = 34;

            ctx.fillStyle = "rgba(11,13,16,.78)";
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.6;

            drawRoundedRect(x, y, w, h, 14);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = color;
            ctx.globalAlpha = alpha * 0.96;
            ctx.fillText(label, x + padX, y + 22);

            ctx.restore();
            return { x, y, w, h };
        };

        const drawLeaderPartial = (a: { x: number; y: number }, b: { x: number; y: number }, color: string, alpha: number, t: number) => {
            if (alpha <= 0.001) return;
            const tt = ease(clamp01(t));
            const x = a.x + (b.x - a.x) * tt;
            const y = a.y + (b.y - a.y) * tt;

            ctx.save();
            ctx.globalAlpha = alpha;

            ctx.strokeStyle = color;
            ctx.lineWidth = 1.8;
            ctx.setLineDash([7, 7]);
            ctx.lineDashOffset = -performance.now() * 0.03;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(x, y);
            ctx.stroke();

            ctx.setLineDash([]);
            ctx.globalAlpha = alpha * (0.35 + 0.65 * tt);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 2.8, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        };

        const drawDashGlowLine = (a: { x: number; y: number }, b: { x: number; y: number }, color: string, alpha: number, w = 4, dash: number[] = [10, 7], speed = 0.04) => {
            if (alpha <= 0.001) return;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = color;
            ctx.lineWidth = w;
            ctx.lineCap = "round";
            ctx.setLineDash(dash);
            ctx.lineDashOffset = -performance.now() * speed;

            ctx.shadowColor = color;
            ctx.shadowBlur = 14;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();

            ctx.shadowBlur = 0;
            ctx.globalAlpha = alpha * 0.88;
            ctx.lineWidth = Math.max(2, w - 1.6);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();

            ctx.restore();
        };

        const drawNode = (p: { x: number; y: number }, color: string, alpha: number, r = 4.3) => {
            if (alpha <= 0.001) return;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        };

        const boxSpanAlongAxis = (box: THREE.Box3, axis: THREE.Vector3) => {
            const min = box.min,
                max = box.max;
            let mn = Infinity,
                mx = -Infinity;
            const v = new THREE.Vector3();
            for (const dx of [min.x, max.x]) {
                for (const dy of [min.y, max.y]) {
                    for (const dz of [min.z, max.z]) {
                        v.set(dx, dy, dz);
                        const d = v.dot(axis);
                        if (d < mn) mn = d;
                        if (d > mx) mx = d;
                    }
                }
            }
            return { mn, mx, span: mx - mn };
        };

        // ===== STAGES DRAW (ported as-is) =====
        const drawAeroSpoilerLeaders = (alphaStage: number, tStage: number) => {
            if (alphaStage <= 0.001 || !visualBox) return;

            const C = getCss("--cyan") || "#00d4ff";

            const bodyT = clamp01(tStage);
            const boxT = ease(clamp01((bodyT - 0.06) / 0.22));
            const a = alphaStage * (0.3 + 0.7 * boxT);

            const { bx, by } = getMasterBoxPos();
            const rect = drawLabelBoxSimple("AERODINAMICA", bx, by, C, alphaStage * boxT);

            const { long, lat } = getCarAxes();
            const axLong = long.clone().normalize();
            const axLat = lat.clone().normalize();

            const spanL = boxSpanAlongAxis(visualBox, axLong);
            const spanW = boxSpanAlongAxis(visualBox, axLat);

            const cD = centerV.dot(axLong);
            const frontOff = (spanL.mx - cD) * 0.98;
            const rearOff = (spanL.mn - cD) * 0.98;
            const Ww = spanW.span;

            const y0 = visualBox.min.y;
            const Hh = extV.y;

            const anchorsW = [
                centerV.clone().addScaledVector(axLong, frontOff).addScaledVector(axLat, +0.18 * Ww),
                centerV.clone().addScaledVector(axLong, rearOff).addScaledVector(axLat, -0.18 * Ww),
            ];
            anchorsW[0].y = y0 + Hh * 0.16;
            anchorsW[1].y = y0 + Hh * 0.78;

            const attaches = [
                { x: rect.x, y: rect.y + rect.h * 0.48 },
                { x: rect.x + rect.w, y: rect.y + rect.h * 0.74 },
            ];

            const starts = [0.12, 0.28];
            const dur = 0.34;

            for (let i = 0; i < 2; i++) {
                const tLine = clamp01((bodyT - starts[i]) / dur);
                const aW = projectToScreen(anchorsW[i]);
                const b = attaches[i];

                const nodeT = ease(clamp01((bodyT - (starts[i] - 0.06)) / 0.18));
                drawNode(aW, C, a * nodeT, 4.2);
                drawLeaderPartial(aW, b, C, a * (0.35 + 0.65 * tLine), tLine);
            }
        };

        const drawMotorBlock2D = (center: { x: number; y: number }, color: string, alpha: number) => {
            if (alpha <= 0.001) return;
            const w = 58,
                h = 22;
            const x = center.x - w / 2;
            const y = center.y - h / 2;

            ctx.save();
            ctx.globalAlpha = 0.92 * alpha;
            ctx.strokeStyle = color;
            ctx.fillStyle = "rgba(42,163,255,.06)";
            ctx.lineWidth = 1.7;
            ctx.setLineDash([7, 6]);

            drawRoundedRect(x, y, w, h, 12);
            ctx.fill();
            ctx.stroke();

            ctx.setLineDash([]);
            ctx.globalAlpha = 0.55 * alpha;
            ctx.beginPath();
            ctx.moveTo(x + 10, y + 7);
            ctx.lineTo(x + w - 10, y + 7);
            ctx.moveTo(x + 10, y + h - 7);
            ctx.lineTo(x + w - 10, y + h - 7);
            ctx.stroke();

            ctx.restore();
        };

        const drawSteeringWheel2D = (center: { x: number; y: number }, color: string, alpha: number) => {
            if (alpha <= 0.001) return;
            ctx.save();
            ctx.globalAlpha = 0.92 * alpha;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;

            ctx.shadowColor = color;
            ctx.shadowBlur = 12;

            ctx.beginPath();
            ctx.arc(center.x, center.y, 11, 0, Math.PI * 2);
            ctx.stroke();

            ctx.shadowBlur = 0;
            ctx.globalAlpha = 0.62 * alpha;
            ctx.beginPath();
            ctx.arc(center.x, center.y, 4, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
        };

        const drawGlowLine = (a: { x: number; y: number }, b: { x: number; y: number }, color: string, alpha: number, w = 4) => {
            if (alpha <= 0.001) return;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.lineWidth = w;
            ctx.lineCap = "round";
            ctx.strokeStyle = color;

            ctx.shadowColor = color;
            ctx.shadowBlur = 14;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();

            ctx.shadowBlur = 0;
            ctx.globalAlpha = alpha * 0.88;
            ctx.lineWidth = Math.max(2, w - 1.6);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();

            ctx.restore();
        };

        const drawDashedRing = (p: { x: number; y: number }, r: number, color: string, alpha: number, w = 2.4, dash: number[] = [7, 6], speed = 0.05) => {
            if (alpha <= 0.001) return;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = color;
            ctx.lineWidth = w;
            ctx.setLineDash(dash);
            ctx.lineDashOffset = -performance.now() * speed;
            ctx.shadowColor = color;
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        };

        const drawTractionAndSteering = (alpha: number) => {
            if (alpha <= 0.001 || !wheelData) return;

            const C = getCss("--blue") || "#2aa3ff";
            const a = 0.98 * alpha;

            const FL = projectToScreen(wheelData.FL);
            const FR = projectToScreen(wheelData.FR);
            const RL = projectToScreen(wheelData.RL);
            const RR = projectToScreen(wheelData.RR);

            const frontMidW = wheelData.frontAxleMid;
            const rearMidW = wheelData.rearAxleMid;

            const frontMid = projectToScreen(frontMidW);
            const rearMid = projectToScreen(rearMidW);

            const longAxis = axisVec(longIdx, 1);
            const latAxis = axisVec(latIdx, 1);
            const upAxis = new THREE.Vector3(0, 1, 0);

            const wb = Math.max(1e-6, wheelData.wheelbase);
            const trackR = Math.max(1e-6, wheelData.trackWidthR);
            const trackF = Math.max(1e-6, wheelData.trackWidthF);

            const tailSign = rearIsMax ? +1 : -1;

            const diffW = rearMidW.clone().addScaledVector(longAxis, tailSign * (0.06 * wb));
            const diff = projectToScreen(diffW);

            const motorBaseW = rearMidW.clone().addScaledVector(longAxis, tailSign * (-0.08 * wb));
            const mL_W = motorBaseW.clone().addScaledVector(latAxis, +0.24 * trackR);
            const mR_W = motorBaseW.clone().addScaledVector(latAxis, -0.24 * trackR);
            const mL = projectToScreen(mL_W);
            const mR = projectToScreen(mR_W);

            const rackMidW = frontMidW.clone().addScaledVector(longAxis, tailSign * (0.04 * wb));
            const rackL_W = rackMidW.clone().addScaledVector(latAxis, +0.34 * trackF);
            const rackR_W = rackMidW.clone().addScaledVector(latAxis, -0.34 * trackF);
            const rackMid = projectToScreen(rackMidW);
            const rackL = projectToScreen(rackL_W);
            const rackR = projectToScreen(rackR_W);

            const steerW = frontMidW
                .clone()
                .addScaledVector(longAxis, tailSign * (0.55 * wb))
                .addScaledVector(upAxis, Math.max(0.02, extV.y * 0.22));
            const steer = projectToScreen(steerW);

            drawGlowLine(FL, FR, C, a * 0.7, 4);
            drawGlowLine(RL, RR, C, a * 0.98, 5);

            drawNode(diff, C, a, 4.6);
            drawGlowLine(diff, RL, C, a * 0.95, 5);
            drawGlowLine(diff, RR, C, a * 0.95, 5);

            drawMotorBlock2D(mL, C, a * 0.95);
            drawMotorBlock2D(mR, C, a * 0.95);
            drawGlowLine(mL, diff, C, a * 0.68, 4);
            drawGlowLine(mR, diff, C, a * 0.68, 4);

            drawSteeringWheel2D(steer, C, a * 0.9);
            drawGlowLine(steer, rackMid, C, a * 0.68, 4);
            drawGlowLine(rackL, rackR, C, a * 0.82, 4);
            drawGlowLine(rackL, FL, C, a * 0.7, 4);
            drawGlowLine(rackR, FR, C, a * 0.7, 4);

            drawGlowLine(frontMid, rearMid, "rgba(42,163,255,.55)", a * 0.28, 3);
        };

        const drawComputerBox2D = (p: { x: number; y: number }, color: string, alpha: number) => {
            if (alpha <= 0.001) return;
            const w = 62,
                h = 30;
            const x = p.x - w / 2,
                y = p.y - h / 2;

            ctx.save();
            ctx.globalAlpha = 0.92 * alpha;
            ctx.strokeStyle = color;
            ctx.fillStyle = "rgba(11,13,16,.72)";
            ctx.lineWidth = 1.8;

            drawRoundedRect(x, y, w, h, 10);
            ctx.fill();
            ctx.shadowColor = color;
            ctx.shadowBlur = 16;
            ctx.stroke();

            ctx.shadowBlur = 0;
            ctx.globalAlpha = 0.35 * alpha;
            ctx.beginPath();
            for (let i = 6; i < h - 4; i += 5) {
                ctx.moveTo(x + 8, y + i);
                ctx.lineTo(x + w - 8, y + i);
            }
            ctx.stroke();

            ctx.globalAlpha = 0.7 * alpha;
            const blink = 0.5 + 0.5 * Math.sin(performance.now() * 0.01);
            ctx.fillStyle = color;
            ctx.fillRect(x + 10, y + h - 10, 10 + 12 * blink, 2);

            ctx.restore();
        };

        const drawCornerTicks = (alpha: number, color: string) => {
            if (alpha <= 0.001) return;
            const pad = 26;
            const len = 22;

            ctx.save();
            ctx.globalAlpha = 0.55 * alpha;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 7]);
            ctx.lineDashOffset = -performance.now() * 0.03;

            ctx.beginPath();
            ctx.moveTo(pad, pad + len);
            ctx.lineTo(pad, pad);
            ctx.lineTo(pad + len, pad);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(W - pad - len, pad);
            ctx.lineTo(W - pad, pad);
            ctx.lineTo(W - pad, pad + len);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(pad, H - pad - len);
            ctx.lineTo(pad, H - pad);
            ctx.lineTo(pad + len, H - pad);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(W - pad - len, H - pad);
            ctx.lineTo(W - pad, H - pad);
            ctx.lineTo(W - pad, H - pad - len);
            ctx.stroke();

            ctx.restore();
        };

        const drawPacketDotsOnSegment = (a: { x: number; y: number }, b: { x: number; y: number }, color: string, alpha: number, phase: number, spacing = 22, r = 2.0) => {
            if (alpha <= 0.001) return;
            const dx = b.x - a.x,
                dy = b.y - a.y;
            const L = Math.hypot(dx, dy);
            if (L < 1e-3) return;

            const ux = dx / L,
                uy = dy / L;
            const t0 = ((phase % 1) + 1) % 1;
            const start = t0 * spacing;

            ctx.save();
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.globalAlpha = alpha;

            for (let d = start; d < L; d += spacing) {
                const x = a.x + ux * d;
                const y = a.y + uy * d;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        };

        const drawPacketLine = (a: { x: number; y: number }, b: { x: number; y: number }, color: string, alpha: number, progress = 1) => {
            if (alpha <= 0.001) return;

            const tt = ease(clamp01(progress));
            const p = { x: a.x + (b.x - a.x) * tt, y: a.y + (b.y - a.y) * tt };

            ctx.save();
            ctx.globalAlpha = alpha * 0.75;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.8;
            ctx.setLineDash([8, 7]);
            ctx.lineDashOffset = -performance.now() * 0.06;
            ctx.shadowColor = color;
            ctx.shadowBlur = 12;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            ctx.restore();

            if (tt > 0.35) {
                const phase = performance.now() * 0.0018;
                drawPacketDotsOnSegment(a, p, color, alpha * 0.85, phase);
            }
        };

        const drawPacketLPath = (a: { x: number; y: number }, b: { x: number; y: number }, color: string, alpha: number, progress = 1) => {
            if (alpha <= 0.001) return;
            const mid = { x: (a.x + b.x) * 0.5, y: a.y };

            const tt = ease(clamp01(progress));
            const t1 = clamp01(tt / 0.55);
            const t2 = clamp01((tt - 0.55) / 0.45);

            drawPacketLine(a, mid, color, alpha, t1);
            drawPacketLine(mid, b, color, alpha, t2);

            if (tt > 0.95) drawNode(b, color, alpha, 3.8);
        };

        const drawAeroStage = (alpha: number, t: number) => {
            if (alpha <= 0.001 || !visualBox) return;
            const C = getCss("--cyan") || "#00d4ff";

            const { long, lat } = getCarAxes();
            const axLong = long.clone().normalize();
            const axLat = lat.clone().normalize();

            const spanL = boxSpanAlongAxis(visualBox, axLong);
            const spanW = boxSpanAlongAxis(visualBox, axLat);

            const cD = centerV.dot(axLong);
            const offMin = (spanL.mn - cD) * 0.98;
            const offMax = (spanL.mx - cD) * 0.98;

            const p0 = centerV.clone().addScaledVector(axLong, offMin);
            const p1 = centerV.clone().addScaledVector(axLong, offMax);

            const track = wheelData ? Math.min(wheelData.trackWidthF, wheelData.trackWidthR) : spanW.span;
            const latOff = Math.max(1e-6, 0.155 * track);

            const A0 = projectToScreen(p0.clone().addScaledVector(axLat, +latOff));
            const A1 = projectToScreen(p1.clone().addScaledVector(axLat, +latOff));
            const B0 = projectToScreen(p0.clone().addScaledVector(axLat, -latOff));
            const B1 = projectToScreen(p1.clone().addScaledVector(axLat, -latOff));

            drawDashGlowLine(A0, A1, C, 0.75 * alpha, 4);
            drawDashGlowLine(B0, B1, C, 0.75 * alpha, 4);

            drawAeroSpoilerLeaders(alpha, t);
        };

        const drawDynamicsStage = (alpha: number, t: number) => {
            if (alpha <= 0.001 || !wheelData) return;
            const C = "#ffb84a";

            const tW1 = ease(clamp01((t - 0.05) / 0.3));
            const tW2 = ease(clamp01((t - 0.18) / 0.3));
            const tCh = ease(clamp01((t - 0.4) / 0.4));
            const tLbl = ease(clamp01((t - 0.62) / 0.28));

            const FL = projectToScreen(wheelData.FL);
            const FR = projectToScreen(wheelData.FR);
            const RL = projectToScreen(wheelData.RL);
            const RR = projectToScreen(wheelData.RR);

            const r = 18;
            drawDashedRing(FL, r, C, alpha * tW1, 2.5, [8, 7], 0.07);
            drawDashedRing(FR, r, C, alpha * tW1, 2.5, [8, 7], 0.07);
            drawNode(FL, C, alpha * tW1, 4.0);
            drawNode(FR, C, alpha * tW1, 4.0);

            drawDashedRing(RL, r, C, alpha * tW2, 2.5, [8, 7], 0.07);
            drawDashedRing(RR, r, C, alpha * tW2, 2.5, [8, 7], 0.07);
            drawNode(RL, C, alpha * tW2, 4.0);
            drawNode(RR, C, alpha * tW2, 4.0);

            const { long, up } = getCarAxes();
            const axLong = long.clone().normalize();
            const wb = Math.max(1e-6, wheelData.wheelbase);

            const frontBase = wheelData.frontAxleMid.clone().addScaledVector(axLong, -0.05 * wb);
            const rearBase = wheelData.rearAxleMid.clone().addScaledVector(axLong, +0.05 * wb);

            const chassisCenterW = frontBase
                .clone()
                .add(rearBase)
                .multiplyScalar(0.5)
                .addScaledVector(up, Math.max(0.02, extV.y * 0.18));

            const chassisCenter = projectToScreen(chassisCenterW);
            drawDashedRing(chassisCenter, 16, C, alpha * tCh, 2.6, [10, 7], 0.06);
            drawNode(chassisCenter, C, alpha * tCh, 4.2);

            const { bx, by } = getMasterBoxPos();
            const rect = drawLabelBoxSimple("DINAMICA / MECCANICA (RUOTE + TELAIO)", bx, by, C, alpha * tLbl);
            const attach = { x: rect.x + rect.w, y: rect.y + rect.h * 0.62 };
            drawLeaderPartial(attach, chassisCenter, C, alpha * tLbl * 0.9, tLbl);
        };

        const drawTractionStage = (alpha: number) => {
            if (alpha <= 0.001 || !visualBox) return;

            const L = extV.getComponent(longIdx);
            const minL = visualBox.min.getComponent(longIdx);
            const maxL = visualBox.max.getComponent(longIdx);
            const rearL = rearIsMax ? maxL : minL;
            const inward = (rearIsMax ? -1 : 1) * (0.28 * L);
            const rearBox = visualBox.clone();
            if (rearIsMax) rearBox.min.setComponent(longIdx, rearL + inward);
            else rearBox.max.setComponent(longIdx, rearL - inward);
            const rearRect = rectFromBox(rearBox);

            ctx.save();
            ctx.globalAlpha = 0.2 * alpha;
            ctx.fillStyle = "rgba(255,43,74,.06)";
            ctx.strokeStyle = "rgba(255,43,74,.92)";
            ctx.lineWidth = 2.0;
            ctx.setLineDash([10, 6]);
            drawRoundedRect(rearRect.x, rearRect.y, rearRect.w, rearRect.h, 18);
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            drawTractionAndSteering(alpha);

            if (wheelData) {
                const a = projectToScreen(wheelData.rearAxleMid);
                const { bx, by } = getMasterBoxPos();
                const rect = drawLabelBoxSimple("POWERTRAIN / CONTROLS", bx, by, "#ff2b4a", alpha);
                const attach = { x: rect.x, y: rect.y + rect.h * 0.62 };
                drawLeaderPartial(attach, a, "#ff2b4a", alpha * 0.9, 1);
            }
        };

        const drawTelemetryStage = (alpha: number, t: number) => {
            if (alpha <= 0.001 || !wheelData) return;
            const C = "#36ff8a";

            const { long, up } = getCarAxes();
            const axLong = long.clone().normalize();
            const wb = Math.max(1e-6, wheelData.wheelbase);

            const compW = wheelData.frontAxleMid
                .clone()
                .addScaledVector(axLong, +0.18 * wb)
                .addScaledVector(up, Math.max(0.02, extV.y * 0.18));
            const comp = projectToScreen(compW);

            const tComp = ease(clamp01((t - 0.04) / 0.22));
            const tNet = ease(clamp01((t - 0.18) / 0.55));
            const tLbl = ease(clamp01((t - 0.58) / 0.3));

            drawComputerBox2D(comp, C, alpha * tComp);

            const imuW = centerV.clone().addScaledVector(up, Math.max(0.02, extV.y * 0.22));
            const invW = wheelData.rearAxleMid.clone().addScaledVector(axLong, -0.1 * wb).addScaledVector(up, Math.max(0.02, extV.y * 0.12));
            const steerW = wheelData.frontAxleMid.clone().addScaledVector(axLong, -0.06 * wb).addScaledVector(up, Math.max(0.02, extV.y * 0.1));

            const targets = [
                { p: wheelData.FL, s: 0.0 },
                { p: wheelData.FR, s: 0.08 },
                { p: wheelData.RL, s: 0.16 },
                { p: wheelData.RR, s: 0.24 },
                { p: imuW, s: 0.34 },
                { p: invW, s: 0.44 },
                { p: steerW, s: 0.54 },
            ];

            for (const it of targets) {
                const prog = clamp01((tNet - it.s) / 0.46);
                if (prog <= 0.001) continue;
                const b = projectToScreen(it.p);
                drawPacketLPath(comp, b, C, alpha * (0.55 + 0.45 * prog), prog);
                const pulse = 0.55 + 0.45 * Math.sin(performance.now() * 0.01 + it.s * 12.3);
                drawNode(b, C, alpha * prog * 0.65 * pulse, 3.6);
            }

            const { bx, by } = getMasterBoxPos();
            const rect = drawLabelBoxSimple("CONTROL SYSTEM / TELEMETRY", bx, by, C, alpha * tLbl);
            const attach = { x: rect.x + rect.w, y: rect.y + rect.h * 0.55 };
            drawLeaderPartial(attach, comp, C, alpha * tLbl * 0.9, tLbl);
        };

        const drawManagementStage = (alpha: number) => {
            if (alpha <= 0.001) return;
            const C = getCss("--vio") || "#b18cff";
            drawCornerTicks(alpha, C);
            const { bx, by } = getMasterBoxPos();
            drawLabelBoxSimple("MANAGEMENT / OPERATIONS", bx, by, C, alpha);
        };

        const topSFromP = (pv: number) => clamp01((pv - cfg.CAM_SEG) / (1 - cfg.CAM_SEG));

        const plateau01 = (u: number, holdIn = cfg.HOLD_IN, holdOut = cfg.HOLD_OUT) => {
            if (u <= holdIn) return 0;
            if (u >= 1 - holdOut) return 1;
            const t = (u - holdIn) / (1 - holdIn - holdOut);
            return ease(clamp01(t));
        };

        const getStageInfo = (s: number) => {
            let idx = cfg.TOP_STAGES.length - 1;
            for (let i = 0; i < cfg.TOP_STAGES.length; i++) {
                if (s >= cfg.TOP_STAGES[i].s0 && s <= cfg.TOP_STAGES[i].s1) {
                    idx = i;
                    break;
                }
            }
            const st = cfg.TOP_STAGES[idx];
            const u = clamp01((s - st.s0) / Math.max(1e-6, st.s1 - st.s0));
            const t = plateau01(u);
            const center = (st.s0 + st.s1) * 0.5;
            return { idx, label: st.label, u, t, center };
        };

        const drawBlueprintOverlay = (pOverall: number) => {
            ctx.clearRect(0, 0, W, H);
            if (!visualBox) return;
            if (pOverall < cfg.CAM_SEG) return;

            const t = clamp01((pOverall - cfg.CAM_SEG) / (1 - cfg.CAM_SEG));
            if (t <= 0.0005) return;

            const st = getStageInfo(t);
            const TRAIL = 0.2;

            // micro grid
            ctx.save();
            ctx.globalAlpha = 0.07 * Math.min(1, t * 1.2);
            ctx.strokeStyle = "rgba(0,212,255,.22)";
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 12]);
            const step = 84;
            for (let x = 0; x <= W; x += step) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, H);
                ctx.stroke();
            }
            for (let y = 0; y <= H; y += step) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(W, y);
                ctx.stroke();
            }
            ctx.restore();

            const aCur = st.t;
            const aPrev = st.idx > 0 ? TRAIL * (1 - st.t) : 0;

            if (st.idx === 0) {
                drawAeroStage(aCur, st.t);
            } else if (st.idx === 1) {
                drawAeroStage(aPrev, 1);
                drawDynamicsStage(aCur, st.t);
            } else if (st.idx === 2) {
                drawDynamicsStage(aPrev, 1);
                drawTractionStage(aCur);
            } else if (st.idx === 3) {
                drawTractionStage(aPrev);
                drawTelemetryStage(aCur, st.t);
            } else {
                drawTelemetryStage(aPrev, 1);
                drawManagementStage(aCur);
            }
        };

        // ===== INPUT (index-like) =====
        const onWheel = (e: WheelEvent) => {
            if (!captureWheel) return;
            if (!enabledRef.current) return;
            if (!isLoaded) return;

            const EPS0 = 0.02;
            const EPS1 = 0.02;

            const atStart = p <= EPS0 && pGoal <= EPS0;

            // ✅ FINE: usa pGoal (molto più stabile del p col spring)
            const atEnd = pGoal >= 1 - EPS1 && p >= 0.92; // p può "laggare" dietro pGoal

            // ===== 1) A FINE: GIÙ -> lascia scorrere la pagina =====
            if (atEnd && e.deltaY > 0) {
                // (opzionale) trigger evento per aprire sezione sotto
                // window.dispatchEvent(new CustomEvent("fsc:gateComplete"));

                // IMPORTANTISSIMO: non bloccare
                // e "taglia" l'inerzia dell'engine così non continua a spingere
                goalV = 0;
                return;
            }

            // ===== 2) A 0%: SU -> lascia scorrere verso Team =====
            if (atStart && e.deltaY < 0) {
                onExitRef.current?.("up"); // opzionale
                return; // non bloccare
            }

            // ===== 3) TUTTO IL RESTO: blocca pagina e muovi engine (avanti o indietro) =====
            e.preventDefault();

            let dy = e.deltaY;
            if (e.deltaMode === 1) dy *= 16;
            if (e.deltaMode === 2) dy *= 320;
            dy = THREE.MathUtils.clamp(dy, -180, 180);

            goalV += dy * cfg.GOAL_IMPULSE;
            goalV = THREE.MathUtils.clamp(goalV, -cfg.GOAL_MAX, cfg.GOAL_MAX);
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (!captureKeys) return;
            if (!enabledRef.current) return;
            const k = e.key.toLowerCase();

            if (k === "0") {
                pGoal = 0;
                p = 0;
                pVel = 0;
                goalV = 0;
                completed = false;
            }
            if (k === "v") {
                sideSign *= -1;
                if (root) fitCameraKeyframes();
            }
            if (k === "r" && root) {
                rebuildDerived();
                wheelData = buildWheelData();
            }
        };

        window.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("keydown", onKeyDown);

        // ===== LOADING (auto-load modelUrl) =====
        const loader = new GLTFLoader();

        const setModel = (gltf: GLTF) => {
            isLoaded = false;

            if (root) {
                scene.remove(root);
                disposeObject3D(root);
            }

            root = gltf.scene ?? gltf.scenes?.[0] ?? null;
            if (!root) return;

            scene.add(root);

            root.traverse((o) => {
                if (!(o instanceof THREE.Mesh)) return;
                o.frustumCulled = false;

                const mat = o.material;
                o.material = Array.isArray(mat) ? mat.map((m) => m.clone()) : mat.clone();
            });

            normalizeUsingVisualCenterAndGround(root);
            rebuildDerived();
            wheelData = buildWheelData();
            fitCameraKeyframes();

            // reset scroll
            pGoal = 0;
            p = 0;
            pVel = 0;
            goalV = 0;
            completed = false; // ✅ ogni volta che carichi/resetti modello
            isLoaded = true;
        };

        loader.load(
            modelUrl,
            (gltf) => {
                if (disposed) return;
                setModel(gltf);
            },
            undefined,
            (err) => console.error(err)
        );

        // ===== LOOP =====
        let raf = 0;
        let lastT = performance.now();

        const tick = () => {
            raf = requestAnimationFrame(tick);

            const now = performance.now();
            let dt = (now - lastT) / 1000;
            lastT = now;
            dt = Math.min(0.033, Math.max(0.001, dt));
            if (!enabledRef.current) {
                // non accumulare nulla mentre la sezione non è in controllo
                goalV = 0;
                pVel = 0;
                pGoal = p; // blocca goal sul valore attuale
            }
            // brake on target
            goalV *= Math.pow(cfg.GOAL_FRICTION, dt * 60);
            if (Math.abs(goalV) < 1e-4) goalV = 0;
            pGoal = clamp01(pGoal + goalV * dt);

            // spring pGoal -> p
            const x = pGoal - p;
            const acc = cfg.SPRING_K * x - cfg.SPRING_C * pVel;
            pVel += acc * dt;
            p += pVel * dt;

            if (p <= 0) {
                p = 0;
                if (pVel < 0) pVel = 0;
            }
            if (p >= 1) {
                p = 1;
                if (pVel > 0) pVel = 0;
            }

            // update progress bar
            currentProgress = p;
            setProgressBarValue(p);

            // CAMERA
            if (visualBox) {
                if (p < cfg.CAM_SEG) {
                    const t = ease(clamp01(p / cfg.CAM_SEG));
                    camera.position.copy(camSide.clone().lerp(camTopA, t));
                } else {
                    const t = ease(clamp01((p - cfg.CAM_SEG) / (1 - cfg.CAM_SEG)));
                    camera.position.copy(camTopA.clone().lerp(camTopB, t));
                }

                // TOP orientation: muso sempre a sinistra (index behaviour) :contentReference[oaicite:3]{index=3}
                if (p >= cfg.CAM_SEG) {
                    const { long } = getCarAxes();
                    const d = lookAt.clone().sub(camera.position).normalize();
                    const desiredRight = long.clone().multiplyScalar(-1);
                    const upTop = new THREE.Vector3().crossVectors(desiredRight, d);
                    if (upTop.lengthSq() > 1e-8) camera.up.copy(upTop.normalize());
                    else camera.up.set(0, 0, 1);
                } else {
                    camera.up.set(0, 1, 0);
                }

                camera.lookAt(lookAt);
            }

            // management ring only in MANAGEMENT stage
            const sOverlay = topSFromP(p);
            const st = getStageInfo(sOverlay);
            let ringAlpha = 0;
            if (st.idx === 4) ringAlpha = st.t;
            if (st.idx === 4 && st.t < 0.2) ringAlpha = Math.max(ringAlpha, 0.15 * (1 - st.t));
            mgmtRing.visible = ringAlpha > 0.01;
            if (mgmtRing.visible) {
                (mgmtRing.material as THREE.MeshStandardMaterial).opacity = 0.35 * ringAlpha;
                mgmtRing.rotation.z += 0.0018;
            }
            // ✅ snap SOLO a riposo (non ti blocca la partenza)
            const SNAP_EPS = 0.002;

            const near0 = p < SNAP_EPS && pGoal < SNAP_EPS;
            const near1 = p > 1 - SNAP_EPS && pGoal > 1 - SNAP_EPS;

            const still = Math.abs(pVel) < 0.002 && Math.abs(goalV) < 0.002;

            if (still && near0) {
                p = 0; pGoal = 0; pVel = 0; goalV = 0;
            }
            if (still && near1) {
                p = 1; pGoal = 1; pVel = 0; goalV = 0;
            }
            drawBlueprintOverlay(p);
            renderer.render(scene, camera);
        };

        tick();

        // ===== RESIZE =====
        const onResize = () => {
            getSize();
            camera.aspect = W / H;
            camera.updateProjectionMatrix();
            renderer.setSize(W, H);
            resizeOverlay();
            if (root) fitCameraKeyframes();
        };
        window.addEventListener("resize", onResize);

        // ResizeObserver for container size changes (e.g., fullscreen)
        const resizeObserver = new ResizeObserver(onResize);
        resizeObserver.observe(wrap);

        // ===== CLEANUP =====
        return () => {
            disposed = true;

            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
            resizeObserver.disconnect();
            window.removeEventListener("wheel", onWheel as any);
            window.removeEventListener("keydown", onKeyDown as any);

            if (root) {
                scene.remove(root);
                disposeObject3D(root);
                root = null;
            }

            mgmtRing.geometry.dispose();
            disposeMaterial(mgmtRing.material as THREE.Material);
            scene.remove(mgmtRing);

            renderer.dispose();
            if (renderer.domElement.parentElement === glHost) glHost.removeChild(renderer.domElement);
        };
    }, [modelUrl, cfg, captureWheel, captureKeys]);

    return (
        <div
            ref={wrapRef}
            className={className}
            style={{
                position: "absolute",
                inset: 0,
                background: "#000000",
                overflow: "hidden",
                ...style,
            }}
        >
            <div ref={glHostRef} style={{ position: "absolute", inset: 0 }} />
            <canvas ref={overlayRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
            {showProgressBar && (
                <ProgressBar
                    stages={cfg.TOP_STAGES}
                    progress={progressBarValue}
                    onProgressChange={handleProgressChange}
                />
            )}
        </div>
    );
}