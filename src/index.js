import Quill from "quill";
import VueEditor from "./components/VueEditor.vue";

const version = "0.1.0-alpha.1";

// Declare install function executed by Vue.use()
export function install(app) {
  if (install.installed) return;
  install.installed = true;

  app.component("VueEditor", VueEditor);
}

const VPlugin = {
  install,
  version,
  Quill,
  VueEditor,
};

// Auto-install when vue is found (eg. in browser via <script> tag)
// let GlobalVue = null;
// if (typeof window !== "undefined") {
//   GlobalVue = window.Vue;
// } else if (typeof global !== "undefined") {
//   GlobalVue = global.Vue;
// }
// if (GlobalVue) {
//   GlobalVue.use(VPlugin);
// }

export default VPlugin;
export { VueEditor, Quill };

/*************************************************/
