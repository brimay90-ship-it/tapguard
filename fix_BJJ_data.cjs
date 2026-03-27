const fs = require('fs');

const path = 'c:/Users/brima/Documents/Projects/tapguard/src/components/matrix/BJJFlowBuilder.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Locate the injected K-Guard object in STARTERS
let startIdx = content.indexOf(',,\n    {\n  "id": 125');
if (startIdx === -1) {
    console.log("Could not find the start of the injected elements");
    process.exit(1);
}

// 2. Locate the end of the injected elements in STARTERS
// The last element is id 163 (Heel Slip)
let endMatch = '    "Switching to an Aoki lock or straight ankle"\n  ]\n}';
let endIdx = content.indexOf(endMatch, startIdx);
if (endIdx === -1) {
    console.log("Could not find the end of the injected elements");
    process.exit(1);
}
endIdx += endMatch.length;

// 3. Extract the injected JSON blocks
let injectedText = content.substring(startIdx + 3, endIdx); // Skip the `,,\n` part
// Parse to verify it's valid
try {
    let parsed = JSON.parse('[' + injectedText + ']');
    console.log("Successfully extracted " + parsed.length + " objects from STARTERS.");
} catch (e) {
    console.log("Failed to parse extracted text:", e.message);
    process.exit(1);
}

// 4. Remove the injected text (and the double comma) from STARTERS
let newContent = content.substring(0, startIdx) + "\n" + content.substring(endIdx);
// Fix the trailing comma in STARTERS if needed (since it was `{ ... },,` we just removed `,,\n{...}` so now it's `{ ... } \n];`)

// 5. Now inject them correctly into DATA (Line 21)
// We know DATA is currently on one line: const DATA = [{...}];
// Let's find `];` at the end of the `const DATA = ` match
let dataStartIdx = newContent.indexOf('const DATA = [');
let dataEndIdx = newContent.indexOf('];', dataStartIdx);

let dataArrayStr = newContent.substring(dataStartIdx + 'const DATA = '.length, dataEndIdx);
let dataArray = JSON.parse(dataArrayStr);
let newDataArray = JSON.parse('[' + injectedText + ']');

dataArray = dataArray.concat(newDataArray);

// Serialize 
let finalDataStr = JSON.stringify(dataArray);
// Now we write it back
let finalContent = newContent.substring(0, dataStartIdx) + 'const DATA = ' + finalDataStr + newContent.substring(dataEndIdx);

fs.writeFileSync(path, finalContent);
console.log("Fixed BJJFlowBuilder.jsx successfully!");
