# 無理なく — ブログ運用マニュアル

エッセイブログ「無理なく」のリポジトリ。収益化済み・自動運用中。
公開URL: https://tenseitomato28-lgtm.github.io/-/ (GitHub Pages, ブランチ claude/blog-project-setup-obd06s 直下)

## プロジェクトの目的
若者向けの共感エッセイで読者を集め、収益化する。
- トーン: 静か・内省的・寄り添い型。「がんばりすぎなくていい」が核。説教しない。最後は必ずやわらかく肯定して終える
- 記事構成: 情景から入る書き出し → 五感の具体 → 一文の発見 → 余韻のある締め。5〜6段落
- 筆名・サイト名: 無理なく

## 自動化の仕組み
1. **毎日18:02 JST**: GitHub Actions (`.github/workflows/daily-post.yml`) が `scripts/publish-next.js` を実行し、`queue/` の先頭記事を1本公開（記事HTML生成・index/sitemap/feed更新・自動コミット）
2. **X自動投稿**: dlvr.it が `feed.xml` を監視し、新記事をXに投稿（ユーザーのXアカウントに接続済み）
3. **ストック補充**: SessionStart フックが `queue/*.json` を数え、5本未満なら補充指示を注入 → 既存の queue/*.json と同形式で新エッセイを書き、コミット・プッシュする
4. **週次見直し**: SessionStart フックが `.claude/last-review`（epoch秒）を確認し、7日超なら見直し指示を注入

## 週次見直しでやること（毎週月曜9時JST以降の最初のセッションで実行）
1. `queue/` の残数確認（5本未満なら補充）
2. `git log --oneline -10` で「Publish scheduled post」コミットが毎日あるか確認（なければActionsの故障 → ユーザーに報告）
3. 記事テーマの偏りを確認し、次の補充分の方向性を調整
4. **収入を伸ばす一手の提案（必須）**: 現在の収益源（note投げ銭・Amazonアソシエイト・Kindle本・将来のAdSense）を踏まえ、今週打てる具体策を1〜3個提案する。例:
   - 検索需要のあるテーマへの記事投入（季節ネタ・悩み系キーワード）
   - x-posts.md の宣伝文の改善、投稿時間の変更提案
   - Amazonアソシエイト180日3販売の進捗確認と対策（アフィリンクの見せ方改善など）
   - Kindle続編・価格変更・無料キャンペーンの提案
   - アクセスが十分育っていればAdSense申請の提案
   - ユーザーにしか見えないデータ（noteダッシュボード・X反応・KDPレポート・Search Console）の確認を依頼し、次回の提案精度を上げる
5. ユーザーに状況報告（正常なら数行＋収益提案）
6. `.claude/last-review` に `date +%s` の値を書き込み、コミット・プッシュ

## 手動のまま残っている工程（自動化不可）
- **noteへの転載**: noteにAPIがない。`note-drafts.md` からユーザーが1日1本コピペ（毎日17時にリマインダー通知の運用）
- dlvr.it / Search Console / KDP の管理画面操作

## 収益化の状態
- note投げ銭: https://note.com/essay28 (`assets/config.js` の support.url)
- Amazonアソシエイト: タグ `tenseitomato2-22` (`assets/config.js` の amazonTag)。**180日以内に3件の販売が必要**
- Kindle本『無理なく』¥399: 出版済み（原稿: `kindle/murinaku.epub`、表紙: `kindle/cover.jpg`）
- AdSense: 未申請（アクセスが育ってから）

## 記事の追加方法（手動で1本すぐ出す場合）
`queue/NNN-slug.json` を作成 → `node scripts/publish-next.js` → コミット・プッシュ。
note用の下書きは `note-drafts.md`、X宣伝文は `x-posts.md` に追記する。

## 注意
- プッシュ先は必ず `claude/blog-project-setup-obd06s`（デフォルトブランチ・Pages配信元）
- 記事URLの変更・削除はしない（共有済みリンクとdlvr.itの重複管理が壊れる）
- コミットメッセージにモデルIDを書かない
