
import JQuery from 'jquery'

import Polyfill from './polyfill'



function id(it) {
  return it;
}

function qsel(selector) {
  return Array.from(JQuery(selector).get());
}

function attribute(element, name) {
  return element.getAttribute(name) || '';
}

function property(element, name) {
  return element[name] || '';
}



function main() {
  const actions = {
    selector: message => qsel(message.query).map(it => it.textContent).filter(id),
    attribute: message => qsel(message.query).map(it => attribute(it, message.attribute)).filter(id),
    property: message => qsel(message.query).map(it => property(it, message.property)).filter(id),
    selected: message => [window.getSelection().toString()],
  };

  chrome.runtime.onMessage.addListener((message, sender, callback) => callback(actions[message.command](message)))
}


main();
