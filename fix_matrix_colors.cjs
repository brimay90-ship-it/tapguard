const fs = require('fs');

const file = 'src/components/matrix/BJJFlowBuilder.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace dark backgrounds
// 0c0c0c, 111, 141414, 161616, 1e1e1e -> var(--bg-card)
content = content.replace(/background:\s*['"]#(000|0c0c0c|111|111111|141414|161616|1e1e1e)['"]/gi, "background: 'var(--bg-card)'");

// Ensure card strokes and grid lines convert to border tokens
// 1c1c1c, 222, 272727, 2a2a2a, 333 -> var(--border)
content = content.replace(/border:\s*['"](1px|1\.5px|2px) solid #(1c1c1c|222|222222|272727|2a2a2a|333|333333)['"]/gi, "border: `$1 solid var(--border)`");
content = content.replace(/borderBottom:\s*['"](1px|2px) solid #(1c1c1c|222|222222|272727|2a2a2a|333|333333)['"]/gi, "borderBottom: `$1 solid var(--border)`");
content = content.replace(/borderTop:\s*['"](1px|2px) solid #(1c1c1c|222|222222|272727|2a2a2a|333|333333)['"]/gi, "borderTop: `$1 solid var(--border)`");

// Fix SVG Stroke Colors for grid lines
content = content.replace(/stroke="?#(1a1a1a|1c1c1c|222|2a2a2a|272727|333|555)"?/gi, 'stroke="var(--border)"');

// Text Colors (grey -> var(--text-sec))
// #444, #555, #666, #888, #aaa -> var(--text-sec)
content = content.replace(/color:\s*['"]#(444|555|666|888|aaa|d8d8d8|3a3a3a)['"]/gi, "color: 'var(--text-sec)'");

fs.writeFileSync(file, content);
console.log('Matrix colors mapped to theme variables!');
