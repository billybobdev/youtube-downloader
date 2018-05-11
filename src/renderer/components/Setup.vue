<template>
<section class="section">
  <div class="content">

    <p>Some or all of the following required software was not detected on your system. Please install the missing software, and make sure it is available in your system <em>$PATH</em>.</p>

    <dl v-for="(available, bin) in $store.state.setup">
      <dt :class="{ 'has-text-success': available, 'has-text-danger': !available }">{{ bin }} {{ available ? 'detected' : 'missing' }}</dt>
      <dd v-if="bin === 'youtube-dl'">youtube-dl is a command-line program to download videos from YouTube.com. Download from
        <a @click="$electron.shell.openExternal('http://rg3.github.io/youtube-dl/')">http://rg3.github.io/youtube-dl/</a></dd>
      <dd v-if="bin === 'ffmpeg'">A complete, cross-platform solution to record, convert and stream audio and video. Download from
        <a @click="$electron.shell.openExternal('https://www.ffmpeg.org/')">https://www.ffmpeg.org/</a></dd>
      <dd v-if="bin === 'ffprobe'">FFProbe is part of the FFmpeg software, but sometimes is packaged seperately. Download from
        <a @click="$electron.shell.openExternal('https://www.ffmpeg.org/')">https://www.ffmpeg.org/</a></dd>
    </dl>

    <p>Once you have installed the missing software, restart this application to continue.</p>
  </div>
</section>
</template>