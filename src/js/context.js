
export default tab => {
  return {
    tab,
    command: (name, options) => {
      let params = Object.assign({command: name}, options);
      return browser.tabs.sendMessage(tab.id, params);
    },
  };
}
