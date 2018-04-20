
import JQuery from 'jquery'


function id(it) {
  return it;
}

function qsel(selector) {
  return Array.from(JQuery(selector).get());
}


function main() {
  const actions = {
    selector: (message) => {
      return qsel(message.query).map(it => it.textContent).filter(id);
    },
    attribute: (message) => {
      return qsel(message.query)
        .map(it => it.getAttribute(message.attribute))
        .filter(id);
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
