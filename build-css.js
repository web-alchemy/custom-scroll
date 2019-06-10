const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const csso = require('postcss-csso');

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

const input = path.join(__dirname, 'src', 'custom-scroll.css');
const output = path.join(__dirname, 'dist', 'custom-scroll.css');
const outputMin = path.join(__dirname, 'dist', 'custom-scroll.min.css');

const buildCSS = (css, plugins, options) => {
  return postcss(plugins)
    .process(css, options)
    .then(result => promisify(fs.writeFile)(options.to, result.css))
}

promisify(fs.readFile)(input)
  .then(css => {
    return Promise.all([
      buildCSS(css, [autoprefixer], {
        from: input,
        to: output
      }),
      buildCSS(css, [
        autoprefixer,
        csso({
          restructure: false
        })
      ], {
        from: input,
        to: outputMin
      }),
    ])
  })
  .catch(console.error);