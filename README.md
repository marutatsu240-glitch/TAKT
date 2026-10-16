# TAKT

食品工場の生産技術を、毎日5問ずつ解くオフライン対応のWebアプリ。

- `index.html` アプリ本体（記録はブラウザの localStorage `takt.records.v1` に保存）
- `sw.js` オフライン用のキャッシュ（問題は通信できるときに最新を取得、できないときは保存済みを使う）
- `data/pack.json` 問題集。`days[].questions[]` に `category, prompt, options(4), answer(0始まり), explanation, detail, deep, keyPoints`

## 問題を追加・修正するときのルール

- 記録は「Day番号＋問題の順番」で紐づくので、既存の日の問題の順番は入れ替えない
- 問題を取り消すときは削除せず、その日を `"removed": true` にするか、末尾の問題として扱いを決める
- 新しい日は `days` の末尾に追加し、`updated` を更新する
- アプリ本体を変えたときは `sw.js` の `SHELL` のバージョンを上げる

## Claudeとの会話（data/notes.json）

アプリの「Claudeで聞く」から質問されたら、回答のあとで `data/notes.json` の `notes` 配列の末尾に次の形で追記して main に push する。

```json
{"day": 4, "i": 0, "question": "質問文", "answer": "回答（見出しは■、マークダウン記号なし）", "at": "2026-10-16T12:00:00+09:00"}
```

- `day` はDay番号、`i` は問題の番号（0始まり。Q1なら0）
- 既存の項目は消さない・書き換えない。末尾に足すだけ
- 公開リポジトリなので、個人的な内容は書かない
