

function generate() {
  function modifyFunction(f) {
    return (...args) => {
      return new Promise((resolve, reject) => {
        args.push(items => {
          let err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve(items);
          }
        })
        return f.apply(null, args);
      });
    };
  }

  function modifyObject(original, definitions) {
    if (!original)
      return {};

    let result = {};
    for (let name of definitions) {
      result[name] = modifyFunction(original[name]);
    }
    return result;
  }

  function modifyStorage(original) {
    return modifyObject(original, ['clear', 'get', 'getBytesInUse', 'remove', 'set']);
  }


  return {
    storage: {
      sync: modifyStorage(chrome.storage.sync),
      local: modifyStorage(chrome.storage.local),
      managed: modifyStorage(chrome.storage.managed),
    },
    tabs: modifyObject(chrome.tabs, ['query', 'sendMessage']),
    runtime: modifyObject(chrome.runtime, ['sendMessage']),
  };
}


const Polyfill = generate();

export default Polyfill;

if (!window.browser)
  window.browser = Polyfill;
