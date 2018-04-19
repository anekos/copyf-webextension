

function main() {
  const actions = {
    selector: (message) => {
      let found = document.querySelector(message.query);
      return found ? found.textContent : '';
    },
    attribute: (message) => {
      let found = document.querySelector(message.query);
      if (found)
        found = found.getAttribute(message.attribute);
      return found || '';
    },
    selected: (message) => {
      return window.getSelection().toString();
    },
  };


  browser.runtime.onMessage.addListener(message => {
    return Promise.resolve(actions[message.command](message));
  });
}


main();
