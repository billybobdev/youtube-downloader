<template>
<section class="section">
  <div class="content">

    <b-field>
      <div class="control">
        <span class="button is-static">Download</span>
      </div>
      <b-select v-model="config.action" placeholder="Action">
        <option value="downloadAudio">Audio</option>
        <option value="downloadVideo">Video</option>
      </b-select>
      <div class="control">
        <span class="button is-static">from</span>
      </div>
      <b-input v-model="url" placeholder="Youtube URL" expanded></b-input>

      <div class="control">
        <button class="button is-info" @click="$store.dispatch('checkUrl', url)">Go!</button>
      </div>
    </b-field>

    <b-field>
      <div class="control">
        <span class="button is-static">Save to</span>
      </div>
      <b-input v-model="config.outputDirectory" expanded readonly></b-input>
      <div class="control">
        <button class="button" @click="selectOutputDirectory">Select</button>
      </div>
      <div class="control">
        <button class="button" @click="$electron.remote.shell.openItem($store.state.config.outputDirectory)">Open</button>
      </div>
    </b-field>

    <b-field grouped>
      <b-field expanded>
        <div class="control">
          <span class="button is-static">Format</span>
        </div>
        <b-input v-model="config.format" expanded></b-input>
      </b-field>

      <b-field>
        <div class="control">
          <span class="button is-static">Audio Format</span>
        </div>
        <b-select v-model="config.audioFormat">
          <option value="mp3">MP3</option>
        </b-select>
      </b-field>

      <b-field>
        <div class="control">
          <span class="button is-static">Audio Quality</span>
        </div>
        <b-select v-model="config.audioQuality">
          <option value="3">Better</option>
          <option value="5">Default</option>
          <option value="7">Worse</option>
        </b-select>
      </b-field>

      <b-field>
        <div class="control">
          <span class="button is-static">Rate</span>
        </div>
        <b-select v-model="config.rateLimit">
          <option :value="null">Unlimited</option>
          <option value="300K">300K</option>
        </b-select>
      </b-field>


    </b-field>

  </div>

  <div class="queue">
    <div class="media" v-for="task in queue">
      <figure class="media-left">
        <p class="image is-128x128">
          <img :src="task.thumbnail">
        </p>
      </figure>
      <div class="media-content">
        <div class="content">
          <p>
            <strong>{{ task.title }}</strong> <small>{{ task.uploader }}</small>
          </p>

          <p>{{ task.description }}</p>

          <b-field class="no-mouse">
            <b-radio-button v-model="task.progress.action" native-value="queued" type="is-dark"><span>Queued</span></b-radio-button>
            <b-radio-button v-model="task.progress.action" native-value="download" type="is-info"><span>Downloading</span> <span class="icon" v-if="task.progress.action === 'download'"><i class="fa fa-spinner fa-spin"></i></span></b-radio-button>
            <b-radio-button v-model="task.progress.action" native-value="ffmpeg" type="is-warning"><span>Converting</span> <span class="icon" v-if="task.progress.action === 'ffmpeg'"><i class="fa fa-spinner fa-spin"></i></span></b-radio-button>
            <b-radio-button v-model="task.progress.action" native-value="complete" type="is-success"><span>Finished</span> <span class="icon" v-if="task.progress.action === 'complete'"><i class="fa fa-check"></i></span></b-radio-button>
          </b-field>

          <progress class="progress" v-if="task.progress.action === 'download'" :value="task.progress.percent" max="100"></progress>
        </div>
      </div>
    </div>
  </div>

</section>
</template>

<script>
import { cloneDeep } from 'lodash';

export default {
  data() {
    return {
      url: null,
      config: cloneDeep(this.$store.state.config),
    };
  },
  watch: {
    config: {
      handler(val) {
        this.$store.commit('setConfig', val);
      },
      deep: true,
    },
  },
  computed: {
    queue() {
      return this.$store.state.queue.slice().reverse();
    },
  },
  methods: {
    selectOutputDirectory() {
      this.$electron.remote.dialog.showOpenDialog({
        title: 'Save to directory',
        defaultPath: this.config.outputDirectory,
        properties: ['openDirectory'],
      }, (paths) => {
        if (paths && paths.length > 0) {
          this.config.outputDirectory = paths[0];
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.section {
  display: flex;
  flex-direction: column;

  > .content {
    flex: 0 0 auto;
  }

  > .queue {
    flex: 1;
    overflow-y: auto;
  }
}

.no-mouse {
  pointer-events: none;
}
</style>