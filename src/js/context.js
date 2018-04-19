
export default (tab) => {
  return {
    tab,
    command: function (name, options) {
      let params = Object.assign({command: name}, options);
      return browser.tabs.sendMessage(tab.id, params);
    },
  };
}
