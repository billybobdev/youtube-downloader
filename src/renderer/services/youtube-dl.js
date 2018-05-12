import sysPath from 'path';
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
    '--no-playlist',
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
    args.push('--dump-json');
  } else {
    args.push('--newline');
  }

  if (opts.rateLimit) {
    args.push('-r', opts.rateLimit);
  }

  // args.push('--simulate');

  if (opts.outputDirectory) {
    args.push('-o', `${opts.outputDirectory}${sysPath.sep}${opts.outputTemplate}`);
  }

  args.push(url);

  log('Spawn: %s %o %o', url, opts, args);

  const em = new EventEmitter();

  let progress;

  const ytdl = spawn(ytdlBin, args);

  const rl = readline.createInterface({
    input: ytdl.stdout,
  });

  ytdl.stderr.on('data', (chunk) => {
    log('Stderr: %s', chunk.toString());
  });

  rl.on('line', (line) => {
    if (opts.dumpJson) {
      const json = JSON.parse(line);
      log('Info: %o', json);
      em.emit('info', json);
    } else {
      log('Stdout: %s', line);
      let matches = /\[download\] Destination: (.+)/.exec(line);

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

      matches = /\[download\]\s+([0-9]+)[0-9.]*% of (.+) at\s+(.+) ETA (.+)/.exec(line);

      if (matches) {
        progress.percent = parseInt(matches[1], 10);
        progress.size = matches[2];
        progress.rate = matches[3];
        progress.eta = matches[4];

        em.emit('progress', progress);

        return;
      }

      matches = /\[ffmpeg\] Destination: (.+)/.exec(line);

      if (matches) {
        progress = {
          action: 'ffmpeg',
          path: matches[1],
          percent: 0,
        };

        em.emit('progress', progress);
        return;
      }

      matches = /Deleting original file /.exec(line);

      if (matches) {
        progress.percent = 100;

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
