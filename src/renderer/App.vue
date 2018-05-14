<template>
<div id="app" @dragenter="onDragEnter">
  <div id="dropzone" v-show="$store.state.appState === 'hover'" class="drop-zone" @dragleave="onDragLeave" @drop="onDrop"></div>
  <section class="hero is-bold" :class="{ 'is-info': $store.state.appState === 'ready', 'is-primary': $store.state.appState === 'checking', 'is-dark': $store.state.appState === 'hover', 'is-danger': $store.state.appState === 'error', 'is-warning': $store.state.appState === 'setup' }">
    <div class="hero-body">
      <h1 class="title">YouTube Downloader</h1>
      <h2 class="subtitle" v-if="$store.state.appState === 'ready'">Drag 'n Drop a YouTube URL here!</h2>
      <h2 class="subtitle" v-if="$store.state.appState === 'hover'">That's the ticket!</h2>
      <h2 class="subtitle" v-if="$store.state.appState === 'error'">Whoops, that wasn't a YouTube URL!</h2>
      <h2 class="subtitle" v-if="$store.state.appState === 'checking'">Checking URL...</h2>
      <h2 class="subtitle" v-if="$store.state.appState === 'setup'">Required software missing</h2>
    </div>
  </section>

  <router-view></router-view>

</div>
</template>

<script>
export default {
  name: 'youtube-downloader',
  data() {
    return {
      url: null,
    };
  },
  methods: {
    onDragEnter() {
      if (this.$store.state.appState !== 'hover') {
        this.$store.commit('setAppState', 'hover');
      }
    },
    onDragLeave() {
      this.$store.commit('setAppState', 'ready');
    },
    onDrop(event) {
      this.$store.commit('setAppState', 'ready');

      const url = event.dataTransfer.getData('text');

      this.$store.dispatch('checkUrl', url);
    },
  },
};
</script>

<style lang="scss">
@import "~bulma/sass/utilities/initial-variables";
@import "~bulma/sass/utilities/functions";

$section-padding: 1rem;

@import "~bulma";
@import "~buefy/src/scss/buefy";

html, body, #app {
  height: 100%;
  overflow: hidden;
}

#app {
  display: flex;
  flex-direction: column;
  position: relative;

  .drop-zone {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 200;
  }

  > * {
    flex: 0 0 auto;
  }

  > .section {
    flex: 1;
  }
}

@media (max-height: 700px){
  .hero-body {
    padding: 1rem 1.5rem;
  }
}
</style>
