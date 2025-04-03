import React, { createContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';

export const dataContext = createContext();

function UserContext({ children }) {
    const audioRef = useRef(null);
    const [index, setIndex] = useState(0);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(30);
    const [isPlaying, setIsPlaying] = useState(false);
    const [previewEnded, setPreviewEnded] = useState(false);
    const [currentPlaylist, setCurrentPlaylist] = useState('Favorites');
    const [audioReady, setAudioReady] = useState(false);
    const [showNowPlaying, setShowNowPlaying] = useState(() => {
        const saved = localStorage.getItem('showNowPlaying');
        return saved !== null ? JSON.parse(saved) : true;
    });
    
    const [likedSongs, setLikedSongs] = useState(() => {
        const saved = localStorage.getItem('likedSongs');
        return saved ? JSON.parse(saved) : [];
    });
    
    const [playlists, setPlaylists] = useState(() => {
        const saved = localStorage.getItem('playlists');
        return saved ? JSON.parse(saved) : { 'Favorites': [] };
    });

    // Initialize audio element
    useEffect(() => {
        const audio = new Audio();
        audioRef.current = audio;
        audio.preload = 'auto';
        setAudioReady(true);
        
        return () => {
            audio.pause();
            audio.src = '';
            audio.remove();
            audioRef.current = null;
        };
    }, []);

    // Persist data to localStorage
    useEffect(() => {
        localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
        localStorage.setItem('playlists', JSON.stringify(playlists));
        localStorage.setItem('showNowPlaying', JSON.stringify(showNowPlaying));
    }, [likedSongs, playlists, showNowPlaying]);

    // Fetch songs
    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const proxyUrl = 'https://corsproxy.io/?';
                const apiUrl = 'https://api.deezer.com/chart/0/tracks?limit=300';
                const response = await axios.get(proxyUrl + encodeURIComponent(apiUrl));
                
                if (response.data?.data) {
                    setSongs(response.data.data.map(song => ({
                        ...song,
                        fullDuration: song.duration,
                        previewDuration: 30
                    })));
                }
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                console.error('Error fetching songs:', err);
            }
        };

        fetchSongs();
    }, []);

    // Audio event handlers
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !audioReady) return;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            if (audio.currentTime >= 29.5) {
                setPreviewEnded(true);
            }
        };

        const handleError = (err) => {
            console.error('Audio error:', err);
            setIsPlaying(false);
        };

        const handleEnded = () => {
            setPreviewEnded(true);
            nextSong();
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('error', handleError);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
        };
    }, [audioReady]);

    // Handle song changes
    useEffect(() => {
        if (!audioReady || songs.length === 0) return;

        const loadNewSong = async () => {
            try {
                const audio = audioRef.current;
                const song = songs[index];
                
                // Pause current playback
                audio.pause();
                
                // Reset and load new source
                audio.src = song.preview;
                audio.currentTime = 0;
                setCurrentTime(0);
                setPreviewEnded(false);
                
                // Load the new audio
                await new Promise((resolve, reject) => {
                    audio.onloadedmetadata = resolve;
                    audio.onerror = reject;
                    audio.load();
                });

                // If we were playing before, resume playback
                if (isPlaying) {
                    try {
                        await audio.play();
                    } catch (playErr) {
                        console.error('Auto-play failed:', playErr);
                    }
                }
            } catch (err) {
                console.error('Error loading song:', err);
                setIsPlaying(false);
            }
        };

        loadNewSong();
    }, [index, songs, audioReady]);

    const PlaySong = async () => {
        const audio = audioRef.current;
        if (!audio || !audioReady) return;
        
        try {
            if (previewEnded) {
                seekSong(0);
                setPreviewEnded(false);
            }

            await audio.play();
            setShowNowPlaying(true);
        } catch (err) {
            console.error('Playback failed:', err);
            setIsPlaying(false);
        }
    };

    const PauseSong = () => {
        const audio = audioRef.current;
        if (audio && audioReady) {
            audio.pause();
        }
    };

    const playSelectedSong = async (songIndex) => {
        if (songIndex === index) {
            // Toggle play/pause for current song
            if (isPlaying) {
                PauseSong();
            } else {
                await PlaySong();
            }
        } else {
            // Change to new song and play
            setIndex(songIndex);
            await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
            await PlaySong();
        }
    };

    const nextSong = () => {
        setIndex(prev => (prev + 1) % songs.length);
    };

    const prevSong = () => {
        setIndex(prev => (prev - 1 + songs.length) % songs.length);
    };

    const seekSong = (time) => {
        const audio = audioRef.current;
        if (audio && audioReady) {
            const seekTime = Math.min(time, duration);
            audio.currentTime = seekTime;
            setCurrentTime(seekTime);
            if (seekTime < 29.5) setPreviewEnded(false);
        }
    };

    const toggleLike = (songId) => {
        setLikedSongs(prev => 
            prev.includes(songId) 
                ? prev.filter(id => id !== songId) 
                : [...prev, songId]
        );
    };

    const addToPlaylist = (songId, playlistName) => {
        setPlaylists(prev => ({
            ...prev,
            [playlistName]: prev[playlistName] 
                ? [...new Set([...prev[playlistName], songId])]
                : [songId]
        }));
    };

    const removeFromPlaylist = (songId, playlistName) => {
        setPlaylists(prev => ({
            ...prev,
            [playlistName]: prev[playlistName].filter(id => id !== songId)
        }));
    };

    const deletePlaylist = (playlistName) => {
        setPlaylists(prev => {
            const newPlaylists = {...prev};
            delete newPlaylists[playlistName];
            return newPlaylists;
        });
    };

    const createPlaylist = (playlistName) => {
        if (!playlistName || !playlistName.trim()) return false;
        if (playlists[playlistName]) return false;
        
        setPlaylists(prev => ({
            ...prev,
            [playlistName]: []
        }));
        return true;
    };

    const value = {
        audioRef,
        isPlaying,
        PlaySong,
        PauseSong,
        songs,
        setSongs,
        index,
        setIndex,
        nextSong,
        prevSong,
        seekSong,
        currentTime,
        duration,
        loading,
        error,
        previewEnded,
        fullDuration: songs[index]?.fullDuration || 0,
        likedSongs,
        playlists,
        currentPlaylist,
        setCurrentPlaylist,
        setPlaylists,
        playSelectedSong,
        toggleLike,
        addToPlaylist,
        removeFromPlaylist,
        deletePlaylist,
        createPlaylist,
        showNowPlaying,
        setShowNowPlaying
    };

    return (
        <dataContext.Provider value={value}>
            {children}
        </dataContext.Provider>
    );
}

export default UserContext;