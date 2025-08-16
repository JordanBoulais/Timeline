const images = import.meta.glob('../assets/*.png', { eager: true });
const imageMap = {};
for (const path in images) {
  const fileName = path.split('/').pop();
  imageMap[fileName] = images[path].default;
}
export default imageMap;