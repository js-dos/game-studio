# DOS.Zone Game Studio

Game Studio is a tool for creation \`js-dos bundles\`. You can think about bundle like a single archive that contains everything to run DOS program ([read more](https://js-dos.com/v7/build/docs/#js-dos-bundle--doszone)).

## Development

```
yarn start
```

## Web deployment

```
cd build
PUBLIC_URL=/studio yarn build && aws s3 sync . s3://dos.zone/studio --delete
```
