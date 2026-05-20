# 버디고치(Community Tamagotchi Buddy) — 발표용 질문·답변지

플레이오 해커톤 발표·Q&A 준비용. 슬라이드(`이지해_버디고치_최종_ppt.key` / PDF)와 본 저장소 코드 기준으로 정리했습니다. 수치·파일 경로는 변경될 수 있으니 발표 직전에 `src/constants/config.ts`, `src/lib/petGenerator.ts`를 한 번 더 확인하면 좋습니다.

---

## 1. 제품·기획

### Q. 플레이오랑 실제로 어떻게 붙나요?

**A.** MVP는 **클라이언트 단독**이라 실시간 API 연동은 없습니다. 다만 설계상 **(1)** 커뮤니티·알림 같은 채널에 **히든 명령어·힌트**를 붙이고, **(2)** 슬라이드의 **Weighted Mixer**에 해당하는 **활동점수·플레이 시간**은 `computePetRarity` / `dnaFromComposite`로 **시드·희귀도**에 반영할 수 있게 해 두었습니다. 장르는 `generatePetDNAWithGenre` / `dnaFromSeedWithGenre`로 **최빈 장르**만 주입하면 됩니다.

### Q. 히든 명령어가 보안이나 치트 아닌가요?

**A.** **이스터 에그·온보딩**용입니다. `SECRET_COMMAND`가 앱에 있으면 누구나 알 수 있어 **보안 장치가 아닙니다**. 보상·랭킹이 서버와 연결되면 **서버 검증**이 필요합니다.

### Q. 왜 서버 없이 AsyncStorage만 쓰나요?

**A.** **1일 해커톤**에서 백엔드 없이 **플로우·UI·DNA 파이프라인**을 끝내기 위해서입니다. `useTamagotchiState`에서 로드·저장·포그라운드 복귀 시 `reconcileState`로 똥·배고픔·성장 단계를 맞춥니다.

### Q. MVP 이후 뭐부터 하나요?

**A.** README의 확장 항목과 동일하게: **서버 동기화**, **실제 플레이오 지표 연동**, **POI·위치 기반 NPC**, **다른 미니게임·랭킹** 등. 슬라이드의 **MVP vs 확장**과 짝을 지어 설명하면 됩니다.

---

## 2. 게임 루프·수치

### Q. 알 1시간·아기 6시간이면 시연이 너무 길지 않나요?

**A.** `GAME_CONFIG`에 **실제 시간**이 박혀 있어 시연에는 길 수 있습니다. 발표에서는 **“운영 시 조정 가능한 상수”**라고 말하고, 라이브 데모는 **이미 해금된 펫**·**성장 단계**·**대결·돌봄** 위주로 보여주면 됩니다. 화면 하단 **데모 패널**으로 단계·상태를 바꿀 수 있습니다.

### Q. 젬은 얼마나 주나요? 다시 뽑기 비용은?

**A.** 신규·리셋 시 기본값은 `DEFAULT_STATE`의 **젬**(시연 편의를 위해 넉넉히 잡을 수 있음). 다시 뽑기 비용은 `ECONOMY.REROLL_COST`(코드상 **1000** 젬). 똥 치우기 보상 등은 `ECONOMY` 상수를 참고하면 됩니다.  
**참고:** 이미 기기에 저장된 세이브는 **기존 젬이 유지**될 수 있어, 시연 전 **스토리지 초기화** 또는 새 설치가 필요할 수 있습니다.

### Q. PvP는 진짜 유저랑 매칭되나요?

**A.** MVP는 **같은 기기에서 탭 대결**이고, PvP일 때 상대 점수는 **플레이어 탭 수 근처로 움직이는 그림자 알고리즘**입니다. **실매칭·서버**는 이후 확장입니다. 딥링크 `?battle=1` 등으로 대결 화면 진입은 지원합니다.

### Q. PPT에 POI·위치 NPC인데 GPS 쓰나요?

**A.** **현재 MVP NPC**는 화면에서 **약함/강함**을 고르는 PvE이고, README·슬라이드의 **expo-location·POI**는 **확장 방향**입니다. 솔직히: **“MVP는 난이도 분리, POI는 플레이오 지도와 합치면 된다”**가 정직한 답입니다.

### Q. 대결 밸런스는?

**A.** `BATTLE_CONFIG`: **10초**, 성장 단계 **0% / +10% / +20%**, **병 -30%**. NPC는 **초당 탭 상한**(약함·강함 각각 상수)으로 난이도를 나눴습니다.

---

## 3. 히든 진입·커뮤니티

### Q. 어떻게 다마고치가 열리나요?

**A.** 커뮤니티 **버디 입장 글** 플로우에서 힌트를 보고 입력합니다. 명령어는 `src/constants/config.ts`의 `SECRET_COMMAND`(예: **BUDDY**), 힌트는 `HINTS` 배열. 맞으면 `unlock()` 후 `/tamagotchi?hatch=1` 등으로 이동합니다.

---

## 4. DNA 생성 엔진 (상세)

### Q. DNA가 뭔가요?

**A.** **문자열 `seed` + 장르·실루엣·눈·입·팔레트 이름** 등의 조합입니다. 외부 PNG 없이 **`petParts` 토큰 그리드 + `petGenerator` 합성**으로 **12×12 픽셀 스프라이트**를 만듭니다.

### Q. 왜 같은 사람은 같은 펫인가요?

**A.** **`hashString`(FNV-1a)** 로 시드를 숫자로 바꾸고 **`mulberry32`** 로 난수를 돌립니다. **같은 `seed` → 같은 DNA → 같은 스프라이트**입니다. `unlock()` 시 한 번 정한 DNA는 **AsyncStorage**에 저장됩니다. **`/dna-demo`** 는 저장을 건드리지 않고 메모리에서만 시연합니다.

### Q. `dnaFromSeed`는 어떤 순서로 고르나요?

**A.** (`src/lib/petGenerator.ts`)

1. `rng = mulberry32(hashString(seed))`
2. **장르** `pick(rng, GAME_GENRES)`
3. **실루엣** `GENRE_BODY[genre]` — 장르당 1:1 매핑(실루엣만으로 장르가 읽히게)
4. **팔레트 이름** `GENRE_PALETTE_POOL[genre]`에서 `pick`
5. **눈·입** `GENRE_FACE_POOLS[genre]`에서 `pick`

### Q. Weighted Mixer / 희귀도는 코드 어디인가요?

**A.** `computePetRarity(activityScore, gameplayTimeMinutes)`: 플레이 분은 상한까지 **0~100 점수**로 스케일한 뒤, **`0.55 × 활동 + 0.45 × 플레이점수`** 한 값으로 노말/레어/에픽/레전더리 구간을 나눕니다.  
`dnaFromComposite(baseSeed, activity, play)`는 내부적으로 **`compositeKey`**로 `dnaFromSeed`를 돌려 파츠를 바꾸되, 반환의 **`seed` 필드는 `baseSeed`**로 유지합니다.

### Q. 희귀도가 스탯에 영향 있나요?

**A.** MVP에서는 **도트 윤곽선(O) 색** 등 **비주얼** 위주입니다. 몸·볼·액센트 색 생성은 **항상 노말(검정 윤곽)과 동일 규칙**으로 두어, 등급이 **밸런스를 깨지 않게** 했습니다. 윤곽 색은 `PET_RARITY_OUTLINE_COLORS`를 참고하면 됩니다.

### Q. 스프라이트는 어떻게 합성되나요?

**A.** `composeSprite` / `paletteWithRarityStyle`: 토큰 `O`·`B`·`D`·`C` 등을 팔레트 색으로 칠한 뒤, **모자 백드롭 → 눈 → 입 → 볼 → 장르별 모자** 순으로 `stamp`합니다. sick/happy는 눈·입 패치 오버라이드. 자세한 파일 역할은 **`PET_GENERATOR.md`** 를 보조 자료로 쓰면 됩니다.

### Q. 옛 저장 데이터는?

**A.** `normalizePetDNA`: 필드가 없거나 규칙이 안 맞으면 **같은 `seed`로 `dnaFromSeed`를 다시 돌려** 스키마에 맞춥니다.

---

## 5. 기술 스택·구조 (한 블록 요약)

- **React Native + Expo**, **expo-router**, **Reanimated**(해칭 등), **AsyncStorage**, **expo-haptics**
- 핵심 화면: `app/tamagotchi.tsx`, 커뮤니티·버디 글: `app/post/buddy` 등, DNA 데모: `app/dna-demo.tsx`
- 상태: `src/hooks/useTamagotchiState.ts`

---

## 6. 체크리스트 (발표 직전)

- [ ] 실기기 또는 시뮬레이터에서 **BUDDY → 해금 → 다마고치** 한 번 통과
- [ ] **대결** (PvP / 약·강 NPC) 탭 동작
- [ ] **뒤집기 → 다시 뽑기** 젬·모달 확인
- [ ] 필요 시 **AsyncStorage 초기화** 후 젬·튜토리얼 상태 확인
- [ ] `npx tsc --noEmit` (선택)

---

*문서 버전: 저장소와 함께 유지보수. 슬라이드 문구와 수치가 어긋나면 코드·`PET_GENERATOR.md`를 기준으로 맞추면 됩니다.*
