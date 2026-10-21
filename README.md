# t3tr1s

Open `index.html` to play. The game runs without a bundler or package dependencies.

## Tests

Use Node.js 24 or later:

```sh
npm test
mkdir -p .artifacts
npm run test:coverage
```

The engine tests use fixed random sources and isolated games. The UI tests use fresh
DOM, audio and animation-frame fakes; they exercise keyboard controls, pause, restart,
game over, timer rendering, sound and rejected audio playback without waiting for real
time or accessing the network. These are deterministic behavior tests, not browser
rendering or device compatibility tests.

CI checks syntax, runs all tests, enforces 99% line / 98% branch / 100% function
coverage across `engine.js` and `script.js`, and retains LCOV and text reports.
CodeQL and weekly GitHub Actions Dependabot updates are configured in `.github`.
