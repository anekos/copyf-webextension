
function main() {
  browser.runtime.onMessage.addListener(message => {
    if (message.command !== 'notify')
      return;

    chrome.notifications.create(
      'copyf',
      {
        type: 'basic',
        iconUrl: chrome.extension.getURL('icon/ic_content_copy_black_48px.svg'),
        title: 'copyf',
        message: message.content,
      });
  });
}


main();

