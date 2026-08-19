import React, { useState, useEffect, useRef, useCallback } from 'react';

const App = () => {
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [subscribedChannels, setSubscribedChannels] = useState(new Set());
  const videoRefs = useRef([]);
  const observerRef = useRef(null);
  const iframeRefs = useRef([]);

  // Initial video data
  const initialVideos = [
    {
      id: 1,
      embedId: 'uP-g5NzidSA',
      title: 'Patratu Valley Jharkhand travel places',
      views: '245K',
      timeAgo: '2 days ago',
      likes: '12K',
      comments: '842',
      channelName: 'Creative Shorts',
      channelInitial: 'C',
      subscribers: '1.2M',
      isLiked: false,
    },
    {
      id: 2,
      embedId: '9Ww7CGbihE0',
      title: 'Netarhat (Jharkhand) A picturesque hill station located in the Latehar district of Jharkhand',
      views: '189K',
      timeAgo: '1 week ago',
      likes: '8.5K',
      comments: '523',
      channelName: 'Travel Jharkhand',
      channelInitial: 'T',
      subscribers: '850K',
      isLiked: false,
    },
    {
      id: 3,
      embedId: 'lHueLGbi_pc',
      title: 'Palani waterfall Patratu Ranchi || #waterfall #ranchi #jharkhandtouristplace #youtubeshorts',
      views: '312K',
      timeAgo: '3 days ago',
      likes: '15K',
      comments: '1.2K',
      channelName: 'Nature Lovers',
      channelInitial: 'N',
      subscribers: '2.1M',
      isLiked: false,
    },
    {
      id: 4,
      embedId: '5f0I1KVFtgY',
      title: 'Heaven hill , jharkhand #jharkhand #jharkhandtourism #tourism #incredibleindia #ranchi',
      views: '156K',
      timeAgo: '5 days ago',
      likes: '7.3K',
      comments: '412',
      channelName: 'Explore India',
      channelInitial: 'E',
      subscribers: '1.5M',
      isLiked: false,
    },
    {
      id: 5,
      embedId: 'BduPbeuyGC4',
      title: 'Highest Peak Of Jharkhand ⛰️ #parasnath_hill #parasnath #jharkhand',
      views: '278K',
      timeAgo: '1 day ago',
      likes: '13K',
      comments: '956',
      channelName: 'Adventure Seekers',
      channelInitial: 'A',
      subscribers: '1.8M',
      isLiked: false,
    },
    {
      id: 6,
      embedId: '-qXLVLbZqLQ',
      title: 'Madhuban parasnath #parasnath_hill #tinujha #parasnathhill #madhuban #jharkhand #jaintemple',
      views: '198K',
      timeAgo: '4 days ago',
      likes: '9.2K',
      comments: '634',
      channelName: 'Spiritual Journeys',
      channelInitial: 'S',
      subscribers: '950K',
      isLiked: false,
    },
  ];

  // Initialize videos on component mount
  useEffect(() => {
    setVideos(initialVideos);
    videoRefs.current = videoRefs.current.slice(0, initialVideos.length);
    iframeRefs.current = iframeRefs.current.slice(0, initialVideos.length);
  }, []);

  // Function to navigate to next/previous video
  const navigateToVideo = useCallback((direction) => {
    const newIndex = direction === 'next' 
      ? Math.min(currentVideoIndex + 1, videos.length - 1)
      : Math.max(currentVideoIndex - 1, 0);
    
    if (newIndex !== currentVideoIndex) {
      setCurrentVideoIndex(newIndex);
      if (videoRefs.current[newIndex]) {
        videoRefs.current[newIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [currentVideoIndex, videos.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          navigateToVideo('next');
          break;
        case 'ArrowUp':
          event.preventDefault();
          navigateToVideo('prev');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateToVideo]);

  // Intersection Observer to detect which video is in view
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.6, // 60% of the video must be visible
    };

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index'));
          setCurrentVideoIndex(index);
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersect, options);

    videoRefs.current.forEach((videoEl) => {
      if (videoEl) {
        observerRef.current.observe(videoEl);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [videos]);

  // Control video playback based on current video index
  useEffect(() => {
    iframeRefs.current.forEach((iframe, index) => {
      if (iframe && iframe.contentWindow) {
        try {
          if (index === currentVideoIndex) {
            // Play current video
            iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          } else {
            // Pause all other videos
            iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          }
        } catch (error) {
          console.log('Could not control video playback:', error);
        }
      }
    });
  }, [currentVideoIndex]);

  // Load more videos function
  const loadMoreVideos = useCallback(() => {
    setLoading(true);

    setTimeout(() => {
      const currentLength = videos.length;
      if (currentLength >= 12) {
        setHasReachedEnd(true);
        setLoading(false);
        return;
      }

      const newVideos = initialVideos.map((video, index) => ({
        ...video,
        id: currentLength + index + 1,
      }));

      setVideos((prev) => [...prev, ...newVideos]);
      setLoading(false);
    }, 1500);
  }, [videos.length]);

  // Infinite scroll logic
  const handleScroll = useCallback(() => {
    if (loading || hasReachedEnd) return;

    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (documentHeight - scrollPosition - windowHeight < 300) {
      loadMoreVideos();
    }
  }, [loading, hasReachedEnd, loadMoreVideos]);

  // Set up scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Toggle like functionality
  const toggleLike = useCallback((videoId) => {
    setVideos((prev) =>
      prev.map((video) =>
        video.id === videoId ? { ...video, isLiked: !video.isLiked } : video
      )
    );
  }, []);

  // Subscribe functionality
  const toggleSubscribe = useCallback((channelName) => {
    setSubscribedChannels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(channelName)) {
        newSet.delete(channelName);
      } else {
        newSet.add(channelName);
      }
      return newSet;
    });
  }, []);

  // Video component for better code organization
  const VideoItem = React.memo(
    ({ video, index, isActive, toggleLike, toggleSubscribe, subscribedChannels }) => (
      <div
        ref={(el) => (videoRefs.current[index] = el)}
        data-index={index}
        className={`relative mb-2 rounded-xl overflow-hidden bg-gray-800 shadow-lg w-full transition-all duration-300 ${
          isActive ? 'opacity-100 ring-2 ring-red-500' : 'opacity-70'
        }`}
      >
        {/* Video Container */}
        <div className="relative w-full" style={{ paddingBottom: '177.8%' }}>
          <iframe
            ref={(el) => (iframeRefs.current[index] = el)}
            className="absolute top-0 left-0 w-full h-full rounded-t-xl"
            src={`https://www.youtube.com/embed/${video.embedId}?enablejsapi=1&mute=1&controls=1&modestbranding=1&rel=0&autoplay=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
          {/* {!isActive && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-lg font-semibold bg-black bg-opacity-70 px-4 py-2 rounded-full">
                ▶️ Scroll or use ↓ to play
              </div>
            </div>
          )} */}
        </div>

        {/* Video Info */}
        <div className="p-4">
          <h3 className="font-medium text-base mb-2 line-clamp-2">
            {video.title}
          </h3>
          <div className="flex justify-between text-gray-400 text-sm mb-3">
            <span>{video.views} views</span>
            <span>{video.timeAgo}</span>
          </div>

          {/* Video Actions */}
          <div className="flex justify-around py-3 border-t border-b border-gray-700 mb-3">
            <button
              onClick={() => toggleLike(video.id)}
              className={`flex flex-col items-center text-sm gap-1 transition-colors duration-200 ${
                video.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
              }`}
              aria-label={video.isLiked ? 'Unlike video' : 'Like video'}
            >
              <span className="text-xl" aria-hidden="true">❤️</span>
              <span>{video.likes}</span>
            </button>
            <div className="flex flex-col items-center text-gray-400 text-sm gap-1">
              <span className="text-xl" aria-hidden="true">💬</span>
              <span>{video.comments}</span>
            </div>
            <button
              className="flex flex-col items-center text-gray-400 text-sm gap-1 hover:text-white transition-colors duration-200"
              aria-label="Share video"
            >
              <span className="text-xl" aria-hidden="true">📤</span>
              <span>Share</span>
            </button>
            <button
              className="flex flex-col items-center text-gray-400 text-sm gap-1 hover:text-white transition-colors duration-200"
              aria-label="More options"
            >
              <span className="text-xl" aria-hidden="true">⋯</span>
            </button>
          </div>

          {/* Channel Info */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center font-bold text-lg">
              {video.channelInitial}
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{video.channelName}</div>
              <div className="text-xs text-gray-400">
                {video.subscribers} subscribers
              </div>
            </div>
            <button
              onClick={() => toggleSubscribe(video.channelName)}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                subscribedChannels.has(video.channelName)
                  ? 'bg-gray-600 text-white hover:bg-gray-500'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
              aria-label={
                subscribedChannels.has(video.channelName)
                  ? `Unsubscribe from ${video.channelName}`
                  : `Subscribe to ${video.channelName}`
              }
            >
              {subscribedChannels.has(video.channelName) ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>

          {/* Related Images Placeholder */}
          <div className="flex gap-2 overflow-x-auto">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-24 h-24 rounded-lg bg-gray-700 flex-shrink-0 hover:bg-gray-600 transition-colors duration-200"
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-gray-900 sticky top-0 z-50 border-b border-gray-700">
        <div className="flex items-center font-bold text-xl">
          <span className="text-red-600 mr-2" aria-hidden="true">▶️</span>
          <span>Explore</span>
        </div>
        <div className="flex items-center bg-gray-800 rounded-full px-4 py-2 w-96">
          {/* <span className="text-gray-400 mr-3" aria-hidden="true">🔍</span> */}
          <input
            type="text"
            placeholder="Search shorts..."
            className="bg-transparent border-none text-white w-full outline-none"
            aria-label="Search for shorts"
          />
        </div>
        {/* <div className="flex items-center gap-4">
          <button className="text-xl hover:text-red-400 transition-colors" aria-label="Upload video">📹</button>
          <button className="text-xl hover:text-red-400 transition-colors" aria-label="Notifications">🔔</button>
          <button className="text-xl hover:text-red-400 transition-colors" aria-label="Profile">👤</button>
        </div> */}
      </header>

      {/* Navigation Instructions */}
      {/* <div className="bg-gray-800 text-center py-2 text-sm text-gray-400">
        Use ↑↓ arrow keys or scroll to navigate between videos
      </div> */}

      {/* Video Feed */}
      <main className="flex flex-col items-center p-4 max-w-lg mx-auto pb-20">
        {videos.map((video, index) => (
          <VideoItem
            key={video.id}
            video={video}
            index={index}
            isActive={index === currentVideoIndex}
            toggleLike={toggleLike}
            toggleSubscribe={toggleSubscribe}
            subscribedChannels={subscribedChannels}
          />
        ))}

        {/* Loading Message */}
        {loading && (
          <div className="text-center py-8 text-red-400 text-lg animate-pulse">
            Loading more shorts...
          </div>
        )}

        {/* End Message */}
        {hasReachedEnd && (
          <div className="text-center py-8 text-green-400 text-lg">
            You're all caught up! Check back later for more shorts.
          </div>
        )}
      </main>

      {/* Navigation Controls (Mobile) */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 md:hidden">
        <button
          onClick={() => navigateToVideo('prev')}
          disabled={currentVideoIndex === 0}
          className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-full transition-all duration-200"
          aria-label="Previous video"
        >
          ↑
        </button>
        <button
          onClick={() => navigateToVideo('next')}
          disabled={currentVideoIndex >= videos.length - 1}
          className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-full transition-all duration-200"
          aria-label="Next video"
        >
          ↓
        </button>
      </div>
    </div>
  );
};

export default App;