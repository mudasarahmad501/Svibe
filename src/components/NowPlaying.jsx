import React, { useContext, useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaTimes, FaHeart, FaRegHeart } from 'react-icons/fa';
import { dataContext } from '../context/context';
import musicImg from '../assets/musicanim.webp';

function NowPlaying() {
    const {
        songs,
        index,
        isPlaying,
        PlaySong,
        PauseSong,
        toggleLike,
        likedSongs,
        currentTime,
        duration,
        showNowPlaying,
        setShowNowPlaying,
        seekSong
    } = useContext(dataContext);

    const [isExpanded, setIsExpanded] = useState(false);
    const playerRef = useRef(null);
    const currentSong = songs[index];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isExpanded && playerRef.current && !playerRef.current.contains(e.target)) {
                setIsExpanded(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExpanded]);

    if (!currentSong || !showNowPlaying) return null;

    const togglePlayPause = (e) => {
        e.stopPropagation();
        if (isPlaying) {
            PauseSong();
        } else {
            PlaySong();
        }
    };

    const handleClose = (e) => {
        e.stopPropagation();
        PauseSong();
        seekSong(0);
        setShowNowPlaying(false);
        setIsExpanded(false);
    };

    const toggleExpand = (e) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <>
            {/* Mini Player */}
            <div 
                className={`fixed bottom-20 md:bottom-4  right-4 w-16 h-16 bg-white rounded-full shadow-lg z-50 overflow-hidden transition-all duration-300 cursor-pointer ${
                    isExpanded ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                }`}
                onClick={toggleExpand}
            >
                <div className="relative w-full h-full">
                    <img 
                        src={currentSong.album?.cover_small || musicImg} 
                        alt={currentSong.title} 
                        className="w-full h-full object-cover"
                        draggable="false"
                    />
                    <button 
                        onClick={togglePlayPause}
                        className="absolute bottom-0 right-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs"
                        aria-label={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? <FaPause /> : <FaPlay className="relative left-[1px]" />}
                    </button>
                </div>
            </div>

            {/* Expanded Player */}
            <div 
                ref={playerRef}
                className={`fixed bottom-20 md:bottom-4 right-0  md:right-4 w-80 bg-white rounded-lg shadow-lg z-50 overflow-hidden transition-all duration-300 transform ${
                    isExpanded ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Header with close button */}
                <div className="flex justify-between items-center p-3 bg-gray-100">
                    <h3 className="font-medium text-gray-800">Now Playing</h3>
                    <button 
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label="Close player"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                </div>
                
                {/* Player content */}
                <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <img 
                            src={currentSong.album?.cover_small || musicImg} 
                            alt={currentSong.title} 
                            className="w-12 h-12 rounded-md object-cover"
                            draggable="false"
                        />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate text-gray-800">
                                {currentSong.title}
                            </h4>
                            <p className="text-xs truncate text-gray-600">
                                {currentSong.artist?.name || 'Unknown Artist'}
                            </p>
                        </div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleLike(currentSong.id);
                            }}
                            className="text-lg hover:scale-110 transition-transform"
                            aria-label={likedSongs.includes(currentSong.id) ? "Unlike song" : "Like song"}
                        >
                            {likedSongs.includes(currentSong.id) ? (
                                <FaHeart className="text-red-500" />
                            ) : (
                                <FaRegHeart className="text-gray-500 hover:text-red-400 transition-colors" />
                            )}
                        </button>
                    </div>

                    <div className="mb-2">
                        <div className="h-1 bg-gray-200 rounded-full">
                            <div 
                                className="h-full bg-amber-500 rounded-full" 
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button 
                            onClick={togglePlayPause}
                            className="p-3 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors flex items-center justify-center"
                            aria-label={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? (
                                <FaPause className="text-sm" />
                            ) : (
                                <FaPlay className="text-sm relative left-[1px]" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default NowPlaying;