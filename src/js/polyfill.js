

function generateBrowser() {
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
      result[name] = modifyFunction(original[name].bind(original));
    }
    return result;
  }

  function modifyStorage(original) {
    return modifyObject(original, ['clear', 'get', 'getBytesInUse', 'remove', 'set']);
  }


  return {
    storage: {
      local: modifyStorage(chrome.storage.local),
      managed: modifyStorage(chrome.storage.managed),
      sync: modifyStorage(chrome.storage.sync),
    },
    tabs: modifyObject(chrome.tabs, ['query', 'sendMessage']),
    runtime: modifyObject(chrome.runtime, ['sendMessage']),
  };
}


function generateGetBytesInUse(storage) {
  return async (keys) => {
    let data = await storage.get(keys);
    return Object.keys(data).reduce(
      (acc, it) => acc + (it + JSON.stringify(data[it])).length,
      0
    );
  };
}




if (!window.browser)
  window.browser = generateBrowser();


['local', 'sync', 'managed'].forEach(name => {
  let storage = window.browser.storage[name];
  if (storage.getBytesInUse)
    return;
  storage.getBytesInUse = generateGetBytesInUse(storage);
});
