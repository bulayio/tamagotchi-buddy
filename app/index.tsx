import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { COMMUNITY_FEED_POSTS } from "../src/constants/communityFeed";

const TAMAGOTCHI_STATE_KEY = "@tamagotchi_state";

const BG = "#FFFFFF";
const BLUE = "#2F80FF";
const TEXT = "#111827";
const SUB = "#6B7280";
const DIVIDER = "#E5E7EB";
const SURFACE = "#F3F4F6";
const TAG_BG = "#FCE7F3";

type TabKey = "live" | "sub" | "rec";

const NAV_ITEMS: {
  key: string;
  label: string;
  icon: string;
  route: "/tamagotchi" | "/battle" | "/" | "/dna-demo";
  isCommunity?: boolean;
}[] = [
  { key: "today", label: "투데이", icon: "🎮", route: "/tamagotchi" },
  { key: "quest", label: "퀘스트", icon: "📜", route: "/battle" },
  { key: "shop", label: "상점", icon: "🎁", route: "/tamagotchi" },
  {
    key: "community",
    label: "커뮤니티",
    icon: "💬",
    route: "/",
    isCommunity: true,
  },
  { key: "party", label: "파티", icon: "🚩", route: "/dna-demo" },
];

export default function CommunityFeedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabKey>("live");
  const [showTamagoShortcut, setShowTamagoShortcut] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      AsyncStorage.getItem(TAMAGOTCHI_STATE_KEY).then((raw) => {
        if (!alive) return;
        if (!raw) {
          setShowTamagoShortcut(false);
          return;
        }
        try {
          const data = JSON.parse(raw) as { isUnlocked?: boolean };
          setShowTamagoShortcut(data.isUnlocked === true);
        } catch {
          setShowTamagoShortcut(false);
        }
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  const openPost = (id: string) => {
    router.push(`/post/${id}`);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeTop} edges={["top"]}>
        {/* 헤더: 프로필 / Lv / 아이콘 */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.profileRing}>
              <Text style={styles.profileEmoji}>😺</Text>
            </View>
            <View style={styles.levelBlock}>
              <Text style={styles.levelText}>Lv.15</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: "42%" }]} />
              </View>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <HeaderIcon
              label="DEV"
              symbol={"</>"}
              onPress={() => router.push("/dna-demo")}
            />
            {showTamagoShortcut ? (
              <HeaderIcon
                label=""
                symbol="🐣"
                onPress={() => router.push("/tamagotchi" as never)}
              />
            ) : null}
            <HeaderIcon label="" symbol="🔔" dot />
            <HeaderIcon label="" symbol="💭" />
            <HeaderIcon label="" symbol="🔍" />
          </View>
        </View>

        {/* 탭 */}
        <View style={styles.tabs}>
          {(
            [
              ["live", "실시간"],
              ["sub", "구독"],
              ["rec", "추천"],
            ] as const
          ).map(([key, label]) => (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              style={styles.tabHit}
            >
              <Text
                style={[styles.tabText, tab === key && styles.tabTextActive]}
              >
                {label}
              </Text>
              {tab === key ? <View style={styles.tabUnderline} /> : null}
            </Pressable>
          ))}
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {COMMUNITY_FEED_POSTS.map((post, index) => (
          <Pressable
            key={post.id}
            onPress={() => openPost(post.id)}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
          >
            {index > 0 ? <View style={styles.cardDivider} /> : null}
            <Text style={styles.category}>{post.category} &gt;</Text>

            <View style={styles.authorRow}>
              <View style={styles.avatarSm}>
                <Text style={styles.avatarSmEmoji}>{post.avatarEmoji}</Text>
              </View>
              <View style={styles.authorMeta}>
                <Text style={styles.authorLevel}>{post.authorLevel}</Text>
                <Text style={styles.authorName}>{post.authorNickname}</Text>
              </View>
            </View>

            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.preview} numberOfLines={2}>
              {post.bodyPreview}
            </Text>

            {post.image ? (
              <Image
                source={post.image}
                style={styles.thumb}
                resizeMode="cover"
              />
            ) : null}

            <View style={styles.cardFooter}>
              <Text style={styles.time}>{post.timestamp}</Text>
              <View style={styles.stats}>
                <View style={styles.statPill}>
                  <Text style={styles.statText}>💬 {post.commentCount}</Text>
                </View>
                <View style={styles.statPill}>
                  <Text style={styles.statText}>👍 {post.likeCount}</Text>
                </View>
              </View>
            </View>

            <View style={styles.hexTag}>
              <Text style={styles.hexTagText}>{post.postTag}</Text>
            </View>
          </Pressable>
        ))}
        <View style={{ height: 120 + insets.bottom }} />
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { bottom: 72 + insets.bottom }]}
        activeOpacity={0.85}
        onPress={() => {}}
      >
        <Text style={styles.fabIcon}>✏️</Text>
      </TouchableOpacity>

      {/* 하단 네비 */}
      <View style={[styles.bottomNav, { paddingBottom: 8 + insets.bottom }]}>
        {NAV_ITEMS.map((item) => {
          const active = item.isCommunity;
          return (
            <TouchableOpacity
              key={item.key}
              style={styles.navItem}
              onPress={() => {
                if (item.route === '/tamagotchi') {
                  router.push('/tamagotchi?hatch=1' as never);
                } else {
                  router.push(item.route as never);
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {item.label}
              </Text>
              {item.key === "quest" ? <View style={styles.navDot} /> : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function HeaderIcon({
  label,
  symbol,
  dot,
  onPress,
}: {
  label: string;
  symbol: string;
  dot?: boolean;
  onPress?: () => void;
}) {
  const inner = (
    <>
      {dot ? <View style={styles.notifDot} /> : null}
      <Text style={styles.hIconSymbol}>{symbol}</Text>
      {label ? <Text style={styles.hIconLabel}>{label}</Text> : null}
    </>
  );
  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.hIconWrap}
        onPress={onPress}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {inner}
      </TouchableOpacity>
    );
  }
  return <View style={styles.hIconWrap}>{inner}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  safeTop: { backgroundColor: BG },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 32,
    paddingTop: 4,
    paddingBottom: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  profileRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: SURFACE,
    alignItems: "center",
    justifyContent: "center",
  },
  profileEmoji: { fontSize: 22 },
  levelBlock: { marginLeft: 12, flex: 1, maxWidth: 120 },
  levelText: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: BLUE,
    borderRadius: 2,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  hIconWrap: { alignItems: "center", minWidth: 28 },
  hIconSymbol: { fontSize: 18, color: TEXT },
  hIconLabel: { fontSize: 9, color: SUB, marginTop: 2 },
  notifDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    zIndex: 1,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 22,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DIVIDER,
  },
  tabHit: { paddingBottom: 10 },
  tabText: {
    fontSize: 16,
    color: SUB,
    fontWeight: "600",
  },
  tabTextActive: {
    color: BLUE,
    fontWeight: "800",
  },
  tabUnderline: {
    marginTop: 6,
    height: 3,
    borderRadius: 2,
    backgroundColor: BLUE,
  },
  list: { flex: 1 },
  listContent: { paddingTop: 12, paddingBottom: 8 },
  card: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },
  cardPressed: { opacity: 0.92 },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DIVIDER,
    marginBottom: 16,
    marginHorizontal: -16,
  },
  category: {
    fontSize: 14,
    fontWeight: "600",
    color: BLUE,
    marginBottom: 10,
  },
  authorRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  avatarSm: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SURFACE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarSmEmoji: { fontSize: 18 },
  authorMeta: { flex: 1 },
  authorLevel: { fontSize: 11, color: SUB, marginBottom: 2 },
  authorName: { fontSize: 15, fontWeight: "800", color: TEXT },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 6,
    lineHeight: 24,
  },
  preview: {
    fontSize: 15,
    color: TEXT,
    lineHeight: 22,
    marginBottom: 10,
    opacity: 0.92,
  },
  thumb: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: SURFACE,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  time: { fontSize: 12, color: SUB },
  stats: { flexDirection: "row", gap: 8 },
  statPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: DIVIDER,
  },
  statText: { fontSize: 13, color: SUB, fontWeight: "600" },
  hexTag: {
    alignSelf: "flex-start",
    backgroundColor: TAG_BG,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  hexTagText: { color: "#BE185D", fontSize: 12, fontWeight: "700" },
  fab: {
    position: "absolute",
    right: 18,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: { fontSize: 24 },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: DIVIDER,
    backgroundColor: BG,
    paddingTop: 8,
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  navItem: { alignItems: "center", flex: 1 },
  navIcon: { fontSize: 22, marginBottom: 2 },
  navLabel: { fontSize: 11, color: SUB, fontWeight: "600" },
  navLabelActive: { color: BLUE },
  navDot: {
    position: "absolute",
    top: -2,
    right: "28%",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EF4444",
  },
});
