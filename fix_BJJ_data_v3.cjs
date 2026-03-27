const fs = require('fs');

const path = 'c:/Users/brima/Documents/Projects/tapguard/src/components/matrix/BJJFlowBuilder.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Locate the injected K-Guard object in STARTERS
let startMatchStr = '{\\n  "id": 125';
let startIdx = content.indexOf(',,\n    {\n  "id": 125');
if (startIdx === -1) {
    startIdx = content.indexOf(',\n    {\n  "id": 125');
}
if (startIdx === -1) {
    console.log("Could not find the start of the injected elements in STARTERS");
    process.exit(1);
}

// Locate the end of the injected elements
let endMatch = '    "Switching to an Aoki lock or straight ankle"\n  ]\n}';
let endIdx = content.indexOf(endMatch, startIdx);
if (endIdx === -1) {
    console.log("Could not find the end of the injected elements");
    process.exit(1);
}
endIdx += endMatch.length;

// Extract the injected block
let injectedText = content.substring(startIdx + 3, endIdx); 
if (injectedText.startsWith(',\n    {')) {
    injectedText = injectedText.substring(2);
}
if (injectedText.startsWith('\n    {')) {
    injectedText = injectedText.substring(1);
}

// Remove the injected block from STARTERS to restore old structure
let newContent = content.substring(0, startIdx) + content.substring(endIdx);
// Fix the trailing comma in STARTERS
newContent = newContent.replace(',\n];', '\n];');
newContent = newContent.replace('},\n];', '}\n];');
newContent = newContent.replace('},,\n];', '}\n];');

// 2. We need to append the 39 items to the DATA array (on line 21)
// We know DATA is currently on one line: const DATA = [ ... }];
let dataStartIdx = newContent.indexOf('const DATA = [');
let idx = dataStartIdx + 'const DATA = ['.length;
// find the end `];` of the DATA array, which is exactly at the end of the line
let newlineIdx = newContent.indexOf('\\n', dataStartIdx);
if (newlineIdx === -1) {
	newlineIdx = newContent.indexOf('\n', dataStartIdx);
}
let dataArrayEndIdx = newContent.lastIndexOf('];', newlineIdx);
if (dataArrayEndIdx === -1) {
   console.log("could not find data array end idx");
   process.exit(1);
}

// Verify that it ends with `}]` before the `;`
let dataContent = newContent.substring(dataStartIdx + 'const DATA = '.length, dataArrayEndIdx);
// Should end with `}]`
if (!dataContent.endsWith('}]')) {
   console.log("Uh oh, data didn't end with }]");
   process.exit(1); 
}
// Strip the `]` from the end since we'll concatenate with `, {`
dataContent = dataContent.substring(0, dataContent.length - 1);

// Append the newly injected text before the closing `];`
// Notice the DATA array is `...}]` and we want to append `,\n { "id": 125 ...` 
let finalContent = newContent.substring(0, dataStartIdx + 'const DATA = '.length) + dataContent + ',\n    ' + injectedText + '\n];' + newContent.substring(dataArrayEndIdx + 2);

// 3. Fix the App Component logic
// Belt Picker skipping
finalContent = finalContent.replace('const [beltDone, setBeltDone] = useState(!!store.belt);', 'const [beltDone, setBeltDone] = useState(true);');
finalContent = finalContent.replace('{!beltDone && <BeltPicker onSelect={b=>{setBelt(b);setBeltDone(true);}}/>}', '{ /* Belt picker completely removed for beginners */ }');
finalContent = finalContent.replace('<Onboarding belt={store.belt}', '<Onboarding belt={store.belt || "White"}');

// Just in case it's formatted differently
finalContent = finalContent.replace('{!beltDone && <BeltPicker onSelect={(b)=>{setBelt(b);setBeltDone(true);}} />}', '{ /* Belt picker removed */ }');

fs.writeFileSync(path, finalContent);
console.log("Fixed successfully!");
