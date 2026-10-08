"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { loadFBX } from "@/game/assets/FBXModel";
import { useGameStore } from "@/state/gameStore";
import {
  X,
  Check,
  RotateCw,
  Sparkles,
  GraduationCap,
  Laptop,
  Wheat,
  Store,
  MapPin,
  Calendar,
  Briefcase,
  ChevronRight,
  Flame,
} from "lucide-react";
import { SPRITES } from "@/game/assets/assetPaths";
import { CHARACTERS, type CharacterId } from "@/data/characters";
import { ClipCharacterAvatar } from "@/game/player/ClipCharacterAvatar";

// Mini 3D Character Preview Mesh for Modal - Loads Real FBX with Procedural Fallback
function CharacterPreviewMesh({ avatarId }: { avatarId: string }) {
  const meshGroup = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const armLRef = useRef<THREE.Group>(null);
  const armRRef = useRef<THREE.Group>(null);

  const [fbxModel, setFbxModel] = useState<THREE.Group | null>(null);

  const characterDef = CHARACTERS[avatarId as CharacterId];
  const usesClipRig = characterDef?.rig === "clips";

  useEffect(() => {
    let active = true;
    const url = characterDef?.model;
    // Clip-rigged characters render via ClipCharacterAvatar (render branch prefers it).
    if (!url || usesClipRig) return;

    loadFBX(url)
      .then((loaded) => {
        if (active) {
          const clone = SkeletonUtils.clone(loaded) as THREE.Group;
          clone.position.set(0, 0, 0);
          clone.rotation.set(0, 0, 0);
          clone.scale.set(1.0, 1.0, 1.0);
          setFbxModel(clone);
        }
      })
      .catch((err) => {
        console.warn("Failed to load character FBX for preview:", url, err);
        if (active) setFbxModel(null);
      });

    return () => {
      active = false;
    };
  }, [characterDef?.model, usesClipRig]);

  const isFemale = avatarId === "sreyneath" || avatarId === "sokunthea";
  const skinColor =
    avatarId === "taing"
      ? "#AD744E"
      : avatarId === "chandy"
      ? "#D4946A"
      : avatarId === "sreyneath" || avatarId === "vuth"
      ? "#E9B996"
      : "#CF946A";

  const hairColor =
    avatarId === "chandy"
      ? "#F2691C"
      : avatarId === "sokunthea"
      ? "#33241B"
      : "#1C1714";

  const topColor =
    avatarId === "chandy"
      ? "#1C1D21"
      : avatarId === "vuth"
      ? "#1A1B1F"
      : avatarId === "taing"
      ? "#6E3B35"
      : avatarId === "sokunthea"
      ? "#FAF8F2"
      : "#ECEEF1";

  const bottomColor =
    avatarId === "chandy"
      ? "#2E5DB2"
      : avatarId === "vuth"
      ? "#2C2E34"
      : avatarId === "taing"
      ? "#3F5C84"
      : avatarId === "sokunthea"
      ? "#2A3A4F"
      : "#1F2A44";

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshGroup.current) {
      // Gentle breathing & floating idle
      meshGroup.current.position.y = -0.7 + Math.sin(t * 2.0) * 0.02;
    }
    if (fbxModel) {
      const head = fbxModel.getObjectByName("Head");
      if (head) {
        head.rotation.y = Math.sin(t * 0.8) * 0.15;
      }
      return;
    }
    if (armLRef.current) {
      armLRef.current.rotation.x = Math.sin(t * 1.5) * 0.06;
      armLRef.current.rotation.z = 0.1;
    }
    if (armRRef.current) {
      armRRef.current.rotation.x = -Math.sin(t * 1.5) * 0.06;
      armRRef.current.rotation.z = -0.1;
    }
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.8) * 0.15;
    }
  });

  return (
    <group ref={meshGroup} position={[0, -0.7, 0]}>
      {/* Ground Pedestal / Spotlight Disc */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.75, 0.8, 0.08, 24]} />
        <meshStandardMaterial color="#1E293B" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[0, -0.005, 0]}>
        <ringGeometry args={[0.62, 0.72, 24]} />
        <meshBasicMaterial color="#F59E0B" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {usesClipRig && characterDef ? (
        <ClipCharacterAvatar modelUrl={characterDef.model} texturePrefix={characterDef.texturePrefix ?? characterDef.nameEn} mode="preview" />
      ) : fbxModel ? (
        <primitive object={fbxModel} />
      ) : (
        /* Procedural Fallback Mesh (Facing Camera) */
        <group rotation={[0, Math.PI, 0]}>
          {/* Hips & Waist */}
          <mesh position={[0, 0.74, 0]} castShadow>
            <boxGeometry args={[0.38, 0.14, 0.24]} />
            <meshStandardMaterial color={bottomColor} />
          </mesh>

          {/* Skirt for Sreyneath */}
          {avatarId === "sreyneath" && (
            <mesh position={[0, 0.58, 0]} castShadow>
              <cylinderGeometry args={[0.22, 0.34, 0.34, 12]} />
              <meshStandardMaterial color={bottomColor} />
            </mesh>
          )}

          {/* Torso / Shirt */}
          <mesh position={[0, 1.05, 0]} castShadow>
            <boxGeometry args={[0.42, 0.46, 0.25]} />
            <meshStandardMaterial color={topColor} roughness={0.7} />
          </mesh>

          {/* Gold belt for Chandy kickboxer */}
          {avatarId === "chandy" && (
            <mesh position={[0, 0.81, 0]}>
              <boxGeometry args={[0.4, 0.04, 0.26]} />
              <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.2} />
            </mesh>
          )}

          {/* Apron for Sokunthea */}
          {avatarId === "sokunthea" && (
            <mesh position={[0, 0.98, -0.13]} castShadow>
              <boxGeometry args={[0.34, 0.42, 0.02]} />
              <meshStandardMaterial color="#B5642F" roughness={0.9} />
            </mesh>
          )}

          {/* Backpack for Sokha */}
          {avatarId === "sokha" && (
            <mesh position={[0, 1.06, 0.18]} castShadow>
              <boxGeometry args={[0.3, 0.38, 0.14]} />
              <meshStandardMaterial color="#232529" roughness={0.8} />
            </mesh>
          )}

          {/* Cambodian Krama Scarf for Taing */}
          {avatarId === "taing" && (
            <mesh position={[0, 1.28, 0]}>
              <torusGeometry args={[0.14, 0.045, 6, 12]} />
              <meshStandardMaterial color="#8E3436" roughness={0.9} />
            </mesh>
          )}

          {/* Head Group */}
          <group ref={headRef} position={[0, 1.35, 0]}>
            {/* Neck */}
            <mesh position={[0, -0.02, 0]}>
              <cylinderGeometry args={[0.07, 0.08, 0.1, 8]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>

            {/* Head */}
            <mesh position={[0, 0.16, 0]} castShadow>
              <sphereGeometry args={[0.2, 12, 12]} />
              <meshStandardMaterial color={skinColor} roughness={0.7} />
            </mesh>

            {/* Eyes */}
            <mesh position={[-0.065, 0.18, -0.18]}>
              <sphereGeometry args={[0.028, 6, 6]} />
              <meshStandardMaterial color="#151113" />
            </mesh>
            <mesh position={[0.065, 0.18, -0.18]}>
              <sphereGeometry args={[0.028, 6, 6]} />
              <meshStandardMaterial color="#151113" />
            </mesh>

            {/* Blush for Female */}
            {isFemale && (
              <>
                <mesh position={[-0.13, 0.14, -0.14]}>
                  <sphereGeometry args={[0.038, 6, 6]} />
                  <meshStandardMaterial color="#E79A8C" roughness={0.9} />
                </mesh>
                <mesh position={[0.13, 0.14, -0.14]}>
                  <sphereGeometry args={[0.038, 6, 6]} />
                  <meshStandardMaterial color="#E79A8C" roughness={0.9} />
                </mesh>
              </>
            )}

            {/* Hair */}
            <mesh position={[0, 0.26, 0.02]} castShadow>
              <sphereGeometry args={[0.21, 10, 10]} />
              <meshStandardMaterial color={hairColor} roughness={0.9} />
            </mesh>

            {/* Farmer Straw Hat */}
            {avatarId === "taing" && (
              <group position={[0, 0.32, 0]}>
                <mesh castShadow>
                  <coneGeometry args={[0.42, 0.16, 14]} />
                  <meshStandardMaterial color="#D8B26A" roughness={0.95} />
                </mesh>
              </group>
            )}

            {/* Headphones for Vuth */}
            {avatarId === "vuth" && (
              <group position={[0, 0.16, 0]}>
                <mesh>
                  <torusGeometry args={[0.23, 0.035, 6, 12, Math.PI]} />
                  <meshStandardMaterial color="#2C2E34" metalness={0.7} />
                </mesh>
                <mesh position={[-0.22, 0.02, 0]}>
                  <cylinderGeometry args={[0.05, 0.05, 0.04, 8]} />
                  <meshStandardMaterial color="#E11D48" />
                </mesh>
                <mesh position={[0.22, 0.02, 0]}>
                  <cylinderGeometry args={[0.05, 0.05, 0.04, 8]} />
                  <meshStandardMaterial color="#E11D48" />
                </mesh>
              </group>
            )}
          </group>

          {/* Left Arm */}
          <group ref={armLRef} position={[-0.26, 1.24, 0]}>
            <mesh position={[0, -0.22, 0]} castShadow>
              <boxGeometry args={[0.1, 0.44, 0.11]} />
              <meshStandardMaterial color={avatarId === "chandy" ? skinColor : topColor} />
            </mesh>
            {/* Prajioud arm band for Chandy */}
            {avatarId === "chandy" && (
              <mesh position={[0, -0.12, 0]}>
                <torusGeometry args={[0.075, 0.02, 6, 12]} />
                <meshStandardMaterial color="#C1252B" />
              </mesh>
            )}
            <mesh position={[0, -0.48, 0]}>
              <sphereGeometry args={[0.055, 6, 6]} />
              <meshStandardMaterial color={avatarId === "chandy" ? "#DCD3C1" : skinColor} />
            </mesh>
          </group>

          {/* Right Arm */}
          <group ref={armRRef} position={[0.26, 1.24, 0]}>
            <mesh position={[0, -0.22, 0]} castShadow>
              <boxGeometry args={[0.1, 0.44, 0.11]} />
              <meshStandardMaterial color={avatarId === "chandy" ? skinColor : topColor} />
            </mesh>
            {/* Prajioud arm band for Chandy */}
            {avatarId === "chandy" && (
              <mesh position={[0, -0.12, 0]}>
                <torusGeometry args={[0.075, 0.02, 6, 12]} />
                <meshStandardMaterial color="#2A4C99" />
              </mesh>
            )}
            <mesh position={[0, -0.48, 0]}>
              <sphereGeometry args={[0.055, 6, 6]} />
              <meshStandardMaterial color={avatarId === "chandy" ? "#DCD3C1" : skinColor} />
            </mesh>

            {/* Teaching Book */}
            {avatarId === "sokha" && (
              <mesh position={[0.06, -0.4, 0.06]} rotation={[0.4, 0, 0]}>
                <boxGeometry args={[0.04, 0.22, 0.16]} />
                <meshStandardMaterial color="#5F9C97" />
              </mesh>
            )}
          </group>

          {/* Left & Right Legs */}
          <mesh position={[-0.12, 0.38, 0]} castShadow>
            <boxGeometry args={[0.13, 0.64, 0.14]} />
            <meshStandardMaterial color={avatarId === "chandy" ? skinColor : bottomColor} />
          </mesh>
          <mesh position={[0.12, 0.38, 0]} castShadow>
            <boxGeometry args={[0.13, 0.64, 0.14]} />
            <meshStandardMaterial color={avatarId === "chandy" ? skinColor : bottomColor} />
          </mesh>

          {/* Shoes or Combat Ankle Wraps */}
          <mesh position={[-0.12, 0.05, 0.04]} castShadow>
            <boxGeometry args={[0.13, 0.09, 0.22]} />
            <meshStandardMaterial color={avatarId === "chandy" ? "#DCD3C1" : "#4A2E1B"} />
          </mesh>
          <mesh position={[0.12, 0.05, 0.04]} castShadow>
            <boxGeometry args={[0.13, 0.09, 0.22]} />
            <meshStandardMaterial color={avatarId === "chandy" ? "#DCD3C1" : "#4A2E1B"} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// =============================================================================
// MAIN CHARACTER SWITCHER MODAL COMPONENT
// =============================================================================
export function CharacterSwitcherModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const player = useGameStore((state) => state.player);
  const switchCharacter = useGameStore((state) => state.switchCharacter);
  const language = useGameStore((state) => state.language);

  // Active character being inspected in the 3D viewer
  const [inspectId, setInspectId] = useState<string>(player.avatar || "sokha");
  const [rotationAngle, setRotationAngle] = useState(0);

  if (!isOpen) return null;

  const characters = [
    {
      id: "sokha",
      nameEn: "Sokha",
      nameKm: "សុខា",
      careerEn: "Teacher",
      careerKm: "គ្រូបង្រៀន",
      provinceEn: "Kampong Cham",
      provinceKm: "កំពង់ចាម",
      age: 24,
      educationEn: "Pedagogy College",
      educationKm: "គរុកោសល្យ",
      outfitEn: "Crisp white blouse, navy pleated trousers, dark backpack & teal lesson planner",
      outfitKm: "អាវស សំពត់ខៀវ កាតាបខ្មៅ និងសៀវភៅបង្រៀន",
      bioEn: "Dedicated provincial school teacher. Patient, compassionate, deeply beloved by students and respected by village elders.",
      bioKm: "គ្រូបង្រៀននៅសាលាខេត្តកំពង់ចាម រួសរាយ រាក់ទាក់ និងឧស្សាហ៍ព្យាយាមណែនាំសិស្សានុសិស្ស។",
      skills: { teaching: 90, technology: 45, farming: 35, business: 50 },
      tag: "👨‍🏫 Teacher",
      icon: <GraduationCap className="w-4 h-4 text-sky-400" />,
      color: "from-sky-600/30 border-sky-400",
    },
    {
      id: "sreyneath",
      nameEn: "Sreyneath",
      nameKm: "ស្រីនាថ",
      careerEn: "University Student",
      careerKm: "និស្សិតសាកលវិទ្យាល័យ",
      provinceEn: "Phnom Penh",
      provinceKm: "ភ្នំពេញ",
      age: 21,
      educationEn: "Royal University of Phnom Penh",
      educationKm: "សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ",
      outfitEn: "Crisp student shirt, navy skirt, white socks, hair ribbon & study books",
      outfitKm: "អាវសិស្ស សំពត់ខៀវ ស្រោមជើងស និងសៀវភៅសិក្សា",
      bioEn: "Ambitious university student in Phnom Penh with bright aspirations. Loves literature, languages, and exploring historical libraries.",
      bioKm: "និស្សិតសាកលវិទ្យាល័យនៅភ្នំពេញ ឆ្លាតវៃ ឧស្សាហ៍ និងស្រឡាញ់ការរៀនសូត្រភាសា។",
      skills: { teaching: 60, technology: 75, farming: 25, business: 65 },
      tag: "👩‍🎓 Student",
      icon: <Briefcase className="w-4 h-4 text-rose-400" />,
      color: "from-rose-600/30 border-rose-400",
    },
    {
      id: "vuth",
      nameEn: "Vuth",
      nameKm: "វុធ",
      careerEn: "Software Developer",
      careerKm: "អ្នកសរសេរកូដ",
      provinceEn: "Phnom Penh",
      provinceKm: "ភ្នំពេញ",
      age: 25,
      educationEn: "Institute of Technology of Cambodia",
      educationKm: "វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា",
      outfitEn: "Charcoal black tech hoodie, over-ear red headphones, dark denim, laptop bag",
      outfitKm: "អាវរងារខ្មៅ ពាក់កាសក្រហម ខោខូវប៊យខ្មៅ និងកាតាបកុំព្យូទ័រ",
      bioEn: "Creative tech engineer passionate about mobile games and web applications. Builds digital tools to connect Cambodian rural communities.",
      bioKm: "អ្នកសរសេរកូដពាក់កាស បង្កើតកម្មវិធីឌីជីថលទាន់សម័យ និងឧបករណ៍បច្ចេកវិទ្យា។",
      skills: { teaching: 40, technology: 95, farming: 20, business: 60 },
      tag: "💻 Developer",
      icon: <Laptop className="w-4 h-4 text-purple-400" />,
      color: "from-purple-600/30 border-purple-400",
    },
    {
      id: "taing",
      nameEn: "Taing",
      nameKm: "តាំង",
      careerEn: "Farmer",
      careerKm: "កសិករ",
      provinceEn: "Takeo",
      provinceKm: "តាកែវ",
      age: 32,
      educationEn: "Agricultural Institute",
      educationKm: "វិទ្យាស្ថានកសិកម្ម",
      outfitEn: "Woven sugar palm leaf hat (មួកស្លឹកត្នោត), red checkered krama scarf, durable countryside workwear",
      outfitKm: "មួកស្លឹកត្នោត ក្រមាក្រហមពាក់ក និងខោអាវធ្វើស្រែចម្ការ",
      bioEn: "Proud Cambodian countryside farmer. Expert in golden rice irrigation, tropical fruit harvests, and sustainable local agriculture.",
      bioKm: "កសិករនៅខេត្តតាកែវ ពាក់មួកស្លឹកត្នោត ស្ទាត់ជំនាញខាងធ្វើស្រែ និងដាំដំណាំកសិកម្ម។",
      skills: { teaching: 30, technology: 20, farming: 95, business: 55 },
      tag: "🌾 Farmer",
      icon: <Wheat className="w-4 h-4 text-emerald-400" />,
      color: "from-emerald-600/30 border-emerald-400",
    },
    {
      id: "sokunthea",
      nameEn: "Sokunthea",
      nameKm: "សុគន្ធា",
      careerEn: "Shop Owner",
      careerKm: "ម្ចាស់តូបលក់ដូរ",
      provinceEn: "Siem Reap",
      provinceKm: "សៀមរាប",
      age: 28,
      educationEn: "Business & Commerce",
      educationKm: "ពាណិជ្ជកម្ម និងសេដ្ឋកិច្ច",
      outfitEn: "White floral blouse, terracotta market apron, woven market basket & friendly smile",
      outfitKm: "អាវផ្កាស អៀមលក់ដូរពណ៌ទឹកក្រូច និងកន្ត្រកផ្សារបុរាណ",
      bioEn: "Warm-hearted market merchant with exceptional community ties. Sells fresh tropical produce, local snacks, and delicious iced drinks.",
      bioKm: "ម្ចាស់តូបលក់ដូរនៅសៀមរាប រាក់ទាក់ រួសរាយ និងពូកែខាងរៀបចំមុខរបររកស៊ី។",
      skills: { teaching: 40, technology: 45, farming: 50, business: 95 },
      tag: "🏪 Shopkeeper",
      icon: <Store className="w-4 h-4 text-amber-400" />,
      color: "from-amber-600/30 border-amber-400",
      portrait: SPRITES.portrait_sokunthea_smile,
      avatarEmoji: "🏪",
    },
    {
      id: "chandy",
      nameEn: "Chandy",
      nameKm: "ចាន់ឌី",
      careerEn: "Kun Khmer Fighter",
      careerKm: "កីឡាករប្រដាល់គុនខ្មែរ",
      provinceEn: "Phnom Penh",
      provinceKm: "ភ្នំពេញ",
      age: 28,
      educationEn: "National Sports Academy",
      educationKm: "វិទ្យាស្ថានជាតិកីឡា",
      outfitEn: "Blue & gold silk fight shorts, red/blue prajioud arm bands & combat hand wraps",
      outfitKm: "ខោខ្លីគុនខ្មែរខៀវមាស ប្រឡាក់ប្រជៀតក្រហមខៀវ និងរុំដៃប្រយុទ្ធ",
      bioEn: "National Kun Khmer kickboxing champion. Agile, fearless, and disciplined fighter carrying the martial spirit and pride of Cambodia.",
      bioKm: "កីឡាករជើងឯកប្រដាល់គុនខ្មែរនៅភ្នំពេញ ក្លាហាន ស្វាហាប់ និងប្រកាន់ខ្ជាប់វិន័យហ្វឹកហាត់យ៉ាងម៉ឺងម៉ាត់។",
      skills: { teaching: 25, technology: 30, farming: 35, business: 50 },
      tag: "🥊 Kickboxer",
      icon: <Flame className="w-4 h-4 text-orange-400" />,
      color: "from-amber-600/30 border-orange-500",
      portrait: SPRITES.portrait_chandy_fierce,
      avatarEmoji: "🥊",
    },
    {
      id: "maiko",
      nameEn: "Maiko",
      nameKm: "ម៉ៃកូ",
      careerEn: "Khmer Boxer",
      careerKm: "កីឡាករប្រដាល់ខ្មែរ",
      provinceEn: "Kampong Cham",
      provinceKm: "កំពង់ចាម",
      age: 22,
      educationEn: "Kampong Cham Boxing Club",
      educationKm: "ក្លឹបប្រដាល់កំពង់ចាម",
      outfitEn: "Red headband, red boxing gloves, \"KHMER\" fight shorts with Angkor Wat emblems & lace-up boots",
      outfitKm: "ក្រមាចងក្បាលក្រហម ស្រោមដៃប្រដាល់ក្រហម ខោខ្លី \"KHMER\" រូបអង្គរវត្ត និងស្បែកជើងប្រដាល់",
      bioEn: "Young rising boxer from Kampong Cham. Trains every day: J punch combo (jab-cross-hook), Q guard, R dodge, Space jump, X crouch, V victory.",
      bioKm: "កីឡាករប្រដាល់វ័យក្មេងមកពីកំពង់ចាម ហ្វឹកហាត់រាល់ថ្ងៃ៖ J ដាល់បន្តបន្ទាប់ Q ការពារ R គេច Space លោត X អង្គុយ V អបអរ។",
      skills: { teaching: 20, technology: 25, farming: 40, business: 35 },
      tag: "🥊 Boxer",
      icon: <Flame className="w-4 h-4 text-red-400" />,
      color: "from-red-600/30 border-red-500",
      portrait: SPRITES.portrait_maiko_neutral,
      avatarEmoji: "🥊",
    },
  ];

  const currentInspect = characters.find((c) => c.id === inspectId) || characters[0];
  const isCurrentlyEquipped = player.avatar === inspectId;

  const handleEquip = () => {
    switchCharacter(inspectId as CharacterId);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          className="w-full max-w-4xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-white/20 rounded-3xl p-4 sm:p-6 shadow-2xl text-white relative overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white cursor-pointer z-10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="mb-4 pr-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/40 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === "km" ? "ប្រព័ន្ធជ្រើសរើសតួអង្គ" : "Character Selection & Switcher"}</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Hotkey [C]</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
              {language === "km" ? "ជ្រើសរើសតួអង្គដែលអ្នកចង់លេង" : "Choose Who You Want To Play"}
            </h2>
            <p className="text-xs text-slate-300">
              {language === "km"
                ? "ផ្លាស់ប្តូររូបរាង សម្លៀកបំពាក់ និងអាជីពបានគ្រប់ពេលវេលា ដោយរក្សាប្រាក់ និងការរីកចម្រើនទាំងអស់"
                : "Switch character models seamlessly at any time while preserving all position, inventory, and progression."}
            </p>
          </div>

          {/* Main 2-Column Content: Left 3D Viewport, Right Character Card & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 overflow-hidden min-h-0">
            {/* LEFT: 3D CHARACTER PREVIEW (5 Cols) */}
            <div className="md:col-span-5 flex flex-col bg-slate-950/70 border border-white/10 rounded-2xl p-2 relative overflow-hidden min-h-[240px] md:min-h-0">
              {/* 3D Canvas */}
              <div className="flex-1 w-full relative">
                <Canvas
                  camera={{ position: [0, 0.4, 2.6], fov: 45 }}
                  className="w-full h-full cursor-grab active:cursor-grabbing"
                >
                  <ambientLight intensity={0.8} />
                  <directionalLight position={[3, 5, 2]} intensity={1.4} castShadow />
                  <pointLight position={[-2, 2, -1]} intensity={0.6} color="#FFF2A8" />
                  <Suspense fallback={null}>
                    <group rotation={[0, rotationAngle, 0]}>
                      <CharacterPreviewMesh avatarId={inspectId} />
                    </group>
                  </Suspense>
                </Canvas>

                {/* Equipped Badge in 3D Viewport */}
                {isCurrentlyEquipped && (
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-emerald-500/30 border border-emerald-400 text-emerald-300 font-bold text-[11px] flex items-center gap-1 shadow">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>EQUIPPED</span>
                  </div>
                )}
              </div>

              {/* 3D Viewer Rotate Controls */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 rounded-xl border border-white/10 mt-2">
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5 text-amber-400" /> Rotate Preview
                </span>
                <input
                  type="range"
                  min={-Math.PI}
                  max={Math.PI}
                  step={0.05}
                  value={rotationAngle}
                  onChange={(e) => setRotationAngle(parseFloat(e.target.value))}
                  className="w-32 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>

            {/* RIGHT: CHARACTER SELECTOR, BIO & ATTRIBUTES (7 Cols) */}
            <div className="md:col-span-7 flex flex-col gap-3 overflow-y-auto pr-1">
              {/* 6 Avatar Quick Selector Tabs */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {characters.map((c) => {
                  const isInspecting = inspectId === c.id;
                  const isEquipped = player.avatar === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setInspectId(c.id);
                        setRotationAngle(0);
                      }}
                      className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer relative ${
                        isInspecting
                          ? "bg-amber-500/25 border-amber-400 shadow-md shadow-amber-500/20 scale-102"
                          : "bg-slate-800/40 border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-900/60 border border-white/10 flex items-center justify-center relative">
                        {c.portrait ? (
                          <img
                            src={c.portrait}
                            alt={c.nameEn}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : null}
                        <span className="absolute text-base pointer-events-none opacity-0 only:opacity-100">{c.avatarEmoji || "👤"}</span>
                      </div>
                      <span className="text-[11px] font-extrabold text-white truncate w-full text-center">
                        {language === "km" ? c.nameKm : c.nameEn}
                      </span>
                      {isEquipped && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[9px] font-black shadow">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Inspected Character Details Card */}
              <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-white/15 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-black text-amber-300">
                        {language === "km" ? currentInspect.nameKm : currentInspect.nameEn}
                      </h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white font-bold flex items-center gap-1 border border-white/15">
                        {currentInspect.icon}
                        <span>{language === "km" ? currentInspect.careerKm : currentInspect.careerEn}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>{language === "km" ? currentInspect.provinceKm : currentInspect.provinceEn}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-sky-400" />
                        <span>{currentInspect.age} {language === "km" ? "ឆ្នាំ" : "years old"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Biography */}
                <p className="text-xs text-slate-200 leading-relaxed bg-black/25 p-2.5 rounded-xl border border-white/5">
                  {language === "km" ? currentInspect.bioKm : currentInspect.bioEn}
                </p>

                {/* Outfit Description */}
                <div className="text-xs">
                  <span className="text-slate-400 font-semibold">{language === "km" ? "សម្លៀកបំពាក់:" : "Authentic Outfit:"} </span>
                  <span className="text-slate-200 font-medium">
                    {language === "km" ? currentInspect.outfitKm : currentInspect.outfitEn}
                  </span>
                </div>

                {/* Skill Bars */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-0.5">
                      <span>Teaching</span>
                      <span>{currentInspect.skills.teaching}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: `${currentInspect.skills.teaching}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-0.5">
                      <span>Technology</span>
                      <span>{currentInspect.skills.technology}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400 rounded-full" style={{ width: `${currentInspect.skills.technology}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-0.5">
                      <span>Farming</span>
                      <span>{currentInspect.skills.farming}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${currentInspect.skills.farming}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-0.5">
                      <span>Business</span>
                      <span>{currentInspect.skills.business}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${currentInspect.skills.business}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Equip or Close */}
              <div className="flex items-center gap-3 pt-1">
                {isCurrentlyEquipped ? (
                  <button
                    disabled
                    className="flex-1 py-3 px-5 rounded-2xl bg-emerald-500/25 border border-emerald-400/50 text-emerald-300 font-extrabold text-sm flex items-center justify-center gap-2 cursor-default"
                  >
                    <Check className="w-5 h-5 stroke-[3]" />
                    <span>{language === "km" ? "កំពុងលេងជាតួអង្គនេះ (Current Active)" : "Currently Equipped"}</span>
                  </button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEquip}
                    className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-extrabold text-sm shadow-xl shadow-orange-500/30 border border-amber-300/40 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-200" />
                    <span>
                      {language === "km"
                        ? `ជ្រើសរើស ${currentInspect.nameKm} (Equip Character)`
                        : `Equip ${currentInspect.nameEn}`}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
