/**
 * High-Performance 2D/3D World Collision, Continuous Collision Detection (CCD) & Navigation System
 * Provides GTA V / Unreal style solid world collision with swept continuous raycasting,
 * realistic wall-sliding response, surface elevation for bridges/ramps, and dynamic building destruction.
 */

import { CAUSEWAYS, CITY_BUILDINGS, CITY_LAMPS, CITY_TREES, RIVER, WORLD_BOUNDS } from "@/data/cityLayout";

export interface AABBCollider {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY?: number;
  maxY?: number;
  name?: string;
  isEntrance?: boolean;
  isDestructible?: boolean;
  isCollapsed?: boolean;
  originalBounds?: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    minY: number;
    maxY: number;
  };
}

export interface CircleCollider {
  id: string;
  cx: number;
  cz: number;
  radius: number;
  minY?: number;
  maxY?: number;
  name?: string;
}

export interface SweepResult {
  x: number;
  z: number;
  collided: boolean;
  hitObstacleId?: string;
  hitObstacleName?: string;
  normalX: number;
  normalZ: number;
  impactSpeedFraction: number; // 0 to 1, how directly perpendicular the hit was
  penetration: boolean;
}

// Registry of static and dynamic world colliders
class CollisionWorld {
  private boxes: AABBCollider[] = [];
  private circles: CircleCollider[] = [];

  public clear() {
    this.boxes = [];
    this.circles = [];
  }

  public addBox(
    id: string,
    cx: number,
    cz: number,
    width: number,
    depth: number,
    name?: string,
    minY = 0,
    maxY = 18.0,
    isDestructible = false
  ) {
    const halfW = width / 2;
    const halfD = depth / 2;
    const minX = cx - halfW;
    const maxX = cx + halfW;
    const minZ = cz - halfD;
    const maxZ = cz + halfD;

    this.boxes.push({
      id,
      minX,
      maxX,
      minZ,
      maxZ,
      minY,
      maxY,
      name,
      isDestructible,
      originalBounds: { minX, maxX, minZ, maxZ, minY, maxY },
    });
  }

  public addCircle(
    id: string,
    cx: number,
    cz: number,
    radius: number,
    name?: string,
    minY = 0,
    maxY = 12.0
  ) {
    this.circles.push({ id, cx, cz, radius, minY, maxY, name });
  }

  public remove(id: string) {
    this.boxes = this.boxes.filter((b) => b.id !== id);
    this.circles = this.circles.filter((c) => c.id !== id);
  }

  public getBoxes(): AABBCollider[] {
    return this.boxes;
  }

  public getCircles(): CircleCollider[] {
    return this.circles;
  }

  public setHomeDoorOpen(open: boolean) {
    if (open) {
      this.remove("player_home_door");
    } else {
      if (!this.boxes.some((b) => b.id === "player_home_door")) {
        this.addBox("player_home_door", -14, -16.6, 2.0, 0.5, "Player Home Closed Door", 0, 3.5);
      }
    }
  }

  /**
   * Dynamically adjusts a building's collision geometry when collapsed or repaired.
   * When collapsed, replaces the tall 18m obstacle with a low rubble pile (height 0.85m)
   * so vehicles and players cannot pass through the remaining physical rubble,
   * while clearing the high airspace above it.
   */
  public setBuildingCollapsed(buildingId: string, collapsed: boolean, rubbleSize?: [number, number, number]) {
    const box = this.boxes.find((b) => b.id === buildingId);
    if (!box) return;

    if (collapsed) {
      if (!box.originalBounds) {
        box.originalBounds = {
          minX: box.minX,
          maxX: box.maxX,
          minZ: box.minZ,
          maxZ: box.maxZ,
          minY: box.minY ?? 0,
          maxY: box.maxY ?? 18.0,
        };
      }
      box.isCollapsed = true;
      box.maxY = 0.85; // Low rubble height
      if (rubbleSize) {
        const cx = (box.originalBounds.minX + box.originalBounds.maxX) / 2;
        const cz = (box.originalBounds.minZ + box.originalBounds.maxZ) / 2;
        const halfW = rubbleSize[0] / 2;
        const halfD = rubbleSize[2] / 2;
        box.minX = cx - halfW;
        box.maxX = cx + halfW;
        box.minZ = cz - halfD;
        box.maxZ = cz + halfD;
      }
    } else {
      // Restore original bounds
      if (box.originalBounds) {
        box.minX = box.originalBounds.minX;
        box.maxX = box.originalBounds.maxX;
        box.minZ = box.originalBounds.minZ;
        box.maxZ = box.originalBounds.maxZ;
        box.minY = box.originalBounds.minY;
        box.maxY = box.originalBounds.maxY;
      }
      box.isCollapsed = false;
    }
  }

  /**
   * Resets all building colliders back to pristine intact state
   */
  public resetAllBuildingColliders() {
    for (const box of this.boxes) {
      if (box.originalBounds && box.isCollapsed) {
        box.minX = box.originalBounds.minX;
        box.maxX = box.originalBounds.maxX;
        box.minZ = box.originalBounds.minZ;
        box.maxZ = box.originalBounds.maxZ;
        box.minY = box.originalBounds.minY;
        box.maxY = box.originalBounds.maxY;
        box.isCollapsed = false;
      }
    }
  }

  /**
   * Fast 3D AABB Raycast against all registered building obstacles
   */
  public raycast(
    ox: number,
    oy: number,
    oz: number,
    dx: number,
    dy: number,
    dz: number,
    maxDistance: number = 200,
    ignoreBoxId?: string
  ): {
    hit: boolean;
    distance: number;
    point: [number, number, number];
    normal: [number, number, number];
    boxId: string;
    boxName?: string;
  } | null {
    let closestDist = maxDistance;
    let closestHit: {
      hit: boolean;
      distance: number;
      point: [number, number, number];
      normal: [number, number, number];
      boxId: string;
      boxName?: string;
    } | null = null;

    const len = Math.hypot(dx, dy, dz);
    if (len < 0.0001) return null;
    const ndx = dx / len;
    const ndy = dy / len;
    const ndz = dz / len;

    const invX = ndx !== 0 ? 1.0 / ndx : 1e12;
    const invY = ndy !== 0 ? 1.0 / ndy : 1e12;
    const invZ = ndz !== 0 ? 1.0 / ndz : 1e12;

    for (const box of this.boxes) {
      if (ignoreBoxId && box.id === ignoreBoxId) continue;

      const isLowWall =
        box.id.includes("wall") ||
        box.id.includes("rail") ||
        box.id.includes("edge") ||
        box.id.includes("chair") ||
        box.id.includes("stall");
      const boxMinY = box.minY ?? 0;
      const boxMaxY = box.maxY ?? (isLowWall ? 2.8 : 18.0);

      const t1x = (box.minX - ox) * invX;
      const t2x = (box.maxX - ox) * invX;
      const t1y = (boxMinY - oy) * invY;
      const t2y = (boxMaxY - oy) * invY;
      const t1z = (box.minZ - oz) * invZ;
      const t2z = (box.maxZ - oz) * invZ;

      const tNearX = Math.min(t1x, t2x);
      const tFarX = Math.max(t1x, t2x);
      const tNearY = Math.min(t1y, t2y);
      const tFarY = Math.max(t1y, t2y);
      const tNearZ = Math.min(t1z, t2z);
      const tFarZ = Math.max(t1z, t2z);

      const tNear = Math.max(tNearX, Math.max(tNearY, tNearZ));
      const tFar = Math.min(tFarX, Math.min(tFarY, tFarZ));

      if (tNear <= tFar && tFar > 0) {
        const hitDist = tNear > 0.01 ? tNear : tFar;
        if (hitDist > 0.01 && hitDist < closestDist) {
          closestDist = hitDist;

          let nx = 0;
          let ny = 0;
          let nz = 0;
          if (tNear === tNearX) nx = invX < 0 ? 1 : -1;
          else if (tNear === tNearY) ny = invY < 0 ? 1 : -1;
          else if (tNear === tNearZ) nz = invZ < 0 ? 1 : -1;

          closestHit = {
            hit: true,
            distance: hitDist,
            point: [ox + ndx * hitDist, oy + ndy * hitDist, oz + ndz * hitDist],
            normal: [nx, ny, nz],
            boxId: box.id,
            boxName: box.name,
          };
        }
      }
    }

    return closestHit;
  }

  /**
   * Resolves camera line-of-sight collision against walls and buildings.
   */
  public resolveCameraObstacle(
    playerX: number,
    playerY: number,
    playerZ: number,
    targetCamX: number,
    targetCamY: number,
    targetCamZ: number,
    padding: number = 0.35
  ): { x: number; y: number; z: number; obstructed: boolean } {
    const dirX = targetCamX - playerX;
    const dirY = targetCamY - playerY;
    const dirZ = targetCamZ - playerZ;
    const totalDist = Math.hypot(dirX, dirY, dirZ);

    if (totalDist < 0.1) {
      return { x: targetCamX, y: targetCamY, z: targetCamZ, obstructed: false };
    }

    const hit = this.raycast(playerX, playerY, playerZ, dirX, dirY, dirZ, totalDist);
    if (hit && hit.distance < totalDist) {
      const safeDist = Math.max(0.4, hit.distance - padding);
      const ratio = safeDist / totalDist;
      return {
        x: playerX + dirX * ratio,
        y: playerY + dirY * ratio,
        z: playerZ + dirZ * ratio,
        obstructed: true,
      };
    }

    return { x: targetCamX, y: targetCamY, z: targetCamZ, obstructed: false };
  }

  /**
   * Advanced Continuous Collision Detection (CCD) & Wall-Sliding Physics Solver
   * Performs swept raycast and Minkowski envelope testing to guarantee that high-speed
   * vehicles and characters NEVER tunnel through buildings, houses, or solid objects.
   */
  public sweepMove(
    fromX: number,
    fromZ: number,
    targetX: number,
    targetZ: number,
    radius: number = 0.5,
    maxSlides: number = 3
  ): SweepResult {
    let currX = fromX;
    let currZ = fromZ;
    let hasCollided = false;
    let firstObstacleId: string | undefined;
    let firstObstacleName: string | undefined;
    let primaryNormalX = 0;
    let primaryNormalZ = 0;
    let maxImpactSpeedFraction = 0;
    let hadPenetration = false;

    // Outer sliding iterations
    for (let iter = 0; iter < maxSlides; iter++) {
      let moveX = targetX - currX;
      let moveZ = targetZ - currZ;
      const moveDist = Math.hypot(moveX, moveZ);

      if (moveDist < 0.0001) break;

      let earliestT = 1.0;
      let contactNormalX = 0;
      let contactNormalZ = 0;
      let hitBox: AABBCollider | null = null;
      let hitCircle: CircleCollider | null = null;

      // -----------------------------------------------------------------------
      // 1. Check all AABB Box Colliders (Minkowski expanded by radius)
      // -----------------------------------------------------------------------
      for (const box of this.boxes) {
        const eMinX = box.minX - radius;
        const eMaxX = box.maxX + radius;
        const eMinZ = box.minZ - radius;
        const eMaxZ = box.maxZ + radius;

        // A. Immediate penetration check (e.g. if spawned inside or pushed)
        if (currX > eMinX && currX < eMaxX && currZ > eMinZ && currZ < eMaxZ) {
          hasCollided = true;
          hadPenetration = true;
          firstObstacleId = firstObstacleId || box.id;
          firstObstacleName = firstObstacleName || box.name;

          // Push out along shallowest penetration axis
          const dLeft = currX - eMinX;
          const dRight = eMaxX - currX;
          const dTop = currZ - eMinZ;
          const dBottom = eMaxZ - currZ;
          const minD = Math.min(dLeft, dRight, dTop, dBottom);

          if (minD === dLeft) {
            currX = eMinX - 0.01;
            contactNormalX = -1;
            contactNormalZ = 0;
          } else if (minD === dRight) {
            currX = eMaxX + 0.01;
            contactNormalX = 1;
            contactNormalZ = 0;
          } else if (minD === dTop) {
            currZ = eMinZ - 0.01;
            contactNormalX = 0;
            contactNormalZ = -1;
          } else {
            currZ = eMaxZ + 0.01;
            contactNormalX = 0;
            contactNormalZ = 1;
          }

          primaryNormalX = primaryNormalX || contactNormalX;
          primaryNormalZ = primaryNormalZ || contactNormalZ;
          continue;
        }

        // B. Swept segment raycast against expanded box
        const invDx = moveX !== 0 ? 1.0 / moveX : (moveX >= 0 ? 1e9 : -1e9);
        const invDz = moveZ !== 0 ? 1.0 / moveZ : (moveZ >= 0 ? 1e9 : -1e9);

        let tNearX = (eMinX - currX) * invDx;
        let tFarX = (eMaxX - currX) * invDx;
        let tNearZ = (eMinZ - currZ) * invDz;
        let tFarZ = (eMaxZ - currZ) * invDz;

        if (tNearX > tFarX) {
          const tmp = tNearX;
          tNearX = tFarX;
          tFarX = tmp;
        }
        if (tNearZ > tFarZ) {
          const tmp = tNearZ;
          tNearZ = tFarZ;
          tFarZ = tmp;
        }

        const tEnter = Math.max(tNearX, tNearZ);
        const tExit = Math.min(tFarX, tFarZ);

        if (tEnter <= tExit && tExit > 0.0) {
          if (tEnter >= -0.001 && tEnter < earliestT) {
            earliestT = Math.max(0, tEnter);
            hitBox = box;
            hitCircle = null;

            if (tEnter === tNearX) {
              contactNormalX = moveX > 0 ? -1 : 1;
              contactNormalZ = 0;
            } else {
              contactNormalX = 0;
              contactNormalZ = moveZ > 0 ? -1 : 1;
            }
          }
        }
      }

      // -----------------------------------------------------------------------
      // 2. Check all Circle Colliders (Tree trunks, poles, pillars)
      // -----------------------------------------------------------------------
      for (const circle of this.circles) {
        const totalRadius = circle.radius + radius;
        const fx = currX - circle.cx;
        const fz = currZ - circle.cz;

        // Immediate penetration check
        const distSq = fx * fx + fz * fz;
        if (distSq < totalRadius * totalRadius) {
          hasCollided = true;
          hadPenetration = true;
          firstObstacleId = firstObstacleId || circle.id;
          firstObstacleName = firstObstacleName || circle.name;

          const dist = Math.sqrt(distSq) || 0.001;
          const nx = fx / dist;
          const nz = fz / dist;
          currX = circle.cx + nx * (totalRadius + 0.01);
          currZ = circle.cz + nz * (totalRadius + 0.01);
          contactNormalX = nx;
          contactNormalZ = nz;
          primaryNormalX = primaryNormalX || nx;
          primaryNormalZ = primaryNormalZ || nz;
          continue;
        }

        // Swept ray vs circle quadratic test
        const a = moveX * moveX + moveZ * moveZ;
        const b = 2 * (fx * moveX + fz * moveZ);
        const c = fx * fx + fz * fz - totalRadius * totalRadius;
        const discriminant = b * b - 4 * a * c;

        if (discriminant >= 0 && a > 0.0001) {
          const sqrtD = Math.sqrt(discriminant);
          const t1 = (-b - sqrtD) / (2 * a);
          if (t1 >= -0.001 && t1 < earliestT) {
            earliestT = Math.max(0, t1);
            hitCircle = circle;
            hitBox = null;

            const hitX = currX + moveX * earliestT;
            const hitZ = currZ + moveZ * earliestT;
            const cdx = hitX - circle.cx;
            const cdz = hitZ - circle.cz;
            const cdLen = Math.hypot(cdx, cdz) || 0.001;
            contactNormalX = cdx / cdLen;
            contactNormalZ = cdz / cdLen;
          }
        }
      }

      // -----------------------------------------------------------------------
      // 3. Collision Resolution & Sliding
      // -----------------------------------------------------------------------
      if (earliestT < 1.0) {
        hasCollided = true;
        if (hitBox) {
          firstObstacleId = firstObstacleId || hitBox.id;
          firstObstacleName = firstObstacleName || hitBox.name;
        } else if (hitCircle) {
          firstObstacleId = firstObstacleId || hitCircle.id;
          firstObstacleName = firstObstacleName || hitCircle.name;
        }

        primaryNormalX = primaryNormalX || contactNormalX;
        primaryNormalZ = primaryNormalZ || contactNormalZ;

        // Calculate impact perpendicularity (dot product of velocity and surface normal)
        const moveLen = Math.hypot(moveX, moveZ) || 0.001;
        const dirX = moveX / moveLen;
        const dirZ = moveZ / moveLen;
        const impactFraction = Math.max(0, -(dirX * contactNormalX + dirZ * contactNormalZ));
        maxImpactSpeedFraction = Math.max(maxImpactSpeedFraction, impactFraction);

        // Advance to impact boundary with safety padding
        const safeT = Math.max(0, earliestT - 0.002);
        currX += moveX * safeT;
        currZ += moveZ * safeT;

        // Calculate remaining motion vector
        const remainingT = 1.0 - earliestT;
        const remX = moveX * remainingT;
        const remZ = moveZ * remainingT;

        // Slide remaining movement along the obstacle's tangent surface
        const dot = remX * contactNormalX + remZ * contactNormalZ;
        if (dot < 0) {
          targetX = currX + (remX - dot * contactNormalX);
          targetZ = currZ + (remZ - dot * contactNormalZ);
        } else {
          targetX = currX + remX;
          targetZ = currZ + remZ;
        }
      } else {
        // No obstacle along this segment: advance fully to target
        currX = targetX;
        currZ = targetZ;
        break;
      }
    }

    return {
      x: currX,
      z: currZ,
      collided: hasCollided,
      hitObstacleId: firstObstacleId,
      hitObstacleName: firstObstacleName,
      normalX: primaryNormalX,
      normalZ: primaryNormalZ,
      impactSpeedFraction: maxImpactSpeedFraction,
      penetration: hadPenetration,
    };
  }

  /**
   * Resolves player on-foot movement with swept CCD sliding
   */
  public resolvePlayer(
    fromX: number,
    fromZ: number,
    targetX: number,
    targetZ: number,
    radius: number = 0.45
  ): { x: number; z: number; collided: boolean } {
    const sweep = this.sweepMove(fromX, fromZ, targetX, targetZ, radius, 3);
    return { x: sweep.x, z: sweep.z, collided: sweep.collided };
  }

  /**
   * Resolves vehicle movement collision with continuous collision detection
   */
  public resolveVehicle(
    fromX: number,
    fromZ: number,
    targetX: number,
    targetZ: number,
    vehicleRadius: number = 1.35
  ): SweepResult {
    return this.sweepMove(fromX, fromZ, targetX, targetZ, vehicleRadius, 3);
  }
}

export const collisionWorld = new CollisionWorld();

/**
 * Returns the exact 3D drivable surface elevation at world coordinate (x, z).
 * Handles smooth ramps and elevated bridge deck crossing the Mekong River.
 */
export function getSurfaceElevation(x: number, z: number): number {
  // Mekong River Bridge Highway (x centered at 25.0, width 7.4m from x = 21.3 to x = 28.7)
  if (x >= 21.0 && x <= 29.0) {
    if (z >= 26.0 && z <= 50.0) {
      // Main bridge road deck surface (elevation 1.50m above river water)
      return 1.5;
    } else if (z >= 18.0 && z < 26.0) {
      // North approach ramp: climbs smoothly from y = 0.0m to y = 1.50m
      const t = (z - 18.0) / 8.0;
      const smoothT = t * t * (3 - 2 * t);
      return smoothT * 1.5;
    } else if (z > 50.0 && z <= 56.0) {
      // South approach ramp: descends smoothly from y = 1.50m to y = 0.0m
      const t = (56.0 - z) / 6.0;
      const smoothT = t * t * (3 - 2 * t);
      return smoothT * 1.5;
    }
  }

  // Expanded city causeways sit at road level over the river
  if (z >= 22.0 && z <= 54.0 && CAUSEWAYS.some((c) => Math.abs(x - c.x) <= c.w / 2)) {
    return 0.0;
  }

  // River water area (z = 24.5 to 51.5) outside the bridge deck
  if (z >= 24.5 && z <= 51.5) {
    if (x < 21.0 || x > 29.0) {
      // Water level is at -0.25m
      return -0.25;
    }
  }

  // Standard town & highway ground level
  return 0.0;
}

/**
 * Finds the nearest safe road navigation point for vehicle unstuck / recovery
 */
export function findNearestRoadPoint(
  x: number,
  z: number
): { x: number; y: number; z: number; heading: number } {
  // Road segments in Kampong Cham open world:
  // 1. Highway 1: x = 25, z from -85 to 110
  // 2. Laterite Heritage Road: z = -15, x from -65 to 25
  // 3. Temple Boulevard: z = 16, x from -65 to 25
  // 4. North Residential Lane: z = -38, x from -60 to 25
  // 5. Sports City Parking Plaza: x = 25, z = 64

  const candidates = [
    { x: 25.0, z: Math.max(-80, Math.min(110, z)), heading: z > 40 ? 0 : 0 },
    { x: Math.max(-65, Math.min(25, x)), z: -15.0, heading: Math.PI / 2 },
    { x: Math.max(-65, Math.min(25, x)), z: 16.0, heading: Math.PI / 2 },
    { x: Math.max(-60, Math.min(25, x)), z: -38.0, heading: Math.PI / 2 },
  ];

  let best = candidates[0];
  let bestDist = Infinity;

  for (const c of candidates) {
    const d = Math.hypot(x - c.x, z - c.z);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }

  const elev = getSurfaceElevation(best.x, best.z);
  return { x: best.x, y: elev, z: best.z, heading: best.heading };
}

/**
 * Initializes all static building, pagoda, wall, and environmental colliders
 * matching the expanded Kampong Cham open world.
 */
export function initWorldColliders() {
  collisionWorld.clear();

  // ---------------------------------------------------------------------------
  // 1. SCHOOL DISTRICT (x ~ 0, z ~ -2)
  // ---------------------------------------------------------------------------
  collisionWorld.addBox("school_main", 0, -2, 18.2, 8.4, "Kampong Cham High School", 0, 14.0, true);
  collisionWorld.addCircle("school_flag", 0, -8.5, 0.6, "Flagpole", 0, 10.0);

  // ---------------------------------------------------------------------------
  // 2. GRAND PAGODA COMPLEX (WAT KAMPONG CHAM) (x ~ -24, z ~ 18)
  // ---------------------------------------------------------------------------
  collisionWorld.addBox("pagoda_sanctuary", -24, 18, 15.0, 11.0, "Pagoda Sanctuary", 0, 16.0, true);
  collisionWorld.addCircle("pagoda_stupa_1", -13.5, 13.0, 1.4, "Golden Stupa North", 0, 12.0);
  collisionWorld.addCircle("pagoda_stupa_2", -13.5, 23.0, 1.4, "Golden Stupa South", 0, 12.0);
  collisionWorld.addCircle("pagoda_stupa_3", -34.5, 18.0, 1.8, "Grand Ancestral Stupa", 0, 14.0);
  collisionWorld.addBox("pagoda_bell_tower", -32.0, 11.0, 4.0, 4.0, "Bell Tower", 0, 10.0, true);

  // Pagoda Perimeter Enclosing Walls
  collisionWorld.addBox("pagoda_wall_north", -24, 9.5, 26.0, 0.6, "Pagoda Wall North", 0, 2.5);
  collisionWorld.addBox("pagoda_wall_south", -24, 26.5, 26.0, 0.6, "Pagoda Wall South", 0, 2.5);
  collisionWorld.addBox("pagoda_wall_west", -37, 18, 0.6, 17.0, "Pagoda Wall West", 0, 2.5);
  collisionWorld.addBox("pagoda_wall_east_top", -11, 12.5, 0.6, 6.0, "Pagoda Wall East North", 0, 2.5);
  collisionWorld.addBox("pagoda_wall_east_bot", -11, 23.5, 0.6, 6.0, "Pagoda Wall East South", 0, 2.5);

  collisionWorld.addCircle("pagoda_gate_pillar_l", -11, 15.3, 0.7, "Gate Pillar North", 0, 6.0);
  collisionWorld.addCircle("pagoda_gate_pillar_r", -11, 20.7, 0.7, "Gate Pillar South", 0, 6.0);
  collisionWorld.addCircle("pagoda_bodhi_tree", -19, 13.5, 1.2, "Bodhi Tree", 0, 10.0);
  collisionWorld.addBox("pagoda_incense_altar", -18, 18, 2.0, 1.2, "Incense Altar", 0, 1.8);

  // ---------------------------------------------------------------------------
  // 3. MEKONG RIVERSIDE GRAND HOTEL & VIP PLAZA (x ~ 18, z ~ -30)
  // ---------------------------------------------------------------------------
  collisionWorld.addBox("hotel_main", 18, -30, 22.0, 11.0, "Mekong Grand Hotel", 0, 18.0, true);
  collisionWorld.addBox("hotel_wing_l", 6, -34, 6.0, 10.0, "Hotel West Wing", 0, 14.0, true);

  // Decorative Fountain in Center Plaza Island (x = 18, z = -14)
  // Perfectly leaves the Porte-Cochere drive-through at z = -21.5 completely unobstructed!
  collisionWorld.addCircle("hotel_fountain", 18, -14, 2.2, "Plaza Fountain", 0, 2.0);

  // ---------------------------------------------------------------------------
  // 4. COMMERCIAL SHOPHOUSES & PROVINCIAL TOWN HALL
  // ---------------------------------------------------------------------------
  collisionWorld.addBox("shophouse_block_a", 16.5, -4, 18.0, 9.0, "Shophouses Block A", 0, 12.0, true);
  collisionWorld.addBox("shophouse_block_b", 16.5, 7, 18.0, 9.0, "Shophouses Block B", 0, 12.0, true);
  collisionWorld.addBox("town_hall", -42, -15, 16.0, 10.0, "Provincial Town Hall", 0, 14.0, true);

  // ---------------------------------------------------------------------------
  // 5. TRADITIONAL KHMER VILLAGE HOUSES
  // ---------------------------------------------------------------------------
  collisionWorld.addBox("player_home_wall_n", -14, -23.4, 8.8, 0.5, "Home North Wall", 0, 4.0, true);
  collisionWorld.addBox("player_home_wall_w", -18.4, -20.0, 0.5, 6.8, "Home West Wall", 0, 4.0, true);
  collisionWorld.addBox("player_home_wall_e", -9.6, -20.0, 0.5, 6.8, "Home East Wall", 0, 4.0, true);
  collisionWorld.addBox("player_home_wall_s_l", -16.7, -16.6, 3.4, 0.5, "Home South Wall Left", 0, 4.0, true);
  collisionWorld.addBox("player_home_wall_s_r", -11.3, -16.6, 3.4, 0.5, "Home South Wall Right", 0, 4.0, true);
  collisionWorld.addBox("player_home_door", -14, -16.6, 2.0, 0.5, "Player Home Closed Door", 0, 3.5);

  collisionWorld.addBox("stilt_house_neighbor_a", 4, -25, 8.8, 6.8, "Neighbor Home A", 0, 5.0, true);
  collisionWorld.addBox("stilt_house_neighbor_b", -30, -36, 8.8, 6.8, "Neighbor Home B", 0, 5.0, true);
  collisionWorld.addBox("stilt_house_neighbor_c", -12, -42, 8.8, 6.8, "Neighbor Home C", 0, 5.0, true);
  collisionWorld.addBox("stilt_house_neighbor_d", 32, -42, 8.8, 6.8, "Neighbor Home D", 0, 5.0, true);

  // ---------------------------------------------------------------------------
  // 6. MARKET STALLS & RIVERSIDE CAFE
  // ---------------------------------------------------------------------------
  collisionWorld.addBox("market_stall_1", 11, -10, 3.4, 2.2, "Market Stall Fruit", 0, 3.0, true);
  collisionWorld.addBox("market_stall_2", 15, -10, 3.4, 2.2, "Market Stall Drinks", 0, 3.0, true);
  collisionWorld.addBox("market_stall_3", 11, -14, 3.4, 2.2, "Market Stall Noodles", 0, 3.0, true);
  collisionWorld.addBox("market_stall_4", 15, -14, 3.4, 2.2, "Market Stall Souvenirs", 0, 3.0, true);
  collisionWorld.addBox("coffee_stall", -6, -12, 2.4, 1.8, "Riverside Coffee Cart", 0, 2.5, true);

  // ---------------------------------------------------------------------------
  // 7. MEKONG RIVER BRIDGE & APPROACH RAMPS GUARD RAILS (x = 25, z = 37)
  // ---------------------------------------------------------------------------
  // Left Guardrail (Unbroken spanning entire North ramp, Deck, and South ramp from z = 18 to 56)
  collisionWorld.addBox("bridge_rail_left", 21.3, 37.0, 0.4, 38.0, "Bridge Guardrail Left", 0, 3.0);
  // Right Guardrail
  collisionWorld.addBox("bridge_rail_right", 28.7, 37.0, 0.4, 38.0, "Bridge Guardrail Right", 0, 3.0);

  // River Bank Water Edge Barriers (z = 24.8 and z = 51.2)
  collisionWorld.addBox("river_edge_north_w", -24, 24.8, 88.0, 0.8, "River Bank North West", 0, 2.5);
  collisionWorld.addBox("river_edge_north_e", 46, 24.8, 34.0, 0.8, "River Bank North East", 0, 2.5);
  collisionWorld.addBox("river_edge_south_w", -24, 51.2, 88.0, 0.8, "River Bank South West", 0, 2.5);
  collisionWorld.addBox("river_edge_south_e", 46, 51.2, 34.0, 0.8, "River Bank South East", 0, 2.5);

  // ---------------------------------------------------------------------------
  // 8. OLYMPIC SPORTS CITY DISTRICT (STADIUM, VOLLEYBALL, CLUBHOUSE & PARKING)
  // ---------------------------------------------------------------------------
  collisionWorld.addBox("sports_arch_col_l", 18.8, 52, 1.4, 1.4, "Sports Arch Pillar L", 0, 8.0);
  collisionWorld.addBox("sports_arch_col_r", 31.2, 52, 1.4, 1.4, "Sports Arch Pillar R", 0, 8.0);

  // Football Stadium
  collisionWorld.addBox("stadium_stand_west", -49.0, 95, 6.0, 46.0, "West Grandstand Bleachers", 0, 8.0);
  collisionWorld.addBox("stadium_stand_east_n", -3.0, 81, 6.0, 18.0, "East Grandstand North", 0, 8.0);
  collisionWorld.addBox("stadium_stand_east_s", -3.0, 109, 6.0, 18.0, "East Grandstand South", 0, 8.0);
  collisionWorld.addBox("stadium_wall_north", -26.0, 67.0, 42.0, 1.4, "Stadium North Perimeter", 0, 4.0);
  collisionWorld.addBox("stadium_wall_south", -26.0, 123.0, 42.0, 1.4, "Stadium South Perimeter", 0, 4.0);

  collisionWorld.addCircle("stadium_floodlight_nw", -46.0, 67.0, 0.8, "Floodlight Tower NW", 0, 18.0);
  collisionWorld.addCircle("stadium_floodlight_ne", -6.0, 67.0, 0.8, "Floodlight Tower NE", 0, 18.0);
  collisionWorld.addCircle("stadium_floodlight_sw", -46.0, 123.0, 0.8, "Floodlight Tower SW", 0, 18.0);
  collisionWorld.addCircle("stadium_floodlight_se", -6.0, 123.0, 0.8, "Floodlight Tower SE", 0, 18.0);

  collisionWorld.addBox("stadium_dugouts", -43.5, 95, 2.0, 14.0, "Team Dugouts", 0, 3.0);
  collisionWorld.addCircle("volleyball_post_w", 21.0, 92, 0.35, "Volleyball Post West", 0, 3.0);
  collisionWorld.addCircle("volleyball_post_e", 31.0, 92, 0.35, "Volleyball Post East", 0, 3.0);
  collisionWorld.addBox("volleyball_ref_chair", 20.6, 92, 0.8, 0.8, "Referee Chair", 0, 2.5);

  collisionWorld.addBox("sports_clubhouse", 6.0, 78, 10.2, 8.2, "Sports Locker Room Clubhouse", 0, 8.0, true);
  collisionWorld.addBox("sports_shop_main", 18.0, 78, 6.6, 7.6, "Sports Merchandise Shop", 0, 6.0, true);
  collisionWorld.addBox("sports_coconut_stall", 24.5, 80.5, 2.6, 2.2, "Fresh Coconut Drink Stall", 0, 3.0, true);
  collisionWorld.addBox("sports_noodle_stall", 11.5, 80.5, 2.8, 2.2, "Sports Noodle Stall", 0, 3.0, true);
  collisionWorld.addBox("parked_team_bus", 14.0, 60.5, 2.4, 4.2, "Sports Team Bus", 0, 3.5);

  // ---------------------------------------------------------------------------
  // 9. ENVIRONMENTAL OBSTACLES (TREES & STREETLAMPS)
  // Ensures vehicles and players collide realistically with roadside trees & poles
  // ---------------------------------------------------------------------------
  const palmTrees: [number, number][] = [
    [-52, -6], [-46, -10], [-32, -6], [-28, -10],
    [-6, 24], [8, 24], [34, 14], [36, -8],
    [-54, 24], [44, 24], [-8, 20], [18, 24],
    [-36, -32], [14, -42], [-22, -26], [12, -27],
    [-34, 2], [30, -22], [-48, -28]
  ];
  palmTrees.forEach(([tx, tz], i) => {
    collisionWorld.addCircle(`tree_trunk_${i}`, tx, tz, 0.55, "Palm Tree Trunk", 0, 10.0);
  });

  const streetLamps: [number, number][] = [
    [4.0, -65], [4.0, -45], [4.0, -25], [4.0, -5],
    [4.0, 15], [4.0, 35], [4.0, 55]
  ];
  streetLamps.forEach(([lx, lz], i) => {
    collisionWorld.addCircle(`street_lamp_${i}`, lx, lz, 0.35, "Streetlamp Post", 0, 6.0);
  });

  registerExpandedCityColliders();
}

/**
 * Colliders for the expanded districts (data/cityLayout.ts): buildings, trees, lamps,
 * causeway rails and the river banks outside the original town (open at the causeways).
 */
function registerExpandedCityColliders() {
  for (const b of CITY_BUILDINGS) {
    collisionWorld.addBox(b.id, b.x, b.z, b.w, b.d, b.name, 0, b.h, !b.hidden);
  }
  CITY_TREES.forEach((t, i) => {
    collisionWorld.addCircle(`city_tree_${i}`, t.x, t.z, 0.45 * t.scale, "Tree Trunk", 0, 8.0);
  });
  CITY_LAMPS.forEach((l, i) => {
    collisionWorld.addCircle(`city_lamp_${i}`, l.x, l.z, 0.3, "Streetlamp Post", 0, 6.0);
  });

  const riverLen = RIVER.z1 - RIVER.z0 + 4;
  const riverMid = (RIVER.z0 + RIVER.z1) / 2;
  for (const c of CAUSEWAYS) {
    collisionWorld.addBox(`causeway_rail_l_${c.x}`, c.x - c.w / 2 + 0.3, riverMid, 0.4, riverLen, "Causeway Rail", 0, 1.0);
    collisionWorld.addBox(`causeway_rail_r_${c.x}`, c.x + c.w / 2 - 0.3, riverMid, 0.4, riverLen, "Causeway Rail", 0, 1.0);
  }

  // Bank barriers wherever the original town had none, skipping the causeways
  const spans: Array<[number, number]> = [];
  let start = WORLD_BOUNDS.minX;
  for (const c of [...CAUSEWAYS].sort((a, b) => a.x - b.x)) {
    spans.push([start, c.x - c.w / 2]);
    start = c.x + c.w / 2;
  }
  spans.push([start, WORLD_BOUNDS.maxX]);
  const original: Array<[number, number]> = [[-68, 20], [29, 63]]; // existing river_edge_* boxes
  spans.forEach(([a, b], i) => {
    // Subtract the existing bank segments
    let pieces: Array<[number, number]> = [[a, b]];
    for (const [oa, ob] of original) {
      pieces = pieces.flatMap(([pa, pb]): Array<[number, number]> =>
        ob <= pa || oa >= pb ? [[pa, pb]] : ([[pa, oa], [ob, pb]] as Array<[number, number]>).filter(([x0, x1]) => x1 - x0 > 0.5)
      );
    }
    // Leave the original bridge (x 21–29) open
    pieces = pieces.flatMap(([pa, pb]): Array<[number, number]> =>
      pb <= 21 || pa >= 29 ? [[pa, pb]] : ([[pa, 21], [29, pb]] as Array<[number, number]>).filter(([x0, x1]) => x1 - x0 > 0.5)
    );
    pieces.forEach(([pa, pb], j) => {
      const w = pb - pa;
      const cx = (pa + pb) / 2;
      collisionWorld.addBox(`city_bank_n_${i}_${j}`, cx, RIVER.z0 + 0.8, w, 0.8, "River Bank", 0, 2.5);
      collisionWorld.addBox(`city_bank_s_${i}_${j}`, cx, RIVER.z1 - 0.8, w, 0.8, "River Bank", 0, 2.5);
    });
  });
}

// Automatically initialize world colliders on import
initWorldColliders();
