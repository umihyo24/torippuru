# torippuru

## 起動方法

`index.html` を `file://` で直接開くと、ブラウザのセキュリティ制約でモジュールやアセット読み込みに失敗する場合があります。
必ずローカルサーバー経由で起動してください。

### 例: Python で起動

```bash
python -m http.server 8000
```

その後、ブラウザで以下にアクセス:

- http://localhost:8000/

## 開発バンドル生成（任意）

`game.bundle.js` が必要な場合は、以下を実行します。

```bash
node tools/build-dev-bundle.js
```

現在の `index.html` は以下の順で起動を試行します。

1. `src/main.js`（ES Modules）
2. `game.bundle.js`（フォールバック）
