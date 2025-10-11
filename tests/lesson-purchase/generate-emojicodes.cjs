#!/usr/bin/env node

/**
 * Generate emojicodes for lesson purchase test results
 */

const fs = require('fs');
const path = require('path');

// Load emojicoding library from The Advancement
const emojicodingPath = path.join(__dirname, '../../../the-advancement/src/The Advancement/AdvanceKey/emojicoding.js');
const emojicodingCode = fs.readFileSync(emojicodingPath, 'utf8');

// Evaluate the emojicoding library
eval(emojicodingCode);

// Load test results
const testResults = JSON.parse(fs.readFileSync('./test-results.json', 'utf8'));

// Generate emojicodes
const lessonBdoPubKey = testResults.lessonBDO.bdoPubKey;
const lessonEmojicode = simpleEncodeEmoji(lessonBdoPubKey);

const contractUuid = testResults.contract.uuid;
const contractEmojicode = simpleEncodeEmoji(contractUuid);

// Add emojicodes to test results
testResults.lessonBDO.emojicode = lessonEmojicode;
testResults.contract.emojicode = contractEmojicode;

// Save updated results
fs.writeFileSync('./test-results-with-emojicodes.json', JSON.stringify(testResults, null, 2));

console.log('✅ Generated emojicodes:');
console.log('');
console.log('Lesson BDO:');
console.log('  bdoPubKey:', lessonBdoPubKey);
console.log('  emojicode:', lessonEmojicode);
console.log('');
console.log('Contract:');
console.log('  uuid:', contractUuid);
console.log('  emojicode:', contractEmojicode);
console.log('');
console.log('📝 Saved to: test-results-with-emojicodes.json');
