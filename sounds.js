// EnigmaSounds: Web Audio calming loops (no MP3s needed)
const EnigmaSounds = (() => {
  let ctx = null;
  let master = null;
  let current = null;
  let statusCb = () => {};

  let volume = 0.6;

  function setStatus(t){ try{ statusCb(t); }catch(e){} }

  function ensureCtx(){
    if (!ctx){
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = volume;
      master.connect(ctx.destination);
    }
    // iOS may suspend until user gesture; play() is called from a click so ok
    if (ctx.state === "suspended") ctx.resume();
  }

  function makeNoise(type="white"){
    // noise buffer
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === "white"){
      for (let i=0;i<bufferSize;i++) data[i] = (Math.random() * 2 - 1);
    } else if (type === "pink"){
      // simple pink noise approximation
      let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      for (let i=0;i<bufferSize;i++){
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;
        data[i] = pink * 0.11; // scale
      }
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1200;

    const gain = ctx.createGain();
    gain.gain.value = 0.45;

    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    src.start();
    return { stop: () => { try{ src.stop(); }catch(e){} } };
  }

  function makeOcean(){
    // ocean = filtered noise with slow amplitude movement
    const n = makeNoise("white");

    // add slow swell using an LFO on master? (safer: local gain)
    const swell = ctx.createGain();
    swell.gain.value = 0.35;
    swell.connect(master);

    // separate noise chain for ocean so we can modulate it
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i=0;i<bufferSize;i++) data[i] = (Math.random()*2 - 1);

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 220;
    bp.Q.value = 0.8;

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 900;

    const g = ctx.createGain();
    g.gain.value = 0.0;

    // LFO
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.08; // slow swell
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.35;
    lfo.connect(lfoGain);
    lfoGain.connect(g.gain);

    src.connect(bp);
    bp.connect(lp);
    lp.connect(g);
    g.connect(swell);

    lfo.start();
    src.start();

    return {
      stop: () => { try{ src.stop(); lfo.stop(); }catch(e){}; n.stop(); }
    };
  }

  function makeRain(){
    // rain = pink noise + slight highpass "spray"
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i=0;i<bufferSize;i++){
      // a bit spikier than pink/white
      const x = (Math.random()*2 - 1);
      data[i] = Math.tanh(x*2.2) * 0.9;
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 500;

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 4500;

    const g = ctx.createGain();
    g.gain.value = 0.35;

    src.connect(hp);
    hp.connect(lp);
    lp.connect(g);
    g.connect(master);
    src.start();

    return { stop: () => { try{ src.stop(); }catch(e){} } };
  }

  function makeWind(){
    // wind = lowpassed noise + gentle filter movement
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i=0;i<bufferSize;i++) data[i] = (Math.random()*2 - 1);

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 650;
    lp.Q.value = 0.7;

    const g = ctx.createGain();
    g.gain.value = 0.25;

    // LFO to move LP frequency slightly
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.05;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain);
    lfoGain.connect(lp.frequency);

    src.connect(lp);
    lp.connect(g);
    g.connect(master);

    lfo.start();
    src.start();

    return { stop: () => { try{ src.stop(); lfo.stop(); }catch(e){} } };
  }

  function makeForest(){
    // forest = low noise + occasional soft bird-like sine chirps
    const base = makeNoise("pink");

    const chirpGain = ctx.createGain();
    chirpGain.gain.value = 0.0;
    chirpGain.connect(master);

    let timer = null;

    function chirp(){
      const osc = ctx.createOscillator();
      osc.type = "sine";
      const g = ctx.createGain();
      g.gain.value = 0.0;

      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.12);

      g.gain.setValueAtTime(0.0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.02);
      g.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 0.18);

      osc.connect(g);
      g.connect(chirpGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }

    timer = setInterval(() => {
      if (Math.random() < 0.55) chirp();
    }, 1600);

    // reduce base a bit
    master.gain.value = volume;
    setTimeout(()=>{},0);

    return {
      stop: () => { base.stop(); if (timer) clearInterval(timer); }
    };
  }

  function makeChimes(){
    // chimes = gentle intervals of sine tones with reverb-like delay
    const out = ctx.createGain();
    out.gain.value = 0.35;
    out.connect(master);

    const delay = ctx.createDelay();
    delay.delayTime.value = 0.18;
    const fb = ctx.createGain();
    fb.gain.value = 0.35;
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(out);

    let timer = null;

    function strike(){
      const osc = ctx.createOscillator();
      osc.type = "sine";
      const g = ctx.createGain();
      g.gain.value = 0;

      const freqs = [392, 440, 523.25, 659.25, 784];
      const f = freqs[Math.floor(Math.random()*freqs.length)];
      osc.frequency.setValueAtTime(f, ctx.currentTime);

      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.6);

      osc.connect(g);
      g.connect(out);
      g.connect(delay);

      osc.start();
      osc.stop(ctx.currentTime + 1.7);
    }

    timer = setInterval(() => {
      strike();
    }, 1600);

    return { stop: () => { if (timer) clearInterval(timer); } };
  }

  function stop(){
    if (current && current.stop) current.stop();
    current = null;
    setStatus("Not playing");
  }

  function play(which){
    ensureCtx();
    stop();

    if (which === "rain") current = makeRain();
    else if (which === "ocean") current = makeOcean();
    else if (which === "forest") current = makeForest();
    else if (which === "wind") current = makeWind();
    else if (which === "white") current = makeNoise("white");
    else if (which === "pink") current = makeNoise("pink");
    else if (which === "chimes") current = makeChimes();
    else current = makeNoise("white");

    setStatus("Playing");
  }

  function setVolume(v){
    volume = Math.max(0, Math.min(1, v));
    if (master) master.gain.value = volume;
  }

  function onStatus(cb){ statusCb = cb || (()=>{}); }

  return { play, stop, setVolume, onStatus };
})();
