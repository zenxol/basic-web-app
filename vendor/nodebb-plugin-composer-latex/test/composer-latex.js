'use strict';

const assert = require('assert');
const plugin = require('../library.js');

describe('Composer LaTeX Plugin', () => {
	describe('registerFormatting', () => {
		it('should add latex option to formatting payload', async () => {
			const payload = { options: [] };
			await plugin.registerFormatting(payload);
			assert(Array.isArray(payload.options));
			assert(payload.options.length >= 1);
			const latexOption = payload.options.find(o => o.name === 'latex');
			assert(latexOption, 'should have a latex option');
			assert.strictEqual(latexOption.name, 'latex');
			assert(latexOption.title);
			assert.strictEqual(latexOption.className, 'fa fa-superscript');
			assert(latexOption.visibility);
			assert.strictEqual(latexOption.visibility.mobile, true);
			assert.strictEqual(latexOption.visibility.desktop, true);
		});

		it('should preserve existing options when adding latex', async () => {
			const payload = { options: [{ name: 'bold' }] };
			await plugin.registerFormatting(payload);
			assert(payload.options.some(o => o.name === 'bold'));
			assert(payload.options.some(o => o.name === 'latex'));
		});

		it('should create options array if missing', async () => {
			const payload = {};
			await plugin.registerFormatting(payload);
			assert(Array.isArray(payload.options));
			assert(payload.options.some(o => o.name === 'latex'));
		});
	});

	describe('addMathJaxScript', () => {
		it('should add MathJax script to templateData.useCustomHTML', async () => {
			const data = { templateData: {} };
			await plugin.addMathJaxScript(data);
			assert(data.templateData.useCustomHTML);
			assert(data.templateData.useCustomHTML.includes('mathjax'));
			assert(data.templateData.useCustomHTML.includes('script'));
			assert(data.templateData.useCustomHTML.includes('cdn.jsdelivr.net'));
		});

		it('should append to existing useCustomHTML if present', async () => {
			const data = { templateData: { useCustomHTML: '<div>custom</div>' } };
			await plugin.addMathJaxScript(data);
			assert(data.templateData.useCustomHTML.includes('<div>custom</div>'));
			assert(data.templateData.useCustomHTML.includes('mathjax'));
		});

		it('should do nothing if templateData is missing', async () => {
			const data = {};
			await plugin.addMathJaxScript(data);
			assert.strictEqual(data.templateData, undefined);
		});
	});
});
