# 🧬 펫 DNA 랜덤 생성 시스템

해커톤용 도트 스타일 애완 캐릭터를 **자동·랜덤하게** 생성하는 시스템입니다.
단일 캐릭터만 있던 기존 구조를 "DNA(파츠 조합) → 12×12 sprite 합성" 파이프라인으로
확장했습니다.

---

## 1. 개요

- **방식**: 파츠 조합형 (body / eyes / mouth / palette) + 장르 고정 **모자**
- **다양성**: 장르당 **고정 실루엣**(퍼즐=네모·시뮬=동그라미·액션/슈팅=키 큼·RPG=뭉툭) + 장르 전용 색·파츠 풀 + 성체·알에 장르별 도트 무늬
- **결정론성**: 같은 `seed` 문자열이면 항상 같은 캐릭터가 나옴 (PRNG 기반)
- **정체성**: 유저 한 명당 1마리 고유. `unlock()` 시 자동 생성, `restart()` 시 새 캐릭터
- **상태 분리**: 데모 페이지는 AsyncStorage를 건드리지 않고 메모리에서만 캐릭터 시연

---

## 2. 파일 구조

```
src/
├── lib/
│   ├── seededRandom.ts        # FNV-1a 해시 + mulberry32 PRNG
│   └── petGenerator.ts        # generatePetDNA / dnaFromSeed / composeSprite
├── constants/
│   ├── petParts.ts            # body·eye·mouth·palette + 장비(모자) 토큰
│   ├── sprites.ts             # 공용 sprite (dead / poop / skull / food)
│   └── config.ts              # TamagotchiData.dna 필드 추가
└── components/
    ├── PixelSprite.tsx        # 2D 배열을 View 그리드로 렌더
    ├── PixelPetView.tsx       # 투명 배경 + 스프라이트 2레이어
    └── PixelCharacter.tsx     # dna → spriteForStageWithBackdrop + PixelPetView

app/
├── tamagotchi.tsx             # 실제 게임 화면 (dna 사용)
└── dna-demo.tsx               # 🆕 생성기 시연 페이지
```

---

## 3. 데이터 모델

```ts
type GameGenre = "puzzle" | "simulation" | "action" | "rpg" | "shooting";

type PetRarity = "normal" | "rare" | "epic" | "legendary";

interface PetDNA {
  seed: string; // 결정론적 PRNG 입력
  genre: GameGenre; // 선호 게임 장르(플레이오 연동 예정; 현재는 시드로 무작위)
  bodyShape: "round" | "tall" | "blob" | "square";
  eyes: "dot" | "oval" | "sleepy" | "sparkle" | "cross";
  mouth: "smile" | "dot" | "fang" | "wavy";
  palette: "yellow" | "mint" | "sky" | "pink" | "lilac" | "peach";
  /** 선택: 활동·플레이타임 기반 희귀도 (`dnaFromComposite` 등). 저장 DNA에는 보통 없음 → 합성 시 `outline`은 노말(검정). */
  rarity?: PetRarity;
  activityScore?: number; // 0–100, 데모·연동용
  gameplayTimeMinutes?: number; // 분, 데모·연동용
}
```

`TamagotchiData`에 `dna: PetDNA | null` 필드가 추가되었고, AsyncStorage에 함께 저장됩니다.
`dna`가 없거나 필드가 옛 형식(`accessory` 등)이면 로드 시 `normalizePetDNA()`가 같은 seed로 표준 `PetDNA`로 맞춥니다.

---

## 4. 핵심 API (`src/lib/petGenerator.ts`)

| 함수                                                           | 설명                                                 |
| -------------------------------------------------------------- | ---------------------------------------------------- |
| `generatePetDNA()`                                             | 새 랜덤 seed + 장르 무작위(시드에서 결정)로 DNA 생성 |
| `generatePetDNAWithGenre(g)` / `dnaFromSeedWithGenre(seed, g)` | 플레이오 최빈 장르 등으로 장르 고정 생성             |
| `normalizePetDNA(dna)`                                         | 저장 호환: 누락·옛 필드면 같은 seed로 표준 DNA로 정규화 |
| `dnaFromSeed(seed)`                                            | 주어진 seed로 동일 DNA 재현 (디버깅·공유용)          |
| `dnaFromComposite(baseSeed, activity, playMin)`                | 시드 합성 + `rarity`·지표 필드 부여 (데모)           |
| `computePetRarity(activity, playMin)`                          | 가중 합산(55% 활동 / 45% 플레이 상대점수) → 노말·레어·에픽·레전더리 |
| `composeSprite(dna, stage, variant)`                           | `paletteWithRarityStyle`: 희귀도별 윤곽(O) hex + 몸색은 노말과 동일(검정 윤곽 기준 HSL) 후 실루엣·눈·입·모자 합성 |
| `composeEggSprite(dna)`                                        | 알 외형 + 장르 무늬                                 |
| `composeRarityBackdrop(...)`                                   | 스프라이트와 동일 크기 **전부 투명** (레이아웃 호환) |
| `spriteForStage(dna, stage, variant)`                          | stage·variant에 맞는 sprite 한 번에 반환             |
| `spriteForStageWithBackdrop(dna, stage, variant)`              | `{ backdrop, sprite }` — 데모·PixelPetView용        |
| `PET_RARITY_LABELS` / `PET_RARITY_OUTLINE_COLORS` / `PET_RARITIES` | UI·윤곽선(O) 색·타입 상수                          |

### 합성 파이프라인

1. `paletteWithRarityStyle(dna)`로 **윤곽(O)** 은 희귀도 고정색, **몸·음영·볼·액센트**는 등급과 무관하게 **노말(검정) 윤곽**과 동일한 규칙으로 HSL·`seed` 기반 생성 후, `BODY_SHAPES[bodyShape][stage]` 실루엣을 칠함 (`baby` / `grown`은 팔·다리 있는 실루엣)
2. **`baby` 또는 `grown`** 이고 sick가 아니면 장르 **모자 백드롭** → `EYE_PATCHES` / `MOUTH_PATCHES` → 볼(cheek, sick 제외) → 장르 **모자** 본체
3. variant 오버라이드: `sick`이면 눈=cross / 입=wavy, `happy`이면 눈=sparkle / 입=smile

### 희귀도 시각 (도트 윤곽 + 노말과 동일 몸색 규칙)

- 스프라이트 합성 시 **`paletteWithRarityStyle`**: `dna.rarity`(없으면 `normal`)마다 **윤곽(O)** 만 `PET_RARITY_OUTLINE_COLORS`로 고정(노말 검정·레어 어두운 금색·에픽 진보라·레전더리 빨간기 주황). **몸·음영·볼·액센트**는 항상 노말과 같이 검정 윤곽 hex를 기준으로 HSL에서 `seed`로 절차 생성. DNA에 저장되는 `palette` 이름(장르 풀 키)은 그대로.
- `composeRarityBackdrop`은 투명 그리드만 반환(2레이어 구조 유지).

### 결정론 PRNG (`seededRandom.ts`)

- `hashString(s)` — FNV-1a 32-bit
- `mulberry32(seed)` — 외부 의존성 0줄, 균등 분포 충분
- 같은 seed → 같은 PRNG 시퀀스 → 같은 DNA

---

## 5. 시연 페이지: `/dna-demo`

**진입 경로**: 커뮤니티 화면(`/`) → "🧬 펫 DNA 생성기 데모" 버튼

### 화면 구성

1. **3×3 그리드** — 9마리의 랜덤 grown 캐릭터(희귀도는 **도트 윤곽선** 색). 각 셀에 seed 표기
2. **🎲 새로 9마리 뽑기** 버튼 — 메모리상으로만 다시 생성 (게임 상태 영향 없음)
3. **변수 카드** — 활동점수·플레이 분을 **숫자 입력** 후 예상 희귀도 확인
4. **선택한 캐릭터의 변화** — 탭한 캐릭터의 [EGG / BABY / GROWN / HAPPY / SICK] 5가지 변형
5. **DNA 카드** — 희귀도 뱃지 + seed + genre·body·eyes·mouth·palette

### 시연 시나리오

- 시연자는 "🎲 새로 9마리 뽑기"를 반복해서 **매번 다른 캐릭터**가 나오는 것을 보여줌
- 특정 캐릭터를 탭해서 같은 DNA가 egg → baby → grown으로 **자연스럽게 자라는 모습**을 보여줌
- 표정 변화(HAPPY/SICK)는 같은 DNA에서 표정만 바뀌어 **일관된 정체성**을 유지한다는 점을 강조
- 슬라이더로 희귀도만 바꿔도 **윤곽선(O) 색**이 달라지고, seed는 유지한 채 “다시 뽑기”하면 **등급은 같고 9마리 외형만** 바뀜

---

## 6. 다양성 추정

| 카테고리    | 종류                                           |
| ----------- | ---------------------------------------------- |
| body shape  | 4 (round / tall / blob / square)               |
| eyes        | 5 (dot / oval / sleepy / sparkle / cross)      |
| mouth       | 4 (smile / dot / fang / wavy)                  |
| palette     | 6 (yellow / mint / sky / pink / lilac / peach) |
| **총 조합 (대략)** | **약 62** (장르가 팔레트·실루엣·눈·입 풀을 묶음; `GENRE_*` 기준) |
| **희귀도** | **4단계** (`normal` … `legendary`) — 파츠 조합 수와 별개로 **활동점수·플레이타임(분)** 가중 합산으로 결정 |

해커톤 시연으로 충분한 다양성이며, 추후 파츠 추가만으로 손쉽게 확장 가능합니다.

---

## 7. 게임 상태 연동

| 시점                            | 동작                                        |
| ------------------------------- | ------------------------------------------- |
| `unlock()` (BUDDY 입력 후)      | `generatePetDNA()` 호출 → AsyncStorage 저장 |
| 앱 재시작                       | 저장된 seed/DNA로 **항상 같은 캐릭터** 표시 |
| `restart()` (사망 후 다시 시작) | 새 DNA 생성, battleRecord는 유지            |
| 레거시 저장 (`dna` 필드 없음)   | 로드 시 1회 자동 생성·재저장                |

---

## 8. 비목표 (이번 스코프 아님)

- NPC 랜덤화 (전투 화면 NPC는 별도 작업)
- 캐릭터 컬렉션 / 도감
- DNA 가져오기·내보내기 UI (현재는 코드 레벨에서 `dnaFromSeed()`로 가능)
- 외부 그래픽 라이브러리 (Skia·SVG·Canvas) 도입

---

## 9. 빠른 검증 체크리스트

- [ ] `npx expo start` → 커뮤니티 화면에서 데모 버튼 동작
- [ ] 데모에서 "🎲 새로 9마리 뽑기" 누를 때마다 다른 9마리 표시
- [ ] 셀 탭 → 하단 변형 행이 해당 캐릭터로 갱신
- [ ] `BUDDY` 입력 → tamagotchi 화면에 **랜덤 캐릭터** 표시
- [ ] 앱 종료/재실행 후 같은 캐릭터 유지
- [ ] "다시 시작"으로 새 캐릭터 확인 (배틀 기록 보존)
- [ ] 데모에서 슬라이더 변경 시 **예상 희귀도**·윤곽선 색 변화 확인
- [ ] `npx tsc --noEmit` 에러 0건
