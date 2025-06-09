# Frostanony - 顔画像自動匿名化ツール

プライバシーを守る顔画像自動匿名化アプリケーション

## 概要

Frostanonyは、画像内の顔を自動検出し、ぼかしやモザイクエフェクトを適用することで個人のプライバシーを保護するWebアプリケーションです。すべての処理はブラウザ内で完結し、画像データが外部に送信されることはありません。

## 主な機能

- 🔍 **自動顔検出**: TensorFlow.jsを使用した高精度な顔検出
- 🌫️ **ぼかしエフェクト**: 自然な見た目のぼかし処理
- 🧩 **モザイクエフェクト**: ピクセル化による匿名化
- ⚙️ **強度調整**: 5段階のエフェクト強度調整
- 📱 **レスポンシブ対応**: モバイル・タブレット・デスクトップ対応
- 🔒 **プライバシー保護**: ブラウザ内完結、外部送信なし
- 💾 **簡単ダウンロード**: 処理済み画像のワンクリックダウンロード

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS + Tailwind Variants
- **機械学習**: TensorFlow.js + MediaPipe Face Detection
- **テスト**: Vitest + Testing Library
- **開発**: ESLint + Prettier

## 対応形式

- **入力形式**: JPEG, PNG, WebP
- **最大ファイルサイズ**: 10MB
- **出力形式**: 元の画像形式を維持

## 開発環境のセットアップ

### 前提条件

- Node.js 18以上
- npm または pnpm

### インストール

```bash
# リポジトリをクローン
git clone [repository-url]
cd frostanony

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

### 利用可能なコマンド

```bash
# 開発サーバー起動
npm run dev

# 本番用ビルド
npm run build

# 本番サーバー起動
npm start

# テスト実行
npm run test

# テストUI起動
npm run test:ui

# 型チェック
npm run type-check

# リント実行
npm run lint
```

## 使い方

1. **画像をアップロード**
   - ドラッグ&ドロップまたはファイル選択で画像をアップロード

2. **エフェクトを選択**
   - ぼかし または モザイク を選択
   - スライダーで強度を調整（5段階）

3. **適用ボタンをクリック**
   - 自動的に顔を検出してエフェクトを適用

4. **ダウンロード**
   - 処理済み画像をダウンロード

## セキュリティとプライバシー

- ✅ すべての処理はブラウザ内で実行
- ✅ 画像データの外部送信なし
- ✅ 処理後の自動メモリクリア
- ✅ HTTPS環境での動作推奨

## ブラウザ対応

- Chrome 90以上
- Firefox 88以上
- Safari 14以上
- Edge 90以上

## 開発ガイド

### プロジェクト構造

```
src/
├── app/                 # Next.js App Router
├── views/               # ページレベルのコンポーネント
├── features/            # ビジネス機能の実装
├── entities/            # ビジネスエンティティ
├── shared/              # 共通のユーティリティとコンポーネント
└── docs/                # ドキュメント
```

### テスト

```bash
# 全テスト実行
npm run test

# 特定のテストファイル実行
npm run test [ファイル名]

# テスト結果をまとめて実行
npm run test:run
```

### コーディング規約

- TypeScript strict mode
- ESLint + Prettier による自動フォーマット
- 関数型プログラミングスタイル
- テスト駆動開発（TDD）

## ライセンス

MIT License

## 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## サポート

バグ報告や機能要求は、[Issues](issues)でお知らせください。