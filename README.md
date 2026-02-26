# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Decap CMS + GitHub Login (Proxy)

L'area riservata è disponibile su `/admin/` e usa Decap CMS.

### 1) Configura il backend GitHub

Apri [public/admin/config.yml](public/admin/config.yml) e sostituisci:

- `repo: YOUR_GITHUB_ORG_OR_USER/YOUR_REPO_NAME`
- `base_url: https://YOUR-DECAP-OAUTH-PROXY-DOMAIN`

Il dominio `base_url` deve essere il tuo proxy OAuth Decap (endpoint con `/auth`).

### 2) Avvio locale con proxy Decap

In due terminali separati:

```bash
npm run dev
npm run decap:proxy
```

Poi apri `http://localhost:5173/admin/`.

### 3) Dati membri modificabili

Decap modifica il file [public/dev/data/members.json](public/dev/data/members.json), letto dalle pagine reparto con mapping:

- `dept: elettrica` + `unit: high_voltage` → High Voltage
- `dept: elettrica` + `unit: low_voltage` → Low Voltage
- `dept: meccanica` + `unit: vehicle_dynamics` → Vehicle Dynamics
- `dept: meccanica` + `unit: mechanical_design` → Mechanical Design
- `dept: meccanica` + `unit: aerodynamics` → Aerodynamics
- `dept: management` → Management

Le card con `special: true` vengono renderizzate come card capo reparto (grande).

## Publish su GitHub Pages

Il progetto include workflow automatico in [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml).

1. Crea un repository GitHub e collega il remote locale.
2. Fai push sul branch `main`.
3. In GitHub vai su **Settings → Pages** e imposta **Build and deployment = GitHub Actions**.
4. Attendi il completamento del workflow **Deploy to GitHub Pages**.

Comandi tipici:

```bash
git init
git add .
git commit -m "Initial publish setup"
git branch -M main
git remote add origin https://github.com/<OWNER>/<REPO>.git
git push -u origin main
```
