import { formatDateTime, safeJsonStringify, triggerDownload, filterBigData } from './helper';

const OxyRecorder = (s) => {
    const recordData = {}
    return {
        add: (funcName, startTime, executionTime, args, result) => {
            if (!recordData[funcName]) {
                recordData[funcName] = [];
            }
            recordData[funcName].push({
                time: startTime,
                executionTime,
                args,
                response: result
            });
        },
        get: () => recordData,
        export: (maxSize = 10000) => {
            let data = safeJsonStringify(filterBigData(recordData, maxSize));
            const filename = `Oxy_record_${formatDateTime()}.json`;

            const blob = new Blob([data], { type: 'application/json' });
            triggerDownload(blob, filename);
        }
    }
}

export { OxyRecorder }