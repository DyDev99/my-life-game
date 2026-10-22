"use client";

import React, { useEffect } from "react";
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
import { MobileShooterControls } from "@/ui/hud/MobileShooterControls";
import { Minimap } from "@/ui/hud/Minimap";
import { PauseMenu } from "@/ui/screens/PauseMenu";
import { WorldMap } from "@/ui/screens/WorldMap";
import { RotateDeviceGate } from "@/ui/screens/RotateDeviceGate";
import { FlightAviationHUD } from "@/ui/hud/FlightAviationHUD";
import { MobileFlightControls } from "@/ui/hud/MobileFlightControls";


// Dynamically import Three.js canvas to ensure client-only rendering
const GameCanvas = dynamic(
  () => import("@/game/GameCanvas").then((mod) => mod.GameCanvas),
  { ssr: false }
);

export default function GamePage() {
  const screen = useGameStore((state) => state.screen);
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);

  // Saved graphics / sensitivity settings (client-only)
  useEffect(() => {
    useGameStore.getState().hydrateSettings();
  }, []);

  return (
    // h-dvh: the visible height, so mobile browser toolbars never cover the bottom controls
    <main className="relative w-full h-dvh overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D Cambodian Miniature World (Runs continuously in background) */}
      <GameCanvas />

      {/* Main Menu Screen */}
      {screen === "main_menu" && <MainMenu />}

      {/* Character Creation Screen */}
      {screen === "character_creation" && <CharacterCreation />}

      {/* Main In-Game World HUD & Interactive Modals */}
      {screen === "game_world" && (
        <>
          {/* Keep HUD and touch controls clear of the notch / home indicator */}
          <div
            className="absolute pointer-events-none"
            style={{
              inset: "env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)",
            }}
          >
            <HUD />
            <MobileShooterControls />
            <FlightAviationHUD />
            <MobileFlightControls />
          </div>
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
          <Minimap />
          <WorldMap />
          <PauseMenu />
          <RotateDeviceGate />
        </>
      )}
    </main>
  );
}
