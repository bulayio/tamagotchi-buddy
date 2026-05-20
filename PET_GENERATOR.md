# 🧬 펫 DNA 랜덤 생성 시스템

해커톤용 도트 스타일 애완 캐릭터를 **자동·랜덤하게** 생성하는 시스템입니다.
단일 캐릭터만 있던 기존 구조를 "DNA(파츠 조합) → 12×12 sprite 합성" 파이프라인으로
확장했습니다.

---

## 1. 개요

- **방식**: 파츠 조합형 (body / eyes / mouth / accessory / palette)
- **다양성**: `4 × 5 × 4 × 5 × 6 = 2,400`가지 조합
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
│   ├── petParts.ts            # body·eye·mouth·accessory·palette 카탈로그
│   ├── sprites.ts             # 공용 sprite (dead / poop / skull / food)
│   └── config.ts              # TamagotchiData.dna 필드 추가
└── components/
    ├── PixelSprite.tsx        # 2D 배열을 View 그리드로 렌더 (변경 없음)
    └── PixelCharacter.tsx     # dna prop으로 받아 spriteForStage() 호출

app/
├── tamagotchi.tsx             # 실제 게임 화면 (dna 사용)
└── dna-demo.tsx               # 🆕 생성기 시연 페이지
```

---

## 3. 데이터 모델

```ts
interface PetDNA {
  seed: string;              // 결정론적 PRNG 입력
  bodyShape: 'round' | 'tall' | 'blob' | 'square';
  eyes: 'dot' | 'oval' | 'sleepy' | 'sparkle' | 'cross';
  mouth: 'smile' | 'dot' | 'fang' | 'wavy';
  accessory: 'none' | 'horn' | 'antenna' | 'leaf' | 'hat';
  palette: 'yellow' | 'mint' | 'sky' | 'pink' | 'lilac' | 'peach';
}
```

`TamagotchiData`에 `dna: PetDNA | null` 필드가 추가되었고, AsyncStorage에 함께 저장됩니다.
기존(레거시) 저장 데이터에 `dna`가 없으면 앱 로드 시 자동으로 한 번 생성·저장합니다.

---

## 4. 핵심 API (`src/lib/petGenerator.ts`)

| 함수 | 설명 |
| --- | --- |
| `generatePetDNA()` | 새 랜덤 seed로 DNA 생성 |
| `dnaFromSeed(seed)` | 주어진 seed로 동일 DNA 재현 (디버깅·공유용) |
| `composeSprite(dna, stage, variant)` | 12×12 hex-color 2D 배열 반환 |
| `composeEggSprite(dna)` | 알 외형 + palette tint |
| `spriteForStage(dna, stage, variant)` | stage·variant에 맞는 sprite 한 번에 반환 |

### 합성 파이프라인
1. `BODY_SHAPES[bodyShape][stage]` 실루엣을 토큰 배열로 가져옴
2. `PALETTES[palette]`의 outline/body/dark/cheek 색상으로 토큰 → 실제 hex 색상 치환
3. `EYE_PATCHES[eyes]`를 좌·우 위치에 스탬프 (오른쪽은 자동 미러)
4. `MOUTH_PATCHES[mouth]` 스탬프
5. 볼(cheek) 픽셀 도트 찍기 (sick일 때는 생략)
6. grown 단계라면 `ACCESSORY_PATCHES[accessory]`를 상단에 스탬프
7. variant 오버라이드: `sick`이면 눈=cross / 입=wavy, `happy`이면 눈=sparkle / 입=smile

### 결정론 PRNG (`seededRandom.ts`)
- `hashString(s)` — FNV-1a 32-bit
- `mulberry32(seed)` — 외부 의존성 0줄, 균등 분포 충분
- 같은 seed → 같은 PRNG 시퀀스 → 같은 DNA

---

## 5. 시연 페이지: `/dna-demo`

**진입 경로**: 커뮤니티 화면(`/`) → "🧬 펫 DNA 생성기 데모" 버튼

### 화면 구성
1. **3×3 그리드** — 9마리의 랜덤 grown 캐릭터. 각 셀에 seed 표기
2. **🎲 새로 9마리 뽑기** 버튼 — 메모리상으로만 다시 생성 (게임 상태 영향 없음)
3. **선택한 캐릭터의 변화** — 탭한 캐릭터의 [EGG / BABY / GROWN / HAPPY / SICK] 5가지 변형
4. **DNA 카드** — seed + 5개 파츠 값 텍스트 표시

### 시연 시나리오
- 시연자는 "🎲 새로 9마리 뽑기"를 반복해서 **매번 다른 캐릭터**가 나오는 것을 보여줌
- 특정 캐릭터를 탭해서 같은 DNA가 egg → baby → grown으로 **자연스럽게 자라는 모습**을 보여줌
- 표정 변화(HAPPY/SICK)는 같은 DNA에서 표정만 바뀌어 **일관된 정체성**을 유지한다는 점을 강조

---

## 6. 다양성 추정

| 카테고리 | 종류 |
| --- | --- |
| body shape | 4 (round / tall / blob / square) |
| eyes | 5 (dot / oval / sleepy / sparkle / cross) |
| mouth | 4 (smile / dot / fang / wavy) |
| accessory | 5 (none / horn / antenna / leaf / hat) |
| palette | 6 (yellow / mint / sky / pink / lilac / peach) |
| **총 조합** | **2,400** |

해커톤 시연으로 충분한 다양성이며, 추후 파츠 추가만으로 손쉽게 확장 가능합니다.

---

## 7. 게임 상태 연동

| 시점 | 동작 |
| --- | --- |
| `unlock()` (BUDDY 입력 후) | `generatePetDNA()` 호출 → AsyncStorage 저장 |
| 앱 재시작 | 저장된 seed/DNA로 **항상 같은 캐릭터** 표시 |
| `restart()` (사망 후 다시 시작) | 새 DNA 생성, battleRecord는 유지 |
| 레거시 저장 (`dna` 필드 없음) | 로드 시 1회 자동 생성·재저장 |

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
- [ ] `npx tsc --noEmit` 에러 0건
