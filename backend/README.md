如何在 Windows 下为你的后端项目创建和使用虚拟环境
进入后端目录
cd E:\InstantTranslation\backend
创建虚拟环境（如 venv）
C:\Python313\python.exe -m venv venv
激活虚拟环境
.\venv\Scripts\activate
激活后命令行前面会出现 (venv)，表示你已在虚拟环境中。
在虚拟环境中安装依赖
pip install -r requirements.txt
启动服务（虚拟环境激活状态下）
uvicorn app.main:app --reload
重要说明
每次开发前都要先激活虚拟环境（即执行 .\venv\Scripts\activate）。
依赖只会装到 backend/venv/Lib/site-packages，不会影响全局 Python。
如果用 VSCode，建议选择虚拟环境的 Python 解释器（backend/venv/Scripts/python.exe）。

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/4ecdefce-e679-4f52-95f8-34e52426df93

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4ecdefce-e679-4f52-95f8-34e52426df93) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/4ecdefce-e679-4f52-95f8-34e52426df93) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
