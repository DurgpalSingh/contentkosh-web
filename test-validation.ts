
import { validateEntityName } from './lib/validation';

const testCases = [
    { name: '', expected: 'Name is required' },
    { name: '   ', expected: 'Name is required' },
    { name: 'Valid Name', expected: null },
    { name: 'Valid-Name_123', expected: null },
    { name: 'a'.repeat(51), expected: 'Name cannot exceed 50 characters' },
    { name: '123456', expected: 'Name must contain at least one alphabet' },
    { name: 'Invalid@Name', expected: 'Name contains invalid characters' },
    { name: '-Start', expected: 'Hyphens and underscores cannot be at the start or end of the name' },
    { name: 'End-', expected: 'Hyphens and underscores cannot be at the start or end of the name' },
    { name: '_Start', expected: 'Hyphens and underscores cannot be at the start or end of the name' },
    { name: 'End_', expected: 'Hyphens and underscores cannot be at the start or end of the name' },
    { name: 'Consecutive--Hyphens', expected: 'Hyphens and underscores cannot be consecutive' },
    { name: 'Consecutive__Underscores', expected: 'Hyphens and underscores cannot be consecutive' },
    { name: 'Mixed-_Consecutive', expected: 'Hyphens and underscores cannot be consecutive' },
];



let passed = 0;
let failed = 0;

testCases.forEach(({ name, expected }, index) => {
    const result = validateEntityName(name);
    if (result === expected) {
        console.log(`Test ${index + 1}: PASSED`);
        passed++;
    } else {
        console.error(`Test ${index + 1}: FAILED`);
        console.error(`  Input: "${name}"`);
        console.error(`  Expected: ${expected}`);
        console.error(`  Actual:   ${result}`);
        failed++;
    }
});

console.log(`\nTests completed. Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) {
    process.exit(1);
}
