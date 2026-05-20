# 펫 DNA 생성 엔진 — 쉬운 설명 + 개발자 가이드

이 문서는 **비개발자**(기획·디자인·사업·발표 청중)와 **개발자**가 같은 내용을 서로 다른 깊이로 이해할 수 있도록 나눴습니다. 구현의 근거는 주로 `src/lib/petGenerator.ts`, `src/lib/seededRandom.ts`, `src/constants/petParts.ts` 입니다.

---

## 목차

1. [비개발자를 위한 설명](#1-비개발자를-위한-설명)
2. [개발자를 위한 설명](#2-개발자를-위한-설명)
3. [용어 한눈에](#3-용어-한눈에)
4. [관련 문서·화면](#4-관련-문서화면)

---

## 1. 비개발자를 위한 설명

### 1.1 한 줄로

**“레고 조립 설명서(DNA) + 주사위 규칙(난수)으로, 매번 같은 조합이 나오게 만드는 도트 캐릭터 공장”** 이라고 보면 됩니다. 그림 파일(PNG)을 수백 장 만드는 대신, **조각 규칙**만 있으면 무한히 가까운 조합을 만들 수 있습니다.

### 1.2 DNA가 뭔가요?

게임 입장에서 DNA는 **캐릭터의 설계 카드**입니다.

- **어떤 게임 장르를 좋아하는지** (퍼즐, 시뮬, 액션, RPG, 슈팅 중 하나)
- **몸 실루엣** (둥근형, 키 큰형 등 — 장르와 짝이 지어져 있음)
- **눈·입 스타일**
- **색 이름** (노랑·민트 등 이름만 저장하고, 실제 RGB는 엔진이 계산)

여기에 **시드(seed)** 라는 짧은 문자열이 붙습니다. 시드는 **“이 유저의 이 펫”을 다른 펫과 구분하는 주민번호**에 가깝습니다.

### 1.3 “같은 펫”이 보장되는 이유

컴퓨터의 무작위는 보통 재현이 안 되지만, 여기서는 **같은 시드를 넣으면 항상 같은 순서로 조각을 고른다**고 약속해 두었습니다. 그래서:

- 앱을 껐다 켜도 **같은 시드면 같은 캐릭터**
- 버그를 고칠 때도 **재현**이 쉬움
- 나중에 서버에 시드만 저장해도 **복원** 가능

### 1.4 장르는 왜 중요한가요?

장르는 **외형의 큰 틀**을 정합니다.

- **실루엣**: 예를 들어 퍼즐은 각진 실루엣, 시뮬은 동그란 실루엣처럼 **장르당 정해진 모양**이 있습니다.
- **모자**: 장르마다 다른 **모자 도트**가 올라갑니다 (마법사 모자, 셰프 모자 등).
- **눈·입 후보**: 장르에 어울리는 표정만 후보에 넣어 **세계관이 안 깨지게** 했습니다.

즉 “랜덤이지만 **브랜드가 허용한 랜덤**”입니다.

### 1.5 희귀도(노말~레전더리)는 뭔가요?

슬라이드의 **Weighted Mixer**에 대응하는 개념입니다. **활동 점수**와 **플레이 시간**을 숫자로 합쳐서 등급을 정합니다.

**중요:** 지금 MVP에서는 희귀도가 **스탯을 올리거나 내리지는 않습니다.**  
화면에서 보이는 차이는 주로 **도트 테두리(윤곽선) 색**입니다. 몸통 색 규칙은 **노말과 동일**하게 두어, 등급은 **자랑·수집 요소**에 가깝고 게임 밸런스는 건드리지 않습니다.

### 1.6 “데모”와 “실제 게임”의 차이

- **실제 게임**: 한 번 `unlock` 되면 DNA가 기기에 저장되고, 그 펫이 계속 이어집니다.
- **DNA 데모 화면** (`/dna-demo`): 활동·플레이 시간 숫자를 바꿔 보며 **여러 마리를 시연**할 수 있게 한 **놀이터**입니다. 저장된 펫을 덮어쓰지 않도록 설계했습니다.

### 1.7 PNG 스프라이트 대신 이렇게 만든 이유 (기획 관점)

| 방식 | 장점 | 단점 |
|------|------|------|
| PNG를 장수만큼 그리기 | 그림 그대로 예쁨 | 조합이 늘어날수록 **작업량 폭발** |
| DNA + 코드 합성 | 파츠·규칙만 추가하면 **확장 쉬움** | 처음 엔진 짜는 비용 |

해커톤·MVP에는 후자가 유리한 편입니다.

---

## 2. 개발자를 위한 설명

### 2.1 데이터 모델 (`PetDNA`)

`src/lib/petGenerator.ts` 의 `PetDNA` 요약:

| 필드 | 타입(개념) | 설명 |
|------|------------|------|
| `seed` | `string` | 결정론 PRNG의 입력. 유저별 고정 식별자로 쓰임 |
| `genre` | `GameGenre` | 5종 중 하나 |
| `bodyShape` | `BodyShape` | `GENRE_BODY[genre]` 로 **장르에 종속** |
| `eyes` / `mouth` | 스타일 키 | `GENRE_FACE_POOLS[genre]` 안에서만 `pick` |
| `palette` | `PaletteName` | `GENRE_PALETTE_POOL[genre]` 안에서만 `pick` |
| `rarity?` | `PetRarity` | `dnaFromComposite`·데모용. 저장 DNA에는 보통 없음 → 합성 시 윤곽은 노말 |
| `activityScore?` / `gameplayTimeMinutes?` | number | 합성·표시용 메타 |

저장되는 `palette`는 **이름**이고, 실제 렌더 색은 `paletteWithRarityStyle`에서 **몸·윤곽 등을 덮어씀**.

### 2.2 난수: `seededRandom.ts`

- **`hashString(s)`** — FNV-1a 32-bit → 문자열을 시드 정수로.
- **`mulberry32(seed)`** — 경량 PRNG, `() => number` in `[0,1)`.
- **`pick(rng, arr)`** — 균등 인덱스 선택.

외부 RNG 라이브러리 없음.

### 2.3 DNA 생성 API 흐름

```
randomSeed() ──► generatePetDNA() ──► dnaFromSeed(seed)

고정 장르 ───────► dnaFromSeedWithGenre(seed, genre)

플레이오 지표 ───► dnaFromComposite(baseSeed, activity, playMin)
                        │
                        ├► compositeKey = baseSeed + act + play
                        ├► dnaFromSeed(compositeKey)  ← 파츠 결정에 사용
                        └► 반환 시 seed 필드는 baseSeed 유지, rarity는 computePetRarity
```

**`dnaFromComposite`의 의도:** 파츠 PRNG 입력은 `compositeKey`로 바꿔 **지표가 바뀌면 외형 후보도 바뀔 수 있게** 하되, 비즈니스 키로 쓰는 **`seed` 문자열은 `baseSeed`로 고정**.

### 2.4 `dnaFromSeed` 알고리즘 (의사코드)

```text
rng ← mulberry32(hashString(seed))
genre ← pick(rng, GAME_GENRES)
bodyShape ← GENRE_BODY[genre]
palette ← pick(rng, GENRE_PALETTE_POOL[genre])
eyes ← pick(rng, GENRE_FACE_POOLS[genre].eyes)
mouth ← pick(rng, GENRE_FACE_POOLS[genre].mouth)
return { seed, genre, bodyShape, palette, eyes, mouth }
```

### 2.5 희귀도 계산 `computePetRarity`

- `playTimeScore(minutes)` = `min(100, minutes / 10080 * 100)` (상한 7일 분량에 맞춘 스케일).
- `score = 0.55 * activity + 0.45 * playTimeScore` (반올림된 활동 0–100).
- 구간: `<40` normal, `<65` rare, `<82` epic, else legendary.

### 2.6 팔레트·희귀도 스타일 `paletteWithRarityStyle`

- 베이스: `PALETTES[dna.palette]` (`petParts.ts`).
- **몸·bodyDark·cheek·accent**: `bodyFillFromOutlineForDna` — **항상 `PET_RARITY_OUTLINE_COLORS.normal`(검정)** 기준으로 `contrastingBodyFillFromOutline` + HSL 절차 생성. `seed`가 바뀌면 색도 바뀜.
- **`outline`**: `dna.rarity ?? "normal"` 에 대응하는 **등급별 고정 hex** (도트 `O` 토큰).

### 2.7 래스터 합성 `composeSprite`

입력: `dna`, `stage` ∈ `{ baby, grown }`, `variant` ∈ `{ null, sick, happy }`.

순서 요약:

1. `palette = paletteWithRarityStyle(dna)`
2. `BODY_SHAPES[bodyShape][stage]` 토큰 그리드 복제 → `renderBody`로 **색 그리드(캔버스)**.
3. 모자 필요 시 상단 `padCanvasTop` (모자와 머리 겹침 보정).
4. `stampGenreHatBackdrop` → **눈**(좌 패치 + 우 미러) → **입** → (sick 아니면) **볼 한 픽셀씩** → `stampGenreGear` 모자.

`variant`:

- `sick`: 눈 `cross`, 입 `wavy`, 볼 스킵, 모자 숨김(`shouldShowHat`).
- `happy`: 눈 `sparkle`, 입 `smile`.

### 2.8 알 스프라이트 `composeEggSprite`

- 하드코딩된 알 형태의 `PixelGrid`에 팔레트 적용 후 `applyEggGenrePattern`으로 장르 무늬 포인트.

### 2.9 스테이지 라우팅 `spriteForStage`

- `egg` → `composeEggSprite` (variant 무시).
- 그 외 → `composeSprite`.

`composeRarityBackdrop`은 현재 **투명 그리드** (레이아웃 호환용).

### 2.10 마이그레이션 `normalizePetDNA`

저장 JSON이 옛 스키마면 **같은 `seed`로 `dnaFromSeed` 재생성**해 필드를 채움.

### 2.11 토큰 타입 (합성 시 색 매핑)

| 토큰(실루엣) | 의미 |
|--------------|------|
| `O` | 윤곽선 |
| `B` | 몸 |
| `D` | 음영 |
| `C` | 볼(팔레트 cheek와 별개로 쓰이는 경우 구분 주의) |

눈·입·장비(모자)는 각각 `EyeToken`, `MouthToken`, `AccToken` + 전용 `...ToColor` 리졸버.

### 2.12 파일 맵

| 경로 | 역할 |
|------|------|
| `src/lib/petGenerator.ts` | DNA 생성, 희귀도, 합성, egg, export API |
| `src/lib/seededRandom.ts` | 해시 + mulberry32 + pick |
| `src/constants/petParts.ts` | 실루엣·눈·입·팔레트·모자 패치 데이터 |
| `src/components/PixelCharacter.tsx` | DNA → `spriteForStageWithBackdrop` |
| `src/components/PixelPetView.tsx` | backdrop + sprite 레이어 렌더 |
| `app/dna-demo.tsx` | 합성·희귀도 시연 UI |

### 2.13 플레이오 연동 시 확장 포인트

- **장르 고정**: `generatePetDNAWithGenre` / `dnaFromSeedWithGenre`.
- **지표 반영 외형 + 등급**: `dnaFromComposite` + `computePetRarity` (이미 존재).
- **서버 주도 시드**: 클라이언트는 `dnaFromSeed(serverSeed)` 만 호출하면 동일 파이프라인.

---

## 3. 용어 한눈에

| 용어 | 짧은 설명 |
|------|-----------|
| 시드(seed) | 캐릭터를 결정하는 문자열 입력; 같으면 결과 동일 |
| DNA | 시드 + 장르·실루엣·표정·팔레트 이름 등 **데이터 묶음** |
| PRNG | 재현 가능한 의사 난수 생성기 |
| 토큰 그리드 | 아직 색이 아닌 기호(`O`,`B`…)로 된 실루엣/패치 |
| 픽셀 그리드(`PixelGrid`) | `#rrggbb` 또는 null(투명) 이중 배열 |
| 합성(stamp) | 작은 패치를 캔버스 좌표에 덮어쓰기 |

---

## 4. 관련 문서·화면

- **API·파이프라인 요약**: [`PET_GENERATOR.md`](./PET_GENERATOR.md)
- **발표 Q&A (전체 범위)**: [`HACKATHON_QA.md`](./HACKATHON_QA.md)
- **시연 페이지**: 앱 내 `/dna-demo` (커뮤니티 피드에서 DEV 링크 등 진입)

---

*구현이 바뀌면 이 문서의 수치·함수 이름을 코드와 맞춰 갱신해 주세요.*
