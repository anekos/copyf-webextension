
export default {
  saveFormats: async function () {
    let formats = this.formats.map(it => Object.assign({}, it));
    formats.forEach(it => delete it.meta);
    console.log('Save formats', JSON.parse(JSON.stringify(formats)));
    return browser.storage.sync.set({formats})
  },

  isTarget: targetUrls => url => {
    if (!targetUrls)
      return true;

    let urls = targetUrls.split(/\n+/).filter(it => it.trim()).map(it => {
      try {
        return new RegExp(it);
      } catch (e) {
        return null;
      }
    }).filter(it => it);

    return urls.some(it => it.test(url));
  },
}
