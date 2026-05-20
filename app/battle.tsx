import { Redirect } from "expo-router";

/** 커뮤니티·탭 등에서 `/battle` 진입 시 다마고치 대결장(상대 선택)으로 연결 */
export default function BattleArenaScreen() {
  return <Redirect href="/tamagotchi?battle=1" />;
}
