import { create } from "zustand";
import { Language } from "@/i18n/translations";
import { audio } from "@/game/audio/audioManager";
import { SPRITES } from "@/game/assets/assetPaths";
import type { CharacterId } from "@/data/characters";
import { LOCATION_COORDINATES, type LocationKey } from "@/data/locations";
import { CHARACTERS } from "@/data/characters";
import {
  type CombatMove,
  PUNCH_POWER,
  MOVE_ENERGY_COST,
  canPerform,
  comboPunch,
  isPunch,
  nextCombo,
  trainingReward,
} from "@/state/rules/combat";

export type CareerType = "Teacher" | "Developer" | "Farmer" | "ShopOwner" | "Kickboxer";

export interface PlayerProfile {
  name: string;
  age: number;
  hometown: string;
  career: CareerType;
  personality: string[];
  education: string;
  avatar: string; // e.g. 'sokha', 'sreyneath', etc.
}

export interface PlayerStats {
  money: number;
  energy: number;
  health: number;
  happiness: number;
  stress: number;
  reputation: number;
  teachingSkill: number;
  technologySkill: number;
  farmingSkill: number;
  businessSkill: number;
}

export interface JournalEntry {
  id: string;
  day: number;
  timeStr: string;
  titleEn: string;
  titleKm: string;
  descEn: string;
  descKm: string;
  tag: "work" | "family" | "rest" | "hobby" | "system";
  badge?: string;
}

export interface StatPop {
  id: string;
  text: string;
  type: "money" | "energy" | "happiness" | "stress" | "skill";
}

export interface DaySummaryData {
  day: number;
  startMoney: number;
  endMoney: number;
  earned: number;
  spent: number;
  energyDelta: number;
  happinessDelta: number;
  stressDelta: number;
  skillDelta: number;
  highlightEn: string;
  highlightKm: string;
}

interface GameState {
  // Screens & Navigation
  screen: "main_menu" | "character_creation" | "game_world";
  activeModal: "decision" | "phone" | "work" | "relationship" | "journal" | "budget" | "inventory" | "summary" | "cafe" | "pagoda" | "market" | "home" | "hotel" | "character_select" | "locker_room" | null;
  phoneApp: "home" | "work" | "family" | "community" | "budget" | "journal" | "status" | "inventory";

  // Movement & Animation State
  movementState: "idle" | "walking" | "running" | "sprinting" | "riding";
  currentSpeed: number;
  setMovementState: (state: "idle" | "walking" | "running" | "sprinting" | "riding", speed: number) => void;

  // Proximity & Walking
  nearLocation: LocationKey | null;

  // Settings
  language: Language;
  soundEnabled: boolean;

  // Player & World
  player: PlayerProfile;
  stats: PlayerStats;
  day: number;
  timeHour: number; // 7.0 = 07:00 AM, 12.5 = 12:30 PM, etc.
  currentLocation: LocationKey;
  playerPos: [number, number, number];
  targetPos: [number, number, number];
  cameraFocus: [number, number, number];

  // Relationships
  relationships: {
    grandma: number;
    mother: number;
    vibol: number;
    kolab: number;
  };

  // Inventory
  inventory: Array<{
    id: string;
    nameEn: string;
    nameKm: string;
    icon: string;
    count: number;
  }>;

  // History & Micro-interactions
  journal: JournalEntry[];
  statPops: StatPop[];
  dayHistory: {
    startMoney: number;
    earned: number;
    spent: number;
    energyDelta: number;
    happinessDelta: number;
    stressDelta: number;
    skillDelta: number;
  };
  lastDaySummary: DaySummaryData | null;

  // Vehicles (Supercar, Motorbike & Bicycle)
  ridingVehicle: "motorbike" | "bicycle" | "supercar" | null;
  vehicleSpeed: number;
  nearVehicle: "motorbike" | "bicycle" | "supercar" | null;
  supercarPos: [number, number, number];
  supercarHeading: number;
  enterVehicleAnimation: boolean;

  // Camera & Face Direction
  playerHeading: number; // yaw in radians
  cameraMode: "chase" | "isometric";
  setPlayerHeading: (heading: number) => void;
  toggleCameraMode: () => void;

  // Actions
  setScreen: (screen: "main_menu" | "character_creation" | "game_world") => void;
  openModal: (modal: "decision" | "phone" | "work" | "relationship" | "journal" | "budget" | "inventory" | "summary" | "cafe" | "pagoda" | "market" | "home" | "hotel" | "character_select" | "locker_room" | null) => void;
  closeModal: () => void;
  setPhoneApp: (app: "home" | "work" | "family" | "community" | "budget" | "journal" | "status" | "inventory") => void;
  setNearLocation: (loc: LocationKey | null) => void;
  enterLocation: (loc?: LocationKey) => void;
  setTargetPosition: (pos: [number, number, number]) => void;
  mountVehicle: (v: "motorbike" | "bicycle" | "supercar") => void;
  dismountVehicle: () => void;
  setNearVehicle: (v: "motorbike" | "bicycle" | "supercar" | null) => void;
  setVehicleSpeed: (spd: number) => void;
  setSupercarPosition: (pos: [number, number, number], heading?: number) => void;
  setEnterVehicleAnimation: (anim: boolean) => void;
  ringVehicleHornOrBell: () => void;
  isPlayerHomeDoorOpen: boolean;
  togglePlayerHomeDoor: (forceOpen?: boolean) => void;
  switchCharacter: (avatar: CharacterId) => void;
  setLanguage: (lang: Language) => void;
  toggleSound: () => void;

  startNewGame: (profile: PlayerProfile) => void;
  moveToLocation: (loc: LocationKey) => void;
  addStatPop: (text: string, type: StatPop["type"]) => void;
  removeStatPop: (id: string) => void;

  advanceTime: (hours: number) => void;
  performWork: (choice: { plan: string; dilemma: string }) => void;
  performVisitFamily: () => void;
  performCallFamily: (member: "grandma" | "mother") => void;
  performRest: () => void;
  performHobby: () => void;
  performCafeDrink: () => void;
  performPagodaMerit: () => void;
  performMarketBuy: (cost: number, itemNameEn: string, itemNameKm: string) => void;
  performHotelStay: () => void;
  goalsScored: number;
  volleyballRallies: number;
  selectedJersey: "cambodia_blue" | "cambodia_red" | "cambodia_white" | "sport_casual";
  setSelectedJersey: (jersey: "cambodia_blue" | "cambodia_red" | "cambodia_white" | "sport_casual") => void;
  restInLockerRoom: () => void;
  drinkCoconutWater: () => void;
  eatSportsSnack: () => void;
  scoreFootballGoal: () => void;
  playVolleyballRally: () => void;

  // Combat (fighter characters, e.g. Maiko). All updates are event-driven — never per frame.
  combat: {
    move: CombatMove | null; // one-shot move currently playing (punches, dodge, victory)
    moveId: number; // increments on every move so the same move can retrigger
    guarding: boolean;
    crouching: boolean;
    airborne: boolean; // true from jump take-off until the avatar reports landing
    combo: number;
    lastPunchAt: number; // seconds (performance clock)
    punchesThrown: number;
  };
  /** "punch" picks the next move in the jab → cross → hook combo chain. */
  performCombatMove: (move: CombatMove | "punch") => void;
  finishCombatMove: (moveId: number) => void;
  land: () => void;
  setGuard: (on: boolean) => void;
  toggleCrouch: () => void;

  sleepAndEndDay: () => void;
  startNextDay: () => void;
}

const INITIAL_PLAYER: PlayerProfile = {
  name: "Dara",
  age: 23,
  hometown: "Kampong Cham",
  career: "Teacher",
  personality: ["Hardworking", "Friendly"],
  education: "University Graduate",
  avatar: "sokha",
};

const INITIAL_STATS: PlayerStats = {
  money: 150,
  energy: 95,
  health: 90,
  happiness: 80,
  stress: 15,
  reputation: 60,
  teachingSkill: 2,
  technologySkill: 1,
  farmingSkill: 1,
  businessSkill: 1,
};

const INITIAL_INVENTORY = [
  { id: "phone", nameEn: "Smartphone", nameKm: "ទូរស័ព្ទដៃ", icon: SPRITES.inv_phone, count: 1 },
  { id: "key", nameEn: "Motorbike Key", nameKm: "សោម៉ូតូ", icon: SPRITES.inv_motokey, count: 1 },
  { id: "notebook", nameEn: "Teaching Notebook", nameKm: "សៀវភៅកត់ត្រា", icon: SPRITES.inv_notebook, count: 1 },
  { id: "krama", nameEn: "Khmer Krama Scarf", nameKm: "ក្រមាខ្មែរ", icon: SPRITES.inv_krama, count: 1 },
  { id: "coffee", nameEn: "Iced Milk Coffee", nameKm: "កាហ្វេទឹកដោះគោ", icon: SPRITES.inv_icedcoffee, count: 1 },
];

export const useGameStore = create<GameState>((set, get) => ({
  screen: "main_menu",
  activeModal: null,
  phoneApp: "home",
  language: "km",
  soundEnabled: true,

  player: INITIAL_PLAYER,
  stats: INITIAL_STATS,
  day: 1,
  timeHour: 7.0,
  currentLocation: "home",
  playerPos: [-14, 0, -18],
  targetPos: [-14, 0, -18],
  cameraFocus: [-14, 0, -20],

  relationships: {
    grandma: 82,
    mother: 75,
    vibol: 65,
    kolab: 60,
  },

  inventory: INITIAL_INVENTORY,

  journal: [
    {
      id: "j-0",
      day: 1,
      timeStr: "07:00 AM",
      titleEn: "Arrival in Kampong Cham",
      titleKm: "ការមកដល់ខេត្តកំពង់ចាម",
      descEn: "Moved into a cozy stilt house near the Mekong. Ready to begin teaching at the local school.",
      descKm: "បានមកស្នាក់នៅផ្ទះឈើក្បែរដងទន្លេមេគង្គ ត្រៀមខ្លួនរួចរាល់សម្រាប់ការបង្រៀននៅសាលាខេត្ត។",
      tag: "system",
      badge: "☀️ Start",
    },
  ],

  movementState: "idle",
  currentSpeed: 0,
  setMovementState: (movementState, currentSpeed) => set({ movementState, currentSpeed }),

  statPops: [],

  dayHistory: {
    startMoney: 150,
    earned: 0,
    spent: 0,
    energyDelta: 0,
    happinessDelta: 0,
    stressDelta: 0,
    skillDelta: 0,
  },

  lastDaySummary: null,

  setScreen: (screen) => {
    audio.playClick();
    set({ screen });
  },

  openModal: (modal) => {
    if (modal) {
      audio.playOpen();
    } else {
      audio.playClose();
    }
    set({ activeModal: modal });
  },

  closeModal: () => {
    audio.playClose();
    set({ activeModal: null });
  },

  setPhoneApp: (phoneApp) => {
    audio.playClick();
    set({ phoneApp });
  },

  setLanguage: (language) => {
    audio.playClick();
    set({ language });
  },

  toggleSound: () => {
    const next = !get().soundEnabled;
    audio.setSoundEnabled(next);
    if (next) audio.playClick();
    set({ soundEnabled: next });
  },

  ridingVehicle: null,
  vehicleSpeed: 0,
  nearVehicle: null,
  supercarPos: [18, 0, -22],
  supercarHeading: 0,
  enterVehicleAnimation: false,

  mountVehicle: (v) => {
    const isKm = get().language === "km";
    if (v === "supercar") {
      audio.playCarDoor(true);
      set({ enterVehicleAnimation: true });
      setTimeout(() => {
        audio.playCarDoor(false);
        audio.playCarIgnition();
        set({ enterVehicleAnimation: false });
      }, 420);
      get().addStatPop(isKm ? "បើករថយន្តស្ព័រ 🏎️" : "Driving Supercar 🏎️", "skill");
    } else if (v === "motorbike") {
      audio.playHorn();
      get().addStatPop(isKm ? "ជិះម៉ូតូឌ្រីម 🏍️" : "Riding Motorbike 🏍️", "skill");
    } else {
      audio.playBicycleBell();
      get().addStatPop(isKm ? "ជិះកង់ 🚲" : "Riding Bicycle 🚲", "skill");
    }
    set({ ridingVehicle: v, vehicleSpeed: 0 });
  },

  dismountVehicle: () => {
    const state = get();
    if (state.ridingVehicle === "supercar") {
      audio.playCarDoor(true);
      setTimeout(() => {
        audio.playCarDoor(false);
      }, 320);
      set({
        supercarPos: [state.targetPos[0], state.targetPos[1], state.targetPos[2]],
        supercarHeading: state.playerHeading,
      });
    } else if (state.ridingVehicle === "motorbike") {
      audio.playClick();
    } else {
      audio.playClick();
    }
    set({ ridingVehicle: null, vehicleSpeed: 0 });
  },

  ringVehicleHornOrBell: () => {
    const v = get().ridingVehicle;
    if (v === "bicycle") {
      audio.playBicycleBell();
    } else {
      audio.playHorn();
    }
  },

  isPlayerHomeDoorOpen: false,
  togglePlayerHomeDoor: (forceOpen) => {
    const current = get().isPlayerHomeDoorOpen;
    const next = forceOpen !== undefined ? forceOpen : !current;
    if (next) {
      audio.playDoorOpen();
      get().addStatPop(get().language === "km" ? "បើកទ្វារផ្ទះ 🚪" : "Front Door Opened 🚪", "happiness");
    } else {
      audio.playDoorClose();
      get().addStatPop(get().language === "km" ? "បិទទ្វារផ្ទះ 🔒" : "Front Door Closed 🔒", "happiness");
    }
    set({ isPlayerHomeDoorOpen: next });
  },

  setNearVehicle: (nearVehicle) => set({ nearVehicle }),
  setVehicleSpeed: (vehicleSpeed) => set({ vehicleSpeed }),
  setSupercarPosition: (supercarPos, heading) =>
    set((state) => ({
      supercarPos,
      supercarHeading: heading !== undefined ? heading : state.supercarHeading,
    })),
  setEnterVehicleAnimation: (enterVehicleAnimation) => set({ enterVehicleAnimation }),

  playerHeading: 0,
  cameraMode: "chase",

  setPlayerHeading: (playerHeading) => set({ playerHeading }),

  toggleCameraMode: () => {
    audio.playClick();
    set((state) => ({
      cameraMode: state.cameraMode === "chase" ? "isometric" : "chase",
    }));
  },

  switchCharacter: (avatar) => {
    audio.playSuccess();
    const profiles: Record<string, { name: string; career: CareerType; hometown: string; age: number; education: string }> = {
      sokha: { name: "Sokha (សុខា)", career: "Teacher", hometown: "Kampong Cham", age: 24, education: "Pedagogy College" },
      sreyneath: { name: "Sreyneath (ស្រីនាថ)", career: "Developer", hometown: "Phnom Penh", age: 21, education: "Royal University of Phnom Penh" },
      vuth: { name: "Vuth (វុធ)", career: "Developer", hometown: "Phnom Penh", age: 25, education: "Institute of Technology of Cambodia" },
      taing: { name: "Taing (តាំង)", career: "Farmer", hometown: "Takeo", age: 32, education: "Agricultural Vocational" },
      sokunthea: { name: "Sokunthea (សុគន្ធា)", career: "ShopOwner", hometown: "Siem Reap", age: 28, education: "Business & Commerce" },
      chandy: { name: "Chandy (ចាន់ឌី)", career: "Kickboxer", hometown: "Phnom Penh", age: 28, education: "National Sports Academy" },
      maiko: { name: "Maiko (ម៉ៃកូ)", career: "Kickboxer", hometown: "Kampong Cham", age: 22, education: "Kampong Cham Boxing Club" },
    };
    const sel = profiles[avatar] || profiles.sokha;
    set((state) => ({
      player: {
        ...state.player,
        name: sel.name,
        career: sel.career,
        hometown: sel.hometown,
        age: sel.age,
        education: sel.education,
        avatar,
      },
      combat: { ...state.combat, move: null, guarding: false, crouching: false, airborne: false, combo: 0 },
    }));
    get().addStatPop(`Switched to ${sel.name.split(" ")[0]}!`, "skill");
  },

  startNewGame: (profile) => {
    audio.playSuccess();
    set({
      player: profile,
      screen: "game_world",
      activeModal: "decision", // Pop up Day 1 "Choose Your Day"
      day: 1,
      timeHour: 7.0,
      stats: INITIAL_STATS,
      ridingVehicle: null,
      vehicleSpeed: 0,
      nearVehicle: null,
      dayHistory: {
        startMoney: 150,
        earned: 0,
        spent: 0,
        energyDelta: 0,
        happinessDelta: 0,
        stressDelta: 0,
        skillDelta: 0,
      },
      currentLocation: "home",
      playerPos: [-14, 0, -18],
      targetPos: [-14, 0, -18],
      cameraFocus: [-14, 0, -20],
    });
  },

  nearLocation: null,

  setNearLocation: (nearLocation) => set({ nearLocation }),

  setTargetPosition: (targetPos) => {
    set({
      targetPos,
      cameraFocus: targetPos,
    });
  },

  enterLocation: (locKey) => {
    const loc = locKey || get().nearLocation || get().currentLocation;
    audio.playOpen();
    if (loc === "cafe") {
      set({ activeModal: "cafe" });
    } else if (loc === "pagoda") {
      set({ activeModal: "pagoda" });
    } else if (loc === "market") {
      set({ activeModal: "market" });
    } else if (loc === "school") {
      set({ activeModal: "work" });
    } else if (loc === "home") {
      set({ activeModal: "home" });
    } else if (loc === "hotel") {
      set({ activeModal: "hotel" });
    } else if (loc === "stadium") {
      const p = LOCATION_COORDINATES.stadium;
      set({ targetPos: p, cameraFocus: p });
      const isKm = get().language === "km";
      get().addStatPop(isKm ? "សូមស្វាគមន៍មកកាន់ពហុកីឡដ្ឋាន! ⚽" : "Welcome to the Stadium Pitch! ⚽", "happiness");
    } else if (loc === "volleyball") {
      const p = LOCATION_COORDINATES.volleyball;
      set({ targetPos: p, cameraFocus: p });
      const isKm = get().language === "km";
      get().addStatPop(isKm ? "សូមស្វាគមន៍មកកាន់តារាងបាល់ទះ! 🏐" : "Welcome to Volleyball Court! 🏐", "happiness");
    } else {
      set({ activeModal: "decision" });
    }
  },

  moveToLocation: (loc) => {
    const coords = LOCATION_COORDINATES[loc];
    audio.playClick();
    set({
      currentLocation: loc,
      nearLocation: loc,
      targetPos: coords,
      cameraFocus: coords,
    });
  },

  addStatPop: (text, type) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      statPops: [...state.statPops, { id, text, type }],
    }));
    setTimeout(() => {
      get().removeStatPop(id);
    }, 2400);
  },

  removeStatPop: (id) => {
    set((state) => ({
      statPops: state.statPops.filter((p) => p.id !== id),
    }));
  },

  advanceTime: (hours) => {
    const current = get().timeHour;
    const nextTime = Math.min(23.0, current + hours);
    set({ timeHour: nextTime });

    // Check if time reaches bedtime (22:00 / 10:00 PM)
    if (nextTime >= 22.0 && get().activeModal !== "summary") {
      get().sleepAndEndDay();
    }
  },

  performWork: ({ plan, dilemma }) => {
    audio.playMoney();
    const state = get();
    const wage = 12;
    const energyCost = 22;
    const stressGain = 8;
    const skillGain = 1;

    const newMoney = state.stats.money + wage;
    const newEnergy = Math.max(0, state.stats.energy - energyCost);
    const newStress = Math.min(100, state.stats.stress + stressGain);
    const newSkill = state.stats.teachingSkill + skillGain;
    const newReputation = Math.min(100, state.stats.reputation + 2);

    state.addStatPop(`+$${wage}`, "money");
    state.addStatPop(`-${energyCost} Energy`, "energy");
    state.addStatPop(`+1 Skill`, "skill");

    const timeStr = formatTimeHour(state.timeHour);
    const journalEntry: JournalEntry = {
      id: "j-" + Date.now(),
      day: state.day,
      timeStr,
      titleEn: "Taught Class at Kampong Cham School",
      titleKm: "បង្រៀនសិស្សនៅសាលាកំពង់ចាម",
      descEn: `Completed a teaching session using ${plan}. Addressed classroom situation with ${dilemma}. Earned $${wage}.`,
      descKm: `បានបញ្ចប់ការបង្រៀនដោយប្រើវិធីសាស្ត្រ ${plan}។ សិស្សានុសិស្សសប្បាយរីករាយ និងទទួលបានប្រាក់កម្រៃ $${wage}។`,
      tag: "work",
      badge: "+$12",
    };

    set({
      stats: {
        ...state.stats,
        money: newMoney,
        energy: newEnergy,
        stress: newStress,
        teachingSkill: newSkill,
        reputation: newReputation,
      },
      dayHistory: {
        ...state.dayHistory,
        earned: state.dayHistory.earned + wage,
        energyDelta: state.dayHistory.energyDelta - energyCost,
        stressDelta: state.dayHistory.stressDelta + stressGain,
        skillDelta: state.dayHistory.skillDelta + skillGain,
      },
      journal: [journalEntry, ...state.journal],
      activeModal: null,
      currentLocation: "school",
      playerPos: LOCATION_COORDINATES.school,
      targetPos: LOCATION_COORDINATES.school,
      cameraFocus: LOCATION_COORDINATES.school,
    });

    get().advanceTime(3.5);
  },

  performVisitFamily: () => {
    audio.playHeart();
    const state = get();
    const giftCost = 4;
    const happinessGain = 18;
    const stressReduction = 10;
    const bondGain = 8;

    const newMoney = Math.max(0, state.stats.money - giftCost);
    const newHappiness = Math.min(100, state.stats.happiness + happinessGain);
    const newStress = Math.max(0, state.stats.stress - stressReduction);
    const newBond = Math.min(100, state.relationships.grandma + bondGain);

    state.addStatPop(`+${happinessGain} Happiness`, "happiness");
    state.addStatPop(`-$${giftCost} Fruit Gift`, "money");

    const timeStr = formatTimeHour(state.timeHour);
    const journalEntry: JournalEntry = {
      id: "j-" + Date.now(),
      day: state.day,
      timeStr,
      titleEn: "Visited Grandma with Fresh Tropical Fruit",
      titleKm: "ទៅសួរសុខទុក្ខលោកយាយ និងផ្ញើផ្លែឈើ",
      descEn: "Spent heartwarming hours talking with grandma under the jackfruit trees. She blessed you with good health.",
      descKm: "បានអង្គុយជជែកសំណេះសំណាលជាមួយលោកយាយក្រោមម្លប់ឈើត្រជាក់។ លោកយាយបានជូនពរឱ្យមានសុខភាពល្អ និងជោគជ័យ។",
      tag: "family",
      badge: "❤️ Family",
    };

    set({
      stats: {
        ...state.stats,
        money: newMoney,
        happiness: newHappiness,
        stress: newStress,
      },
      relationships: {
        ...state.relationships,
        grandma: newBond,
      },
      dayHistory: {
        ...state.dayHistory,
        spent: state.dayHistory.spent + giftCost,
        happinessDelta: state.dayHistory.happinessDelta + happinessGain,
        stressDelta: state.dayHistory.stressDelta - stressReduction,
      },
      journal: [journalEntry, ...state.journal],
      activeModal: null,
      currentLocation: "home",
      playerPos: LOCATION_COORDINATES.home,
      targetPos: LOCATION_COORDINATES.home,
      cameraFocus: LOCATION_COORDINATES.home,
    });

    get().advanceTime(2.5);
  },

  performCallFamily: (member) => {
    audio.playHeart();
    const state = get();
    const currentBond = state.relationships[member];
    const newBond = Math.min(100, currentBond + 5);
    const newHappiness = Math.min(100, state.stats.happiness + 6);

    state.addStatPop("+6 Happiness", "happiness");

    const timeStr = formatTimeHour(state.timeHour);
    const isGrandma = member === "grandma";
    const journalEntry: JournalEntry = {
      id: "j-" + Date.now(),
      day: state.day,
      timeStr,
      titleEn: `Phone Call with ${isGrandma ? "Grandma" : "Mother"}`,
      titleKm: `ខលទូរស័ព្ទទៅកាន់${isGrandma ? "លោកយាយ" : "អ្នកម្តាយ"}`,
      descEn: `Had a sweet 20-minute phone call. Shared updates about life in Kampong Cham.`,
      descKm: `បានខលនិយាយគ្នាលេងយ៉ាងកក់ក្តៅ និងប្រាប់ពីការងារបង្រៀននៅកំពង់ចាម។`,
      tag: "family",
      badge: "📞 Call",
    };

    set({
      stats: {
        ...state.stats,
        happiness: newHappiness,
      },
      relationships: {
        ...state.relationships,
        [member]: newBond,
      },
      journal: [journalEntry, ...state.journal],
    });

    get().advanceTime(0.5);
  },

  performRest: () => {
    audio.playSuccess();
    const state = get();
    const energyGain = 25;
    const stressReduction = 15;

    const newEnergy = Math.min(100, state.stats.energy + energyGain);
    const newStress = Math.max(0, state.stats.stress - stressReduction);

    state.addStatPop(`+${energyGain} Energy`, "energy");
    state.addStatPop(`-${stressReduction} Stress`, "stress");

    const timeStr = formatTimeHour(state.timeHour);
    const journalEntry: JournalEntry = {
      id: "j-" + Date.now(),
      day: state.day,
      timeStr,
      titleEn: "Hammock Rest Under Wooden Stilt House",
      titleKm: "សម្រាកដេកអង្រឹងក្រោមផ្ទះឈើ",
      descEn: "Felt the gentle river breeze while resting in the hammock. Recharged mind and body.",
      descKm: "បានសម្រាកលំហែអារម្មណ៍យ៉ាងស្ងប់ស្ងាត់ជាមួយខ្យល់ទន្លេដ៏ត្រជាក់ ស្រស់ស្រាយឡើងវិញ។",
      tag: "rest",
      badge: "⚡ Rest",
    };

    set({
      stats: {
        ...state.stats,
        energy: newEnergy,
        stress: newStress,
      },
      dayHistory: {
        ...state.dayHistory,
        energyDelta: state.dayHistory.energyDelta + energyGain,
        stressDelta: state.dayHistory.stressDelta - stressReduction,
      },
      journal: [journalEntry, ...state.journal],
      activeModal: null,
      currentLocation: "home",
      playerPos: LOCATION_COORDINATES.home,
      targetPos: LOCATION_COORDINATES.home,
      cameraFocus: LOCATION_COORDINATES.home,
    });

    get().advanceTime(2.0);
  },

  performHobby: () => {
    audio.playClick();
    const state = get();
    const cost = 3;
    const happinessGain = 14;
    const stressReduction = 12;

    const newMoney = Math.max(0, state.stats.money - cost);
    const newHappiness = Math.min(100, state.stats.happiness + happinessGain);
    const newStress = Math.max(0, state.stats.stress - stressReduction);

    state.addStatPop(`+${happinessGain} Happiness`, "happiness");
    state.addStatPop(`-$${cost} Coffee & Music`, "money");

    const timeStr = formatTimeHour(state.timeHour);
    const journalEntry: JournalEntry = {
      id: "j-" + Date.now(),
      day: state.day,
      timeStr,
      titleEn: "Iced Coffee & Music by the Mekong River",
      titleKm: "ញ៉ាំកាហ្វេទឹកកក និងស្តាប់តន្ត្រីមាត់ទន្លេមេគង្គ",
      descEn: "Sat on a little plastic chair at the riverside cart. Watched wooden boats pass by while listening to sweet melodies.",
      descKm: "បានអង្គុយកៅអីជ័រមាត់ទន្លេ ញ៉ាំកាហ្វេទឹកដោះគោទឹកកក មើលទូកឆ្លងកាត់ និងស្តាប់ភ្លេងយ៉ាងរំភើប។",
      tag: "hobby",
      badge: "🎵 Hobby",
    };

    set({
      stats: {
        ...state.stats,
        money: newMoney,
        happiness: newHappiness,
        stress: newStress,
      },
      dayHistory: {
        ...state.dayHistory,
        spent: state.dayHistory.spent + cost,
        happinessDelta: state.dayHistory.happinessDelta + happinessGain,
        stressDelta: state.dayHistory.stressDelta - stressReduction,
      },
      journal: [journalEntry, ...state.journal],
      activeModal: null,
      currentLocation: "cafe",
      playerPos: LOCATION_COORDINATES.cafe,
      targetPos: LOCATION_COORDINATES.cafe,
      cameraFocus: LOCATION_COORDINATES.cafe,
    });

    get().advanceTime(1.5);
  },

  performCafeDrink: () => {
    audio.playClick();
    const state = get();
    const cost = 1.5;
    const happinessGain = 16;
    const stressReduction = 15;

    const newMoney = Math.max(0, state.stats.money - cost);
    const newHappiness = Math.min(100, state.stats.happiness + happinessGain);
    const newStress = Math.max(0, state.stats.stress - stressReduction);

    state.addStatPop(`+${happinessGain} Happiness`, "happiness");
    state.addStatPop(`-$${cost} Iced Coffee`, "money");

    const timeStr = formatTimeHour(state.timeHour);
    const journalEntry: JournalEntry = {
      id: "j-" + Date.now(),
      day: state.day,
      timeStr,
      titleEn: "Sweet Iced Milk Coffee at Riverside Stall",
      titleKm: "ញ៉ាំកាហ្វេទឹកដោះគោទឹកកកមាត់ទន្លេមេគង្គ",
      descEn: "Sat on the little red plastic stool enjoying cold sweet coffee and watching boat traffic across the Mekong.",
      descKm: "បានអង្គុយកៅអីជ័រក្រហម ញ៉ាំកាហ្វេទឹកដោះគោទឹកកកយ៉ាងផ្អែមឆ្ងាញ់ និងមើលទូកឆ្លងកាត់ទន្លេមេគង្គ។",
      tag: "hobby",
      badge: "☕ Cafe",
    };

    set({
      stats: {
        ...state.stats,
        money: newMoney,
        happiness: newHappiness,
        stress: newStress,
      },
      dayHistory: {
        ...state.dayHistory,
        spent: state.dayHistory.spent + cost,
        happinessDelta: state.dayHistory.happinessDelta + happinessGain,
        stressDelta: state.dayHistory.stressDelta - stressReduction,
      },
      journal: [journalEntry, ...state.journal],
      activeModal: null,
    });

    get().advanceTime(1.0);
  },

  performPagodaMerit: () => {
    audio.playHeart();
    const state = get();
    const cost = 2.0;
    const happinessGain = 20;
    const stressReduction = 25;
    const repGain = 3;

    const newMoney = Math.max(0, state.stats.money - cost);
    const newHappiness = Math.min(100, state.stats.happiness + happinessGain);
    const newStress = Math.max(0, state.stats.stress - stressReduction);
    const newRep = Math.min(100, state.stats.reputation + repGain);

    state.addStatPop(`+${happinessGain} Happiness`, "happiness");
    state.addStatPop(`-${stressReduction} Stress`, "stress");
    state.addStatPop(`+${repGain} Reputation`, "skill");

    const timeStr = formatTimeHour(state.timeHour);
    const journalEntry: JournalEntry = {
      id: "j-" + Date.now(),
      day: state.day,
      timeStr,
      titleEn: "Offered Lotus Flowers & Prayed at Wat Kampong Cham",
      titleKm: "ថ្វាយផ្កាឈូក និងបួងសួងនៅវត្តអារាម",
      descEn: "Lit fragrant incense, offered fresh lotus blossoms, and listened to the gentle temple bells. Felt profound peace.",
      descKm: "បានអុជធូប ថ្វាយផ្កាឈូកស្រស់ និងស្តាប់សូរសំឡេងជួងវត្តដ៏ពីរោះ ធ្វើឱ្យចិត្តស្ងប់ក្សាន្តក្រៃលែង។",
      tag: "rest",
      badge: "🛕 Pagoda",
    };

    set({
      stats: {
        ...state.stats,
        money: newMoney,
        happiness: newHappiness,
        stress: newStress,
        reputation: newRep,
      },
      dayHistory: {
        ...state.dayHistory,
        spent: state.dayHistory.spent + cost,
        happinessDelta: state.dayHistory.happinessDelta + happinessGain,
        stressDelta: state.dayHistory.stressDelta - stressReduction,
      },
      journal: [journalEntry, ...state.journal],
      activeModal: null,
    });

    get().advanceTime(1.5);
  },

  performMarketBuy: (cost, itemNameEn, itemNameKm) => {
    audio.playMoney();
    const state = get();
    const happinessGain = 12;
    const energyGain = 15;

    const newMoney = Math.max(0, state.stats.money - cost);
    const newHappiness = Math.min(100, state.stats.happiness + happinessGain);
    const newEnergy = Math.min(100, state.stats.energy + energyGain);

    state.addStatPop(`-$${cost}`, "money");
    state.addStatPop(`+${energyGain} Energy`, "energy");

    const timeStr = formatTimeHour(state.timeHour);
    const journalEntry: JournalEntry = {
      id: "j-" + Date.now(),
      day: state.day,
      timeStr,
      titleEn: `Bought ${itemNameEn} at Kampong Cham Market`,
      titleKm: `ទិញ ${itemNameKm} នៅផ្សារកំពង់ចាម`,
      descEn: `Walked through the busy colorful market rows and enjoyed delicious local treats.`,
      descKm: `បានដើរលេងក្នុងផ្សារដ៏អ៊ូអរ និងទិញចំណីអាហារឆ្ងាញ់ៗហូប។`,
      tag: "hobby",
      badge: "🍉 Market",
    };

    set({
      stats: {
        ...state.stats,
        money: newMoney,
        happiness: newHappiness,
        energy: newEnergy,
      },
      dayHistory: {
        ...state.dayHistory,
        spent: state.dayHistory.spent + cost,
        happinessDelta: state.dayHistory.happinessDelta + happinessGain,
        energyDelta: state.dayHistory.energyDelta + energyGain,
      },
      journal: [journalEntry, ...state.journal],
      activeModal: null,
    });

    get().advanceTime(1.0);
  },

  performHotelStay: () => {
    audio.playSuccess();
    const state = get();
    const cost = 25;
    const happinessGain = 30;
    const energyGain = 40;
    const stressReduction = 35;
    const newMoney = Math.max(0, state.stats.money - cost);
    const newHappiness = Math.min(100, state.stats.happiness + happinessGain);
    const newEnergy = Math.min(100, state.stats.energy + energyGain);
    const newStress = Math.max(0, state.stats.stress - stressReduction);

    state.addStatPop(`-$${cost} Luxury Suite`, "money");
    state.addStatPop(`+${energyGain} Energy`, "energy");
    state.addStatPop(`-${stressReduction} Stress`, "stress");

    const timeStr = formatTimeHour(state.timeHour);
    const journalEntry: JournalEntry = {
      id: "j-" + Date.now(),
      day: state.day,
      timeStr,
      titleEn: "Relaxed at Mekong Riverside Grand Hotel",
      titleKm: "សម្រាកលំហែនៅសណ្ឋាគារលំដាប់ខ្ពស់មាត់ទន្លេមេគង្គ",
      descEn: "Enjoyed breathtaking rooftop views over the Mekong River and rested in a luxurious executive suite.",
      descKm: "បានទស្សនាទេសភាពដ៏ស្រស់ត្រកាលនៃដងទន្លេមេគង្គពីលើដំបូលសណ្ឋាគារ និងសម្រាកយ៉ាងមានផាសុកភាព។",
      tag: "rest",
      badge: "🏨 Hotel",
    };

    set({
      stats: {
        ...state.stats,
        money: newMoney,
        happiness: newHappiness,
        energy: newEnergy,
        stress: newStress,
      },
      dayHistory: {
        ...state.dayHistory,
        spent: state.dayHistory.spent + cost,
        happinessDelta: state.dayHistory.happinessDelta + happinessGain,
        energyDelta: state.dayHistory.energyDelta + energyGain,
        stressDelta: state.dayHistory.stressDelta - stressReduction,
      },
      journal: [journalEntry, ...state.journal],
      activeModal: null,
    });

    get().advanceTime(2.0);
  },

  goalsScored: 0,
  volleyballRallies: 0,
  selectedJersey: "cambodia_blue",

  setSelectedJersey: (jersey) => {
    set({ selectedJersey: jersey });
    const isKm = get().language === "km";
    const name =
      jersey === "cambodia_blue"
        ? (isKm ? "ឈុតជម្រើសជាតិ ខៀវ 🇰🇭" : "Cambodia National Blue Kit 🇰🇭")
        : jersey === "cambodia_red"
        ? (isKm ? "ឈុតជម្រើសជាតិ ក្រហម 🔴" : "Cambodia National Red Kit 🔴")
        : jersey === "cambodia_white"
        ? (isKm ? "ឈុតប្រកួតក្រៅដី ស ⚪" : "Cambodia Away White Kit ⚪")
        : (isKm ? "ឈុតកីឡាហ្វឹកហាត់ 🏃" : "Sport Casual Training Attire 🏃");
    audio.playClick();
    get().addStatPop(isKm ? `បានផ្លាស់ ${name}` : `Equipped ${name}`, "happiness");
  },

  restInLockerRoom: () => {
    audio.playClick();
    const isKm = get().language === "km";
    get().addStatPop(isKm ? "សម្រាកនៅបន្ទប់កីឡា (+30 Energy, -20 Stress)" : "Rested in Locker Room (+30 Energy, -20 Stress)", "energy");
    set((state) => ({
      stats: {
        ...state.stats,
        energy: Math.min(100, state.stats.energy + 30),
        stress: Math.max(0, state.stats.stress - 20),
        health: Math.min(100, state.stats.health + 10),
      },
    }));
    get().advanceTime(1.0);
  },

  drinkCoconutWater: () => {
    const money = get().stats.money;
    if (money < 1.5) {
      const isKm = get().language === "km";
      get().addStatPop(isKm ? "មិនគ្រប់ប្រាក់ទិញទឹកដូង ($1.50)!" : "Not enough cash for coconut ($1.50)!", "stress");
      return;
    }
    audio.playSip();
    const isKm = get().language === "km";
    get().addStatPop(isKm ? "ទឹកដូងក្រអូបធម្មជាតិ 🥥 (+20 Energy, +15 Happiness)" : "Fresh Fragrant Coconut 🥥 (+20 Energy, +15 Happiness)", "happiness");
    set((state) => ({
      stats: {
        ...state.stats,
        money: state.stats.money - 1.5,
        energy: Math.min(100, state.stats.energy + 20),
        happiness: Math.min(100, state.stats.happiness + 15),
        stress: Math.max(0, state.stats.stress - 10),
      },
    }));
    get().advanceTime(0.5);
  },

  eatSportsSnack: () => {
    const money = get().stats.money;
    if (money < 2.0) {
      const isKm = get().language === "km";
      get().addStatPop(isKm ? "មិនគ្រប់ប្រាក់ទិញអាហារ ($2.00)!" : "Not enough cash for snack ($2.00)!", "stress");
      return;
    }
    audio.playEat();
    const isKm = get().language === "km";
    get().addStatPop(isKm ? "មីឆាប្រូតេអ៊ីនកីឡា 🍜 (+25 Energy, +10 Health)" : "Sports Protein Noodles 🍜 (+25 Energy, +10 Health)", "energy");
    set((state) => ({
      stats: {
        ...state.stats,
        money: state.stats.money - 2.0,
        energy: Math.min(100, state.stats.energy + 25),
        health: Math.min(100, state.stats.health + 10),
        happiness: Math.min(100, state.stats.happiness + 10),
        stress: Math.max(0, state.stats.stress - 10),
      },
    }));
    get().advanceTime(0.5);
  },

  scoreFootballGoal: () => {
    const nextGoals = get().goalsScored + 1;
    audio.playGoalCheer();
    const isKm = get().language === "km";
    get().addStatPop(isKm ? `ចូលទី! គ្រាប់ទី ${nextGoals} ⚽` : `GOAL! #${nextGoals} ⚽`, "happiness");
    set((state) => ({
      goalsScored: nextGoals,
      stats: {
        ...state.stats,
        health: Math.min(100, state.stats.health + 5),
        happiness: Math.min(100, state.stats.happiness + 8),
        stress: Math.max(0, state.stats.stress - 5),
      },
    }));
  },

  playVolleyballRally: () => {
    const count = get().volleyballRallies + 1;
    audio.playVolleyHit();
    const isKm = get().language === "km";
    get().addStatPop(isKm ? `ប៉ះសីបាល់ទះ! x${count} 🏐` : `Volley Rally! x${count} 🏐`, "skill");
    set((state) => ({
      volleyballRallies: count,
      stats: {
        ...state.stats,
        energy: Math.max(5, state.stats.energy - 3),
        health: Math.min(100, state.stats.health + 4),
        happiness: Math.min(100, state.stats.happiness + 5),
        stress: Math.max(0, state.stats.stress - 4),
      },
    }));
  },

  combat: {
    move: null,
    moveId: 0,
    guarding: false,
    crouching: false,
    airborne: false,
    combo: 0,
    lastPunchAt: -Infinity,
    punchesThrown: 0,
  },

  performCombatMove: (requested) => {
    const state = get();
    if (!CHARACTERS[state.player.avatar as keyof typeof CHARACTERS]?.canFight) return;
    if (state.ridingVehicle || state.activeModal) return;
    const c = state.combat;
    const isKm = state.language === "km";

    if (requested === "jump") {
      if (c.airborne || c.move) return;
      if (!canPerform("jump", state.stats.energy)) {
        get().addStatPop(isKm ? "អស់កម្លាំង! សម្រាកសិន 😮‍💨" : "Too tired! Rest first 😮‍💨", "energy");
        return;
      }
      audio.playJump(false);
      set((s) => ({
        combat: { ...s.combat, airborne: true, crouching: false },
        stats: { ...s.stats, energy: Math.max(0, s.stats.energy - MOVE_ENERGY_COST.jump) },
      }));
      return;
    }

    // One move at a time; in the air only punches are allowed.
    if (c.move) return;
    if (c.airborne && requested !== "punch") return;

    const now = performance.now() / 1000;
    const combo = requested === "punch" ? nextCombo(c.combo, c.lastPunchAt, now) : c.combo;
    const move: CombatMove = requested === "punch" ? comboPunch(combo) : requested;

    if (!canPerform(move, state.stats.energy)) {
      get().addStatPop(isKm ? "អស់កម្លាំង! សម្រាកសិន 😮‍💨" : "Too tired! Rest first 😮‍💨", "energy");
      return;
    }

    if (isPunch(move)) {
      audio.playPunch(PUNCH_POWER[move]);
    } else if (move === "dodge") {
      audio.playGuard();
    } else if (move === "victory") {
      audio.playSuccess();
    }

    const punchesThrown = c.punchesThrown + (isPunch(move) ? 1 : 0);
    const reward = isPunch(move) ? trainingReward(punchesThrown) : null;

    set((s) => ({
      combat: {
        ...s.combat,
        move,
        moveId: s.combat.moveId + 1,
        combo: isPunch(move) ? combo : s.combat.combo,
        lastPunchAt: isPunch(move) ? now : s.combat.lastPunchAt,
        punchesThrown,
      },
      stats: {
        ...s.stats,
        energy: Math.max(0, s.stats.energy - MOVE_ENERGY_COST[move]),
        stress: reward ? Math.max(0, s.stats.stress + reward.stress) : s.stats.stress,
        happiness: reward ? Math.min(100, s.stats.happiness + reward.happiness) : s.stats.happiness,
      },
    }));

    if (isPunch(move) && combo >= 3 && combo % 3 === 0) {
      get().addStatPop(isKm ? `បន្តបន្ទាប់ x${combo} 🥊` : `Combo x${combo} 🥊`, "skill");
    }
    if (reward) {
      get().addStatPop(isKm ? `ហាត់ប្រដាល់ ${punchesThrown} ដង! ស្ត្រេស ${reward.stress}` : `${punchesThrown} punches trained! Stress ${reward.stress}`, "stress");
    }
  },

  finishCombatMove: (moveId) => {
    // Only clear the move if no newer move started meanwhile.
    if (get().combat.moveId !== moveId) return;
    set((s) => ({ combat: { ...s.combat, move: null } }));
  },

  land: () => {
    if (!get().combat.airborne) return;
    audio.playJump(true);
    set((s) => ({ combat: { ...s.combat, airborne: false } }));
  },

  setGuard: (on) => {
    const c = get().combat;
    if (c.guarding === on) return;
    if (on) {
      if (!CHARACTERS[get().player.avatar as keyof typeof CHARACTERS]?.canFight || get().ridingVehicle) return;
      audio.playGuard();
    }
    set((s) => ({ combat: { ...s.combat, guarding: on } }));
  },

  toggleCrouch: () => {
    if (!CHARACTERS[get().player.avatar as keyof typeof CHARACTERS]?.canFight || get().ridingVehicle) return;
    set((s) => ({ combat: { ...s.combat, crouching: !s.combat.crouching } }));
  },

  sleepAndEndDay: () => {
    audio.playNight();
    const state = get();
    const summary: DaySummaryData = {
      day: state.day,
      startMoney: state.dayHistory.startMoney,
      endMoney: state.stats.money,
      earned: state.dayHistory.earned,
      spent: state.dayHistory.spent,
      energyDelta: state.dayHistory.energyDelta,
      happinessDelta: state.dayHistory.happinessDelta,
      stressDelta: state.dayHistory.stressDelta,
      skillDelta: state.dayHistory.skillDelta,
      highlightEn: `Day ${state.day} ended serenely in Kampong Cham. Your students learned well, and your family ties grew warmer.`,
      highlightKm: `ថ្ងៃទី ${state.day} បានបញ្ចប់ទៅដោយភាពសុខសាន្តនៅកំពង់ចាម។ សិស្សានុសិស្សពេញចិត្តនឹងការបង្រៀន ហើយចំណងមេត្រីភាពគ្រួសារកាន់តែកក់ក្តៅ។`,
    };

    set({
      timeHour: 22.0,
      lastDaySummary: summary,
      activeModal: "summary",
    });
  },

  startNextDay: () => {
    audio.playSuccess();
    const state = get();
    const nextDay = state.day + 1;

    // Reset daily energy from full night sleep
    const refreshedEnergy = 95;
    const reducedStress = Math.max(5, state.stats.stress - 15);

    const timeStr = "07:00 AM";
    const morningEntry: JournalEntry = {
      id: "j-" + Date.now(),
      day: nextDay,
      timeStr,
      titleEn: `Day ${nextDay} Began`,
      titleKm: `ចាប់ផ្តើមថ្ងៃទី ${nextDay}`,
      descEn: "Woke up to roosters crowing in the village and warm golden sunlight across the palm trees.",
      descKm: "ភ្ញាក់ពីដំណេកជាមួយនឹងសូរសត្វមាន់រងាវ និងពន្លឺព្រះអាទិត្យពណ៌មាសចាំងតាមចុងត្នោត។",
      tag: "system",
      badge: `☀️ Day ${nextDay}`,
    };

    set({
      day: nextDay,
      timeHour: 7.0,
      stats: {
        ...state.stats,
        energy: refreshedEnergy,
        stress: reducedStress,
      },
      dayHistory: {
        startMoney: state.stats.money,
        earned: 0,
        spent: 0,
        energyDelta: 0,
        happinessDelta: 0,
        stressDelta: 0,
        skillDelta: 0,
      },
      journal: [morningEntry, ...state.journal],
      activeModal: "decision", // Prompt new decisions for the fresh day
      currentLocation: "home",
      playerPos: LOCATION_COORDINATES.home,
      targetPos: LOCATION_COORDINATES.home,
      cameraFocus: LOCATION_COORDINATES.home,
    });
  },
}));

export function formatTimeHour(hourFloat: number): string {
  const totalMinutes = Math.floor(hourFloat * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const displayMin = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${displayHour}:${displayMin} ${ampm}`;
}
