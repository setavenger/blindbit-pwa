# BlindBit PWA wallet

I forked this from [Silentium](github.com/louisinger/silentium) and made it nostr wallet connect (NWC) compatible with [BlindBit Scan](github.com/setavenger/blindbit-scan). I forked this to give users another option next to [BlindBit Spend](github.com/setavenger/blindbit-spend) which is a heavier react native. Now that the scanning server implements NWC and there are no heavy computations happening on the mobile client a PWA is no problem anymore. 

Some of the modifications I made:
- Added a BlindBit adapted NWC connection to a BlindBit Scan instance (change in settings -> explore, might move that to network)
- Removed all scanning - this mobile client only receives updates from BlindBit Scan
- Removed standard taproot receiving to prevent mixing of funds (avoid privacy footguns for users)

Massiv cudos to Louis Singer, it took very little time to make the necessary adaptations to his [prototype](https://github.com/louisinger/silentium) I forked from.

> **This is an experimental project acting as a proof of concept for Silent Payments light wallets. Use at your own risk.**

A known bug: This wallet does not use label m=0 for change, it just sends to the base address.

<p align="center">
    <a href="https://app.silentium.dev">app.silentium.dev</a>
</p>
<p align="center">
    <img src="./screenshots/balance.jpeg" width="250px" >
    <img src="./screenshots/receive.jpeg" width="250px" >
    <img src="./screenshots/send.jpeg" width="250px" >
</p>

## Design

- Mobile first Progressive Web App
- Self-custodial (no server owns your keys)
- Privacy focused (no tracking, no analytics, silentiumd can't track your utxos or transactions). Use compact block filter (BIP158) to fetch utxos and transactions.

## Development

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

In the project directory, begin by intializing the local dependencies:

### `yarn install`

You can then run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Acknowledgements

- [Silentiumd](https://github.com/louisinger/silentiumd) 
- Silent payments [BIP352](https://github.com/bitcoin/bips/pull/1458)
- Compact block filter for light clients [BIP158](https://bips.dev/158)
- [Helm wallet](https://github.com/bordalix/helm-wallet) by [bordalix](https://github.com/bordalix)

## Buy me a coffee

`sp1qqwgst7mthsl46hkcek6ets58rfunr4qaxpchuegs09m6uy3tm4xysqmdf6xr9rh68stzzhshjt6z7288tc7eqts65ls4sg2dg6aexlx595f5wa7u`

## License

<p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/"><a property="dct:title" rel="cc:attributionURL" href="https://github.com/louisinger/silentium">silentium</a> by <a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="https://github.com/louisinger">Louis Singer</a> is licensed under <a href="https://creativecommons.org/licenses/by/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">Creative Commons Attribution 4.0 International<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1" alt=""><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1" alt=""></a></p>
