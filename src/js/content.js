
import JQuery from 'jquery'

import './polyfill'



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

function getOgUrl() {
  let found = document.querySelector('meta[property="og:url"][content]')
  return found && head(found.getAttribute('content'))
}

function getCanonicalUrl() {
  let found = document.querySelector('link[rel="canonical"][href]')
  return found && head(found.getAttribute('href'))
}

function head(s) {
  if (typeof s === 'string')
    return s.split('\n')[0]
  else
    return s
}


function main() {
  const actions = {
    attribute: message => qsel(message.query).map(it => attribute(it, message.attribute)).filter(id),
    ping: message => 'pong',
    property: message => qsel(message.query).map(it => property(it, message.property)).filter(id),
    selected: message => [window.getSelection().toString()],
    selector: message => qsel(message.query).map(it => it.textContent).filter(id),
    'og-url': message => [getOgUrl() || document.location.href],
    'canonical-url': message => [getCanonicalUrl() || document.location.href],
    'x-url': message => [getCanonicalUrl() || getOgUrl() || document.location.href],
  };

  browser.runtime.onMessage.addListener((message, sender, callback) => callback(actions[message.command](message)))
}

main();
