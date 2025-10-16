# 📷 Camera & Photo Feature

This document covers the newly implemented camera and photo attachment feature in LogMoments.

## Overview

Users can now attach photos to their moments, with full support for:
- Native camera capture on mobile devices
- Photo library selection on mobile devices
- Web fallback using file upload
- Offline storage of photos in IndexedDB
- Cloud sync of photos via Supabase

## Architecture

### Data Flow

1. **Photo Capture**
   - User taps "Take Photo" or "Choose Photo"
   - On mobile: Capacitor Camera API opens native camera/gallery
   - On web: Hidden file input triggers browser file picker
   - Photo is converted to Data URL (base64)

2. **Storage**
   - Photo Data URL is stored in IndexedDB with the moment
   - When online, photo syncs to Supabase `moments.photo` column
   - Photos work offline and sync when connection restores

3. **Display**
   - Photos are displayed inline in moment cards
   - Full responsive design with object-fit cover
   - Graceful handling of missing photos

## Implementation Details

### New Files

- `src/lib/cameraService.ts` - Camera abstraction layer
- `SUPABASE_MIGRATION.sql` - Database migration for photo column
- `CAMERA_FEATURE.md` - This documentation

### Modified Files

- `src/lib/db.ts` - Added `photo?: string` to Moment interface
- `src/lib/syncService.ts` - Photo field syncing to/from Supabase
- `src/lib/offlineStorage.ts` - Added photo support to OfflineMoment
- `src/components/QuickCapture.tsx` - Photo capture UI and logic
- `src/components/MomentsTimeline.tsx` - Photo display
- `src/pages/Timeline.tsx` - Photo display
- `src/mobile.ts` - Camera permission request on app init
- `package.json` - Added @capacitor/filesystem dependency

## User Experience

### Capturing a Photo

1. Open the app and navigate to Quick Capture
2. Below the time adjuster, see two buttons:
   - **Take Photo** - Opens camera (mobile) or file picker (web)
   - **Choose Photo** - Opens gallery (mobile) or file picker (web)
3. Select or capture a photo
4. Photo appears as a preview above the text area
5. Click the X button to remove the photo if desired
6. Submit the moment normally - photo is included

### Viewing Photos

- Photos appear inline in moment cards on the Timeline
- Photos are shown in the MomentsTimeline component
- Full-width responsive images with rounded corners

## Technical Considerations

### Data URL Storage

Photos are stored as Data URLs (base64-encoded) for several reasons:

**Pros:**
- ✅ Works seamlessly with IndexedDB (no Blob handling)
- ✅ Direct sync with Supabase TEXT column
- ✅ Immediate preview without file system access
- ✅ Cross-platform compatibility

**Cons:**
- ⚠️ Larger storage size (base64 is ~33% larger than binary)
- ⚠️ Not ideal for very large images

**Recommendations:**
- Keep image quality at 80% (already configured)
- Consider future optimization: store full-res in Supabase Storage, thumbnails in DB
- For now, the simple Data URL approach is perfect for MVP

### Permissions

Camera permissions are requested on app initialization in `mobile.ts`:

```typescript
await cameraService.requestPermissions();
```

If permissions are denied, camera features gracefully fail and users can still use the app.

### Platform Differences

| Feature | iOS | Android | Web |
|---------|-----|---------|-----|
| Camera Capture | ✅ Native | ✅ Native | ❌ Falls back to gallery |
| Gallery Selection | ✅ Native | ✅ Native | ✅ File input |
| Photo Editing | ✅ Basic crop | ✅ Basic crop | ❌ |
| Permissions | Runtime | Runtime | Browser prompt |

## Future Enhancements

Possible improvements for the photo feature:

1. **Image Compression**
   - Add client-side image compression before storage
   - Use Canvas API to resize images to max dimensions
   - Further reduce Data URL size

2. **Supabase Storage Integration**
   - Store full-resolution images in Supabase Storage buckets
   - Keep thumbnails in the database for quick loading
   - Add CDN URLs for faster delivery

3. **Multiple Photos**
   - Allow multiple photo attachments per moment
   - Photo carousel/gallery view
   - Swipe gestures for photo navigation

4. **Photo Filters**
   - Apply Instagram-style filters
   - Black and white, sepia, vintage effects
   - Mood-based automatic filter suggestions

5. **Photo Metadata**
   - Extract and store EXIF data (date, location, camera)
   - Display photo capture date if different from moment date
   - Privacy controls for metadata

6. **Advanced Editing**
   - Crop and rotate tools
   - Text and sticker overlays
   - Drawing and markup tools

## Supabase Setup

To enable photo sync, run the migration:

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Run the contents of `SUPABASE_MIGRATION.sql`
4. Verify the `photo` column exists in the `moments` table

```sql
ALTER TABLE moments ADD COLUMN IF NOT EXISTS photo TEXT;
```

## Testing

### Test Camera Feature

1. **Mobile (iOS/Android)**
   ```bash
   npm run mobile:sync
   npm run mobile:android  # or mobile:ios
   ```

2. **Test Camera Capture**
   - Tap "Take Photo"
   - Grant camera permissions
   - Capture a photo
   - Verify preview appears
   - Submit moment
   - Check photo appears in timeline

3. **Test Gallery Selection**
   - Tap "Choose Photo"
   - Grant gallery permissions
   - Select an existing photo
   - Verify preview appears
   - Submit and verify

4. **Test Web Fallback**
   ```bash
   npm run dev
   ```
   - Open browser
   - Click camera buttons
   - Verify file picker opens
   - Select image file
   - Verify functionality

### Test Offline Sync

1. Turn off WiFi/mobile data
2. Capture moment with photo
3. Verify photo appears in IndexedDB
4. Turn on connectivity
5. Wait for auto-sync
6. Check Supabase - photo should appear

## Troubleshooting

### Camera Not Opening

- **Check permissions**: Settings > App > Permissions
- **iOS**: Ensure `NSCameraUsageDescription` in Info.plist
- **Android**: Ensure permissions in AndroidManifest.xml

### Photos Not Syncing

- Check network connection indicator
- Verify `moments.photo` column exists in Supabase
- Check browser console for sync errors
- Verify storage mode is set to "cloud" not "local"

### Photos Too Large

- Default quality is set to 80%
- Consider reducing in `cameraService.ts`:
  ```typescript
  quality: 60, // Lower = smaller file size
  ```

### File Input Not Working (Web)

- Check browser console for errors
- Verify file input accepts "image/*"
- Test with different image formats (JPG, PNG, WEBP)

## Performance

### Storage Impact

| Quality | Avg Size | Storage for 100 moments |
|---------|----------|-------------------------|
| 100% | ~800 KB | ~80 MB |
| 80% | ~200 KB | ~20 MB |
| 60% | ~100 KB | ~10 MB |

Current setting: 80% quality (good balance)

### Sync Performance

- Photos sync one at a time with each moment
- Large photos may take 2-5 seconds to sync
- Background sync continues even if app is closed (mobile)
- Progress is tracked in moment sync status

## Security & Privacy

- Photos are stored locally in IndexedDB (encrypted by browser)
- Supabase RLS policies protect photo data
- Photos are only visible to the moment's owner
- No photo analysis or processing by third parties
- Camera permissions can be revoked anytime in device settings

---

**Feature Status**: ✅ Fully Implemented  
**Version**: 1.0.0  
**Last Updated**: 2025-01-16
