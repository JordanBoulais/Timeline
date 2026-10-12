const images = import.meta.glob('../assets/*.png', { eager: true });
const imageMap = {};
for (const path in images) {
  const fileName = path.split('/').pop();
  imageMap[fileName] = images[path].default;
}

// Card images are displayed at 133x100, so use the small 266x200 webp thumbnails
// (generated from the originals) under the original card file name.
const thumbs = import.meta.glob('../assets/thumbs/*.webp', { eager: true });
for (const path in thumbs) {
  const stem = path.split('/').pop().replace(/\.webp$/, '');
  for (const ext of ['png', 'jpg']) {
    imageMap[`${stem}.${ext}`] = thumbs[path].default;
  }
  // Preload so cards display instantly when they first appear
  new Image().src = thumbs[path].default;
}

export default imageMap;
