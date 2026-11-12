const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'board_case_tray.js'), 'utf8');
const start = source.indexOf('var CASE_IMAGE_MAX_BYTES=');
const end = source.indexOf('function addSingle()', start);
assert.ok(start >= 0 && end > start, 'Upload preflight functions should exist');

const status = { textContent: '' };
const sandbox = {
  caseFiles: [],
  caseRunPending: false,
  E: id => id === 'uploadStatus' ? status : null,
  tray: () => {},
  Number,
};
vm.runInNewContext(source.slice(start, end), sandbox);

const file = (name, size) => ({name, size});
const allowed = ['photo.jpg','photo.JPEG','image.png','image.webp','image.bmp','image.tif','image.tiff'];
allowed.forEach(name => assert.equal(sandbox.caseFileError(file(name, 1024)), '', name));
assert.match(sandbox.caseFileError(file('photo.heic', 1024)), /Convert HEIC/);
assert.match(sandbox.caseFileError(file('file.txt', 1024)), /unsupported image format/);
assert.match(sandbox.caseFileError(file('photo.jpg', 0)), /empty/);
assert.match(sandbox.caseFileError(file('photo.jpg', 10 * 1024 * 1024 + 1)), /10 MB/);
assert.equal(sandbox.caseFileError(file('photo.jpg', 10 * 1024 * 1024)), '');

sandbox.addFiles([file('good.jpg', 1000), file('bad.heic', 1000), file('large.png', 10 * 1024 * 1024 + 1)]);
assert.equal(sandbox.caseFiles.length, 1);
assert.match(status.textContent, /1 photo added/);
assert.match(status.textContent, /bad.heic/);
assert.match(status.textContent, /large.png/);

sandbox.addFiles(Array.from({length: 8}, (_, i) => file('board'+i+'.jpg', 500)));
assert.equal(sandbox.caseFiles.length, 6, 'six photo limit must remain');
assert.match(status.textContent, /six-photo limit/);
sandbox.caseRunPending = true;
sandbox.addFiles([file('other.jpg', 500)]);
assert.equal(sandbox.caseFiles.length, 6, 'upload disabled while scanning');

console.log('Case upload preflight regression passed');
