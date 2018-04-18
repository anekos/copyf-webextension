


function main() {
  browser.runtime.onMessage.addListener(message => {
    if (message.command === 'selector') {
      let found = document.querySelector(message.query);
      return Promise.resolve(found ? found.textContent : '');
    }
  });
}


main();
