# Security Notice

## API Keys Committed to Git (Mar 2026)

**.env files containing API keys were previously committed to this repository.** If you have cloned this repo, treat all keys in commit history as compromised:

- **CLAUDE_API_KEY** (Anthropic) — [Rotate at console.anthropic.com](https://console.anthropic.com/)
- **NEWS_API_KEY** / **NEXT_PUBLIC_NEWS_API_KEY** — Rotate with your news API provider

### Immediate Actions

1. **Rotate all exposed keys** — Generate new keys and revoke the old ones
2. **Update local .env files** — Copy from `.env.example` and add your new keys
3. **Never commit .env** — `.env` is now in `.gitignore`; ensure it stays untracked

### For Repository Maintainers

To remove .env from git history entirely (optional, use with caution if others have cloned):

```bash
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env Complete-Frontend/.env" --prune-empty HEAD
```

Or use [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) for large repos.
