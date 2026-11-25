# Verifiable Voting Demo

A beginner-friendly static website based on the supplied screenshot. It includes:
- Voter page with demo IDs `VOTER001` to `VOTER005`
- One vote per demo ID (in the current browser)
- Receipt code generation and receipt lookup
- Officials dashboard with candidate totals
- Auditor dashboard with a public-style ledger
- SHA-256 record hashes when the browser supports Web Crypto

## Run locally

You can open `index.html` directly, or use the VS Code **Live Server** extension.

## Deploy to Vercel

### Option 1: Deploy from GitHub
1. Create a GitHub repository.
2. Upload all files in this folder (`index.html`, `style.css`, `app.js`, `vercel.json`, and `README.md`).
3. Sign in to [Vercel](https://vercel.com/) and choose **Add New → Project**.
4. Import your GitHub repository.
5. Keep the framework preset as **Other**.
6. Leave Build Command and Output Directory empty (or use `.` as the output directory if prompted).
7. Click **Deploy**. Vercel will provide a public URL.

### Option 2: Deploy with Vercel CLI
Install Node.js, then run:
```bash
npm install -g vercel
vercel
```
Follow the prompts. For a production deployment, run:
```bash
vercel --prod
```

## Important limitations

This is a front-end educational demo, not a production election system. Votes are stored in the browser's `localStorage`, so they are not shared between devices or browsers and can be cleared or changed by the user. The voter ID list is hard-coded for demonstration. The receipt hash demonstrates hashing but does not provide a decentralized blockchain, secure identity verification, end-to-end verifiability, or protection against a compromised device.

For a real election, add a trusted backend, secure voter authentication, append-only replicated ledger or audited blockchain, cryptographic ballot secrecy, independent security review, accessibility testing, and legally compliant election procedures. Do not use this demo to conduct a real election.
