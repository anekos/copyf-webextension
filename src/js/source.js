
import dateFormat from 'dateformat'



function join(ary) {
  return ary.join('\n');
}


function inContent(f) {
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



export default args => {
  return {
    attribute: inContent((context, command) => {
      let [attribute, query] = args.split(/\s+/, 2);
      return command('attribute', {query, attribute}).then(join);
    }),
    'const': context => args,
    date: context => dateFormat(args),
    property: inContent((context, command) => {
      let [property, query] = args.split(/\s+/, 2);
      return command('property', {query, property}).then(join);
    }),
    selected: inContent((context, command) => command('selected', {})),
    selector: inContent((context, command) => command('selector', {query: args}).then(join)),
    title: context => context.tab.title,
    url: context => context.tab.url,
  }
}
