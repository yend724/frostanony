# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Frostanonyは、画像内の顔を自動検出し、匿名化エフェクト（ぼかし・モザイク）をブラウザ内で完全に適用するプライバシー重視のWebアプリケーションです。Next.js 15、TypeScript、TensorFlow.jsを使用してクライアントサイドで顔検出を行います。

## アーキテクチャ

このプロジェクトは**Feature-Sliced Design (FSD)**アーキテクチャに従っています：

- `app/` - Next.js App Routerのセットアップとグローバル設定
- `views/` - ページレベルのコンポーネント（pagesに相当）
- `features/` - ビジネスロジック機能（image-upload, face-detection, image-effects）
- `entities/` - コアビジネスエンティティ（顔検出モデル）
- `shared/` - 再利用可能なユーティリティ、UIコンポーネント、設定

### 主要なアーキテクチャ原則

- **Package by Feature**: 技術レイヤーではなく、ビジネス機能によるコード整理
- **単方向依存**: 上位レイヤーは下位レイヤーにのみ依存可能
- **Barrel Exports**: 各feature/entityはindex.tsファイルを通じてエクスポート
- **テスト駆動開発**: すべてのコア機能に包括的なテストカバレッジ

## 主要技術

- **Next.js 15** App Routerを使用したフロントエンドフレームワーク
- **TypeScript** strict modeでの型安全性
- **TensorFlow.js** MediaPipe Face Detectionによるブラウザベースの機械学習
- **Tailwind CSS** + Tailwind Variantsによるスタイリング
- **Vitest** + Testing Libraryによるユニットテスト
- **Canvas API** 画像処理とエフェクト適用

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 全テスト実行
npm run test

# 特定のテストファイル実行
npm run test [ファイル名]

# ウォッチモード無しでテスト実行
npm run test:run

# 型チェック
npm run type-check

# リント実行
npm run lint

# 本番用ビルド
npm run build
```

## 主要な実装詳細

### 顔検出パイプライン
1. TensorFlow.jsを使用してブラウザ内で画像を完全に処理
2. MediaPipeランタイムでBlazeFaceモデルによる顔検出
3. 検出された顔領域にCanvas APIでぼかし/モザイクエフェクトを適用
4. 外部API呼び出しなし - プライバシーファーストアーキテクチャ

### エフェクトシステム
- **BlurEffect**: 設定可能なぼかし半径でCanvas filter APIを使用
- **MosaicEffect**: 設定可能なブロックサイズでピクセル平均化アルゴリズム
- **強度レベル**: 5段階システム（WEAK=1 から VERY_STRONG=5）
- エフェクトは検出された顔のバウンディングボックスにのみ適用

### 状態管理
- 各機能ドメインごとのカスタムReactフック
- グローバル状態管理ライブラリは不要
- 処理後の自動メモリクリーンアップ

## テスト戦略

- すべてのコアビジネスロジックのユニットテスト
- 信頼性の高いテストのためのTensorFlow.jsとCanvas APIのモック
- 顔検出、画像エフェクト、ファイルアップロードのテストカバレッジ
- 重要な機能をカバーする36以上のテスト

## セキュリティとプライバシー

- **外部データ転送なし**: すべての処理はクライアントサイドで実行
- **メモリ管理**: 処理後の画像データの自動クリーンアップ
- **ファイル検証**: 画像タイプとサイズの厳密な検証
- **HTTPS必須**: 本番デプロイメント用

## 開発時の注意事項

- srcディレクトリからのインポートには`@/`パスエイリアスを使用
- FSDインポートルールに従う：featuresはentitiesとsharedからインポート可能だが、他のfeaturesからは不可
- すべてのCanvas操作でコンテキスト利用可能性の適切なエラーハンドリングが必要
- TensorFlow.jsモデル読み込みは非同期で、使用前に適切に初期化する必要がある