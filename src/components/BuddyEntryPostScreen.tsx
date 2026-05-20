import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { SECRET_COMMAND, HINTS } from "../constants/config";

const UNLOCK_KEY = "@tamagotchi_state";

const BLUE = "#3B82F6";
const BG = "#FFFFFF";
const SURFACE = "#F3F4F6";
const TEXT = "#111827";
const SUB = "#6B7280";
const BORDER = "#E5E7EB";

const POST_TITLE = "내 힌트는 앞에 B라고 하는데";
const POST_BODY =
  "플오에서 받은 힌트가 맨 앞글자 B만 적혀 있어서 미치겠음 ㅋㅋ 댓글 창에 영단어로 추측해서 넣어보래서 그냥 때려 넣어봤는데 신기능 연다는 소문 ㄹㅇ냐?? 대박이네";

const COMMENTS = [
  {
    id: "1",
    level: "크리에이터 Lv.74",
    user: "NOD3",
    body: '혹시 "buddy" 아냐',
    avatarBg: "#F472B6",
    initial: "N",
  },
  {
    id: "2",
    level: "플레이오고인물 Lv.12",
    user: "달빛라떼",
    body: "저도 같은 힌트 봤어요 ㅋㅋ 다 같이 맞춰봐요.",
    avatarBg: "#34D399",
    initial: "달",
  },
];

export default function BuddyEntryPostScreen() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [hint, setHint] = useState("");
  const [showError, setShowError] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(UNLOCK_KEY).then((raw) => {
      if (raw) {
        const data = JSON.parse(raw);
        if (data.isUnlocked) setIsUnlocked(true);
      }
    });
    setHint(HINTS[Math.floor(Math.random() * HINTS.length)]);
  }, []);

  const handleSubmit = () => {
    if (input.trim().toUpperCase() === SECRET_COMMAND) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push("/tamagotchi");
    } else {
      setShowError(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => setShowError(false), 2000);
    }
  };

  const handleGoToTamagotchi = () => {
    router.push("/tamagotchi");
  };

  const handleGoToDnaDemo = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
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
            <Text style={styles.category}>☆ 자유 &gt;</Text>
          </TouchableOpacity>

          <Text style={styles.postTitle}>{POST_TITLE}</Text>

          <Text style={styles.meta}>
            2026.05.08 오후 03:14{"  "}|{"  "}조회 146
          </Text>

          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarEmoji}>🐱</Text>
            </View>
            <View style={styles.authorTextBlock}>
              <Text style={styles.authorLevel}>플레이오고인물 Lv.23</Text>
              <Text style={styles.authorName}>잭냥이.</Text>
            </View>
            <TouchableOpacity style={styles.moreBtn} hitSlop={12}>
              <Text style={styles.moreDots}>⋮</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.postBody}>{POST_BODY}</Text>
          <Text style={styles.hintHelper}>💡 막히면 힌트: {hint}</Text>

          <Text style={styles.caption}>
            <Text style={styles.captionSub}>
              아래 댓글 칸에 영문 대문자로 입력하면 다마고치 화면으로 이동해요.
            </Text>
          </Text>

          {isUnlocked ? (
            <TouchableOpacity onPress={handleGoToTamagotchi}>
              <Text style={styles.inlineLink}>🐣 내 다마고치로 바로가기</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={handleGoToDnaDemo} style={styles.dnaLinkWrap}>
            <Text style={styles.inlineLink}>🧬 펫 DNA 생성기 — 피드 상단 DEV</Text>
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.85}>
              <Text style={styles.outlineBtnText}>💬 8</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.85}>
              <Text style={styles.outlineBtnText}>👍 5</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {COMMENTS.map((c) => (
            <View key={c.id} style={styles.commentBlock}>
              <View style={styles.commentTop}>
                <View style={[styles.cAvatar, { backgroundColor: c.avatarBg }]}>
                  <Text style={styles.cAvatarText}>{c.initial}</Text>
                </View>
                <View style={styles.commentMeta}>
                  <Text style={styles.authorLevel}>{c.level}</Text>
                  <Text style={styles.authorName}>{c.user}</Text>
                </View>
                <TouchableOpacity style={styles.moreBtn} hitSlop={12}>
                  <Text style={styles.moreDots}>⋮</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.commentBody}>{c.body}</Text>
            </View>
          ))}

          <View style={[styles.commentBlock, styles.composerBlock]}>
            <View style={styles.commentTop}>
              <View style={[styles.cAvatar, { backgroundColor: "#6366F1" }]}>
                <Text style={styles.cAvatarText}>나</Text>
              </View>
              <View style={styles.commentMeta}>
                <Text style={styles.authorLevel}>플레이어 Lv.1</Text>
                <Text style={styles.authorName}>히든</Text>
              </View>
            </View>
            <View style={styles.composerInner}>
              <View style={styles.composerFieldRow}>
                <TextInput
                  style={styles.commentInput}
                  value={input}
                  onChangeText={setInput}
                  placeholder="댓글처럼 히든을 입력하세요…"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="characters"
                  returnKeyType="send"
                  onSubmitEditing={handleSubmit}
                />
                <TouchableOpacity
                  style={styles.composerSend}
                  onPress={handleSubmit}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.composerSendText}>등록</Text>
                </TouchableOpacity>
              </View>
              {showError ? (
                <Text style={styles.composerError}>
                  잘못된 히든이에요. 힌트를 확인해 주세요.
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.bottomPad} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT,
  },
  category: {
    fontSize: 15,
    fontWeight: "600",
    color: BLUE,
    marginBottom: 10,
  },
  postTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 8,
    lineHeight: 30,
  },
  meta: {
    fontSize: 13,
    color: SUB,
    marginBottom: 18,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
  authorAvatarEmoji: { fontSize: 26 },
  authorTextBlock: { flex: 1 },
  authorLevel: {
    fontSize: 12,
    color: SUB,
    marginBottom: 2,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
  },
  moreBtn: { padding: 4 },
  moreDots: {
    fontSize: 20,
    color: SUB,
    fontWeight: "700",
    lineHeight: 22,
  },
  postBody: {
    fontSize: 16,
    color: TEXT,
    lineHeight: 24,
    marginBottom: 12,
  },
  hintHelper: {
    fontSize: 13,
    color: SUB,
    lineHeight: 20,
    marginBottom: 14,
  },
  caption: { marginBottom: 10 },
  captionSub: {
    fontSize: 13,
    color: SUB,
    fontWeight: "400",
  },
  inlineLink: {
    fontSize: 14,
    fontWeight: "600",
    color: BLUE,
    marginBottom: 6,
  },
  dnaLinkWrap: { marginBottom: 20 },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  outlineBtn: {
    flex: 1,
    maxWidth: 140,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
  },
  outlineBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: SUB,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginVertical: 20,
  },
  commentBlock: { marginBottom: 22 },
  commentTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cAvatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  commentMeta: { flex: 1 },
  commentBody: {
    marginLeft: 52,
    marginTop: 8,
    fontSize: 15,
    color: TEXT,
    lineHeight: 22,
  },
  composerBlock: {
    marginTop: 4,
    paddingTop: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
  },
  composerInner: {
    marginLeft: 52,
    marginTop: 8,
  },
  composerFieldRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingLeft: 12,
    paddingRight: 4,
    minHeight: 44,
  },
  commentInput: {
    flex: 1,
    fontSize: 15,
    color: TEXT,
    paddingVertical: 10,
    paddingRight: 8,
    maxHeight: 120,
  },
  composerSend: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  composerSendText: {
    fontSize: 15,
    fontWeight: "700",
    color: BLUE,
  },
  composerError: {
    marginTop: 8,
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "600",
  },
  bottomPad: { height: 16 },
});
