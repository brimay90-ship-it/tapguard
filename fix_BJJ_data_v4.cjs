const fs = require('fs');

const path = 'c:/Users/brima/Documents/Projects/tapguard/src/components/matrix/BJJFlowBuilder.jsx';
let content = fs.readFileSync(path, 'utf8');

let startMatchStr = '{\\n  "id": 125';
let startIdx = content.indexOf(',,\n    {\n  "id": 125');
if (startIdx === -1) startIdx = content.indexOf(',\n    {\n  "id": 125');
if (startIdx === -1) startIdx = content.indexOf('\n    {\n  "id": 125');

let endMatch = '    "Switching to an Aoki lock or straight ankle"\n  ]\n}';
let endIdx = content.indexOf(endMatch, startIdx) + endMatch.length;

let injectedText = content.substring(content.indexOf('{\n  "id": 125', startIdx), endIdx);

let newContent = content.substring(0, startIdx) + content.substring(endIdx);
newContent = newContent.replace(',\n];', '\n];').replace('},\n];', '}\n];').replace('},,\n];', '}\n];');
// Just manually fix the end of STARTERS to ensure it's `}\n];`
newContent = newContent.replace('cat:"Submission" },,\n];', 'cat:"Submission" }\n];');
newContent = newContent.replace('cat:"Submission" },\n];', 'cat:"Submission" }\n];');

let dataStartIdx = newContent.indexOf('const DATA = [');
let idx = dataStartIdx + 'const DATA = ['.length;
let newlineIdx = newContent.indexOf('\n', dataStartIdx);
let dataArrayEndIdx = newContent.lastIndexOf('];', newlineIdx);

let dataContent = newContent.substring(idx, dataArrayEndIdx);
// Add the injected objects. Notice we need `,\n ` before it.
let finalContent = newContent.substring(0, dataStartIdx + 'const DATA = ['.length) + dataContent + ',\n    ' + injectedText + '\n];' + newContent.substring(dataArrayEndIdx + 2);

// Belt Picker removal
finalContent = finalContent.replace('const [beltDone, setBeltDone] = useState(!!store.belt);', 'const [beltDone, setBeltDone] = useState(true);');
finalContent = finalContent.replace('{!beltDone && <BeltPicker onSelect={b=>{setBelt(b);setBeltDone(true);}}/>}', '{ /* Belt picker completely removed for beginners */ }');
finalContent = finalContent.replace('<Onboarding belt={store.belt}', '<Onboarding belt={store.belt || "White"}');

fs.writeFileSync(path, finalContent);
console.log("Fixed successfully v4!");
