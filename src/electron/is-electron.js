/*
A one-liner to detect an Electron context. This is safe to run in any context.
*/

module.exports = () => window.navigator.userAgent.indexOf('Electron') !== -1;
