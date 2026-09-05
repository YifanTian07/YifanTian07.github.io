# Browser regression checks

Serve the repository root with `python -m http.server 4174`, then run:

```sh
node tests/startup-qa.cjs
```

The test requires Playwright and an installed Chromium browser. It does not add
dependencies to the static website. Set `PLAYWRIGHT_MODULE` to an existing
Playwright module path and `CHROME_PATH` to a Chrome executable when using a shared
tooling installation. `SITE_URL` can target a deployed copy instead of localhost.
Screenshots are written to the ignored `tmp/` directory.

The startup regression holds the actual 3D entry-script response to check the
first painted state, then releases it and exercises the real WebGL homepage.
It also covers failed downloads, unavailable WebGL, the bounded startup timeout,
late responses, JavaScript-disabled reading, and direct section links.
