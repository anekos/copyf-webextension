
export default {
  saveFormats: async function () {
    let formats = this.formats.map(it => Object.assign({}, it));
    formats.forEach(it => delete it.meta);
    console.log('Save formats', JSON.parse(JSON.stringify(formats)));
    return browser.storage.sync.set({formats})
  },
}
