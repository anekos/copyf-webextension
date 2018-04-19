


function main() {
  browser.runtime.onMessage.addListener(message => {
    if (message.command === 'selector') {
      let found = document.querySelector(message.query);
      return Promise.resolve(found ? found.textContent : '');
    } else if (message.command === 'attribute') {
      let found = document.querySelector(message.query);
      if (found)
        found = found.getAttribute(message.attribute);
      return Promise.resolve(found || '');
    }
  });
}


main();
