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
