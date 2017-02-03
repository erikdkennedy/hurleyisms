var uglifyJs = require('uglify-js')
var sass = require('node-sass')
var fs = require('fs');
function minJSFiles (files, target) {
  var beautify = process.env.NODE_ENV === 'development'
  try {
    var uglified = uglifyJs.minify(files, { compress: false, mangle: false, output: { beautify: beautify } })

    fs.writeFile(target, uglified.code, function (err) {
      if (err) {
        console.log('error found')
        console.log(err)
      } else {
        console.log('Script generated and saved:', target)
      }
    })
  } catch (error) {
    console.log(error)
  }
}
function writeJSFiles () {
  // combine JS for SPA
  var appClientFiles = [
    'public/javascripts/auth.js',
    'public/javascripts/shared.js',
    'public/javascripts/app.js'

  ]
  minJSFiles(appClientFiles, 'public/javascripts/hurleyisms.min.js')

  var proClientFiles = [
    'public/javascripts/config.min.js',
    'public/javascripts/auth.js',
    'public/javascripts/shared.js',
    'public/javascripts/stripe.js',
    'public/javascripts/pro.js'
  ]
  minJSFiles(proClientFiles, 'public/javascripts/pro.min.js')

  var indexClientFiles = [
    'public/javascripts/auth.js',
    'public/javascripts/shared.js',
    'public/javascripts/marketing.js'
  ]
  minJSFiles(indexClientFiles, 'public/javascripts/index.min.js')

  var myAccountClientFiles = [
    'public/javascripts/config.min.js',
    'public/javascripts/auth.js',
    'public/javascripts/shared.js',
    'public/javascripts/stripe.js',
    'public/javascripts/my-account.js'
  ]
  minJSFiles(myAccountClientFiles, 'public/javascripts/myaccount.min.js')
}
// Create Configuration Javascript
var configJsonString = require('../routes/configuration').getConfig()
fs.writeFile('public/javascripts/config.min.js', configJsonString, function (err) {
  if (err) {
    console.log(err)
  }
  writeJSFiles()
})

sass.render({
  file: 'public/stylesheets/styles.scss'
}, function (error, result) { // node-style callback from v3.0.0 onwards
  if (!error) {
    // No errors during the compilation, write this result on the disk
    fs.writeFile('public/stylesheets/styles.css', result.css, function (err) {
      if (!err) {
        console.log('styles.css written on disk')
      }else {
        console.error(err)
      }
    })
  }else {
    console.error(error)
  }
})
