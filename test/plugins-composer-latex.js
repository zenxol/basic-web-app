'use strict';

const path = require('path');

// Run LaTeX plugin unit tests (same pattern as post-fields-logger)
const pluginTestPath = path.join(__dirname, '../vendor/nodebb-plugin-composer-latex/test/composer-latex.js');
require(pluginTestPath);
