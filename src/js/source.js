
import dateFormat from 'dateformat'



function join(ary) {
  return ary.join('\n');
}



export default args => {
  return {
    attribute: context => {
      let [attribute, query] = args.split(/\s+/, 2);
      return context.command('attribute', {query, attribute}).then(join);
    },
    'const': context => args,
    date: context => dateFormat(args),
    property: context => {
      let [property, query] = args.split(/\s+/, 2);
      return context.command('property', {query, property}).then(join);
    },
    selected: context => context.command('selected', {}),
    selector: context => context.command('selector', {query: args}).then(join),
    title: context => context.tab.title,
    url: context => context.tab.url,
  }
}
