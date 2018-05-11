import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store';
import ytdl from '@/services/youtube-dl';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'app',
      component: () => ytdl.checkBinaries()
        .then(() => require('@/components/YouTube').default)
        .catch((err) => {
          store.commit('setAppState', 'setup');
          store.commit('setSetup', err);
          return require('@/components/Setup').default;
        }),
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});
