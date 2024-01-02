<template>
  <div id="app">
    <VueEditor
      ref="vEditor"
      v-model="content"
      use-custom-image-handler
      use-markdown-shortcuts
      prepend-links-https
      @focus="onEditorFocus"
      @blur="onEditorBlur"
      @imageAdded="handleImageAdded"
      @image-removed="handleImageRemoved"
    />
    <div id="result" v-html="content"></div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { ref } from 'vue';
import Quill from 'quill';
import VueEditor from './components/VueEditor.vue';

const AlignStyle = Quill.import('attributors/style/align');
Quill.register(AlignStyle, true);

const BlockEmbed = Quill.import('blots/block/embed');

const CLIENT_ID = '993793b1d8d3e2e';

class ImageBlot extends BlockEmbed {
  static create(value: { url: string; id: string }) {
    const node = super.create();
    node.setAttribute('src', value.url);
    node.setAttribute('id', value.id);
    return node;
  }

  static value(node: HTMLImageElement) {
    return {
      url: node.getAttribute('src')!,
      id: node.getAttribute('id')!,
    };
  }
}

ImageBlot.blotName = 'image';
ImageBlot.tagName = 'img';
Quill.register(ImageBlot);

const content = ref('');

// @ts-ignore
const handleTextChange = (obj: any) => {
  console.log('TCL: handleTextChange -> obj', obj);
};

const onEditorBlur = (quill: Quill) => {
  console.log('editor blur!', quill);
};

const onEditorFocus = (quill: Quill) => {
  console.log('editor focus!', quill);
};

const handleImageAdded = async (file: File, Editor: Quill, cursorLocation: number) => {
  const formData = new FormData();
  formData.append('image', file);

  const { data } = await axios({
    url: 'https://api.imgur.com/3/image',
    method: 'POST',
    headers: { Authorization: 'Client-ID ' + CLIENT_ID },
    data: formData,
  });

  const { link, id } = data.data;
  Editor.insertEmbed(cursorLocation, 'image', { id, url: link }, Quill.sources.USER);
};

const handleImageRemoved = (image: { id: string }) => {
  console.log('handleImageRemoved -> image', image);
  // @ts-ignore
  deleteImage(image.id);
};
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
