import React, { useState, useRef } from "react";
import { Heart, Edit3, Wifi, WifiOff, Camera, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { syncService } from "../lib/syncService";
import { db } from "../lib/db";
import { useMobile } from "../hooks/useMobile";
import { notificationService } from "../lib/notificationService";
import { cameraService } from "../lib/cameraService";
import { offlineStorage } from "../lib/offlineStorage";
import { sanitizeContent, sanitizeFeeling } from "../lib/sanitizer";
import { logger } from "../lib/logger";
import { ERROR_MESSAGES, INPUT_VALIDATION, MOOD_KEYWORDS } from "../lib/constants";
import { imageProcessor } from "../lib/imageProcessor";

const detectMood = (text: string): string => {
  const lowerText = text.toLowerCase();

  const matchesKeywords = (keywords: readonly string[]) =>
    keywords.some(keyword => lowerText.includes(keyword));

  if (matchesKeywords(MOOD_KEYWORDS.LONGING)) return "Longing";
  if (matchesKeywords(MOOD_KEYWORDS.HAPPY)) return "Happy";
  if (matchesKeywords(MOOD_KEYWORDS.SAD)) return "Sad";
  if (matchesKeywords(MOOD_KEYWORDS.EXCITED)) return "Excited";
  if (matchesKeywords(MOOD_KEYWORDS.NOSTALGIC)) return "Nostalgic";
  if (matchesKeywords(MOOD_KEYWORDS.HOPEFUL)) return "Hopeful";
  return "Reflective";
};

export default function QuickCapture() {
  const [content, setContent] = useState("");
  const [customDateTime, setCustomDateTime] = useState<Date | null>(null);
  const [isAdjustingTime, setIsAdjustingTime] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const { hapticNotification } = useMobile();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      logger.warn("Attempted to submit moment without authenticated user");
      return;
    }

    const sanitizedContent = sanitizeContent(content);

    if (sanitizedContent.length < INPUT_VALIDATION.MIN_CONTENT_LENGTH) {
      logger.warn("Attempted to submit empty or invalid content");
      return;
    }

    setIsSubmitting(true);

    try {
      const timestamp = (customDateTime || new Date()).toISOString();
      const detectedMood = sanitizeFeeling(detectMood(sanitizedContent));

      const momentData = {
        content: sanitizedContent,
        feeling: detectedMood,
        photo: photoDataUrl || undefined,
        created_at: timestamp,
        updated_at: timestamp,
        user_id: user.id,
        synced: 0,
      };

      const id = await db.moments.add(momentData);
      const savedMoment = await db.moments.get(id);

      if (!savedMoment) {
        throw new Error(ERROR_MESSAGES.SAVE_FAILED);
      }

      if (!isOnline) {
        await offlineStorage.saveMoment({
          content: momentData.content,
          feeling: momentData.feeling,
          photo: momentData.photo,
          created_at: momentData.created_at,
          user_id: momentData.user_id,
        });
      }

      setContent("");
      setCustomDateTime(null);
      setIsAdjustingTime(false);
      setPhotoDataUrl(null);

      if (isOnline) {
        syncService.syncOfflineData().catch((error) => {
          logger.error("Failed to trigger sync after moment capture", error);
        });
      }

      void notificationService.sendMomentCapturedNotification();
      void hapticNotification("Success");
    } catch (error) {
      logger.error("Failed to save moment", error);
      void hapticNotification("Error");
      alert(ERROR_MESSAGES.SAVE_FAILED);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayDate = customDateTime || new Date();

  const setTimePreset = (date: Date) => {
    setCustomDateTime(date);
  };

  const handleTakePhoto = async () => {
    if (!cameraService.isNativePlatform()) {
      handlePickPhoto();
      return;
    }

    try {
      setIsPhotoLoading(true);
      await hapticNotification("Warning");
      const result = await cameraService.takePhoto();
      if (result) {
        setPhotoDataUrl(result.dataUrl);
        await hapticNotification("Success");
      }
    } catch (error) {
      logger.error("Error taking photo", error);
      await hapticNotification("Error");
    } finally {
      setIsPhotoLoading(false);
    }
  };

  const handlePickPhoto = () => {
    if (!cameraService.isNativePlatform()) {
      fileInputRef.current?.click();
      return;
    }

    setIsPhotoLoading(true);

    cameraService.pickPhoto()
      .then(async (result) => {
        if (result) {
          setPhotoDataUrl(result.dataUrl);
          await hapticNotification("Success");
        }
      })
      .catch(async (error) => {
        logger.error("Error picking photo", error);
        await hapticNotification("Error");
      })
      .finally(() => {
        setIsPhotoLoading(false);
      });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsPhotoLoading(true);
      const processedImage = await imageProcessor.processImage(file);
      setPhotoDataUrl(processedImage.dataUrl);
      await hapticNotification("Success");
    } catch (error) {
      logger.error("Error processing file", error);
      await hapticNotification("Error");
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(ERROR_MESSAGES.UNSUPPORTED_FILE_TYPE);
      }
    } finally {
      setIsPhotoLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = async () => {
    setPhotoDataUrl(null);
    await hapticNotification("Success");
  };

  return (
    <section className="p-4 sm:p-6 relative z-10">
      <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-4 sm:p-6">
        {/* Hidden file input for web platforms */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {/* Network Status Indicator */}
        <div className="flex items-center justify-center mb-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
            isOnline 
              ? 'bg-green-100 text-green-700' 
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-medium text-neutral-900 mb-2">How are you feeling?</h2>
          <p className="text-neutral-500 text-sm">Capture this moment and make it last</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Time Adjuster */}
          <div className="flex items-center justify-between bg-neutral-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${isAdjustingTime ? 'bg-purple-500' : 'bg-neutral-400'}`}></div>
              <div>
                <div className="text-sm font-medium text-neutral-900">{format(displayDate, "EEEE, MMM d")}</div>
                <div className="text-xs text-neutral-500">{format(displayDate, "h:mm a")}</div>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setIsAdjustingTime(!isAdjustingTime)}
              className="h-8 px-3 text-xs text-purple-500 hover:bg-purple-50 font-medium rounded-md flex items-center"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              {isAdjustingTime ? "Use Now" : "Adjust"}
            </button>
          </div>
          
          {isAdjustingTime && (
             <div className="bg-neutral-50 rounded-xl p-4 space-y-4">
               <div className="text-center">
                  <h4 className="text-sm font-medium text-neutral-700 mb-1">When did this happen?</h4>
                  <p className="text-xs text-neutral-500">Choose a time that feels right</p>
                </div>
              <div className="grid grid-cols-2 gap-3">
                 <button type="button" onClick={() => setTimePreset(new Date(Date.now() - 3600000))} className="h-12 flex flex-col items-center justify-center border border-neutral-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-xs">1 hour ago</button>
                 <button type="button" onClick={() => setTimePreset(new Date(new Date().setHours(9,0,0,0)))} className="h-12 flex flex-col items-center justify-center border border-neutral-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-xs">This morning</button>
              </div>
               <div className="border-t border-neutral-200 pt-4">
                  <label htmlFor="datetime" className="text-sm font-medium text-neutral-700 mb-2 block">Or pick a specific time</label>
                  <input
                    id="datetime" type="datetime-local"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value) {
                        setCustomDateTime(null);
                        return;
                      }
                      const selectedDate = new Date(value);
                      if (!Number.isNaN(selectedDate.getTime())) {
                        setCustomDateTime(selectedDate);
                      }
                    }}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
             </div>
          )}

          {/* Photo Attachment */}
          {photoDataUrl ? (
            <div className="relative bg-neutral-50 rounded-xl overflow-hidden">
              <img 
                src={photoDataUrl} 
                alt="Attached" 
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleTakePhoto}
                disabled={isPhotoLoading || isSubmitting}
                className="flex-1 flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-neutral-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all disabled:opacity-50"
              >
                {isPhotoLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                ) : (
                  <Camera className="w-5 h-5 text-neutral-600" />
                )}
                <span className="text-sm font-medium text-neutral-700">Take Photo</span>
              </button>
              <button
                type="button"
                onClick={handlePickPhoto}
                disabled={isPhotoLoading || isSubmitting}
                className="flex-1 flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-neutral-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all disabled:opacity-50"
              >
                {isPhotoLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-neutral-600" />
                )}
                <span className="text-sm font-medium text-neutral-700">Choose Photo</span>
              </button>
            </div>
          )}
          
          {/* Text Area */}
          <div className="relative">
            <textarea 
              className="w-full h-32 p-4 border border-neutral-200 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-neutral-400"
              placeholder="What's on your mind? Every feeling matters..."
              value={content}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (inputValue.length <= INPUT_VALIDATION.MAX_CONTENT_LENGTH) {
                  setContent(inputValue);
                }
              }}
              disabled={isSubmitting}
              maxLength={INPUT_VALIDATION.MAX_CONTENT_LENGTH}
            />
          </div>
          
          {/* Submit Button */}
          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:transform-none"
            disabled={sanitizeContent(content).length < INPUT_VALIDATION.MIN_CONTENT_LENGTH || isSubmitting}
          >
            <Heart className="h-4 w-4 mr-2" />
            {isSubmitting ? "Capturing..." : "Capture this moment"}
          </button>
        </form>
      </div>
    </section>
  );
}
