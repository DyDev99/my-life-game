"use client";

import React, { useEffect, useState, useMemo } from "react";
import { FBXLoader, SkeletonUtils } from "three-stdlib";
import * as THREE from "three";

// Shared in-memory cache for parsed FBX models so each file is only fetched and parsed once
const modelCache = new Map<string, THREE.Group>();
const loadingPromises = new Map<string, Promise<THREE.Group>>();

/**
 * Converts imported FBX materials into enhanced Physically Based Rendering (PBR)
 * MeshStandardMaterials with accurate roughness, metalness, and emissive properties.
 */
function enhanceMaterial(mat: THREE.Material): THREE.Material {
  const m = mat as THREE.MeshStandardMaterial;
  const name = (m.name || "").toLowerCase();
  const color = m.color ? m.color.clone() : new THREE.Color(0xcccccc);

  const std = new THREE.MeshStandardMaterial({
    color,
    name: m.name,
    roughness: 0.7,
    metalness: 0.05,
  });

  if (name.includes("gold") || name.includes("rope_gold")) {
    std.color = m.color ? m.color.clone() : new THREE.Color("#D4AF37");
    std.metalness = 0.82;
    std.roughness = 0.25;
  } else if (name.includes("metal") || name.includes("chrome") || name.includes("silver")) {
    std.metalness = 0.85;
    std.roughness = 0.25;
  } else if (name.includes("skin")) {
    std.roughness = 0.78;
    std.metalness = 0.0;
  } else if (name.includes("hair")) {
    std.roughness = 0.88;
    std.metalness = 0.05;
  } else if (name.includes("wrap") || name.includes("gauze") || name.includes("cloth")) {
    std.roughness = 0.85;
    std.metalness = 0.0;
  } else if (name.includes("roof") || name.includes("tile")) {
    std.roughness = 0.65;
    std.metalness = 0.05;
  } else if (name.includes("wood")) {
    std.roughness = 0.78;
    std.metalness = 0.02;
  } else if (name.includes("concrete") || name.includes("asphalt")) {
    std.roughness = 0.88;
    std.metalness = 0.05;
  } else if (name.includes("window") || name.includes("glass")) {
    std.roughness = 0.15;
    std.metalness = 0.3;
    std.transparent = true;
    std.opacity = 0.85;
  } else if (name.includes("water")) {
    std.roughness = 0.1;
    std.metalness = 0.1;
    std.transparent = true;
    std.opacity = 0.8;
  } else if (name.includes("light") || name.includes("lamp")) {
    std.emissive = color;
    std.emissiveIntensity = 0.8;
  }

  return std;
}

/**
 * Loads and caches an FBX model from a URL.
 */
export function loadFBX(url: string): Promise<THREE.Group> {
  if (modelCache.has(url)) {
    return Promise.resolve(modelCache.get(url)!);
  }
  if (loadingPromises.has(url)) {
    return loadingPromises.get(url)!;
  }

  const promise = new Promise<THREE.Group>((resolve, reject) => {
    const loader = new FBXLoader();
    loader.load(
      url,
      (fbx) => {
        fbx.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (Array.isArray(mesh.material)) {
              mesh.material = mesh.material.map(enhanceMaterial);
            } else if (mesh.material) {
              mesh.material = enhanceMaterial(mesh.material);
            }
          }
        });
        modelCache.set(url, fbx);
        resolve(fbx);
      },
      undefined,
      (err) => {
        console.warn(`Failed to load FBX model ${url}:`, err);
        reject(err);
      }
    );
  });

  loadingPromises.set(url, promise);
  return promise;
}

/**
 * Reusable React component that renders a cached 3D FBX model with position, rotation, and scale.
 */
export function FBXModel({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  fallback,
  onClick,
  onPointerOver,
  onPointerOut,
}: {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number] | number;
  fallback?: React.ReactNode;
  onClick?: (e: any) => void;
  onPointerOver?: (e: any) => void;
  onPointerOut?: (e: any) => void;
}) {
  const [model, setModel] = useState<THREE.Group | null>(null);

  useEffect(() => {
    let active = true;
    loadFBX(url)
      .then((loaded) => {
        if (active) {
          setModel(SkeletonUtils.clone(loaded) as THREE.Group);
        }
      })
      .catch(() => {
        // Fallback handles gracefully
      });
    return () => {
      active = false;
    };
  }, [url]);

  const scaleVec = useMemo(() => {
    if (typeof scale === "number") return [scale, scale, scale] as [number, number, number];
    return scale;
  }, [scale]);

  if (!model) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <primitive
      object={model}
      position={position}
      rotation={rotation}
      scale={scaleVec}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    />
  );
}
