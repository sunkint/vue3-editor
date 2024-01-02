import Quill from 'quill';
import VueEditor from './components/VueEditor.vue';

const version: string = '0.1.0-alpha.2';

// Declare install function executed by Vue.use()
export function install(app: any): void {
  // @ts-ignore
  if (install.installed) return;
  // @ts-ignore
  install.installed = true;

    app.component('VueEditor', VueEditor);
}

interface IVPlugin {
    install: (app: any) => void;
    version: string;
    Quill: typeof Quill;
    VueEditor: typeof VueEditor;
}

const VPlugin: IVPlugin = {
  install,
  version,
  Quill,
  VueEditor,
};

// Auto-install when vue is found (eg. in browser via <script> tag)
// let GlobalVue: any = null;
// if (typeof window !== 'undefined') {
//   GlobalVue = window.Vue;
// } else if (typeof global !== 'undefined') {
//   GlobalVue = global.Vue;
// }
// if (GlobalVue) {
//   GlobalVue.use(VPlugin);
// }

export default VPlugin;
export { VueEditor, Quill };
