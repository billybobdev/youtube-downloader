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
        <b-input v-model="config.format" placeholder="bestvideo+bestaudio/best" expanded></b-input>
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
          <option v-for="o in ['300K', '600K', '800K', '1M', '2M', '5M']" :value="o">{{ o }}</option>
        </b-select>
      </b-field>


    </b-field>

  </div>

  <div class="card queue">
    <div class="card-header">
      <p class="card-header-title">Queue</p>
      <div class="card-header-icon">
        <span class="tag is-dark">{{ $store.getters['queuedCount'] }} queued</span>&nbsp;
        <span class="tag is-info">{{ $store.getters['downloadingCount'] }} downloading</span>&nbsp;
        <span class="tag is-warning">{{ $store.getters['convertingCount'] }} converting</span>&nbsp;
        <span class="tag is-success">{{ $store.getters['completedCount'] }} completed</span>
      </div>
    </div>
    <div class="card-content">

      <div class="task" v-for="task in queue">
        <div class="media">
          <figure class="media-left">
            <p class="image is-16by9">
              <img v-if="task.thumbnail" :src="task.thumbnail">
              <img v-if="!task.thumbnail" style="background-color: #ddd;">
            </p>
          </figure>
          <div class="media-content">

            <div class="level">
              <div class="level-left">
                <div class="level-item">
                  <div class="panel">
                    <div class="panel-item">
                      <a @click="$electron.remote.shell.openExternal(task.webpage_url)">{{ task.title }}</a><span v-if="task.duration"> ({{ task.duration | duration }})</span>
                    </div>
                    <div class="panel-item" v-if="task.uploader"><small>uploaded by <a @click="$electron.remote.shell.openExternal(task.uploader_url)">{{ task.uploader }}</a></small></div>
                  </div>
                </div>
              </div>

              <div class="level-right">
                <div class="level-item">
                  <div class="panel">
                    <div class="panel-item">
                      <b-field class="no-mouse">
                        <b-radio-button v-model="task.progress.action" native-value="queued" size="is-small" type="is-dark"><span>Queued</span></b-radio-button>
                        <b-radio-button v-model="task.progress.action" native-value="download" size="is-small" type="is-info"><span>Downloading</span> <span class="icon" v-if="task.progress.action === 'download'"><i class="fa fa-spinner fa-spin"></i></span></b-radio-button>
                        <b-radio-button v-model="task.progress.action" native-value="ffmpeg" size="is-small" type="is-warning"><span>Converting</span> <span class="icon" v-if="task.progress.action === 'ffmpeg'"><i class="fa fa-spinner fa-spin"></i></span></b-radio-button>
                        <b-radio-button v-model="task.progress.action" native-value="complete" size="is-small" type="is-success"><span>Completed</span></b-radio-button>
                      </b-field>
                    </div>
                    <div class="panel-item"><progress class="progress" v-if="task.progress.action === 'download'" :value="task.progress.percent" max="100"></progress></div>
                    <div class="panel-item has-text-right" style="font-size: 13px" v-if="task.progress.action === 'download'">
                      {{ task.progress.percent }}% of {{ task.progress.size }} at {{ task.progress.rate }} ETA {{ task.progress.eta }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="content">
              <p>{{ task.description }}</p>
            </div>
          </div>
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
    display: flex;
    flex-direction: column;

    .card-header {
      flex: 0 0 auto;
    }

    .card-content {
      flex: 1;
      overflow-y: auto;
    }
  }
}

.task {
  padding-bottom: 1em;
  margin-bottom: 1em;

  &:not(:last-child) {
    border-bottom: 1px solid #333;
  }

  .media {
    margin-bottom: 0;
  }
  .media-left {
    width: 200px;
  }

  .level {
    align-items: flex-start;
  }

  .progress {
    border-radius: 0;
  }
}

.no-mouse {
  pointer-events: none;
}
</style>