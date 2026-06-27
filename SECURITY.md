# Security Policy

Kàá is a client-side calculator and learning app. The web app is a static
Next.js build with no backend, no accounts, and no user data collection; the
iOS app works fully offline. There is no server-side attack surface beyond
standard static-hosting/CDN concerns on Vercel.

If you find a security issue (e.g. a dependency vulnerability, an XSS in
the web build, or a PWA/service-worker caching bug with security
implications), please open a GitHub issue describing it. For anything you'd
rather not post publicly first, mention that in the issue and a maintainer
will follow up privately.
