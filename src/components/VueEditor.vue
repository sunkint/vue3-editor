<!-- eslint-disable no-unused-vars -->
<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue';
import Quill from 'quill';
import mergeDeep from '../helpers/merge-deep';
import MarkdownShortcuts from '../helpers/markdown-shortcuts';
import CustomLink from '../helpers/custom-link';

const defaultToolbar = [
  [{ header: [false, 1, 2, 3, 4, 5, 6] }],
  ['bold', 'italic', 'underline', 'strike'], // toggled buttons
  [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
  ['blockquote', 'code-block'],
  [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
  [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  ['link', 'image', 'video'],
  ['clean'], // remove formatting button
];

// @ts-ignore
const id = ref('quill-container');
const quill = ref<Quill>({} as Quill);
const fileInput = ref<HTMLElement>(null as unknown as HTMLElement);

const props = defineProps({
  id: String,
  placeholder: String,
  modelValue: String,
  disabled: Boolean,
  editorToolbar: { type: [Array, Object], default: () => [] },
  editorOptions: Object,
  useCustomImageHandler: Boolean,
  useMarkdownShortcuts: Boolean,
  prependLinksHttps: Boolean,
  customModules: Array,
});

const emits = defineEmits([
  'ready',
  'editor-change',
  'focus',
  'selection-change',
  'text-change',
  'blur',
  'input',
  'image-removed',
  'image-added',
  'update:modelValue',
]);

function setupQuillEditor () {
  let editorConfig = {
    debug: false,
    modules: setModules(),
    theme: 'snow',
    placeholder: props.placeholder ? props.placeholder : '',
    readOnly: props.disabled ? props.disabled : false,
  };

  prepareEditorConfig(editorConfig);
  quill.value = new Quill(getCurrentInstance()?.refs.quillContainer as Element, editorConfig);
};

function setModules() {
  let modules = {
    toolbar: props.editorToolbar.length ? props.editorToolbar : defaultToolbar,
  };
  if (props.useMarkdownShortcuts) {
    Quill.register('modules/markdownShortcuts', MarkdownShortcuts, true);
    // @ts-ignore
    modules['markdownShortcuts'] = {};
  }
  if (props.prependLinksHttps) {
    Quill.register('formats/link', CustomLink, true);
  }
  return modules;
};

function prepareEditorConfig (editorConfig: any) {
  if (Object.keys(props.editorOptions ?? {}).length > 0 && props.editorOptions?.constructor === Object) {
    if (props.editorOptions.modules && typeof props.editorOptions.modules.toolbar !== 'undefined') {
      delete editorConfig.modules.toolbar;
    }

    mergeDeep(editorConfig, props.editorOptions);
  }
};

function registerCustomModules(Quill: any): void {
      if (props.customModules !== undefined) {
        props.customModules.forEach((customModule: any) => {
          Quill.register('modules/' + customModule.alias, customModule.module);
        });
      }
    }

    function registerPrototypes ()  {
  // @ts-ignore
  Quill.prototype.getHTML = function() {
    return this.root.querySelector('.ql-editor')?.innerHTML;
  };
  // @ts-ignore
  Quill.prototype.getWordCount = function() {
    return this.root.querySelector('.ql-editor')?.textContent?.length;
  };
};

function registerEditorEventListeners  () {
  quill.value.on('text-change', handleTextChange);
  quill.value.on('selection-change', handleSelectionChange);
  listenForEditorEvent('text-change');
  listenForEditorEvent('selection-change');
  listenForEditorEvent('editor-change');
};

function listenForEditorEvent (type: string)  {
  // @ts-ignore
  quill.value.on(type, (...args) => emits(type, ...args));
};

function handleInitialContent () {
  if (props.modelValue) quill.value.root.innerHTML = props.modelValue;
};

function handleSelectionChange (range: any, oldRange: any) {
  if (!range && oldRange) emits('blur', quill.value);
  else if (range && !oldRange) emits('focus', quill.value);
};

function handleTextChange(delta: any, oldContents: any)  {
  let editorContent = quill.value.root.innerHTML === '<p><br></p>' ? '' : quill.value.root.innerHTML;
  emits('update:modelValue', editorContent);

  if (props.useCustomImageHandler) handleImageRemoved(delta, oldContents);
};

function handleImageRemoved (_delta: any, oldContents: any) {
  const currrentContents = quill.value.getContents();
  const deletedContents = currrentContents.diff(oldContents);
  const operations = deletedContents.ops;

  operations.map(operation => {
    if (operation.insert && operation.insert.hasOwnProperty('image')) {
      const { image } = operation.insert as Record<string, unknown>;
      emits('image-removed', image);
    }
  });
};

function checkForCustomImageHandler ()  {
  props.useCustomImageHandler === true ? setupCustomImageHandler() : '';
};

function setupCustomImageHandler  ()  {
  let toolbar = quill.value.getModule('toolbar');
  toolbar.addHandler('image', customImageHandler);
};

function customImageHandler ()  {
  fileInput.value.click();
};

function emitImageInfo ($event: Event)  {
  const resetUploader = function() {
    var uploader = document.getElementById('file-upload');
    if (uploader) {
      (uploader as HTMLInputElement).value = '';
    }
  };
  let file = ($event.target as HTMLInputElement)?.files?.[0];
  let Editor = quill.value;
  let range = Editor.getSelection();
  let cursorLocation = range ? range.index : 0;
  emits('image-added', file, Editor, cursorLocation, resetUploader);
};

onMounted(() => {
  registerCustomModules(Quill);
  registerPrototypes();
  initializeEditor();
});

onBeforeUnmount(() => {
  quill.value = {} as Quill;
  // delete quill.value;
});

watch(() => props.modelValue, (val) => {
  if (val != quill.value.root.innerHTML && !quill.value.hasFocus()) {
    quill.value.root.innerHTML = val ?? '';
  }
});

watch(() => props.disabled, (status) => {
  quill.value.enable(!status);
});

watch(() => props.useCustomImageHandler, checkForCustomImageHandler);

function initializeEditor  ()  {
  setupQuillEditor();
  checkForCustomImageHandler();
  handleInitialContent();
  registerEditorEventListeners();
  emits('ready', quill.value);
};
</script>

<template>
  <div class="quillWrapper">
    <slot name="toolbar"></slot>
    <div :id="props.id" ref="quillContainer"></div>
    <input
      v-if="props.useCustomImageHandler"
      id="file-upload"
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display:none;"
      @change="emitImageInfo($event)"
    />
  </div>
</template>

<style src="quill/dist/quill.snow.css"></style>
<style src="../assets/vue3-editor.scss" lang="scss"></style>
