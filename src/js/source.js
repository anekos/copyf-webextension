
import dateFormat from 'dateformat'
import URL from 'url-parse'



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


function split2(args) {
  let [_, head, tail] = args.trim().match(/(\S*)(?:\s+(.+))?/);
  return [head, tail];
}


function getUrlProperty(url, name, modifier) {
  try {
    let result = new URL(url)[name];
    return modifier ? modifier(result) : result;
  } catch (e) {
    return '';
  }
}


function urlProp(name, modifier) {
  return N((context, tab) => [getUrlProperty(tab.url, name, modifier)]);
}



export default (args, name) => {
  let entries = {
    attribute: I((context, tab, command) => {
      let [attribute, query] = split2(args);
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

  for (let name of 'host hostname port query hash protocol username password'.split(' ')) {
    let modifier = null;
    if (name === 'query' || name === 'hash')
      modifier = (url) => url.slice(1);
    entries[name] = urlProp(name, modifier);
  }

  return entries[name];
}
