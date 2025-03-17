# DOS.Zone Game Studio v7

**THIS IS LEGACY VERSION, NOW STUDIO IS A PART OF JS-DOS**

Game Studio is a tool for creation \`js-dos bundles\`. You can think about bundle like a single archive that contains everything to run DOS program ([read more](https://js-dos.com/v7/build/docs/#js-dos-bundle--doszone)).

## Development

```
yarn start
```

## Web deployment

```
cd build && PUBLIC_URL=/studio NODE_ENV=production yarn build && aws s3 --endpoint-url=https://storage.yandexcloud.net sync . s3://dos.zone/studio --delete --acl public-read && cd ..
```
