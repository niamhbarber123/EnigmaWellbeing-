// EnigmaSounds: hybrid player
// - tries MP3 from /audio/<name>.mp3
// - if missing, falls back to WebAudio generated sound
const EnigmaSounds = (() => {
  let ctx = null;
  let master = null;
  let current = null;
  let statusCb = () => {};
  let volume = 0.6;

  let mp3 = null;

  function setStatus(t){ try{ statusCb(t); }catch(e){} }

  function ensureAudio(){
    if (!mp3){
      mp3 = new Audio();
      mp3.loop = true;
      mp3.preload = "auto";
    }
    mp3.volume = volume;
  }

  function ensureCtx(){
    if (!ctx){
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = volume;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
  }

  function stopAll(){
    // stop mp3
    if (mp3){
      try{ mp3.pause(); mp3.currentTime = 0; }catch(e){}
      mp3.src = "";
    }
    // stop generated
    if (current && current.stop) current.stop();
    current = null;
  }

  // -------- WebAudio generators --------
  function makeNoise(type="white"){
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === "white"){
      for (let i=0;i<bufferSize;i++) data[i] = (Math.random() * 2 - 1);
    } else {
      // pink noise approximation
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
        data[i] = pink * 0.11;
      }
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1200;

    const g = ctx.createGain();
    g.gain.value = 0.5;

    src.connect(lp);
    lp.connect(g);
    g.connect(master);

    src.start();
    return { stop: () => { try{ src.stop(); }catch(e){} } };
  }

  function makeOcean(){
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

    const g = ctx.createGain();
    g.gain.value = 0;

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.08;

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.35;

    lfo.connect(lfoGain);
    lfoGain.connect(g.gain);

    src.connect(bp);
    bp.connect(g);
    g.connect(master);

    lfo.start();
    src.start();
    return { stop: () => { try{ src.stop(); lfo.stop(); }catch(e){} } };
  }

  function makeWind(){
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

    const g = ctx.createGain();
    g.gain.value = 0.25;

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

  function makeChimes(){
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

    let timer = setInterval(() => {
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
    }, 1600);

    return { stop: () => { clearInterval(timer); } };
  }

  function makeFireplace(){
    // deeper filtered noise
    const n = makeNoise("pink");
    return n;
  }

  function makeForest(){
    const base = makeNoise("pink");
    let timer = setInterval(() => {
      if (Math.random() < 0.55){
        const osc = ctx.createOscillator();
        osc.type = "sine";
        const g = ctx.createGain();
        g.gain.value = 0;

        osc.frequency.setValueAtTime(650, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.12);

        g.gain.setValueAtTime(0.0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.02);
        g.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 0.18);

        osc.connect(g);
        g.connect(master);

        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    }, 1600);

    return { stop: () => { base.stop(); clearInterval(timer); } };
  }

  function makeMeditation(){
    // soft drone
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 110;

    const g = ctx.createGain();
    g.gain.value = 0.12;

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.08;

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.06;

    lfo.connect(lfoGain);
    lfoGain.connect(g.gain);

    osc.connect(g);
    g.connect(master);

    lfo.start();
    osc.start();

    return { stop: () => { try{ osc.stop(); lfo.stop(); }catch(e){} } };
  }

  // -------- public API --------
  async function play(name){
    // Always stop previous
    stopAll();

    // Try MP3 first (optional)
    ensureAudio();
    const mp3Url = `/Enigma-/audio/${name}.mp3`;
    mp3.src = mp3Url;

    try{
      // If MP3 exists + allowed by gesture, this will play
      await mp3.play();
      setStatus(`Playing (${name})`);
      return;
    } catch (e){
      // fallback to generated
    }

    // Generated fallback (works without any MP3s)
    ensureCtx();

    if (name === "rain") current = makeNoise("white");       // “rain-ish”
    else if (name === "ocean") current = makeOcean();
    else if (name === "forest") current = makeForest();
    else if (name === "fireplace") current = makeFireplace();
    else if (name === "wind") current = makeWind();
    else if (name === "white") current = makeNoise("white");
    else if (name === "pink") current = makeNoise("pink");
    else if (name === "chimes") current = makeChimes();
    else if (name === "meditation") current = makeMeditation();
    else current = makeNoise("white");

    setStatus(`Playing (${name})`);
  }

  function stop(){
    stopAll();
    setStatus("Not playing");
  }

  function setVolume(v){
    volume = Math.max(0, Math.min(1, v));
    if (master) master.gain.value = volume;
    if (mp3) mp3.volume = volume;
  }

  function onStatus(cb){ statusCb = cb || (()=>{}); }

  return { play, stop, setVolume, onStatus };
})();
