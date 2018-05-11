<template>
<div id="app" @dragover.prevent.stop @drop.prevent.stop>
  <section class="hero is-bold" :class="{ 'is-info': $store.state.appState === 'ready', 'is-primary': $store.state.appState === 'checking', 'is-dark': $store.state.appState === 'hover', 'is-danger': $store.state.appState === 'error', 'is-warning': $store.state.appState === 'setup' }">
    <div class="hero-body"
         @dragover.prevent.stop="onDragOver"
         @dragleave="onDragLeave"
         @drop.prevent.stop="onDrop">
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
    onDragOver() {
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
@import "~bulma";
@import "~buefy/src/scss/buefy";

html, body, #app {
  height: 100%;
  overflow: hidden;
}

#app {
  display: flex;
  flex-direction: column;

  > * {
    flex: 0 0 auto;
  }

  > .section {
    flex: 1;
  }

  > .hero .hero-body > * {
    pointer-events: none;
  }
}
</style>
