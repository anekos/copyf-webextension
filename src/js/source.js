
export default (args) => {
  return {
    title: context => context.tab.title,
    url: context => context.tab.url,
    date: context => DateFormat(args),
    selector: context => {
      return context.command('selector', {query: args});
    },
    attribute: context => {
      let [attribute, query] = args.split(/\s+/, 2);
      return context.command('attribute', {query, attribute});
    },
    selected: context => {
      return context.command('selected', {});
    },
  }
}
