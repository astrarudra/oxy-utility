/*
 * Oxy: Empowering Your JS With Insights
 * Author: Rudra Roy <astrarudra@gmail.com>
 * Version: 1.1
 * Description: Oxy is your go-to solution for logging and tracking functionalities in JavaScript applications. Monitor function execution times, and take control of your code's performance effortlessly.
 * License: MIT
 */

import { OxyLocker } from './lib/locker';
import { OxyTracker } from './lib/tracker';
import { OxyLogger } from './lib/logger';
import { OxyInterceptor } from './lib/interceptor';
import { OxyRecorder } from './lib/recorder';
import { getConfig, allowedConfig } from './lib/helper';
import { getAllInfo } from './lib/info';

function Oxy(config) {
    const savedConfig = JSON.parse(localStorage.getItem('OxyConfig')) || {};
    const s = Object.assign({
        enable: true,
        log: true,
        group: true,
        stats: true,
        record: false,
        fnPrefix: "Controller",
    }, getConfig(config), savedConfig);

    s.proxy = null
    s.errorStack = []
    s.statsTracker = OxyTracker()
    s.logger = OxyLogger(s)
    s.recorder = OxyRecorder(s)
    const interceptor = OxyInterceptor(s);

    const saveConfig = () => {
        localStorage.setItem('OxyConfig', JSON.stringify(getConfig(s)));
        console.log('Config saved');
    };

    const resetConfig = () => {
        localStorage.removeItem('OxyConfig');
        console.log('Config removed');
    };
    return {
        help: () => {
            window.open('https://github.com/astrarudra/oxy-utility#readme', '_blank');
        },
        viewConfig: () => getConfig(s),
        saveConfig, 
        resetConfig,
        enable: (key='enable') => {
            if(!allowedConfig.includes(key)) {
                console.log('Enter one of - ' + allowedConfig.join(', '))
                return
            } else if(s[key]) {
                console.log(key + ' is already enabled');
                return
            }
            s[key] = true;
            console.log(key + ' enabled');
        },
        disable: (key = 'enable') => {
            if(!allowedConfig.includes(key)) {
                console.log('Enter one of - ' + allowedConfig.join(', '))
                return
            } else if(!s[key]) {
                console.log(key + ' is already disabled');
                return
            }
            s[key] = false;
            console.log(key + ' disabled');
        },
        getStats: () => s.statsTracker.get(),
        resetStats: () => s.statsTracker.reset(),
        exportStats: (fileFormat = 'csv', formatTime=true) => s.statsTracker.export(fileFormat, formatTime),
        benchmarkStats: async () => s.statsTracker.benchmark(),
        getDeviceInfo: async () => {
            console.log('Getting info....')
            const details = await getAllInfo()
            console.log(details)
        },
        getRecords: () => s.recorder.get(),
        exportRecords: (maxSize = 10000) => s.recorder.export(maxSize = 10000),
        getErrors: () => s.errorStack,
        getProxy: () => s.proxy,
        oxyfy: (o) => interceptor(o)
    };
}

export { Oxy, OxyLocker };
