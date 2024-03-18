
const allowedConfig = ['enable', 'log', 'group', 'stats', 'record', 'fnPrefix'];
const DTTemplate = "{year}_{month}_{day}_{hours}{minutes}{seconds}"
const welcomeMessage = [
    { body: 'Hey there, it\'s Oxy!', style: 'font-size: 24px; color: #ff6f61;' },
    { body: 'To use me, you can:', style: 'font-size: 16px; color: #75daad;' },
    { body: 'help() - Get to know all about me', style: 'font-size: 14px; color: #f5f3bc;' },
    { body: 'Version: 1.1', style: 'color: #D0FFBB;' },
    { body: 'For more fun and feedback, visit: ', style: 'color: #D0FFBB;' },
    { body: 'https://github.com/astrarudra/oxy-utility', style: 'color: #007bff;' },
    { body: 'And if you love what I do, throw a star my way on GitHub!', style: 'color: #D0FFBB; font-style: italic;' }
];

const getConfig = (o) => allowedConfig.reduce((res, key) => { res[key] = o[key]; return res; }, {})
const formatError = (error) =>  error ? (error.stack ? error.stack : error) : 'Unknown Error'

const messageLogger = (messages) => {
    messages.forEach(({ body, style }, index) => {
      if (index === 0) {
        console.groupCollapsed('%c' + body, style || '');
      } else {
        console.log('%c' + body, style || '');
        if (index === messages.length - 1) {
          console.groupEnd();
        }
      }
    });
}

const timeString = (executionTime) => {
  const m = executionTime < 0 ? -1: 1
  executionTime = m * executionTime
  if (executionTime > 60000) return (executionTime * m / 60000).toFixed(2) + 'm';
  else if (executionTime > 1000) return (executionTime * m / 1000).toFixed(2) + 's';
  else return m * executionTime.toFixed(2) + 'ms';
}

const getDateTime = (date = new Date()) => {
  return {
      year: String(date.getFullYear()).slice(-2),
      month: String(date.getMonth() + 1).padStart(2, '0'),
      day: String(date.getDate()).padStart(2, '0'),
      hours: String(date.getHours()).padStart(2, '0'),
      minutes: String(date.getMinutes()).padStart(2, '0'),
      seconds: String(date.getSeconds()).padStart(2, '0')
  };
}

const formatDateTime = (template = DTTemplate, date = new Date()) => {
  const placeholders = getDateTime(date);
  for (const placeholder in placeholders) template = template.split('{' + placeholder + '}').join(placeholders[placeholder]);
  return template;
}

const triggerDownload = (blob, filename) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.addEventListener('click', () => {
      document.body.removeChild(link);
  });
  document.body.appendChild(link); // Add link to the document
  link.click();
}

function safeJsonStringify(obj, replacer = null, space = 2) {
  const seen = new WeakSet();
  function serializer(key, value) {
      if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
              return '[Circular]';
          }
          seen.add(value);
      }
      try {
          return JSON.stringify(value, replacer);
      } catch (err) {
          return '[Unserializable]';
      }
  }
  return JSON.stringify(obj, serializer, space);
}

function filterBigData(data, maxSize = 10000) {
  const filteredData = {};
  for (const [funcName, records] of Object.entries(data)) {
      filteredData[funcName] = records.map(record => {
          const filteredArgs = record.args.filter(arg => JSON.stringify(arg).length <= maxSize);
          const filteredResponse = typeof record.response === 'object' ?
              Object.keys(record.response).reduce((acc, key) => {
                  if (typeof record.response[key] === 'object') {
                      acc[key] = JSON.stringify(record.response[key]).length <= maxSize ? record.response[key]: '[TooBig]'
                  } else {
                      acc[key] = record.response[key]
                  }
                  return acc;
              }, {}) :
              record.response;

          return {
              ...record,
              args: filteredArgs,
              response: filteredResponse
          };
      });
  }

  return filteredData;
}


export { messageLogger, welcomeMessage, allowedConfig, timeString, formatError, getConfig, formatDateTime, getDateTime, triggerDownload, safeJsonStringify, filterBigData}