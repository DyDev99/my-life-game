import * as THREE from "three";

// Shared night factor (0 day … 1 night) for lit windows and lamp heads.
export const nightUniform = { value: 0 };

/**
 * MeshStandardMaterial with procedural windows on vertical faces, computed from world
 * position so window size stays constant whatever the instance scale. Lit at night.
 */
export function makeWindowMaterial(spacingX: number, spacingY: number, roughness = 0.6) {
  const mat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness, metalness: 0.1 });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uWin = { value: new THREE.Vector2(spacingX, spacingY) };
    shader.uniforms.uNight = nightUniform;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vCityWorld;\nvarying vec3 vCityNormal;")
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        vec4 cityPos = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          cityPos = instanceMatrix * cityPos;
        #endif
        vCityWorld = (modelMatrix * cityPos).xyz;
        vCityNormal = objectNormal;`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vCityWorld;\nvarying vec3 vCityNormal;\nuniform vec2 uWin;\nuniform float uNight;"
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float citySide = step(abs(vCityNormal.y), 0.5);
        float cityAlong = abs(vCityNormal.x) > 0.5 ? vCityWorld.z : vCityWorld.x;
        vec2 cityCell = vec2(cityAlong / uWin.x, vCityWorld.y / uWin.y);
        vec2 cityF = fract(cityCell);
        float cityWin = citySide * step(0.18, cityF.x) * step(cityF.x, 0.82) * step(0.3, cityF.y) * step(cityF.y, 0.82) * step(1.0, cityCell.y);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.13, 0.19, 0.27), cityWin * 0.82);`
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        float cityLit = step(0.55, fract(sin(dot(floor(cityCell), vec2(12.9898, 78.233))) * 43758.5453));
        totalEmissiveRadiance += cityWin * cityLit * uNight * vec3(1.0, 0.8, 0.48) * 0.95;`
      );
  };
  // Distinct cache key so the patched program isn't shared with plain standard materials
  mat.customProgramCacheKey = () => "city-windows";
  return mat;
}
