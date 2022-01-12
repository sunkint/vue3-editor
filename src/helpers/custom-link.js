import Quill from 'quill';
const Link = Quill.import('formats/link');

export default class CustomLink extends Link {
  static sanitize(url) {
    const value = super.sanitize(url);
    if (value) {
      for (let i = 0; i < this.PROTOCOL_WHITELIST.length; i++)
        if (value.startsWith(this.PROTOCOL_WHITELIST[i])) {
          return value;
        }
        return `https://${value}`
    }
    return value;
  }
}
