import { formatError } from './helper';

const handleChainParentEnd = (exeChain, fnName, logger) => {
    const inChain = Object.keys(exeChain).filter(key => exeChain[key].logDetails && key !== fnName)
    if(inChain.length === 0) {
        logger(...exeChain[fnName].logDetails)
        delete exeChain[fnName]
    }
    else {
        const errorFns = inChain.filter(key => exeChain[key].error)
        const fnString = fnName + ` (+${inChain.length})`
        exeChain[fnName].logDetails[0] = errorFns.length > 0 ? fnString + ' (With Error)' : fnString
        logger(...exeChain[fnName].logDetails, false) // keep group open for the parent
        delete exeChain[fnName]
        const exeChainString = [fnName, ...inChain.map(fnName => exeChain[fnName].error ? fnName + ' (Error)': fnName)].join(' > ')
        console.log("Execution Chain: " + exeChainString)
        inChain.forEach(key => {
            logger(...exeChain[key].logDetails, false, exeChain[key].error) // keep sub group open
            delete exeChain[key]
        })
        inChain.forEach(() => console.groupEnd()) // close sub group
        console.groupEnd() // close parent group
    }
    Object.keys(exeChain).forEach((key, i) => { // these are not part of the chain as parent have ended -> make a new parent
        exeChain[key].order = i
    })
}

const OxyInterceptor = (s) => (o) => {
    if (s.proxy) {
        console.log('Proxy already exists');
        return s.proxy;
    }
    const exeChain = {};
    s.proxy = new Proxy(o, {
        get(target, prop) {
            if (!s.enable || !(typeof target[prop] === 'function')) return target[prop];
            const func = target[prop];
            const fnName = prop.toString()
            const isAsync = func.constructor.name === 'AsyncFunction';
            let startTime
            if (isAsync) {
                return async (...args) => {
                    try {
                        if(s.log) {
                            if(s.group) exeChain[fnName] = {order: Object.keys(exeChain).length}
                            s.logger(fnName, true)
                        }
                        startTime = performance.now();
                        const result = await func(...args);
                        const endTime = performance.now();
                        const time = endTime - startTime;
                        if (s.log) {
                            if(!s.group) s.logger(fnName, true, args, time, result)
                            else if(exeChain[fnName].order === 0) { // 1st function, the parent in the chain has ended
                                if(Object.keys(exeChain).length === 1) {
                                    s.logger(fnName, true, args, time, result)
                                    delete exeChain[fnName]
                                }
                                else {
                                    exeChain[fnName].logDetails = [fnName, true, args, time, result]
                                    handleChainParentEnd(exeChain, fnName, s.logger)
                                }
                            } else exeChain[fnName].logDetails = [fnName, true, args, time, result]
                        }
                        if (s.record) s.recorder.add(fnName, new Date(), time, args, result);
                        if(s.stats) s.statsTracker.add(fnName, time);
                        return result;
                    } catch (error) {
                        if (s.log) {
                            const endTime = performance.now();
                            const errorMsg = formatError(error)
                            const logDetails = [fnName, true, args, endTime - startTime, errorMsg]
                            s.logger(...logDetails, true, true) // log error
                            s.errorStack.push({ [fnName]: errorMsg});
                            if(s.group) {
                                exeChain[fnName].logDetails = logDetails
                                exeChain[fnName].error = true
                            }
                        }
                        throw error;
                    }
                };
            } else {
                return (...args) => {
                    try {
                        startTime = performance.now();
                        const result = func(...args);
                        const endTime = performance.now();
                        const time = endTime - startTime;
                        if (s.log) s.logger(fnName, false, args, time, result);
                        if (s.record) s.recorder.add(fnName, startTime, time, args, result);
                        return result;
                    } catch (error) {
                        if (s.log) {
                            const endTime = performance.now();
                            const errorMsg = formatError(error)
                            const logDetails = [fnName, false, args, endTime - startTime, errorMsg]
                            s.logger(...logDetails, true, true) // log error
                            s.errorStack.push({ [fnName]: error.stack });
                        }
                        throw error;
                    }
                };
            }
        }
    })
    return s.proxy;
}

export { OxyInterceptor }