import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import BuddyEntryPostScreen from "../../src/components/BuddyEntryPostScreen";
import {
  COMMUNITY_FEED_POSTS,
  GENERIC_POST_FULL_BODY,
  POST_COMMENTS,
  type CommunityFeedItem,
} from "../../src/constants/communityFeed";

const BG = "#FFFFFF";
const BLUE = "#3B82F6";
const TEXT = "#111827";
const SUB = "#6B7280";
const SURFACE = "#F3F4F6";
const BORDER = "#E5E7EB";
const TAG_BG = "#FCE7F3";

function GenericCommunityPost({ post }: { post: CommunityFeedItem }) {
  const router = useRouter();
  const full =
    GENERIC_POST_FULL_BODY[post.id] ??
    `${post.bodyPreview}\n\n(더 보기 준비 중)`;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={{ width: 56 }} />
          <Text style={styles.pageTitle}>게시글</Text>
          <View style={{ width: 56 }} />
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 0, right: 12 }}
        >
          <Text style={styles.category}>{post.category} &gt;</Text>
        </TouchableOpacity>

        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.meta}>{post.timestamp}</Text>

        <View style={styles.authorRow}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorAvatarEmoji}>{post.avatarEmoji}</Text>
          </View>
          <View style={styles.authorTextBlock}>
            <Text style={styles.authorLevel}>{post.authorLevel}</Text>
            <Text style={styles.authorName}>{post.authorNickname}</Text>
          </View>
          {post.id === "tamagotchi-pvp-call" ? (
            <TouchableOpacity
              style={styles.battleBtn}
              onPress={() => router.push("/battle")}
              activeOpacity={0.85}
            >
              <Text style={styles.battleBtnText}>대결</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {post.image ? (
          <Image source={post.image} style={styles.hero} resizeMode="cover" />
        ) : null}

        <Text style={styles.postBody}>{full}</Text>

        <View style={styles.footerRow}>
          <Text style={styles.timestamp}>{post.timestamp}</Text>
          <View style={styles.actions}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>💬 {post.commentCount}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>👍 {post.likeCount}</Text>
            </View>
          </View>
        </View>

        <View style={styles.hexTag}>
          <Text style={styles.hexTagText}>{post.postTag}</Text>
        </View>

        {POST_COMMENTS[post.id]?.length ? (
          <>
            <View style={styles.commentsDivider} />
            <Text style={styles.commentsHeading}>댓글</Text>
            {POST_COMMENTS[post.id]!.map((c) => (
              <View key={c.id} style={styles.commentCard}>
                <View style={styles.commentTopRow}>
                  <View style={styles.commentAvatar}>
                    {c.avatarImage ? (
                      <Image
                        source={c.avatarImage}
                        style={styles.commentAvatarImg}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.commentAvatarEmoji}>
                        {c.avatarEmoji ?? "👤"}
                      </Text>
                    )}
                  </View>
                  <View style={styles.commentMetaCol}>
                    <Text style={styles.commentLevel}>{c.authorLevel}</Text>
                    <Text style={styles.commentAuthor}>{c.authorName}</Text>
                  </View>
                  <TouchableOpacity hitSlop={12} style={styles.commentMore}>
                    <Text style={styles.commentMoreDots}>⋮</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.commentBody}>{c.body}</Text>
                <View style={styles.commentFooter}>
                  <Text style={styles.commentFooterMuted}>👍 {c.likes}</Text>
                  <Text style={styles.commentReply}>답글쓰기</Text>
                  <View style={{ flex: 1 }} />
                  <Text style={styles.commentFooterMuted}>{c.timeAgo}</Text>
                </View>
              </View>
            ))}
          </>
        ) : null}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function CommunityPostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (id === "buddy") {
    return <BuddyEntryPostScreen />;
  }

  const post = COMMUNITY_FEED_POSTS.find((p) => p.id === id);
  if (!post) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar style="dark" />
        <View style={styles.missing}>
          <Text style={styles.missingText}>글을 찾을 수 없어요.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return <GenericCommunityPost post={post} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  pageTitle: { fontSize: 17, fontWeight: "700", color: TEXT },
  category: {
    fontSize: 14,
    fontWeight: "600",
    color: BLUE,
    marginBottom: 10,
  },
  postTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 8,
    lineHeight: 28,
  },
  meta: { fontSize: 13, color: SUB, marginBottom: 16 },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SURFACE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  authorAvatarEmoji: { fontSize: 24 },
  authorTextBlock: { flex: 1 },
  authorLevel: { fontSize: 12, color: SUB, marginBottom: 2 },
  authorName: { fontSize: 16, fontWeight: "700", color: TEXT },
  battleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: BLUE,
    marginLeft: 8,
  },
  battleBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  hero: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: SURFACE,
  },
  postBody: {
    fontSize: 16,
    color: TEXT,
    lineHeight: 24,
    marginBottom: 20,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  timestamp: { fontSize: 12, color: SUB },
  actions: { flexDirection: "row", gap: 8 },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  pillText: { fontSize: 14, color: SUB, fontWeight: "600" },
  hexTag: {
    alignSelf: "flex-start",
    backgroundColor: TAG_BG,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  hexTagText: { color: "#BE185D", fontSize: 13, fontWeight: "700" },
  commentsDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginTop: 8,
    marginBottom: 16,
  },
  commentsHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 14,
  },
  commentCard: {
    marginBottom: 20,
    paddingBottom: 4,
  },
  commentTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SURFACE,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  commentAvatarImg: { width: 40, height: 40 },
  commentAvatarEmoji: { fontSize: 22 },
  commentMetaCol: { flex: 1 },
  commentLevel: {
    fontSize: 12,
    color: "#9B8FC9",
    marginBottom: 2,
  },
  commentAuthor: { fontSize: 15, fontWeight: "700", color: TEXT },
  commentMore: { padding: 4, marginTop: -4 },
  commentMoreDots: {
    fontSize: 18,
    color: SUB,
    fontWeight: "700",
    lineHeight: 20,
  },
  commentBody: {
    fontSize: 15,
    color: TEXT,
    lineHeight: 22,
    marginBottom: 12,
    paddingLeft: 50,
  },
  commentFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 50,
    gap: 14,
  },
  commentFooterMuted: { fontSize: 13, color: SUB },
  commentReply: {
    fontSize: 13,
    color: SUB,
    fontWeight: "600",
  },
  bottomPad: { height: 24 },
  missing: { flex: 1, padding: 24 },
  missingText: { marginTop: 24, color: SUB, fontSize: 16 },
});
