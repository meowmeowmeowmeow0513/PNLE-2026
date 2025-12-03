import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { NavigationItem } from '../types';

interface GlobalYoutubePlayerProps {
  activeItem: NavigationItem;
}

const GlobalYoutubePlayer: React.FC<GlobalYoutubePlayerProps> = ({ activeItem }) => {
  const [targetNode, setTargetNode] = useState<HTMLElement | null>(null);

  // Poll for the placeholder in the DOM when on the Pomodoro page
  useEffect(() => {
    let interval: number;
    
    const findTarget = () => {
      if (activeItem === 'Pomodoro Timer') {
        const placeholder = document.getElementById('video-placeholder');
        if (placeholder) {
          setTargetNode(placeholder);
        }
      } else {
        setTargetNode(null); // Reset to null to trigger "Hidden Mode"
      }
    };

    findTarget();
    
    // Aggressive polling for the first second to catch the mount
    interval = window.setInterval(findTarget, 200);
    setTimeout(() => clearInterval(interval), 2000);

    return () => clearInterval(interval);
  }, [activeItem]);

  // The Player Content
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

  // 1. If we found the specific placeholder in the Pomodoro UI, Portal into it.
  if (activeItem === 'Pomodoro Timer' && targetNode) {
    return ReactDOM.createPortal(
      <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner animate-fade-in">
        {playerContent}
      </div>, 
      targetNode
    );
  }

  // 2. Otherwise, render in "Immortal Hidden Mode" (Fixed to body, invisible but active)
  // We do NOT use display: none, as that reloads the iframe in some browsers.
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: '1px',
        height: '1px',
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
