# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

This repo is an early-stage, incomplete scaffold for **SportStyle**, a React + Firebase e-commerce catalog (Spanish UI text). It is **not currently runnable**:

- There is no `package.json` (and no lockfile) anywhere in the repo, so there are no declared dependencies and no `npm`/`yarn` scripts to build, lint, or test with. Before writing code that assumes a working dev/build/test pipeline, check whether `package.json` has been added — if not, that's a prerequisite, not something to silently work around.
- `main.jsx` is an empty file.
- All source files live flat in the repo root — there is no `src/` directory — but several files `import` from paths that imply a `src/`-style folder structure that doesn't exist (see "Known inconsistencies" below).

Because of this, do not assume standard Create React App commands (`npm start`, `npm test`, `npm run build`) work out of the box. If asked to make the project runnable, you'll need to scaffold `package.json` (dependencies at minimum: `react`, `react-dom`, `react-router-dom`, `firebase`, plus CRA or Vite tooling and `@testing-library/*` for `App.test.js`/`setupTests.js`) and decide on a real folder layout before other fixes will matter.

## Architecture (intended)

The app is a small product catalog with two competing implementations of the same idea, both present in the repo simultaneously:

1. **`App.js`** — routes `/` to `ItemListContainer` and `/product/:id` to `ItemDetailContainer`. This pairs with the "container/presentational" component set: `ItemListContainer.js` → `ItemList.js` → `Item.js`, and `ItemDetailContainer.js` → `ItemDetail.js` → `ItemCount.js`. Containers fetch data from Firestore (via `Firebaseconfig.js`) in `useEffect` and pass it down as props; presentational components just render.
2. **`App.jsx`** — routes `/`, `/category/:category`, `/product/:id` to `Home.jsx`, `Category.jsx`, `ProductDetail.jsx`, and renders `NavBar.jsx` (SportStyle branding, category links, cart icon) on every route. `Home`, `Category`, and `ProductDetail` are currently placeholder components with no data fetching.

Only one of `App.js` / `App.jsx` should exist long-term — `index.js` imports `App` from `./App` (i.e. `App.js`). If continuing the `App.jsx`/`NavBar`/`Home`/`Category`/`ProductDetail` direction, either rename it to `App.js` or update `index.js`'s import, and decide whether the container/Firestore-fetching components from the first implementation should be wired into the new routes (e.g. `ItemListContainer` rendered inside `Home`, filtered by category inside `Category`).

Data model: products are read from a Firestore `products` collection, each doc having at least `name`, `description`, `price`, `stock`.

## Known inconsistencies to be aware of

These are bugs/typos in the current files, not intentional conventions — fix them as part of any related work rather than copying the pattern elsewhere:

- `App.js` imports from `'./ItemListContaineromponents/'` and `'./ItemDetailContaineromponents'` — these paths don't exist (the actual files are `ItemListContainer.js` / `ItemDetailContainer.js` at repo root).
- `App.jsx` imports from `'../Components/NavBar'`, `'../pages/Home'`, `'../pages/Category'`, `'../pages/ProductDetail'` — implies a `Components/`/`pages/` structure that doesn't exist; the actual files are at repo root.
- `ItemListContainer.js` imports `{ collection, getDocs } from 'Firebase/Firestore'` — wrong casing/module path; should be `'firebase/firestore'` (see `Firebaseconfig.js` and `ItemDetailContainer.js` for the correct import).
- `Firebaseconfig.js` contains placeholder credentials (`"TU_API_KEY"`, etc.) — Firestore calls will fail until real project config is supplied, ideally via environment variables rather than hardcoded values.
- `NavBar.jsx` imports `'./NavBar.css'`, which does not exist in the repo.
- `App.test.js` / `setupTests.js` are unmodified Create React App boilerplate (the test asserts a "learn react" link that no component in this app renders) and reference `@testing-library/react` / `@testing-library/jest-dom`, which aren't declared anywhere since there's no `package.json`.

## Conventions observed

- Components are function components using hooks (`useState`, `useEffect`, `useParams`), no class components.
- User-facing text is in Spanish (e.g. "Catálogo Principal de Productos", "Añadir al Carrito").
- `.jsx` extension is used for route-level/page/layout components (`App.jsx`, `Home.jsx`, `Category.jsx`, `NavBar.jsx`, `ProductDetail.jsx`); `.js` extension is used for the older container/item component set (`ItemList.js`, `Item.js`, `ItemCount.js`, `ItemDetail.js`, `ItemDetailContainer.js`, `ItemListContainer.js`). Match the existing extension convention for the file you're editing rather than mixing them.
