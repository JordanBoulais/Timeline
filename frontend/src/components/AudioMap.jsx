const images = import.meta.glob('../assets/*.mp3', { eager: true });
const AudioMap = {};
for (const path in images) {
  const fileName = path.split('/').pop();
  AudioMap[fileName] = images[path].default;
}
export default AudioMap;