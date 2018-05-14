import sysPath from 'path';
import { remote } from 'electron'; // eslint-disable-line
import hasbin from 'hasbin';
import EventEmitter from 'events';
import readline from 'readline';
import { spawn } from 'child_process';
import debug from 'debug';

const log = debug('youtube-dl');

const ytdlBin = 'youtube-dl';
const ffmpegBin = 'ffmpeg';
const ffprobeBin = 'ffprobe';

function youtubeDL(url, opts) {
  opts = opts || {};

  const args = [
    '--ignore-config',
    '--ignore-errors',
    '--no-color',
    '--no-call-home',
    '--no-warnings',
  ];

  if (process.platform === 'win32') {
    args.push('--no-check-certificate');
  }

  if (!opts.outputTemplate) {
    opts.outputTemplate = '%(title)s-%(id)s.%(ext)s';
  }

  if (opts.noContinue) {
    args.push('--no-continue');
  }

  // args.push('--ffmpeg-location', sysPath.resolve(__static, 'bin'));

  if (opts.extractAudio) {
    args.push('-x');
  }

  if (opts.audioFormat) {
    args.push('--audio-format', opts.audioFormat);
  }

  if (opts.audioQuality) {
    args.push('--audio-quality', opts.audioQuality);
  }

  if (opts.format) {
    args.push('-f', opts.format);
  }

  if (opts.dumpJson) {
    args.push('--dump-single-json');
    args.push('--flat-playlist');
  } else {
    args.push('--newline');
    args.push('--no-playlist');
  }

  if (opts.rateLimit) {
    args.push('-r', opts.rateLimit);
  }

  // args.push('--simulate');

  if (opts.proxy) {
    args.push('--proxy', opts.proxy);
    log('Using proxy %s', opts.proxy);
  }

  if (opts.outputDirectory) {
    args.push('-o', `${opts.outputDirectory}${sysPath.sep}${opts.outputTemplate}`);
  }

  args.push(url);

  log('Spawn: %s %o %o', url, opts, args);

  const em = new EventEmitter();

  let progress;

  const ytdl = spawn(ytdlBin, args);

  const stdout = readline.createInterface({
    input: ytdl.stdout,
  });

  const stderr = readline.createInterface({
    input: ytdl.stderr,
  });

  stderr.on('line', (line) => {
    log('%cstderr:', '%s', 'color: red', line);
  });

  stdout.on('line', (line) => {
    if (opts.dumpJson && line.charAt(0) === '{') {
      try {
        const json = JSON.parse(line);
        log('Info: %o', json);
        em.emit('info', json);
      } catch (e) {
        log(line);
      }
    } else {
      let matches = /\[download] Destination: (.+)/.exec(line);

      if (matches) {
        progress = {
          action: 'download',
          path: matches[1],
          percent: 0,
          size: '',
          rate: '',
          eta: '',
        };

        em.emit('progress', progress);
        return;
      }

      matches = /\[download] (.+) has already been downloaded and merged/.exec(line);

      if (matches) {
        progress = {
          path: matches[1],
        };

        em.emit('progress', progress);

        return;
      }

      matches = /\[download]\s+([0-9]+)[0-9.]*% of (.+) at\s+(.+) ETA (.+)/.exec(line);

      if (matches) {
        progress.percent = parseInt(matches[1], 10);
        progress.size = matches[2];
        progress.rate = matches[3];
        progress.eta = matches[4];

        em.emit('progress', progress);

        return;
      }

      matches = /\[ffmpeg] Destination: (.+)/.exec(line);

      if (matches) {
        progress = {
          action: 'ffmpeg',
          path: matches[1],
          percent: 0,
        };

        em.emit('progress', progress);
        return;
      }

      matches = /\[ffmpeg] Merging formats into "(.+)"/.exec(line);

      if (matches) {
        progress = {
          action: 'ffmpeg',
          path: matches[1],
          percent: 0,
        };

        em.emit('progress', progress);
      }
    }
  });

  ytdl.on('close', (code) => {
    log('Exited: %o', code);
    return em.emit('close', code);
  });

  return em;
}

youtubeDL.checkBinaries = function checkBinaries() {
  return new Promise((resolve, reject) => {
    const result = {
      'youtube-dl': hasbin.sync(ytdlBin),
      ffmpeg: hasbin.sync(ffmpegBin),
      ffprobe: hasbin.sync(ffprobeBin),
    };

    if (Object.values(result).indexOf(false) !== -1) {
      return reject(result);
    }

    return resolve(result);
  });
};

export default youtubeDL;
