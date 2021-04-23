process.env.BABEL_ENV = "development"
process.env.NODE_ENV = "development"

const webpack = require("webpack")

const webpackConfigFactory = require("../config/webpack/webpack.config")
const webpackConfig = webpackConfigFactory("development")
const compiler = webpack(webpackConfig)

compiler.watch({}, (err, stats) => {})
