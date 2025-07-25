# Frostanony 開発TODO

## 開発ステップ

### ✅ 完了
- [x] 要件定義の詳細化（ヒアリング実施）
- [x] 技術スタックの確認とプロジェクト初期化
- [x] 基本的なUIレイアウト構築（FSD アーキテクチャ採用）
- [x] 画像アップロード機能の実装（ドラッグ&ドロップ対応）
- [x] テスト環境のセットアップ（Vitest + Testing Library）
- [x] **TensorFlow.jsセットアップと顔検出機能の実装**
  - [x] TensorFlow.js + MediaPipe Face Detection インストール
  - [x] 複数人対応顔検出（最大10人）
  - [x] WebGL → CPU フォールバック機能
  - [x] MediaPipe → TensorFlow.js ランタイムフォールバック
  - [x] 画像アップロード時の自動顔検出
  - [x] 検出結果の可視化（赤枠表示・番号付き識別）
- [x] **ぼかしエフェクトの実装**
  - [x] Canvas APIを使用したぼかし処理
  - [x] 強度調整ロジック（5段階）
  - [x] リアルタイム適用
- [x] **モザイクエフェクトの実装**
  - [x] ピクセル化アルゴリズムの実装
  - [x] 強度調整ロジック（5段階）
  - [x] リアルタイム適用
- [x] **エフェクト選択・強度調整UIの実装**
  - [x] ラジオボタンによるエフェクト選択
  - [x] スライダーコンポーネント（5段階）
  - [x] デフォルト値の設定（中程度のぼかし）
- [x] **画像ダウンロード機能の実装**
  - [x] Canvas to DataURL変換
  - [x] ファイル名の自動生成（anonymized-image.png）
  - [x] ワンクリックダウンロード
- [x] **スクロール対応プレビューシステム**
  - [x] 大きな画像での全体確認機能
  - [x] レスポンシブ対応のスクロールエリア

- [x] **適用ボタンと再適用機能の実装**
  - [x] 適用ボタンのイベントハンドリング
  - [x] 処理中のローディング表示
  - [x] エフェクト変更時の自動再適用
  - [x] 完全な再適用機能の実装
- [x] **トースト通知システムの実装**
  - [x] 成功・エラー・警告メッセージの表示
  - [x] 自動消去機能
  - [x] ユーザーによる手動削除
- [x] **TypeScriptエラー・ビルドエラーの修正**
  - [x] TensorFlow.js API型エラーの解決
  - [x] ESLintエラーの修正
  - [x] プロダクションビルドの安定化
- [x] **レスポンシブ対応の改善**
  - [x] 小画面での画像オーバーフロー問題の解決
  - [x] モバイル・タブレット・デスクトップ対応

### 🔄 進行中

- [x] **完全な再適用機能の仕上げ**
  - [x] エフェクト変更時の自動再適用
  - [x] 強度変更時の即座な反映改善（デバウンス機能追加）

### 📋 未着手

#### 追加機能

#### 追加機能
- [ ] **ズーム機能の実装**
  - ピンチズーム対応
  - ズームボタンUI
  - パン機能

- [ ] **エラーハンドリングとフィードバックメッセージの強化**
  - [x] 基本的なトースト通知システム
  - [ ] より詳細なエラーメッセージの実装
  - [ ] ネットワークエラー・メモリ不足等の対応

#### 品質向上
- [ ] **レスポンシブデザインの詳細調整**
  - [x] 基本的なレスポンシブ対応
  - [ ] ブレークポイントの詳細調整
  - [ ] タッチデバイス向けUI改善

- [ ] **パフォーマンス最適化**
  - Web Workersの活用検討
  - 画像サイズの最適化
  - メモリ管理の改善

- [ ] **最終テストとバグ修正**
  - 各機能の動作確認
  - クロスブラウザテスト
  - エッジケースの対応

## 実装優先度

### 高優先度 🔴
1. 技術スタックの確認とプロジェクト初期化
2. 基本的なUIレイアウト構築
3. 画像アップロード機能の実装
4. TensorFlow.jsセットアップと顔検出機能の実装
5. ぼかしエフェクトの実装
6. モザイクエフェクトの実装
7. 最終テストとバグ修正

### 中優先度 🟡
8. エフェクト選択・強度調整UIの実装
9. 適用ボタンと再適用機能の実装
10. 画像ダウンロード機能の実装
11. エラーハンドリングとフィードバックメッセージの実装
12. レスポンシブデザインの調整

### 低優先度 🟢
13. ズーム機能の実装
14. パフォーマンス最適化

## 技術的な注意事項

- コンポーネントは機能単位で分割し、再利用性を高める
- 状態管理はReact hooksを中心に、必要に応じてContext APIを使用
- エフェクトロジックは拡張性を考慮し、ハードコードを避ける
- 画像処理は非同期で実行し、UIのブロッキングを防ぐ
- セキュリティとプライバシーを最優先に、画像データは外部送信しない