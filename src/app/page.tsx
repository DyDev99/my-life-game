"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useGameStore } from "@/state/gameStore";
import { MainMenu } from "@/ui/screens/MainMenu";
import { CharacterCreation } from "@/ui/screens/CharacterCreation";
import { HUD } from "@/ui/hud/HUD";
import { DecisionModal } from "@/ui/modals/DecisionModal";
import { WorkModal } from "@/ui/modals/WorkModal";
import { PhoneModal } from "@/ui/modals/PhoneModal";
import { RelationshipsModal } from "@/ui/modals/RelationshipsModal";
import { JournalModal } from "@/ui/modals/JournalModal";
import { DailySummaryModal } from "@/ui/modals/DailySummaryModal";
import { StatFeedback } from "@/ui/hud/StatFeedback";
import { FighterHud } from "@/ui/hud/FighterHud";
import { CafeModal } from "@/ui/modals/CafeModal";
import { PagodaModal } from "@/ui/modals/PagodaModal";
import { MarketModal } from "@/ui/modals/MarketModal";
import { HomeModal } from "@/ui/modals/HomeModal";
import { HotelModal } from "@/ui/modals/HotelModal";
import { LockerRoomModal } from "@/ui/modals/LockerRoomModal";
import { CharacterSwitcherModal } from "@/ui/modals/CharacterSwitcherModal";

// Dynamically import Three.js canvas to ensure client-only rendering
const GameCanvas = dynamic(
  () => import("@/game/GameCanvas").then((mod) => mod.GameCanvas),
  { ssr: false }
);

export default function GamePage() {
  const screen = useGameStore((state) => state.screen);
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D Cambodian Miniature World (Runs continuously in background) */}
      <GameCanvas />

      {/* Main Menu Screen */}
      {screen === "main_menu" && <MainMenu />}

      {/* Character Creation Screen */}
      {screen === "character_creation" && <CharacterCreation />}

      {/* Main In-Game World HUD & Interactive Modals */}
      {screen === "game_world" && (
        <>
          <HUD />
          <FighterHud />
          <DecisionModal />
          <WorkModal />
          <PhoneModal />
          <RelationshipsModal />
          <JournalModal />
          <DailySummaryModal />
          <CafeModal />
          <PagodaModal />
          <MarketModal />
          <HomeModal />
          <HotelModal />
          <LockerRoomModal />
          <CharacterSwitcherModal
            isOpen={activeModal === "character_select"}
            onClose={closeModal}
          />
          <StatFeedback />
        </>
      )}
    </main>
  );
}
