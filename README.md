# tProof.io dApp

> **⚠️ ARCHIVED**
>
> This repository is archived and read-only. **tproof.io is no longer associated with it.**
> The dApp is preserved on Arweave:
> https://gateway.irys.xyz/BW_BztlNLblqValcwGMqjUUdAgBDBb9PlU--q_SUy90

This repo contains the code for the frontend dApp to access Pythia results.

## Project creation

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Project Docs

Project documentation can be accessed on [Gitbook docs](https://docs.tproof.io)



Arweva image for ISB - https://arweave.net/lgtigI7EygXCpldVaU2SaQrGZS00Gbl0DDrXes3Jlno

## Archived public deployment

**tproof.io is no longer associated with this repository or with the deployment below.**

This project is kept as a public archive. A permanent snapshot of the dApp is stored on Arweave and is accessible to anyone:

- App: https://gateway.irys.xyz/BW_BztlNLblqValcwGMqjUUdAgBDBb9PlU--q_SUy90
- Manifest ID: `BW_BztlNLblqValcwGMqjUUdAgBDBb9PlU--q_SUy90`

The snapshot is provided as-is for archival purposes. No support, maintenance, or affiliation with the original tproof.io team or domain should be inferred.

Proofs are read directly on-chain from the Polygon contracts through the connected wallet. No tproof.io backend (Lambda/Alchemy proxy) is required to browse proofs; the legacy endpoint was replaced in the bundled build.

## Deploying this snapshot

The static build is uploaded to Arweave with the Irys SDK. Payment can be made in AR (`-t arweave`) or directly on Base in native ETH (`-t base-eth`):

```bash
npm install -g @irys/sdk
irys upload-dir build/ -w ./wallet.json --index-file index.html -t arweave
```

`wallet.json` holds the Arweave private key and is gitignored: never commit or share it.
