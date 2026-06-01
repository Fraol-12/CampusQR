# Run CampusQR in Cursor — Step by Step

## 1. Install Node.js (one time)

Node.js **22+** is required (built-in SQLite, no C++ build tools).

If not installed:

```powershell
winget install OpenJS.NodeJS.LTS
```

**Restart Cursor** after install so the terminal sees `node` and `npm`.

Verify in Cursor terminal (`Ctrl+`` `):

```powershell
node --version
npm --version
```

## 2. Install recommended extensions

When Cursor opens this folder, click **Install** on the popup for recommended extensions, or:

1. Press `Ctrl+Shift+X` (Extensions)
2. Search `@recommended`
3. Install all workspace recommendations

| Extension           | Purpose                 |
| ------------------- | ----------------------- |
| ESLint              | JavaScript linting      |
| Prettier            | Code formatting         |
| npm IntelliSense    | Package imports         |
| JavaScript Debugger | Run/debug server        |
| Live Server         | Optional static preview |
| Material Icon Theme | File icons              |

## 3. Install dependencies & seed database

**One command setup:**

```powershell
cd "C:\Users\Core X\g14-cursor"
powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
```

Or manually:

```powershell
cd "C:\Users\Core X\g14-cursor"
npm run setup
```

## 4. Start the server

**Option A — Terminal**

```powershell
npm start
```

**Option B — Cursor task (recommended)**

1. `Ctrl+Shift+B` → runs **campus: setup and start** (install + seed + server)
2. Or `Ctrl+Shift+P` → **Tasks: Run Task** → **npm: start server**

**Option C — Debugger**

1. Press `F5`
2. Choose **Start CampusQR Server**

## 5. Open the app

Browser: **http://localhost:3000**

Login: `admin@university.edu` / `admin123`

## Troubleshooting

| Problem                             | Fix                                        |
| ----------------------------------- | ------------------------------------------ |
| `npm` not recognized                | Restart Cursor; reinstall Node.js          |
| Port 3000 in use                    | Change `PORT=3001` in `.env`               |
| Camera not working on scanner pages | Use Chrome/Edge; allow camera on localhost |
| Database empty                      | Run `npm run seed` again                   |

## Daily workflow

```powershell
npm start
```

Then open http://localhost:3000
