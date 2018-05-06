
import dateFormat from 'dateformat'



// In content and Array
function I(f) {
  let result = (context, tab) => {
    let command = (name, options) => {
      let params = Object.assign({command: name}, options);
      return browser.tabs.sendMessage(tab.id, params);
    };

    return f(context, tab, command);
  };

  result.useContent = true;
  return result;
}

// Not in content and Not promise
function N(f) {
  return (context, tab) => Promise.resolve(f(context, tab));
}


function forEachTabs(f) {
  let result = async context => {
    let result = [];
    for (let tab of context.tabs) {
      try {
        result.push(await f(context, tab));
      } catch (e) {
        // PASS
      }
    }

    return Promise.resolve(result);
  };

  result.useContent = f.useContent;

  return result;
}


function split2(args) {
  let [_, head, tail] = args.trim().match(/(\S*)(?:\s+(.+))?/);
  return [head, tail];
}



export default (args, name) => {
  let entries = {
    attribute: I((context, tab, command) => {
      let [property, query] = split2(args);
      return command('attribute', {query, attribute});
    }),

    'const': N((context, tab) => [args]),

    date: N((context, tab) => [dateFormat(args)]),

    property: I((context, tab, command) => {
      let [property, query] = split2(args);
      return command('property', {query, property});
    }),

    selected: I((context, tab, command) => command('selected', {})),

    selector: I((context, tab, command) => command('selector', {query: args})),

    title: N((context, tab) => [tab.title]),

    url: N((context, tab) => [tab.url]),
  };

  return forEachTabs(entries[name]);
}
