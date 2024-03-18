import { timeString, formatDateTime, triggerDownload } from './helper';
import { importJson, runBenchmark } from './benchmark';

function statsToCSV(stats) {
    let csv = 'Name, Count, Avg, High, Low, Executions\n';
    for (const name in stats) {
        const { count, avg, high, low, executions } = stats[name];
        csv += `${name}, ${count}, ${avg}, ${high}, ${low}, ${executions.join('|')}\n`;
    }
    return csv;
}

const computeStats = (executions, formatTime = false) => {
    const count = executions.length;
    const totalExecutionTime = executions.reduce((acc, curr) => acc + curr, 0);
    const avg = count ? totalExecutionTime / count : 0;
    const high = Math.max(...executions);
    const low = Math.min(...executions);
    const executionList = formatTime ? executions.map(timeString) : executions;

    return {
        count,
        avg: formatTime ? timeString(avg) : avg,
        high: formatTime ? timeString(high) : high,
        low: formatTime ? timeString(low) : low,
        executions: executionList
    };
};

function OxyTracker() {
    let r = {};
    const getStats = (formatTime) => {
        const stats = {};
        for (const name in r) {
            stats[name] = computeStats(r[name], formatTime);
        }
        return stats;
    }
    return {
        add: (name, time) => {
            r[name] = r[name] || [];
            r[name].push(time);
        },
        get: (formatTime = true) => getStats(formatTime),
        reset: () => {
            const confirmation = window.confirm('Are you sure you want to reset the tracker?');
            if (confirmation) {
                r = {};
            }
        },
        export: (format = 'csv', formatTime=true) => {
            if(format !== 'json' && format !== 'csv') {
                console.log('Invalid format, allowed formats are json and csv')
                return
            }
            if(format === 'json') formatTime=false
            const stats = getStats(formatTime);
            const data = format === 'json' ? JSON.stringify(stats, null, 2) : statsToCSV(stats);
            const filename = `Oxy_stats_${formatDateTime()}.${format}`;
            const blob = new Blob([data], { type: `text/${format === 'json' ? 'plain' : 'csv'}` });
            triggerDownload(blob, filename);
        },
        benchmark: async () => {
            const confirmation = window.confirm('For benchmark - You will need to import previously exported stats file (JSON format)');
            if(!confirmation) return
            const importedStats = await importJson();
            if(!importedStats) return
            const currentStats = getStats();
            const results_csv = runBenchmark(importedStats, currentStats);
            const filename = `Oxy_benchmark_${formatDateTime()}.csv`;
            const blob = new Blob([results_csv], { type: 'text/csv' });
            triggerDownload(blob, filename);
        }
    }
}

export { OxyTracker };
