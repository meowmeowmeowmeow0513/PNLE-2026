
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { NavigationItem } from '../types';

interface GlobalYoutubePlayerProps {
  activeItem: NavigationItem;
}

const GlobalYoutubePlayer: React.FC<GlobalYoutubePlayerProps> = ({ activeItem }) => {
  // We use a state to force re-evaluation of the portal target
  const [targetNode, setTargetNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Function to find the target
    const findTarget = () => {
      if (activeItem === 'Pomodoro Timer') {
        const placeholder = document.getElementById('video-placeholder');
        if (placeholder) return placeholder;
      }
      // Fallback to body (hidden) if not on Pomodoro page or placeholder not ready
      return document.body;
    };

    // Small delay to allow Pomodoro component to mount its div
    const timer = setTimeout(() => {
      setTargetNode(findTarget());
    }, 100);

    return () => clearTimeout(timer);
  }, [activeItem]);

  // Styles for when the player is "hidden" (active in background)
  const hiddenStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: '-9999px',
    width: '1px',
    height: '1px',
    opacity: 0,
    pointerEvents: 'none',
    zIndex: -1,
  };

  // Styles for when the player is visible in the Pomodoro page
  const visibleStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: '12px',
    display: 'block',
  };

  const isPomodoro = activeItem === 'Pomodoro Timer' && targetNode?.id === 'video-placeholder';

  const content = (
    <div style={isPomodoro ? visibleStyle : hiddenStyle}>
      <iframe 
        width="100%" 
        height="100%" 
        src="https://www.youtube.com/embed/videoseries?list=PLxoZGx3mVZsxJgQlgxSOBn6zCONGfl6Tm&enablejsapi=1" 
        title="Study Playlist" 
        frameBorder="0" 
        style={{ borderRadius: '12px', width: '100%', height: '100%' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        referrerPolicy="strict-origin-when-cross-origin" 
        allowFullScreen
      ></iframe>
    </div>
  );

  if (!targetNode) return null;

  return ReactDOM.createPortal(content, targetNode);
};

export default GlobalYoutubePlayer;
