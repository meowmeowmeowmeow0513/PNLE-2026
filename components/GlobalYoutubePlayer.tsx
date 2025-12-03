import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { NavigationItem } from '../types';

interface GlobalYoutubePlayerProps {
  activeItem: NavigationItem;
}

const GlobalYoutubePlayer: React.FC<GlobalYoutubePlayerProps> = ({ activeItem }) => {
  const [targetNode, setTargetNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const findTarget = () => {
      // 1. Priority: Main Pomodoro Page Placeholder
      if (activeItem === 'Pomodoro Timer') {
        const mainPlaceholder = document.getElementById('video-placeholder');
        if (mainPlaceholder) {
          setTargetNode(mainPlaceholder);
          return;
        }
      }

      // 2. Fallback: Floating Timer Mini Player
      // We look for this even if activeItem is NOT Pomodoro Timer
      const miniPlaceholder = document.getElementById('mini-player-container');
      if (miniPlaceholder) {
        setTargetNode(miniPlaceholder);
      }
    };

    // Check immediately and poll briefly to handle mounting race conditions
    findTarget();
    const interval = setInterval(findTarget, 500);
    
    // Cleanup
    return () => clearInterval(interval);
  }, [activeItem]);

  const playerContent = (
    <iframe 
      width="100%" 
      height="100%" 
      src="https://www.youtube.com/embed/videoseries?list=PLxoZGx3mVZsxJgQlgxSOBn6zCONGfl6Tm&enablejsapi=1" 
      title="Study Playlist" 
      frameBorder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
      referrerPolicy="strict-origin-when-cross-origin" 
      allowFullScreen
      className="w-full h-full object-cover"
    />
  );

  // If we have a target (either main page or mini player), portal there.
  if (targetNode) {
    return ReactDOM.createPortal(
      <div className="w-full h-full animate-fade-in bg-black">
        {playerContent}
      </div>, 
      targetNode
    );
  }

  // Fallback (Should rarely happen if FloatingTimer is mounted)
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: '0px',
        height: '0px',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: -9999
      }}
      aria-hidden="true"
    >
      {playerContent}
    </div>
  );
};

export default GlobalYoutubePlayer;
