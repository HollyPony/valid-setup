# valid-setup

> Pacakge intent to be used on `pre` package.json `scripts`

Check current npm version and current `package.json` modified date and execute `npm install` or `npm rebuild` or changes.

Create a `package.lastSetup` to make the diff. I recommand to put this file in .gitignore

## Use cases

### Ensure install deps if someone else add package

Use on `package.json`

```json
{
  "scripts": {
    "prestart": "npx valid-setup",
    "start": "start dev command"
  }
}
```
