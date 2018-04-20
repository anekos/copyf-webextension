
export default (args) => ({
  title: context => context.tab.title,
  url: context => context.tab.url,
  date: context => DateFormat(args),
  selector: async context => {
    return browser.tabs.sendMessage(context.tab.id, {command: 'selector', query: args});
  }
});


