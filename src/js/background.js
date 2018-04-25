
function main() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command !== 'notify')
      return sendResponse(false);

    chrome.notifications.create(
      'copyf',
      {
        type: 'basic',
        iconUrl: chrome.extension.getURL('icon/ic_content_copy_black_48dp_1x.png'),
        title: 'copyf',
        message: message.content,
      }
    );

    return sendResponse(true);
  });
}


main();
