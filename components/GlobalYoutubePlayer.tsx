
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { NavigationItem } from '../types';

interface GlobalYoutubePlayerProps {
  activeItem: NavigationItem;
}

const GlobalYoutubePlayer: React.FC<GlobalYoutubePlayerProps> = ({ activeItem }) => {
  // We use a state to force re-evaluation of the portal target
  const [targetNode, setTargetNode] = useState<HTMLElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Function to find the target
    const findTarget = () => {
      // If we are on the Pomodoro page, try to find the placeholder
      if (activeItem === 'Pomodoro Timer') {
        const placeholder = document.getElementById('video-placeholder');
        if (placeholder) return placeholder;
      }
      // Fallback to body (hidden state) if not on Pomodoro page or placeholder not ready
      return document.body;
    };

    // Small delay/polling to allow Pomodoro component to mount its div
    const checkTarget = () => {
        const target = findTarget();
        setTargetNode(target);
        setIsReady(true);
    };

    // Initial check
    checkTarget();

    // Check again after short delay to catch mounting
    const timer = setTimeout(checkTarget, 100);
    const timer2 = setTimeout(checkTarget, 500);

    return () => {
        clearTimeout(timer);
        clearTimeout(timer2);
    };
  }, [activeItem]);

  // Styles for when the player is "hidden" (active in background, attached to body)
  const hiddenStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    right: 0,
    width: '1px',
    height: '1px',
    opacity: 0,
    pointerEvents: 'none',
    zIndex: -1,
  };

  // Styles for when the player is visible inside the Pomodoro placeholder
  const visibleStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'block',
    borderRadius: '0.75rem', // rounded-xl
    overflow: 'hidden',
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
        style={{ width: '100%', height: '100%', borderRadius: isPomodoro ? '0.75rem' : '0' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        referrerPolicy="strict-origin-when-cross-origin" 
        allowFullScreen
      ></iframe>
    </div>
  );

  if (!targetNode || !isReady) return null;

  return ReactDOM.createPortal(content, targetNode);
};

export default GlobalYoutubePlayer;
