# Acy

Website pages are placed under `src/pages`, whereas components are in `src/components`. The mappings of page and URL are defined in `config/router.config.js`. VSCode's [Code navigation functionality](https://code.visualstudio.com/Docs/editor/editingevolved#:~:text=Go%20to%20Definition%23,a%20symbol%20by%20pressing%20F12.&text=Tip%3A%20You%20can%20jump%20to,with%20Ctrl%2BAlt%2BClick.) will come in handy when trying to locate a specific components.

Please push your commits to "develop" branch.

## Useful commands

### Development

```shell
npm install
npm start 
```



### Deployment

```shell
# local
npm run build
git push

# server
cd acy-dex-interface
sudo git pull
```

