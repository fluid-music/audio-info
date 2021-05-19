const fs = require('fs')
const path = require('path')
const wav = require('node-wav')
const essentia = require('essentia.js')

const FRAME_SIZE = 2048
const HOP_SIZE = 1024

const audioFileName = path.join(__dirname, 'elis-set-creation-tool', 'src1', 'outro.wav')
const audioFileData = fs.readFileSync(audioFileName)
const audio = wav.decode(audioFileData)

console.log(`sampleRate: ${audio.sampleRate} channelCount: ${audio.channelData.length}`)


// See EBU128 (LFU) loudness here: https://github.com/MTG/essentia.js-benchmarks/blob/master/node/benchmark_essentia_sync/loudnessEBUR128.js
// See RMS here: https://github.com/MTG/essentia.js-benchmarks/blob/master/node/benchmark_essentia_sync/rms.js
// See Windowed Spectral here: https://github.com/MTG/essentia.js-benchmarks/blob/master/node/benchmark_essentia_sync/all_time_domain_and_spectral_features.js#L67-L90

// Get RMS over time
const frames = essentia.FrameGenerator(audio.channelData[0], FRAME_SIZE, HOP_SIZE)
for (let i = 0; i < frames.size(); i++) {
  const frame = frames.get(i)
  const { rms } = essentia.RMS(frame)
  console.log(rms)
}
frames.delete()

// get EBU Loudness
const audioDataL = essentia.arrayToVector(audio.channelData[0])
const audioDataR = essentia.arrayToVector(audio.channelData[1])
const loudness = essentia.LoudnessEBUR128(audioDataL, audioDataR, undefined, audio.sampleRate)
console.log('integrated loudness', loudness.integratedLoudness)
console.log('loudness range', loudness.loudnessRange)
console.log('number of hops', loudness.momentaryLoudness.size(), loudness.shortTermLoudness.size())
audioDataL.delete()
audioDataR.delete()
loudness.momentaryLoudness.delete()
loudness.shortTermLoudness.delete()
