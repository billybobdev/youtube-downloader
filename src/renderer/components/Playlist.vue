<template>
<div class="modal-card">
  <div class="modal-card-head">
    <div class="modal-card-title">Playlist Detected</div>
  </div>
  <div class="modal-card-body">
    <div class="content">
      <p>The URL you provided includes a playlist of <strong>{{ urlInfo.entries.length }}</strong> videos.</p>

      <b-table
        :data="videoList"
        :columns="columns"
        checkable
        :checked-rows.sync="checkedVideos">
      </b-table>
    </div>
  </div>
  <div class="modal-card-foot has-text-right">
    <button class="button" @click="$emit('close')">Cancel</button>
    <button class="button is-primary" @click="$emit('close'); $emit('download', selectedVideos)">Download {{ selectedVideos.length }}</button>
  </div>
</div>
</template>

<script>

/* eslint-disable */

import { URL } from 'url';

export default {
  props: {
    urlInfo: {
      type: Object,
    },
  },
  data() {
    return {
      checkedVideos: [],
      columns: [
        {
          field: 'index',
          label: 'Index',
          sortable: true,
        },
        {
          field: 'title',
          label: 'Title',
          sortable: true,
        },
      ],
    };
  },
  computed: {
    videoList() {
      return this.urlInfo.entries.map((entry, index) => { // eslint-disable-line arrow-body-style
        return {
          index,
          ...entry,
        };
      });
    },
    selectedVideos() {
      return this.checkedVideos.map(video => video.index).sort((a, b) => a - b);
    },
  },
  methods: {
    checkDefaultVideo() {
      const url = new URL(this.urlInfo.webpage_url);

      const videoId = url.searchParams.get('v');

      if (videoId){
        const videoInfo = this.videoList.find(entry => entry.id === videoId);

        if (videoInfo){
          this.checkedVideos.push(videoInfo);

          return;
        }
      }

      const index = url.searchParams.get('index');

      if (index){
        this.checkedVideos.push(this.videoList[index]);
      }
    },
  },
  created() {
    this.checkDefaultVideo();
  },
};
</script>

<style lang="scss" scoped>
.modal-card-body {
  overflow: hidden;
}

.b-table {
  overflow: auto;
  height: 300px;
}

.modal-card-foot {
  justify-content: flex-end;
}
</style>