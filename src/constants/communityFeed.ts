import type { ImageSourcePropType } from "react-native";

export type CommunityFeedItem = {
  id: string;
  category: string;
  authorLevel: string;
  authorNickname: string;
  title: string;
  bodyPreview: string;
  timestamp: string;
  commentCount: number;
  likeCount: number;
  postTag: string;
  /** 목록 썸네일 (없으면 미표시) */
  image?: ImageSourcePropType;
  avatarEmoji: string;
};

/** 메인 커뮤니티 탭 — 하드코딩 목록. `buddy`만 버디 진입 상세로 연결. */
export const COMMUNITY_FEED_POSTS: CommunityFeedItem[] = [
  {
    id: "tamagotchi-pvp-call",
    category: "☆ 자유",
    authorLevel: "디지몬매니아 Lv.33",
    authorNickname: "알맹탱",
    title: "다마고치 있는 사람만 들어와라~",
    bodyPreview:
      "다마고치 있는 사람들 우측 옆에 대결 버튼 눌러와서 함 뜨자",
    timestamp: "2026.05.20 오후 02:07",
    commentCount: 3,
    likeCount: 12,
    postTag: "501442",
    avatarEmoji: "🥚",
  },
  {
    id: "buddy",
    category: "☆ 자유",
    authorLevel: "플레이오고인물 Lv.23",
    authorNickname: "잭냥이.",
    title: "내 힌트는 앞에 B라고 하는데",
    bodyPreview:
      "플오에서 받은 힌트가 맨 앞글자 B만 적혀 있어서 미치겠음 ㅋㅋ 댓글 창에 영단어로 추측해서 넣어보래서...",
    timestamp: "2026.05.08 오후 03:14",
    commentCount: 8,
    likeCount: 5,
    postTag: "482901",
    avatarEmoji: "🐱",
  },
  {
    id: "gacha-rant",
    category: "☆ 꿀팁",
    authorLevel: "럭키가이 Lv.41",
    authorNickname: "뽑기의악마",
    title: "이번 시즌 박스Only 현질 각?",
    bodyPreview: "통계 올린 사람 있음? 솔직히 편파적인 것 같아서 ㅠㅠ",
    timestamp: "2026.05.19 오후 09:22",
    commentCount: 24,
    likeCount: 67,
    postTag: "494201",
    avatarEmoji: "🎰",
  },
];

export const GENERIC_POST_FULL_BODY: Record<string, string> = {
  "tamagotchi-pvp-call":
    "다마고치 있는 사람들 우측 옆에 대결 버튼 눌러와서 함 뜨자",
  "gacha-rant":
    "확률표는 공개됐는데 체감이 너무 다름. 패치 노트에는 안 나온 밸런스 조정 있는 거 아님? 댓글로 데이터 공유 부탁!",
};
