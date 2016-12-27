# yayata

![yayata](https://cdn.rawgit.com/kalmanolah/yayata/master/src/assets/img/logo_text.svg)

Yet Another Timesheet Application... Yet Again. This is a frontend for
[ninetofiver](https://github.com/kalmanolah/925r).

## Configuration

First, you'll need to create an OAuth2 client for the frontend to use. You
can do this by visiting `${baseUrl}/oauth/v2/applications/register/`. Example
URL: [http://localhost:8000/oauth/v2/applications/register/](http://localhost:8000/oauth/v2/applications/register/).

You will need to configure your server base URL and OAuth2 client credentials
before you can use this frontend. You can do this by copying the example
configuration file and editing it:

```bash
cp src/static/cfg/config.json.dist src/static/cfg/config.json
```

## Build Setup

```bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

For detailed explanation on how things work, consult the
[docs for vue-loader](http://vuejs.github.io/vue-loader).
