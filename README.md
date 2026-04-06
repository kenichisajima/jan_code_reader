# JAN Code Reader (React + Vite)

スマートフォンのカメラを利用してJAN（EAN-13）コード等のバーコードを読み取り、画面に表示するSingle Page Application (SPA) です。

## ✨ 特徴
- **リアルタイム読み取り**: 高性能な `@zxing/library` を用い、Webカメラからバーコードを連続スキャンします。
- **レスポンシブ・モダンUI**: Glassmorphismを取り入れた見栄えの良い洗練されたデザイン。PCでもスマートフォンでも綺麗に表示されます。
- **マルチデバイス対応**: デバイスに複数のカメラがある場合（前面/背面など）、切り替えボタンで簡単にカメラをスイッチできます。
- **Docker開発環境**: `docker-compose` コマンドひとつで、ホストマシンを汚すことなくViteの開発サーバーを立ち上げられます。
- **GitHub Pages自動デプロイ**: `main` ブランチにプッシュするだけで、GitHub Actionsがビルドから静的ホスティングまでを自動で行います。

## 🚀 ローカルでの動作確認方法 (PC向け)

### Dockerを使用する場合（推奨）
PCのローカル環境を汚さずに開発・確認が可能です。

1. ターミナルで本ディレクトリを開きます。
2. 以下のコマンドを実行して、Dockerコンテナを立ち上げます。
   ```bash
   docker-compose up --build
   ```
3. 起動完了後、ブラウザで **[http://localhost:5173](http://localhost:5173)** にアクセスしてください。
   （※PCにWebカメラが付いている場合は、本のようなバーコード付きの商品をかざすことでスキャンテストが可能です）
4. 終了時はターミナルで `Ctrl + C` を押下するか、別のターミナルから `docker-compose down` を実行します。

### ローカルのNode.js環境を使用する場合
1. パッケージをインストールします。
   ```bash
   npm install
   ```
2. 開発サーバーを起動します。
   ```bash
   npm run dev
   ```
3. ブラウザで **[http://localhost:5173](http://localhost:5173)** にアクセスします。

## 📱 スマートフォンでの動作確認方法 (実機テスト)

スマートフォンのブラウザでカメラを起動するには、セキュリティの制約により **HTTPS（暗号化通信）** もしくは `localhost` でのアクセスが必須となります。
（※PCのIPアドレス経由でスマホからアクセスしても、カメラ権限のエラーとなり利用できません。）

そのため、スマートフォンでカメラ読み取りを試す場合は **GitHub Pages にデプロイして確認する** 構成が最も確実で簡単です。

### デプロイ手順
1. 本プロジェクトをGitHubリポジトリにプッシュします。
   ```bash
   git add .
   git commit -m "Update source code"
   git push origin main
   ```
2. GitHub Actionsのワークフローが裏側で自動的に動作し、アプリをビルドしてデプロイします（1〜2分かかります）。
3. デプロイ完了後、ご自身のスマートフォンでGitHub Pagesの公開URL（例: `https://kenichisajima.github.io/jan_code_reader/`）へアクセスしてください。
4. カメラのアクセス権限を許可すると、映像が映りスキャンが可能になります。

## 🛠️ 技術スタック
- **Frontend**: React 18, Vite, Vanilla CSS
- **Barcode Scanner**: @zxing/browser, @zxing/library
- **Deployment**: GitHub Actions, GitHub Pages
- **Environment**: Docker, Docker Compose
