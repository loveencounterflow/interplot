/*### thx to https://gist.github.com/tomhicks/6cb5e827723c4eaef638bf9f7686d2d8

Copy this into the console of any web page that is interactive and doesn't
do hard reloads. You will hear your DOM changes as different pitches of
audio.

I have found this interesting for debugging, but also fun to hear web pages
render like UIs do in movies.
*/
// plink-plonk.js
const audioCtx = new window.AudioContext();
const observer = new MutationObserver(function(mutationsList) {
  // if ( audioCtx.state != 'running' ) { return; }
  const oscillator = audioCtx.createOscillator()
  oscillator.connect(audioCtx.destination)
  oscillator.type = "sine"
  oscillator.frequency.setValueAtTime( Math.log(mutationsList.length + 5) * 180, audioCtx.currentTime )
  oscillator.start();
  oscillator.stop( audioCtx.currentTime + 0.05 );
  })

observer.observe(document, {
  attributes: true,
  childList: true,
  subtree: true,
  characterData: true,
  })

