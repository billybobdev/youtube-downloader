import sysPath from 'path';
import Vue from 'vue';
import Vuex from 'vuex';
import ytdl from '@/services/youtube-dl';
import { Toast } from 'buefy';
import async from 'async';
import { clone, cloneDeep } from 'lodash';
import { remote } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies

Vue.use(Vuex);

function taskRunner(task, cb) {
  const em = task.startFunc();

  task.commit('updateTaskProgress', { task, progress: { action: 'download', percent: 0 } });

  em.on('progress', progress => task.commit('updateTaskProgress', { task, progress }));
  em.on('close', (code) => {
    task.commit('updateTaskProgress', { task, progress: { action: 'complete' } });
    cb(null, code);
  });
}

const queue = async.queue(taskRunner, 1);

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    appState: 'ready',
    setup: null,
    config: Object.assign({
      action: 'downloadAudio',
      audioFormat: 'mp3',
      rateLimit: null,
      format: null,
      audioQuality: 5,
      outputDirectory: `${sysPath.join(remote.app.getPath('downloads'), 'youtube-downloader')}`,
    }, localStorage.config ? JSON.parse(localStorage.config) : {}),
    queue: [],
  },
  mutations: {
    setAppState(state, appState) {
      state.appState = appState;
    },
    setConfig(state, config) {
      state.config = cloneDeep(config);
      localStorage.config = JSON.stringify(cloneDeep(config));
    },
    setSetup(state, setup) {
      state.setup = setup;
    },
    addToQueue(state, { info, commit }) {
      const config = clone(state.config);
      const task = cloneDeep(info);

      task.commit = commit;
      task.progress = { action: 'queued' };
      task.action = config.action;

      const ytdlConfig = {
        outputDirectory: config.outputDirectory,
        rateLimit: config.rateLimit,
      };

      if (config.action === 'downloadAudio') {
        ytdlConfig.extractAudio = true;
        ytdlConfig.audioFormat = config.audioFormat;
        ytdlConfig.audioQuality = config.audioQuality;
      }

      if (config.action === 'downloadVideo') {
        ytdlConfig.format = config.format;
      }

      task.startFunc = function startTask() {
        Toast.open(`Downloading ${this.action === 'downloadAudio' ? 'audio' : 'video'} for "${this.title}"`);

        return ytdl(this.webpage_url, ytdlConfig);
      };

      queue.push(task);
      state.queue.push(task);
    },
    updateTaskProgress(state, { task, progress }) {
      const index = state.queue.indexOf(task);

      if (index !== -1) {
        Vue.set(task.progress, Object.assign(task.progress, progress));
        Vue.set(state.queue, index, task);
      }
    },
  },
  actions: {
    checkUrl({ state, commit }, url) {
      if (state.appState !== 'ready') {
        return;
      }

      if (!url || url === '' || url.indexOf('youtube.com') === -1) {
        commit('setAppState', 'error');

        setTimeout(() => {
          commit('setAppState', 'ready');
        }, 1600);

        return;
      }

      commit('setAppState', 'checking');

      const em = ytdl(url, { dumpJson: true });

      let videoInfo;

      em.on('info', (info) => {
        videoInfo = info;
      });

      em.on('close', (code) => {
        commit('setAppState', 'ready');
        if (code === 0) {
          commit('addToQueue', { info: videoInfo, commit });
        }
      });
    },
  },
});
