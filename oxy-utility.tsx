/*
 * Oxy: Empowering Your JS with Intelligence and Efficiency
 * Author: Rudra Roy <astrarudra@gmail.com>
 * Version: 1.0.0
 * Description: Oxy is your go-to solution for logging and tracking functionalities in JavaScript applications. Monitor function execution times, and take control of your code's performance effortlessly.
 * License: MIT
 */

function OxyLocker(obj, password, windowVariable = "Oxy") {
    return {
        unlock(pwd) {
            if (pwd === password) {
                console.log("Unlocked");
                window[windowVariable] = obj;
            } else {
                console.log("Incorrect password");
            }
        },
    };
}

function OxyTracker() {
    const record = {};
    return {
        add: (name, executionTime) => {
            if (record[name]) {
                record[name].executions++;
                record[name].executionTime += executionTime;
                record[name].average = record[name].executionTime / record[name].executions;
            } else {
                record[name] = {
                    executions: 1,
                    executionTime,
                    average: executionTime
                };
            }
        },
        get: (name?) => name ? record[name] : record,
        reset: () => { 
            for (const key in record) {
                delete record[key];
            }
        },
    };
}

function Oxy(log?) {
    let logging = log || false
    let proxy
    const statsTracker = OxyTracker();
    const logger = (funcName, async, params?, executionTime?, result?) => {
        if(!async) {
            console.groupCollapsed(`%c Controller Executed: ${funcName}`, 'background: #222; color: #f5f3bc', );
            console.log('Parameters:', params);
            console.log('Response:', result);
            console.log('Execution Time:', executionTime);
            console.groupEnd();
            return
        }
        if(!params) {
            console.log(`%c Controller initiated: ${funcName}`, 'background: #222; color: #f5f3bc');
            return
        }
        console.groupCollapsed(`%c Controller Completed: ${funcName}`, 'background: #222; color: #02f236');
        console.log('Parameters:', params);
        if(executionTime) {
            let executionTimeString = executionTime;
            if(executionTime > 60000) executionTimeString = (executionTime / 60000).toFixed(2) + 'm'
            else if(executionTime > 1000) executionTimeString = (executionTime / 1000).toFixed(2) + 's';
            else executionTimeString = executionTime.toFixed(2) + 'ms';
            console.log('Response:', result);
            console.log('Execution Time:', executionTimeString);
        }
        console.groupEnd();
        statsTracker.add(funcName, executionTime)
    };
    return {
        logging: () => logging,
        enableLogging: () => {
            logging = true
            console.log('Logging enabled')
        },
        disableLogging: () => {
            logging = false
            console.log('Logging disabled')
        },
        getStats: () => statsTracker.get(),
        getProxy: () => proxy,
        intercept: (object) => {
            if(proxy) {
                console.log('Proxy already exists')
                return proxy
            }
            proxy = new Proxy(object, {
                get: function(target, prop) {
                    if(!logging) return target[prop]
                    if (!(typeof target[prop] === 'function')) return target[prop]
                    const func = target[prop]
                    const isAsync = func.constructor.name === 'AsyncFunction'
                    if(isAsync){                
                        return async (...args) => {
                            logger(prop.toString(), true);
                            const startTime = performance.now();
                            const result = await func(...args);
                            const endTime = performance.now();
                            logger(prop.toString(), true, args, endTime - startTime, result);
                            return result
                        }
                    } else {
                        return (...args) => {
                            const startTime = performance.now();
                            const result = func(...args);
                            const endTime = performance.now();
                            logger(prop.toString(), false, args, endTime - startTime, result);
                            return result
                        }
                    }
                }
            })
            return proxy
        }
    }
}

export { Oxy, OxyLocker }
