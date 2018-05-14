<template>
<div class="modal-card">
  <div class="modal-card-head">
    <div class="modal-card-title">Playlist Detected</div>
  </div>
  <div class="modal-card-body">
    <div class="content">
      <p>The URL you provided includes a playlist of <strong>{{ urlInfo.entries.length }}</strong> videos.</p>

      <p>Do you want to download all <strong>{{ urlInfo.entries.length }}</strong> videos<span v-if="selectedVideo"> or just <strong>{{ selectedVideo.title }}</strong></span>?</p>
    </div>
  </div>
  <div class="modal-card-foot has-text-right">
    <button class="button" @click="$emit('close')">Cancel</button>
    <button class="button is-primary" v-if="selectedVideo" @click="$emit('close'); $emit('downloadOne', selectedVideo.id)">Download One</button>
    <button class="button is-primary" @click="$emit('close'); $emit('downloadAll', allVideos)">Download All</button>
  </div>
</div>
</template>

<script>
import { URL } from 'url';

export default {
  props: {
    urlInfo: {
      type: Object,
    },
  },
  computed: {
    selectedVideo() {
      const url = new URL(this.urlInfo.webpage_url);

      const videoId = url.searchParams.get('v');

      if (!videoId) {
        return null;
      }

      return this.urlInfo.entries.find(entry => entry.id === videoId);
    },
    allVideos() {
      return this.urlInfo.entries.map(entry => entry.id);
    },
  },
};
</script>

<style lang="scss" scoped>
.modal-card-foot {
  justify-content: flex-end;
}
</style>