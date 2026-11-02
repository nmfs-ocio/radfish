---
sidebar_position: 8
---

# FAQ

## Why am I getting a `401 Unauthorized` error when installing packages? {#token-expired}

If `npm install` or `npx @nmfs-ocio/create-radfish-app` fails with an error like this:

```text
npm error code E401
npm error 401 Unauthorized - GET https://npm.pkg.github.com/@nmfs-ocio%2fradfish - unauthenticated: User cannot be authenticated with the token provided.
```

your GitHub personal access token (PAT) has most likely expired (or was revoked or mistyped). PATs expire after the period you choose when creating them (for example, 90 days; your organization may set a maximum), and npm can't download `@nmfs-ocio` packages from GitHub Packages without a valid one.

To fix it:

1. Create a new token by following the steps in [Getting Started](./getting-started.mdx#prerequisites). You can also click your expired token's name under **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**, then click **Regenerate token**. Either way, authorize the new token for `nmfs-ocio` afterwards: click **Configure SSO** next to it, then **Authorize** next to **nmfs-ocio**.
2. Update your `.npmrc` with the new token:

   ```bash
   npm config set //npm.pkg.github.com/:_authToken YOUR_NEW_PERSONAL_ACCESS_TOKEN
   ```

   If your project has its own `.npmrc` with a token in it, update the token there too, since it takes priority over your user `.npmrc`.

3. Verify it works:

   ```bash
   npm view @nmfs-ocio/radfish --registry https://npm.pkg.github.com
   ```

## How often do I need to update my token? {#token-rotation}

Whenever it expires. GitHub shows the expiration date next to each token on the **Tokens (classic)** page and emails you a reminder before it expires. Set a calendar reminder for the expiration date so your installs don't break unexpectedly.
