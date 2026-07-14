/* =========================================================================
   generate-essays.js — queue/ が5本未満のとき、Claude APIでエッセイを
   自動生成して補充する。GitHub Actions (refill-queue.yml) から実行される。
   環境変数: ANTHROPIC_API_KEY (必須) / FORCE=1 (満杯でも1本生成・テスト用)
   ========================================================================= */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const QDIR = path.join(ROOT, "queue");
const TARGET = 5;

const KEY = process.env.ANTHROPIC_API_KEY;
const FORCE = !!process.env.FORCE;

const queueFiles = fs.readdirSync(QDIR).filter(f => f.endsWith(".json"));
let need = TARGET - queueFiles.length;
if (FORCE && need < 1) need = 1;
if (need < 1) {
  console.log(`queue has ${queueFiles.length} items — no refill needed`);
  process.exit(0);
}
if (!KEY) {
  console.error("ANTHROPIC_API_KEY is not set");
  process.exit(1);
}

/* 既存タイトル・slug（重複防止） */
const titles = [];
const slugs = new Set();
for (const f of fs.readdirSync(path.join(ROOT, "posts")).filter(f => f.endsWith(".html"))) {
  const m = fs.readFileSync(path.join(ROOT, "posts", f), "utf8").match(/<title>([^<]+?)\s*—/);
  if (m) titles.push(m[1].trim());
  slugs.add(f.replace(/\.html$/, ""));
}
for (const f of queueFiles) {
  try {
    const p = JSON.parse(fs.readFileSync(path.join(QDIR, f), "utf8"));
    titles.push(p.title);
    slugs.add(p.slug);
  } catch {}
}

const now = new Date(Date.now() + 9 * 3600 * 1000);
const month = now.getUTCMonth() + 1;
const datePrefix = now.toISOString().slice(0, 10).replace(/-/g, "");

function buildPrompt() {
  return `あなたはエッセイブログ「無理なく」の筆者です。新しいエッセイを1本書いてください。

## ブログのトーン（厳守）
- 読者: 日本の20〜30代。仕事や暮らしに少し疲れている人
- 静か・内省的・寄り添い型。「がんばりすぎなくていい」が核。説教しない
- 構成: 情景から入る書き出し → 五感の具体 → 一文の発見 → 最後は必ずやわらかく肯定して終える
- 本文は10〜16段落、合計3000字前後（2800〜3500字）。内容を詰め込むのではなく、無駄・脱線・どうでもいい具体でゆったりふくらませる。冗長・蛇足を恐れない
- いまは${month}月。季節感が合う題材だと望ましい（必須ではない)

## 文体の掟（最重要）
- 「研究によると」「〜という話を聞いた」「統計では」などのエビデンス話法は禁止。根拠は筆者個人の実感と記憶だけでよい
- きれいに解決しないこと。矛盾は矛盾のまま抱えて終わってよい。「わかっているのに、できない。それでも」のような不完全さを残す。「理由は3つ」「ひとつは〜ふたつめは〜」のような整理された骨格は使わない
- 人間的な口調: 言いよどみ・自問・書きながら考えている感じ（「〜だろうか。いや、違うかもしれない」「…と、ここまで書いて気づいた」）を1〜2箇所入れる
- 比喩は使い古したもの（電池の充電・植物の根・心の洗濯など）を避け、その記事の情景から生まれた固有の比喩だけを使う
- 完璧な語り手にならない。筆者自身もできていない・迷っている、という立ち位置を保つ

## note型の文体（伸びているnoteエッセイの型に準拠）
- 比喩は「きれい」より「勢い」。身近でヘンな例えが、文学的な美文に勝つ
- 笑いと切なさを同居させる。自虐やセルフツッコミを1箇所入れる
- 話はポンと飛んでよい。脱線を味として残す
- 固有名詞・数字・時刻で具体に（「夜遅く」ではなく「23時46分」、「飲み物」ではなく「午後の紅茶」）
- タイトルは説明ではなく「事件性・意外性のある具体的な一文」にする
- ユーモアは「狙って作ったオチ」ではなく「偶然のしょうもなさ」。何も起こらない出来事・意味のないディテールをオチにせずそのまま置く。設計されたボケ比喩は1記事1個まで
- ほのかな切なさ: 笑いの奥に、消えていくもの・戻らないもの（季節・時間・その夜かぎりのもの）への淡いさびしさを1〜2箇所にじませる。泣かせにいかない
- 仏教的人生観を、宗教用語や説教を一切使わずに視線として底に流す: すべては移ろい同じ夜は二度と来ない（無常）、思いどおりにならないことと争わない（受容）、解決への執着をそっと手放す
- 記事のどこか1箇所、読んでいる人をそっとねぎらう一文を置く（「あなたも今日、よく外に出た」のような、小さな安らぎ）
- 統計や研究ではなく「特徴的なデータ」を使う: 肌感のある固有の数字・事実（セミは地上で一週間、26.5度で停戦した冷房、当たりの出ないアイスの棒、など）を手触りとして置く

## 既存タイトル（これらと重複・類似しないこと）
${titles.map(t => "- " + t).join("\n")}

## 出力形式
以下のJSONだけを出力すること。コードブロック記号や説明文は一切付けない。
{
  "slug": "英小文字とハイフンのみの短いスラッグ",
  "title": "エッセイのタイトル（30字以内）",
  "tag": "こころ/暮らし/ライフ/カルチャー/お金 のいずれか",
  "desc": "メタ説明文（60字以内）",
  "excerpt": "一覧に出る抜粋（60字以内・本文冒頭の要約）",
  "affiliate": [
    { "name": "本文の内容に自然に関連する商品名", "desc": "ひとこと説明", "url": "https://www.amazon.co.jp/s?k=検索キーワード" }
  ],
  "body": ["段落1", "段落2", "…", "段落9〜12"]
}`;
}

async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 6000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return data.content.map(b => b.text || "").join("");
}

function validate(p) {
  if (!p.slug || !/^[a-z0-9-]{3,40}$/.test(p.slug)) return "bad slug";
  if (slugs.has(p.slug)) return "duplicate slug";
  if (!p.title || p.title.length > 40) return "bad title";
  if (titles.includes(p.title)) return "duplicate title";
  if (!["こころ", "暮らし", "ライフ", "カルチャー", "お金"].includes(p.tag)) return "bad tag";
  if (!p.desc || !p.excerpt) return "missing desc/excerpt";
  if (!Array.isArray(p.body) || p.body.length < 9 || p.body.length > 18) return "bad body";
  if (p.body.some(t => typeof t !== "string" || t.length < 40)) return "body paragraph too short";
  if (!Array.isArray(p.affiliate)) p.affiliate = [];
  return null;
}

(async () => {
  let made = 0;
  for (let i = 0; i < need; i++) {
    let ok = false;
    for (let attempt = 1; attempt <= 2 && !ok; attempt++) {
      try {
        const raw = await callClaude(buildPrompt());
        const m = raw.match(/\{[\s\S]*\}/);
        if (!m) throw new Error("no JSON in response");
        const p = JSON.parse(m[0]);
        const err = validate(p);
        if (err) throw new Error("validation: " + err);
        const fname = `${datePrefix}-${p.slug}.json`;
        fs.writeFileSync(path.join(QDIR, fname), JSON.stringify(p, null, 2) + "\n");
        titles.push(p.title);
        slugs.add(p.slug);
        made++;
        ok = true;
        console.log(`generated: ${p.title} -> queue/${fname}`);
      } catch (e) {
        console.error(`attempt ${attempt} failed: ${e.message}`);
      }
    }
  }
  console.log(`done: ${made}/${need} generated`);
  if (made === 0 && need > 0) process.exit(1);
})();
