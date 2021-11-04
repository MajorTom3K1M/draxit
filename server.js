const express = require('express');
const http = require('http');
const path = require('path');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const routes = require('./server/index');
const connectToMongoDB = require('./server/libs/db')
const connectToSocket = require('./server/libs/socket')

const historyApiFallback = require('connect-history-api-fallback');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const app = express();
const server = http.createServer(app);

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// middleware settings
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({
    extended: true
}));

// connectToDatabase
connectToMongoDB();

// connectToSocket
connectToSocket(server);

// setup the routes
app.use(routes);

// setup env
app.set('port', process.env.PORT || 3000);
app.set('env', process.env.NODE_ENV);


const compiler = webpack(webpackConfig);

app.use(historyApiFallback({ verbose: false }));

if(app.get('env') === 'development' || app.get('env') === 'dev') {
    app.use(
        webpackDevMiddleware(compiler, {
            publicPath: webpackConfig.output.publicPath,
            // contentBase: path.resolve(__dirname, "client/public"),
            stats: {
              colors: true,
              hash: false,
              timings: true,
              chunks: false,
              chunkModules: false,
              modules: false,
            },
        })
    )

    app.use(webpackHotMiddleware(compiler, {
        // log: true,
        path: "/__webpack_hmr",
        heartbeat: 2000
    }));
    app.use(express.static(path.resolve(__dirname, "./dist")));
} else {
    app.use(express.static(path.resolve(__dirname, './dist')));
    app.get('*', function (req, res) {
        res.sendFile(path.resolve(__dirname, './dist/index.html'));
        res.end();
    });
}

server.listen(app.get('port'), () => {
    console.log(`listen to port ${app.get("port")}`);
});

module.exports = server;