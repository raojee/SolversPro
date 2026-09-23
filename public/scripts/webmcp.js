/**
 * SolversPro WebMCP (Web Model Context Protocol) Integration
 * Exposes core solvers and tools to browser-based AI agents via navigator.modelContext.
 * Specification: https://webmachinelearning.github.io/webmcp/
 */
(function() {
  const tools = [
    {
      name: 'solverspro_solve',
      description: 'Executes SolversPro AI multi-step solver for mathematical, financial, engineering, and logic questions.',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'The natural language problem or question to solve.'
          }
        },
        required: ['prompt']
      },
      execute: async function(params) {
        try {
          const res = await fetch('/api/solve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: params.prompt })
          });
          if (!res.ok) {
            return { error: 'Failed to solve problem: HTTP ' + res.status };
          }
          const text = await res.text();
          return { solution: text };
        } catch (err) {
          return { error: err.message || String(err) };
        }
      }
    },
    {
      name: 'solverspro_json_format',
      description: 'Formats, minifies, or validates a JSON string.',
      inputSchema: {
        type: 'object',
        properties: {
          json: {
            type: 'string',
            description: 'The JSON string to format or validate.'
          },
          indent: {
            type: 'number',
            description: 'Indentation spacing (e.g. 2 or 4). Use 0 for minification.',
            default: 2
          }
        },
        required: ['json']
      },
      execute: async function(params) {
        try {
          const parsed = JSON.parse(params.json);
          const indent = typeof params.indent === 'number' ? params.indent : 2;
          return {
            valid: true,
            formatted: JSON.stringify(parsed, null, indent)
          };
        } catch (err) {
          return {
            valid: false,
            error: err.message
          };
        }
      }
    },
    {
      name: 'solverspro_base64',
      description: 'Encodes or decodes text using Base64.',
      inputSchema: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'Text string to encode or decode.'
          },
          action: {
            type: 'string',
            enum: ['encode', 'decode'],
            description: 'Action to perform: "encode" or "decode".'
          }
        },
        required: ['text', 'action']
      },
      execute: async function(params) {
        try {
          if (params.action === 'decode') {
            return { result: decodeURIComponent(escape(atob(params.text))) };
          } else {
            return { result: btoa(unescape(encodeURIComponent(params.text))) };
          }
        } catch (err) {
          return { error: 'Base64 conversion failed: ' + err.message };
        }
      }
    },
    {
      name: 'solverspro_search_tools',
      description: 'Finds SolversPro calculators and tools by keyword or category.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Keywords to search for (e.g., mortgage, concrete, jwt, bmi).'
          }
        },
        required: ['query']
      },
      execute: async function(params) {
        const query = (params.query || '').toLowerCase();
        const catalog = [
          { name: 'Mortgage Calculator', url: '/finance/mortgage-calculator', category: 'finance' },
          { name: 'Compound Interest', url: '/finance/compound-interest', category: 'finance' },
          { name: 'JSON Tools', url: '/developer/json-tools', category: 'developer' },
          { name: 'XML Tools', url: '/developer/xml-tools', category: 'developer' },
          { name: 'Base64 Converter', url: '/developer/base64-converter', category: 'developer' },
          { name: 'JWT Decoder', url: '/developer/jwt-decoder', category: 'developer' },
          { name: 'BMI Calculator', url: '/health/bmi-calculator-adult', category: 'health' },
          { name: 'TDEE Calculator', url: '/health/tdee-calculator', category: 'health' },
          { name: 'Concrete Slab Calculator', url: '/trades/concrete-slab-calculator', category: 'trades' },
          { name: 'Lumber Board Feet', url: '/trades/board-feet-calculator', category: 'trades' },
          { name: 'Scientific Calculator', url: '/math/scientific-calculator', category: 'math' },
          { name: 'Quadratic Solver', url: '/math/quadratic-solver', category: 'math' },
          { name: 'Unit Converter', url: '/math/unit-converter', category: 'math' }
        ];
        const matches = catalog.filter(t => t.name.toLowerCase().includes(query) || t.category.includes(query));
        return { count: matches.length, tools: matches };
      }
    }
  ];

  // Expose tools on window for introspection & testability
  window.__solverspro_webmcp_tools = tools;

  function registerWebMCP() {
    try {
      const mc = navigator.modelContext || window.modelContext;
      if (mc) {
        if (typeof mc.provideContext === 'function') {
          mc.provideContext({ tools: tools });
        } else if (typeof mc.registerTool === 'function') {
          tools.forEach(tool => mc.registerTool(tool));
        } else if (typeof mc.registerTools === 'function') {
          mc.registerTools(tools);
        }
      }
    } catch (e) {
      console.debug('WebMCP registration notice:', e);
    }
  }

  // Register immediately and on DOM load
  registerWebMCP();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerWebMCP);
  }
})();
