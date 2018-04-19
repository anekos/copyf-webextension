
export default (args) => ({
  title: context => context.tab.title,
  url: context => context.tab.url,
  date: context => DateFormat(args),
  selector: context => {
    return browser.tabs.sendMessage(context.tab.id, {command: 'selector', query: args});
  },
  attribute: context => {
    console.log(args);
    let [attribute, query] = args.split(/\s+/, 2);
    return browser.tabs.sendMessage(context.tab.id, {command: 'attribute', query, attribute});
  },
});
