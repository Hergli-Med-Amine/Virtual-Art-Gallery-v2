# Images Required for Virtual Art Gallery

Please add the following image files to this directory:

## Artwork Images:

### Current Paintings (optional - using external URLs by default):
If you want to use local images instead of external URLs, add these files:

1. **Filename**: `starry_night.jpg`
   - **Artwork**: La Nuit Étoilée by Vincent van Gogh
   - **Current**: Using Wikimedia Commons URL
   - **Local alternative**: High-resolution version for faster loading

2. **Filename**: `mona_lisa.jpg`
   - **Artwork**: La Joconde by Léonard de Vinci  
   - **Current**: Using Wikimedia Commons URL
   - **Local alternative**: High-resolution version for faster loading

3. **Filename**: `great_wave.jpg`
   - **Artwork**: La Grande Vague by Katsushika Hokusai
   - **Current**: Using Wikimedia Commons URL
   - **Local alternative**: High-resolution version for faster loading

4. **Filename**: `the_scream.jpg`
   - **Artwork**: Le Cri by Edvard Munch
   - **Current**: Using Wikimedia Commons URL
   - **Local alternative**: High-resolution version for faster loading

5. **Filename**: `guernica.jpg`
   - **Artwork**: Guernica by Pablo Picasso
   - **Current**: Using Wikimedia Commons URL
   - **Local alternative**: High-resolution version for faster loading

## Adding New Artwork Images:

When adding new paintings to the gallery:
- **Format**: JPG or PNG preferred
- **Size**: High resolution (minimum 1200px on longest side)
- **Quality**: Good quality for close inspection
- **Naming**: Use descriptive filenames (artist_title.jpg)
- **Copyright**: Ensure images are copyright-free or properly licensed

## Usage:
- Images in this folder can be referenced in `/assets/data/paintings.json`
- Update the `imageUrl` field to use local path: `assets/images/filename.jpg`
- Local images will load faster than external URLs
- Fallback: System will show colored rectangles if images fail to load

## Notes:
- Keep total file size reasonable for web loading
- Consider using WebP format for better compression (if supported)
- Test all images load correctly in the gallery
