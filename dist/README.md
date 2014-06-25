# BitAuth Browser Bundle

To build a browser compatible version of BitAuth, run the following command from
the project's root directory:

```
npm run make-dist
```

This will output `bitauth.browser.js` to this directory. The script introduces a
global variable at `window.bitauth`.
