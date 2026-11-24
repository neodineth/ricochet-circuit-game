'use strict';

function createGameAudio() {
  const hits = {
    Signature:    {wave:'triangle', start:255, end:130, length:.09, noise:790},
    'Arc Lance':  {wave:'sine', start:1280, end:565, length:.13, noise:2720},
    'Pulse Hammer': {wave:'triangle', start:143, end:46, length:.21, noise:460},
    'Twin Blades': {wave:'triangle', start:1060, end:460, length:.065, noise:4860, double:true},
    'Ion Drill': {wave:'sawtooth', start:385, end:146, length:.17, noise:1190},
    'Ember Saw': {wave:'square', start:208, end:104, length:.12, noise:1740},
    'Frost Sabre': {wave:'sine', start:1770, end:1060, length:.19, noise:6230, double:true},
    'Cinder Axe': {wave:'triangle', start:310, end:67, length:.145, noise:820},
    'Iron Mace': {wave:'square', start:156, end:44, length:.19, noise:305},
    'Jade Dagger': {wave:'triangle', start:2040, end:810, length:.065, noise:3540}
  };
  const melody = [69, null, 72, 76, null, 74, 72, null, 67, null, 71, 74, 76, null, 71, null];
  const roots = [45, 48, 43, 47];
  let context, musicBus, effectsBus, noiseBuffer;
  let musicEnabled = true, effectsEnabled = true, playing = false;
  let nextBeat = 0, beat = 0;
  const previousHit = new Map();

  function unlock() {
    const AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine || (!musicEnabled && !effectsEnabled)) return;
    if (!context) {
      try {
        context = new AudioEngine();
      } catch {
        return;
      }
      musicBus = context.createGain();
      musicBus.gain.value = 0;
      musicBus.connect(context.destination);
      effectsBus = context.createGain();
      effectsBus.gain.value = 0;
      effectsBus.connect(context.destination);
      noiseBuffer = context.createBuffer(1, Math.floor(context.sampleRate * .45), context.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    if (context.state !== 'running') context.resume().catch(() => {});
    applyLevels();
  }

  function applyLevels(finish=false) {
    if (!context) return;
    const now = context.currentTime;
    musicBus.gain.setTargetAtTime(musicEnabled && playing ? .21 : 0, now, .025);
    effectsBus.gain.setTargetAtTime(effectsEnabled && playing ? .42 : 0, now, finish ? .12 : .018);
  }

  function configure(music, effects) {
    musicEnabled = music;
    effectsEnabled = effects;
    applyLevels();
  }

  function setPlaying(active, finish=false) {
    if (playing === active) return;
    playing = active;
    if (active) {
      nextBeat = 0;
      previousHit.clear();
    }
    applyLevels(finish);
  }

  function tone(bus, wave, from, to, time, duration, level) {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(from, time);
    oscillator.frequency.exponentialRampToValueAtTime(to, time + duration);
    envelope.gain.setValueAtTime(.0001, time);
    envelope.gain.exponentialRampToValueAtTime(level, time + .008);
    envelope.gain.exponentialRampToValueAtTime(.0001, time + duration);
    oscillator.connect(envelope);
    envelope.connect(bus);
    oscillator.start(time);
    oscillator.stop(time + duration + .01);
  }

  function noise(frequency, time, duration, level) {
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    source.buffer = noiseBuffer;
    filter.type = 'bandpass';
    filter.frequency.value = frequency;
    filter.Q.value = .8;
    envelope.gain.setValueAtTime(level, time);
    envelope.gain.exponentialRampToValueAtTime(.0001, time + duration);
    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(effectsBus);
    source.start(time);
    source.stop(time + duration);
  }

  function hit(weapon) {
    if (!playing || !effectsEnabled || context?.state !== 'running') return;
    const now = context.currentTime;
    if (now - (previousHit.get(weapon) ?? -1) < .048) return;
    previousHit.set(weapon, now);
    const {wave, start, end, length, noise:frequency, double} = hits[weapon] ?? hits.Signature;
    tone(effectsBus, wave, start, end, now, length, .14);
    noise(frequency, now, length * .65, .12);
    if (double) tone(effectsBus, wave, start * 1.3, end * 1.2, now + .041, length * .7, .085);
  }

  function power(name, phase='start') {
    if (!playing || !effectsEnabled || context?.state !== 'running') return;
    const now = context.currentTime;
    const pulse = (wave, from, to, delay, length, level=.13) =>
      tone(effectsBus, wave, from, to, now + delay, length, level);
    switch (name) {
      case 'Thunder Circle':
        if (phase === 'impact') {
          pulse('sine', 115, 38, 0, .29, .17);
          noise(1100, now, .22, .20);
        } else pulse('triangle', 290, 740, 0, .34, .10);
        break;
      case 'Whirlwind':
        noise(phase === 'grab' ? 720 : 1500, now, .22, .13);
        pulse('sine', phase === 'grab' ? 240 : 440, 120, 0, .20, .10);
        break;
      case 'Flame Wave':
        if (phase === 'launch') {
          noise(900, now, .24, .14);
          pulse('triangle', 350, 95, 0, .20, .095);
        } else pulse('sine', 450, 670, 0, .09, .075);
        break;
      case 'Hammer Slam':
        if (phase === 'impact') {
          pulse('sine', 124, 36, 0, .30, .23);
          noise(480, now, .21, .20);
        } else pulse('triangle', 180, 510, 0, .27);
        break;
      case 'Drill Rush':
        if (phase === 'launch') {
          pulse('sawtooth', 470, 172, 0, .27);
          noise(2140, now, .24, .12);
        } else if (phase === 'impact') {
          pulse('triangle', 230, 72, 0, .12, .15);
        } else pulse('sawtooth', 104, 360, 0, .22);
        break;
      case 'Boomerang':
        if (phase === 'return') pulse('triangle', 1370, 440, 0, .26, .095);
        else pulse('sine', 620, 1420, 0, .15);
        break;
      case 'Bounce Grenade':
        if (phase === 'impact') {
          pulse('triangle', 172, 51, 0, .21, .21);
          noise(580, now, .19, .18);
        } else if (phase === 'bounce') pulse('sine', 590, 405, 0, .095);
        else pulse('sine', 240, 620, 0, .11);
        break;
      case 'Overdrive':
        pulse('square', 105, 345, 0, .32, .10);
        pulse('triangle', 300, 470, .16, .30, .095);
        noise(1840, now + .075, .34, .15);
        break;
      case 'Chemical Bomb':
        if (phase === 'land') {
          for (let i = 0; i < 5; i++) pulse('sine', 325 + i * 61, 208 + i * 26, i * .063, .145, .09);
          noise(715, now + .12, .19, .065);
        } else pulse('sine', 395, 290, 0, .13, .09);
        break;
      case 'Sentry Bot':
        if (phase === 'fire') {
          pulse('triangle', 1170, 690, 0, .045, .065);
        } else if (phase === 'land') {
          pulse('square', 660, 660, 0, .073, .085);
          pulse('square', 880, 680, .08, .15, .085);
        } else pulse('square', 440, 440, 0, .073, .085);
        break;
    }
  }

  function tick() {
    if (!playing || !musicEnabled || context?.state !== 'running') return;
    const now = context.currentTime;
    if (nextBeat < now) nextBeat = now + .025;
    const hz = note => 440 * 2 ** ((note - 69) / 12);
    while (nextBeat < now + .09) {
      const note = melody[beat % melody.length];
      if (note !== null) tone(musicBus, 'triangle', hz(note), hz(note), nextBeat, .21, .11);
      if (beat % 4 === 0) {
        const root = hz(roots[Math.floor(beat / 4) % roots.length]);
        tone(musicBus, 'sine', root, root, nextBeat, .62, .19);
      }
      if (beat % 4 === 2) tone(musicBus, 'sine', 86, 43, nextBeat, .12, .14);
      beat++;
      nextBeat += .245;
    }
  }

  return {unlock, configure, setPlaying, hit, power, tick};
}
