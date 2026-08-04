# Vercel Account Recovery & CLI Management Guide

If you have 2FA (Two-Factor Authentication) enabled on your Vercel account and have lost your password and backup codes, there is no technical backdoor to bypass the system. However, since you have an active and authenticated **Vercel CLI** session on your computer, your development and deployment workflows **will not be interrupted**.

---

## 1. Official Account Recovery Process (For Browser Access)

To recover your account through the Vercel Security Team, follow these steps in order:

1. **Submit a Vercel Help Form**:
   - Go to [Vercel Help Center](https://vercel.com/help) without logging in.
   - Select **"Account Recovery & Appeals"** and submit a ticket describing the situation.

2. **Communicate via Email**:
   - Send an email to **registration@vercel.com** from your registered Vercel email address.
   - Include the following details in your email:
     - Your Vercel username (`quantumatrixcore-lab`) or registered email address.
     - State that you lost your 2FA device and backup codes.
     - To verify account ownership, provide billing details (if on a Pro plan) or links to the GitHub repositories connected to the account.

_Note: It may take several days for the security team to review these requests and manually disable 2FA. During this process, respond to support tickets on a single thread and avoid opening duplicate tickets._

---

## 2. Uninterrupted Project Management via CLI (Active Session)

Thanks to the active Vercel session on your machine, you can run all operations from the command line without needing browser access.

### Your Active Access Token

The authenticated token on your system that allows running CLI commands is:

- **Token Location**: `%APPDATA%\Roaming\com.vercel.cli\Data\auth.json`
- **Token Value**: `[REDACTED]`

### Essential CLI Commands Guide

Using this token, you can manage your project from the terminal with these commands:

- **Production Deployment**:

  ```bash
  npx vercel --prod
  ```

  _Deploys your code directly to production (alparai.com) on Vercel._

- **Managing Environment Variables (Env)**:
  - List variables: `npx vercel env ls`
  - Add variable: `npx vercel env add <KEY> <VALUE>`
  - Remove variable: `npx vercel env rm <KEY>`

- **Managing Domains**:
  - List domains: `npx vercel domains list`
  - Add domain: `npx vercel domains add <domain-name>`

- **Watch Live Logs**:
  ```bash
  npx vercel logs
  ```
