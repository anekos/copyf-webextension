
export default {
  saveFormats: async function () {
    console.log('Save formats', JSON.parse(JSON.stringify(this.formats)));
    browser.storage.sync.set({formats: this.formats})
  },
}