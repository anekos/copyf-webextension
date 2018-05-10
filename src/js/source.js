
import dateFormat from 'dateformat'



// In content and Array
function I(f) {
  let result = context => {
    let command = (name, options) => {
      let params = Object.assign({command: name}, options);
      return browser.tabs.sendMessage(context.tab.id, params);
    };

    return f(context, command);
  };

  result.useContent = true;
  return result;
}

// Not in content and Not promise
function N(f) {
  return context => Promise.resolve(f(context));
}


function split2(args) {
  let [_, head, tail] = args.trim().match(/(\S*)(?:\s+(.+))?/);
  return [head, tail];
}



export default args => {
  return {
    attribute: I((context, command) => {
      let [attribute, query] = split2(args);
      return command('attribute', {query, attribute});
    }),

    'const': N(context => [args]),

    date: N(context => [dateFormat(args)]),

    property: I((context, command) => {
      let [property, query] = split2(args);
      return command('property', {query, property});
    }),

    selected: I((context, command) => command('selected', {})),

    selector: I((context, command) => command('selector', {query: args})),

    title: N(context => [context.tab.title]),

    url: N(context => [context.tab.url]),
  }
}
