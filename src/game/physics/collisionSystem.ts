/**
 * High-performance 2D/3D World Collision and Navigation System
 * Provides GTA V / PUBG style solid world collision with smooth wall-sliding response.
 */

export interface AABBCollider {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  name?: string;
  isEntrance?: boolean;
}

export interface CircleCollider {
  id: string;
  cx: number;
  cz: number;
  radius: number;
  name?: string;
}

// Registry of static and dynamic world colliders
class CollisionWorld {
  private boxes: AABBCollider[] = [];
  private circles: CircleCollider[] = [];

  public clear() {
    this.boxes = [];
    this.circles = [];
  }

  public addBox(id: string, cx: number, cz: number, width: number, depth: number, name?: string) {
    const halfW = width / 2;
    const halfD = depth / 2;
    this.boxes.push({
      id,
      minX: cx - halfW,
      maxX: cx + halfW,
      minZ: cz - halfD,
      maxZ: cz + halfD,
      name,
    });
  }

  public addCircle(id: string, cx: number, cz: number, radius: number, name?: string) {
    this.circles.push({ id, cx, cz, radius, name });
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
        this.addBox("player_home_door", -14, -16.6, 2.0, 0.5, "Player Home Closed Door");
      }
    }
  }

  /**
   * Resolves player movement with smooth sliding along obstacles (GTA / PUBG feel)
   */
  public resolvePlayer(
    fromX: number,
    fromZ: number,
    targetX: number,
    targetZ: number,
    radius: number = 0.45
  ): { x: number; z: number; collided: boolean } {
    let currentX = targetX;
    let currentZ = targetZ;
    let collided = false;

    // First try moving on X axis only, then Z axis (standard 2-axis slip resolution)
    // Test full movement
    let testX = targetX;
    let testZ = targetZ;

    for (let iter = 0; iter < 3; iter++) {
      let hit = false;

      // 1. Check Box Colliders
      for (const box of this.boxes) {
        // Expand box by player radius
        const expMinX = box.minX - radius;
        const expMaxX = box.maxX + radius;
        const expMinZ = box.minZ - radius;
        const expMaxZ = box.maxZ + radius;

        if (testX > expMinX && testX < expMaxX && testZ > expMinZ && testZ < expMaxZ) {
          hit = true;
          collided = true;

          // Find shortest push-out vector
          const dLeft = testX - expMinX;
          const dRight = expMaxX - testX;
          const dTop = testZ - expMinZ;
          const dBottom = expMaxZ - testZ;

          const minD = Math.min(dLeft, dRight, dTop, dBottom);

          if (minD === dLeft) {
            testX = expMinX;
          } else if (minD === dRight) {
            testX = expMaxX;
          } else if (minD === dTop) {
            testZ = expMinZ;
          } else {
            testZ = expMaxZ;
          }
        }
      }

      // 2. Check Circle Colliders (Tree trunks, pillars, poles)
      for (const circle of this.circles) {
        const dx = testX - circle.cx;
        const dz = testZ - circle.cz;
        const distSq = dx * dx + dz * dz;
        const minDist = radius + circle.radius;

        if (distSq < minDist * minDist) {
          hit = true;
          collided = true;
          const dist = Math.sqrt(distSq) || 0.001;
          const pushX = (dx / dist) * minDist;
          const pushZ = (dz / dist) * minDist;
          testX = circle.cx + pushX;
          testZ = circle.cz + pushZ;
        }
      }

      if (!hit) break;
    }

    return { x: testX, z: testZ, collided };
  }

  /**
   * Resolves vehicle movement collision with world obstacles
   */
  public resolveVehicle(
    fromX: number,
    fromZ: number,
    targetX: number,
    targetZ: number,
    vehicleRadius: number = 1.35
  ): { x: number; z: number; collided: boolean } {
    return this.resolvePlayer(fromX, fromZ, targetX, targetZ, vehicleRadius);
  }
}

export const collisionWorld = new CollisionWorld();

/**
 * Initializes all static building, pagoda, wall, and environmental colliders
 * matching the expanded Kampong Cham open world.
 */
export function initWorldColliders() {
  collisionWorld.clear();

  // ---------------------------------------------------------------------------
  // 1. SCHOOL DISTRICT (x ~ 0, z ~ -2)
  // ---------------------------------------------------------------------------
  // School main building (18m wide, 8m deep)
  collisionWorld.addBox("school_main", 0, -2, 18.2, 8.4, "School");
  // School flagpole base
  collisionWorld.addCircle("school_flag", 0, -8.5, 0.6, "Flagpole");

  // ---------------------------------------------------------------------------
  // 2. GRAND PAGODA COMPLEX (WAT KAMPONG CHAM) (x ~ -24, z ~ 18)
  // ---------------------------------------------------------------------------
  // Main Temple Vihara Sanctuary (15m wide, 11m deep)
  collisionWorld.addBox("pagoda_sanctuary", -24, 18, 15.0, 11.0, "Pagoda Sanctuary");

  // Sacred Stupas (Chedey) - tall ornate Buddhist spires
  collisionWorld.addCircle("pagoda_stupa_1", -13.5, 13.0, 1.4, "Golden Stupa North");
  collisionWorld.addCircle("pagoda_stupa_2", -13.5, 23.0, 1.4, "Golden Stupa South");
  collisionWorld.addCircle("pagoda_stupa_3", -34.5, 18.0, 1.8, "Grand Ancestral Stupa");

  // Pagoda Bell Tower (Hor Keng)
  collisionWorld.addBox("pagoda_bell_tower", -32.0, 11.0, 4.0, 4.0, "Bell Tower");

  // Pagoda Perimeter Enclosing Walls (Kampheng Wat)
  // North Wall: from x = -37 to x = -11 (length 26m at z = 9.5)
  collisionWorld.addBox("pagoda_wall_north", -24, 9.5, 26.0, 0.6, "Pagoda Wall North");
  // South Wall: from x = -37 to x = -11 (length 26m at z = 26.5)
  collisionWorld.addBox("pagoda_wall_south", -24, 26.5, 26.0, 0.6, "Pagoda Wall South");
  // West Wall: (length 17m at x = -37)
  collisionWorld.addBox("pagoda_wall_west", -37, 18, 0.6, 17.0, "Pagoda Wall West");
  // East Wall: has a central opening (entrance gate at z = 18, width 5m)
  // East wall top segment (z = 10 to 15.5)
  collisionWorld.addBox("pagoda_wall_east_top", -11, 12.5, 0.6, 6.0, "Pagoda Wall East North");
  // East wall bottom segment (z = 20.5 to 26)
  collisionWorld.addBox("pagoda_wall_east_bot", -11, 23.5, 0.6, 6.0, "Pagoda Wall East South");
  // Grand Entrance Gate Pillars flanking the entrance at [-11, 0, 18]
  collisionWorld.addCircle("pagoda_gate_pillar_l", -11, 15.3, 0.7, "Gate Pillar North");
  collisionWorld.addCircle("pagoda_gate_pillar_r", -11, 20.7, 0.7, "Gate Pillar South");

  // Sacred Bodhi Tree & Incense Shrine
  collisionWorld.addCircle("pagoda_bodhi_tree", -19, 13.5, 1.2, "Bodhi Tree");
  collisionWorld.addBox("pagoda_incense_altar", -18, 18, 2.0, 1.2, "Incense Altar");

  // ---------------------------------------------------------------------------
  // 3. MEKONG RIVERSIDE GRAND HOTEL & VIP PLAZA (x ~ 18, z ~ -28)
  // ---------------------------------------------------------------------------
  // Main Hotel Tower (22m wide, 12m deep)
  collisionWorld.addBox("hotel_main", 18, -30, 22.0, 11.0, "Mekong Grand Hotel");
  // Hotel Left Wing
  collisionWorld.addBox("hotel_wing_l", 6, -34, 6.0, 10.0, "Hotel West Wing");
  // Hotel Plaza Fountain / Statue
  collisionWorld.addCircle("hotel_fountain", 18, -21, 2.2, "Plaza Fountain");

  // ---------------------------------------------------------------------------
  // 4. COMMERCIAL SHOPHOUSES & PROVINCIAL TOWN HALL
  // ---------------------------------------------------------------------------
  // Central Shophouses Block A (x = 16.5, z = -4) (18m wide, 9m deep)
  collisionWorld.addBox("shophouse_block_a", 16.5, -4, 18.0, 9.0, "Shophouses Block A");
  // Shophouses Block B (x = 16.5, z = 7) (18m wide, 9m deep)
  collisionWorld.addBox("shophouse_block_b", 16.5, 7, 18.0, 9.0, "Shophouses Block B");

  // Provincial Town Hall / Library (x = -42, z = -15) (16m wide, 10m deep)
  collisionWorld.addBox("town_hall", -42, -15, 16.0, 10.0, "Provincial Town Hall");

  // ---------------------------------------------------------------------------
  // 5. TRADITIONAL KHMER VILLAGE HOUSES
  // ---------------------------------------------------------------------------
  // Player Home (Enterable Stilt House with Openable Door at [-14, -16.6])
  collisionWorld.addBox("player_home_wall_n", -14, -23.4, 8.8, 0.5, "Home North Wall");
  collisionWorld.addBox("player_home_wall_w", -18.4, -20.0, 0.5, 6.8, "Home West Wall");
  collisionWorld.addBox("player_home_wall_e", -9.6, -20.0, 0.5, 6.8, "Home East Wall");
  collisionWorld.addBox("player_home_wall_s_l", -16.7, -16.6, 3.4, 0.5, "Home South Wall Left");
  collisionWorld.addBox("player_home_wall_s_r", -11.3, -16.6, 3.4, 0.5, "Home South Wall Right");
  collisionWorld.addBox("player_home_door", -14, -16.6, 2.0, 0.5, "Player Home Closed Door");
  // Village Neighbor Stilt House A at [4, 0, -25]
  collisionWorld.addBox("stilt_house_neighbor_a", 4, -25, 8.8, 6.8, "Neighbor Home A");
  // Village Neighbor Stilt House B at [-30, 0, -36]
  collisionWorld.addBox("stilt_house_neighbor_b", -30, -36, 8.8, 6.8, "Neighbor Home B");
  // Village Neighbor Stilt House C at [-12, 0, -42]
  collisionWorld.addBox("stilt_house_neighbor_c", -12, -42, 8.8, 6.8, "Neighbor Home C");
  // Village Neighbor Stilt House D at [32, 0, -42]
  collisionWorld.addBox("stilt_house_neighbor_d", 32, -42, 8.8, 6.8, "Neighbor Home D");

  // ---------------------------------------------------------------------------
  // 6. MARKET STALLS & RIVERSIDE CAFE
  // ---------------------------------------------------------------------------
  // Market Stalls at [11, 0, -10] and [15, 0, -10]
  collisionWorld.addBox("market_stall_1", 11, -10, 3.4, 2.2, "Market Stall Fruit");
  collisionWorld.addBox("market_stall_2", 15, -10, 3.4, 2.2, "Market Stall Drinks");
  // Riverside Market Stall 3 & 4
  collisionWorld.addBox("market_stall_3", 11, -14, 3.4, 2.2, "Market Stall Noodles");
  collisionWorld.addBox("market_stall_4", 15, -14, 3.4, 2.2, "Market Stall Souvenirs");

  // Riverside Coffee Stall at [-6, 0, -12]
  collisionWorld.addBox("coffee_stall", -6, -12, 2.4, 1.8, "Riverside Coffee Cart");

  // ---------------------------------------------------------------------------
  // 7. MEKONG RIVER BRIDGE GUARD RAILS (x = 25, z = 38)
  // ---------------------------------------------------------------------------
  // Bridge left rail
  collisionWorld.addBox("bridge_rail_left", 21.4, 38, 0.4, 24.0, "Bridge Rail Left");
  // Bridge right rail
  collisionWorld.addBox("bridge_rail_right", 28.6, 38, 0.4, 24.0, "Bridge Rail Right");
  // River Bank North Water Edge Barrier (z = 26, from x = -68 to x = 21, and x = 29 to 62)
  collisionWorld.addBox("river_edge_west", -23, 26.2, 90.0, 0.8, "River Bank West");
  collisionWorld.addBox("river_edge_east", 45, 26.2, 34.0, 0.8, "River Bank East");

  // ---------------------------------------------------------------------------
  // 8. OLYMPIC SPORTS CITY DISTRICT (STADIUM, VOLLEYBALL, CLUBHOUSE & PARKING)
  // ---------------------------------------------------------------------------
  // Welcome Arch Columns at [x = 25, z = 52]
  collisionWorld.addBox("sports_arch_col_l", 18.8, 52, 1.4, 1.4, "Sports Arch Pillar L");
  collisionWorld.addBox("sports_arch_col_r", 31.2, 52, 1.4, 1.4, "Sports Arch Pillar R");

  // Football Stadium at [-26, 0, 95]
  // Grandstand West Wing Bleachers (x = -49, z = 95)
  collisionWorld.addBox("stadium_stand_west", -49.0, 95, 6.0, 46.0, "West Grandstand Bleachers");
  // Grandstand East Wing Bleachers with central player tunnel opening
  collisionWorld.addBox("stadium_stand_east_n", -3.0, 81, 6.0, 18.0, "East Grandstand North");
  collisionWorld.addBox("stadium_stand_east_s", -3.0, 109, 6.0, 18.0, "East Grandstand South");
  // Stadium North Scoreboard Wall at z = 67
  collisionWorld.addBox("stadium_wall_north", -26.0, 67.0, 42.0, 1.4, "Stadium North Perimeter");
  // Stadium South Perimeter Wall at z = 123
  collisionWorld.addBox("stadium_wall_south", -26.0, 123.0, 42.0, 1.4, "Stadium South Perimeter");

  // Stadium 4 Corner Floodlight Mast Towers
  collisionWorld.addCircle("stadium_floodlight_nw", -46.0, 67.0, 0.8, "Floodlight Tower NW");
  collisionWorld.addCircle("stadium_floodlight_ne", -6.0, 67.0, 0.8, "Floodlight Tower NE");
  collisionWorld.addCircle("stadium_floodlight_sw", -46.0, 123.0, 0.8, "Floodlight Tower SW");
  collisionWorld.addCircle("stadium_floodlight_se", -6.0, 123.0, 0.8, "Floodlight Tower SE");

  // Team Dugouts along West Touchline
  collisionWorld.addBox("stadium_dugouts", -43.5, 95, 2.0, 14.0, "Team Dugouts");

  // Volleyball Court Net Posts & Referee Chair at [x = 26, z = 92]
  collisionWorld.addCircle("volleyball_post_w", 21.0, 92, 0.35, "Volleyball Post West");
  collisionWorld.addCircle("volleyball_post_e", 31.0, 92, 0.35, "Volleyball Post East");
  collisionWorld.addBox("volleyball_ref_chair", 20.6, 92, 0.8, 0.8, "Referee Chair");

  // Sports Clubhouse & Locker Room Facility at [x = 6, z = 78]
  collisionWorld.addBox("sports_clubhouse", 6.0, 78, 10.2, 8.2, "Sports Locker Room Clubhouse");

  // Sports Retail Store & Refreshment Stalls at [x = 18, z = 78]
  collisionWorld.addBox("sports_shop_main", 18.0, 78, 6.6, 7.6, "Sports Merchandise Shop");
  collisionWorld.addBox("sports_coconut_stall", 24.5, 80.5, 2.6, 2.2, "Fresh Coconut Drink Stall");
  collisionWorld.addBox("sports_noodle_stall", 11.5, 80.5, 2.8, 2.2, "Sports Noodle Stall");

  // Parked Sports Team Bus in Parking Lot at [x = 14, z = 60.5]
  collisionWorld.addBox("parked_team_bus", 14.0, 60.5, 2.4, 4.2, "Sports Team Bus");
}

// Automatically initialize world colliders on import
initWorldColliders();
