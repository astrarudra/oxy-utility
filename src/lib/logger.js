import { timeString } from './helper';

function OxyLogger(s) {
    return function logger(funcName, async, params, executionTime, result, end = true, error=false) {
        if (!async) {
            let style = 'color: #f5f3bc';
            let message = `%c ${s.fnPrefix} Executed: ${funcName}`
            if(error) {
                style = 'color: red'
                message = `%c ${s.fnPrefix} Failed: ${funcName}`
            }
            console.groupCollapsed(message, style);
            console.log('Parameters:', params);
            console.log('Response:', result);
            console.log('Execution Time:', timeString(executionTime));
            console.groupEnd();
        } else if(!params){
            console.log(`%c ${s.fnPrefix} initiated: ${funcName}`, 'color: #f5f3bc');
        }
        else {
            let style = 'color: #02f236';
            let message = `%c ${s.fnPrefix} Completed: ${funcName}`
            if(error) {
                style = 'color: red'
                message = `%c ${s.fnPrefix} Failed: ${funcName}`
            }
            console.groupCollapsed(message, style);
            console.log('Parameters:', params);
            console.log('Response:', result);
            if (executionTime) console.log('Execution Time:', timeString(executionTime))
            if(end) console.groupEnd();
        }
    };
}

export { OxyLogger }