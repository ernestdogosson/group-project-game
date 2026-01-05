import React, { useEffect, useState } from 'react';
import { AudioManager } from '../utility/audioManager';
import '../min-audio.css';

// AudioControls component
// - UI to control the game's background music
// - Play/Pause button and a volume slider
// - Persists settings in localStorage so they survive reloads
export default function AudioControls() {
  // Initialize volume from localStorage
  const getInitialVolume = () => {
    const storedVol = localStorage.getItem('musicVolume');
    return storedVol !== null ? Number(storedVol) : 0.4;
  };
  
  // Track whether music is currently playing (for button label)
  const [isPlaying, setIsPlaying] = useState(false);
  // Track the slider value (0.0 - 1.0)
  const [volume, setVolume] = useState(getInitialVolume());

  useEffect(() => {
    // Apply the saved volume to the AudioManager
    try { AudioManager.setBgVolume(volume); } catch { /* ignore */ }
    
    // Load saved music-on flag from previous session
    const storedOn = localStorage.getItem('musicOn');
   
    if (storedOn === 'true') {
      try {
        AudioManager.playBg();
        const shouldPlay = true;
        
        setTimeout(() => {
          if (!AudioManager.isBgPlaying()) {
            localStorage.setItem('musicOn', 'false');
          } else if (shouldPlay) {
            setIsPlaying(true);
          }
        }, 400);
      } catch { /* ignore */ }
    }
  }, [volume]);

  
  // Toggle music play/pause when user clicks the button
  const togglePlay = () => {
    if (isPlaying) {
      try { AudioManager.pauseBg(); } catch { /* ignore */ }
      setIsPlaying(false);
      localStorage.setItem('musicOn', 'false');
    } else {
      try {
        AudioManager.playBg();
        setIsPlaying(true);
        localStorage.setItem('musicOn', 'true');
        // Verify playback actually started 
        setTimeout(() => {
          if (!AudioManager.isBgPlaying()) {
            setIsPlaying(false);
            localStorage.setItem('musicOn', 'false');
          }
        }, 400);
      } catch { /* ignore */ }
    }
  };

  // Called when the volume slider changes
  // - updates UI state
  // - tells AudioManager to set the new volume
  // - saves the preference
  const onVolumeChange = (e) => {
    const v = Number(e.target.value);
    setVolume(v);
    try { AudioManager.setBgVolume(v); } catch { /* ignore */ }
    localStorage.setItem('musicVolume', String(v));
  };

  
  // Minimal Pokémon themed layout: play/pause button + volume slider + percent label
  return (
    <div className='audio_controls'>
      {/* Play / Pause */}
      <button type="button" onClick={togglePlay} className='audio_controls_toggle'>
        {isPlaying ? 'Pause' : 'Play'}
      </button>

      {/* Volume slider and percentage */}
      <div className='audio_controls_volume-row'>
        <label className='normal-text'>Volume</label>
        <input
          className='pokeball-range'
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={onVolumeChange}
        />
        <span className='audio_controls_percent' >{Math.round(volume * 100)}%</span>
      </div>
    </div>
  );
}
