# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
# fuel-wise-client

## FuelWise

FuelWise is a smart, fuel-efficient routing and money-saving application. This package is the React + TypeScript + Vite frontend, which talks to a JDK 21 backend for authentication, station lookup, and route advice.

## Security / Dependency Audit

Run `npm audit` before releases to check for known vulnerable dependencies.

**Status as of 2026-08-03:** `npm audit` reports one high-severity advisory:

- [`GHSA-qwww-vcr4-c8h2`](https://github.com/advisories/GHSA-qwww-vcr4-c8h2) — React Router "RSC Mode CSRF Bypass Allows Action Execution Before 400 Response", affecting `react-router` `>=7.12.0 <8.3.0`.

This advisory only applies to React Router's data-router / RSC ("framework mode") APIs (`createBrowserRouter`, route `loader`/`action`, React Server Components). This app uses only the declarative APIs (`BrowserRouter`, `Routes`, `Route`, `Link`, `useNavigate`) — no data router, no loaders/actions, no RSC — so the vulnerable code path is not reachable here.

No fix is currently published for `react-router-dom` (the fix requires `react-router@8.3.0+`, which has not been released for the `-dom` package). **Do not** run `npm audit fix --force` for this advisory — it downgrades `react-router-dom` to `7.11.0`, which reintroduces several other, previously-patched high-severity advisories (XSS via open redirects, SSR XSS in `ScrollRestoration`, deserialization RCE, DoS, etc.). Staying on the latest `7.x` (`^7.18.2`) is the safer choice until an upstream fix ships.

All other dependencies are currently clean (`npm audit` reports 0 vulnerabilities outside the item above).
