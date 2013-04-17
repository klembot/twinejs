// This builds single HTML, JS, and CSS files for Twine
// in the dist/ directory. Overall, this leaves much to be desired,
// but it works.

var requirejs = require('requirejs');
var fs = require('fs');
var wrench = require('wrench');

// http://stackoverflow.com/a/12761924

deleteFolderRecursive = function(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

var JS_PLACEHOLDER = '<script data-main="js/app" src="js/lib/require.js"></script>';
var CSS_PLACEHOLDER = '<link href="css/app.css" rel="stylesheet" media="screen">';

deleteFolderRecursive('dist');
wrench.mkdirSyncRecursive('dist/resources');

console.log('Optimizing JavaScript...');
requirejs.optimize(
{
	baseUrl: '../js',
	mainConfigFile: '../js/app.js',
	include: ['../build/almond'],
	insertRequire: ['app'],
	name: 'app',
	out: 'dist/resources/twine.js'
});

console.log('Optimizing CSS...');
requirejs.optimize(
{
	cssIn: '../css/app.css',
	out: 'dist/resources/twine.css'
});

// copy over HTML file and adjust links

console.log('Writing HTML...');

var html = fs.readFileSync('../index.html', 'utf8');
html = html.replace(JS_PLACEHOLDER, '<script src="resources/twine.js"></script>');
html = html.replace(CSS_PLACEHOLDER, '<link rel="stylesheet" href="resources/twine.css">');
fs.writeFileSync('dist/index.html', html, 'utf8');

// and associated resources

wrench.mkdirSyncRecursive('dist/resources/fontawesome/font');
wrench.copyDirSyncRecursive('../fontawesome/font/', 'dist/resources/fontawesome/font/');
wrench.mkdirSyncRecursive('dist/resources/img');
wrench.copyDirSyncRecursive('../img/', 'dist/resources/img/');

// yuck, have to copy this file manually since it's a single

var license = fs.readFileSync('../LICENSE');
fs.writeFileSync('dist/LICENSE');

// Fix CSS urls, this sucks and is inexplicable to me.
// The cssPrefix attribute on the optimize call looks like
// it does something, but it doesn't do the right thing.
// on top of that, I can't figure out how to take action
// after the CSS optimize other than this.

fs.watchFile('dist/resources/twine.css', function() {
	console.log('Final CSS tweaks...');

	var css = fs.readFileSync('dist/resources/twine.css', 'utf8');
	css = css.replace(/url\("..\//g, 'url("');
	css = css.replace(/url\(..\//g, 'url(');

	fs.writeFileSync('dist/resources/twine.css', css, 'utf8')
	fs.unwatchFile('dist/resources/twine.css');
});

