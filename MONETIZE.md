# 収益化ガイド

このブログには収益化の仕組みがすでに組み込まれています。
あとは各サービスに登録し、発行された値を **`assets/config.js` に貼るだけ**で有効になります。
（`config.js` の空欄はサイト上に表示されないので、準備できたものから順に埋めればOK）

---

## いま動いているもの（登録不要）

- **SNSシェアボタン**（X / LINE / Facebook / リンクコピー）— 各記事の下部で即動作。
  拡散＝アクセス増＝収益の土台になります。

## あなたの登録が必要なもの

### ① 投げ銭・サポート（最優先・元手ゼロ）
1. [note](https://note.com/) か [Ko-fi](https://ko-fi.com/) でアカウント作成
2. 自分のページURLを `config.js` の `support.url` に貼る
3. 全記事の下に「応援する」ボタンが自動表示されます

### ② Amazon アソシエイト（アフィリエイト）
1. [アソシエイト・プログラム](https://affiliate.amazon.co.jp/)に登録・審査
2. 発行されたトラッキングID（例 `myblog-22`）を `config.js` の `amazonTag` に貼る
3. 各記事の「登場したもの」リンクに自動でIDが付与されます
   （商品自体は各記事HTMLの `window.PAGE.affiliate` で差し替え可能）

### ③ Google AdSense（ディスプレイ広告）
1. [AdSense](https://adsense.google.com/) に登録・サイト審査（記事が数本必要）
2. 発行された `ca-pub-...` を `config.js` の `adsense.client` に、
   広告ユニットのスロットIDを `adsense.slot` に貼る
3. 各記事の上部に広告が自動表示されます

---

## 収益を伸ばすコツ
- **記事を増やす**のが最も効きます（検索流入の入口が増える）
- 書いたら **X や Instagram で一節を紹介** → ブログへ誘導
- **Google Search Console** に `sitemap.xml` を登録して検索に載せる

## 新しい記事の追加手順
1. `posts/` に既存HTMLをコピーして本文を差し替え
2. `index.html` にカードを1つ追加
3. `sitemap.xml` にURLを1行追加
4. コミット & プッシュ → 数分で公開
