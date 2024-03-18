import { timeString } from './helper.js';

const importJson = async () => new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            reject(new Error('No file selected'));
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const jsonData = JSON.parse(event.target.result);
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };
        reader.readAsText(file);
    });
    input.click()
});

const analysis = (curr, old) => curr > old ? 'Slower' : curr < old ? 'Faster' : 'Equal'

function runBenchmark(importedStats, currentStats) {
    const comparisonData = {};
    const notFound = []
    for (const name in currentStats) {
        if(!importedStats[name]) {
            notFound.push(name)
            continue
        }
        const { avg, high, low } = currentStats[name];
        const { avg: importedAvg, high: importedHigh, low: importedLow } = importedStats[name];
        comparisonData[name] = {
            avg: timeString(avg), 
            importedAvg: timeString(importedAvg),
            diff: timeString(avg - importedAvg),
            analysis: analysis(avg, importedAvg),
            high: timeString(high),
            importedHigh: timeString(importedHigh),
            highDiff: timeString(high - importedHigh),
            highAnalysis: analysis(high, importedHigh),
            low: timeString(low),
            importedLow: timeString(importedLow),
            lowDiff: timeString(low - importedLow),
            lowAnalysis: analysis(low, importedLow)
        };
    }

    let csv = 'Name, Current Average, Imported Average, Difference, Comparison,, Current High, Imported High, Difference, Comparison,, Current Low, Imported Low, Difference, Comparison\n';
    for (const name in comparisonData) {
        const { avg, importedAvg, diff, analysis, high, importedHigh, highDiff, highAnalysis, low, importedLow, lowDiff, lowAnalysis } = comparisonData[name];
        csv += `${name}, ${avg}, ${importedAvg}, ${diff}, ${analysis},, ${high}, ${importedHigh}, ${highDiff}, ${highAnalysis},, ${low}, ${importedLow}, ${lowDiff}, ${lowAnalysis}\n`;
    }
    if(notFound.length) {
        csv += '\n\n\n\nThe following functions were not found in the imported stats:\n';
        csv += notFound.join(', ');
        console.log("Not found in imported data", notFound)
    }
    return csv;
}

export { importJson, runBenchmark }





