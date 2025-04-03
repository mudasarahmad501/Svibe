import React, { useContext, useState, useEffect } from 'react';
import { MdSkipPrevious, MdSkipNext } from 'react-icons/md';
import { FaPlay, FaPause, FaHeart, FaRegHeart, FaList } from 'react-icons/fa';
import { dataContext } from '../context/context';
import musicImg from '../assets/musicanim.webp';

function Home() {
    const pulseAnimation = {
        animation: 'pulse 2s infinite',
        '@keyframes pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        }
    };
    
    const {
        isPlaying,
        PlaySong,
        PauseSong,
        songs,
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
        fullDuration,
        likedSongs,
        playlists,
        toggleLike,
        addToPlaylist,
        createPlaylist
    } = useContext(dataContext);

    const [currentPage, setCurrentPage] = useState(1);
    const songsPerPage = 10;
    const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(null);
    const [isChangingSong, setIsChangingSong] = useState(false);

    useEffect(() => {
        const newPage = Math.floor(index / songsPerPage) + 1;
        if (newPage !== currentPage) {
            setCurrentPage(newPage);
        }
    }, [index, songsPerPage]);

    const handleProgressChange = (e) => {
        const percent = e.target.value;
        const seekTime = (percent / 100) * duration;
        seekSong(seekTime);
    };

    const indexOfLastSong = currentPage * songsPerPage;
    const indexOfFirstSong = indexOfLastSong - songsPerPage;
    const currentSongs = songs.slice(indexOfFirstSong, indexOfLastSong);
    const totalPages = Math.ceil(songs.length / songsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const playSelectedSong = async (songIndex) => {
        const actualIndex = indexOfFirstSong + songIndex;
        
        try {
            setIsChangingSong(true);
            
            if (actualIndex !== index) {
                // If changing to a different song
                PauseSong(); // Pause current song first
                setIndex(actualIndex);
                seekSong(0);
                
                // Small delay to allow state to update
                await new Promise(resolve => setTimeout(resolve, 100));
                
                PlaySong();
            } else {
                // If same song, just toggle play/pause
                if (isPlaying) {
                    PauseSong();
                } else {
                    if (previewEnded) {
                        seekSong(0);
                    }
                    PlaySong();
                }
            }
        } catch (err) {
            console.error("Playback error:", err);
        } finally {
            setIsChangingSong(false);
        }
    };

    const handleLike = (songId, e) => {
        e.stopPropagation();
        toggleLike(songId);
    };

    const handleAddToPlaylist = (songId, playlistName, e) => {
        e.stopPropagation();
        addToPlaylist(songId, playlistName);
        setShowPlaylistDropdown(null);
    };

    const handleCreatePlaylist = (songId, e) => {
        e.stopPropagation();
        const newPlaylistName = prompt('Enter new playlist name:');
        if (newPlaylistName && newPlaylistName.trim()) {
            if (createPlaylist(newPlaylistName)) {
                addToPlaylist(songId, newPlaylistName);
            }
        }
        setShowPlaylistDropdown(null);
    };

    if (loading) {
        return <div className='w-full h-screen flex justify-center items-center bg-[#1B1833] text-white'>Loading...</div>;
    }

    if (error) {
        return <div className='w-full h-screen flex justify-center items-center bg-[#1B1833] text-white'>Error: {error}</div>;
    }

    if (songs.length === 0) {
        return <div className='w-full h-screen flex justify-center items-center bg-[#1B1833] text-white'>No songs available</div>;
    }

    const currentSong = songs[index];

    return (
        <div className='w-full min-h-screen flex flex-col bg-[#1B1833] pt-[60px]'>
            {/* Desktop Layout - Side by Side */}
            <div className='hidden md:flex w-full h-[calc(100vh-64px)]'>
                {/* Now Playing Section - Left Side */}
                <div className='w-1/2 flex flex-col gap-3 justify-center items-center p-4'>
                    <h1 className='text-white font-semibold text-lg'>Now Playing</h1>
                    
                    <div className='w-[300px] h-[300px] relative rounded-lg overflow-hidden'>
                        <img 
                            src={currentSong.album?.cover_big || musicImg} 
                            alt={currentSong.title} 
                            className="w-full h-full object-cover"
                        />
                        {isPlaying && (
                            <div className='w-full h-full bg-black flex justify-center items-center opacity-50 absolute top-0'>
                                <img className='w-[50%]' style={pulseAnimation} src={musicImg} alt="music playing" />
                            </div>
                        )}
                    </div>
                    
                    <div className='flex items-center gap-2'>
                        <h1 className='text-white text-2xl font-bold px-4'>{currentSong.title}</h1>
                        <button onClick={(e) => { e.stopPropagation(); toggleLike(currentSong.id); }}>
                            {likedSongs.includes(currentSong.id) ? (
                                <FaHeart className='text-red-500' />
                            ) : (
                                <FaRegHeart className='text-white' />
                            )}
                        </button>
                    </div>
                    
                    <p className='text-md px-4 text-[#F5F0CD]'>
                        {currentSong.artist?.name || 'Unknown Artist'}
                    </p>
                    
                    <div className='w-[80%] max-w-[400px]'>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={duration ? (currentTime / duration) * 100 : 0}
                            onChange={handleProgressChange}
                            className='w-full h-1 rounded-md bg-amber-100 cursor-pointer'
                        />
                        <div className='flex justify-between text-xs text-white mt-1'>
                            <span>{formatTime(currentTime)}</span>
                            <span>
                                {formatTime(fullDuration)}
                                {previewEnded && <span className='text-amber-100 ml-1'>(Preview ended)</span>}
                            </span>
                        </div>
                    </div>
                    
                    <div className='flex flex-col items-center gap-1'>
                        <div className='flex justify-center items-center gap-4 pt-3 text-xl text-white'>
                            <MdSkipPrevious 
                                className='text-2xl hover:text-pink-700 cursor-pointer'
                                onClick={prevSong}
                                disabled={isChangingSong}
                            />
                            <div className={`cursor-pointer w-[50px] h-[50px] bg-amber-100 text-pink-700 hover:bg-white flex justify-center items-center rounded-full ${isChangingSong ? 'opacity-50' : ''}`}>
                                {!isPlaying ? 
                                    <FaPlay onClick={isChangingSong ? null : PlaySong} /> : 
                                    <FaPause onClick={isChangingSong ? null : PauseSong} />
                                }
                            </div>
                            <MdSkipNext 
                                className='text-2xl hover:text-pink-700 cursor-pointer'
                                onClick={nextSong}
                                disabled={isChangingSong}
                            />
                        </div>
                        <div className='text-xs text-amber-100'>
                            {previewEnded ? (
                                <button onClick={() => seekSong(0)} className='hover:underline'>Replay Preview</button>
                            ) : (
                                <span>30-second preview</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Song List Section - Right Side */}
                <div className='w-1/2 h-full p-4 overflow-y-auto'>
                    <div className='grid grid-cols-1 gap-3'>
                        {currentSongs.map((song, i) => {
                            const isCurrentSong = index === indexOfFirstSong + i;
                            const isLiked = likedSongs.includes(song.id);
                            
                            return (
                                <div 
                                    key={song.id} 
                                    className={`flex items-center p-3 rounded-lg cursor-pointer ${isCurrentSong ? 'bg-amber-100' : 'bg-white hover:bg-gray-100'} ${isChangingSong && isCurrentSong ? 'opacity-70' : ''}`}
                                    onClick={() => !isChangingSong && playSelectedSong(i)}
                                >
                                    <img 
                                        src={song.album?.cover_small || musicImg} 
                                        alt={song.title} 
                                        className="w-12 h-12 rounded-md object-cover mr-3"
                                    />
                                    <div className='flex-1 min-w-0'>
                                        <h3 className={`text-sm font-medium truncate ${isCurrentSong ? 'text-gray-800' : 'text-gray-800'}`}>
                                            {song.title}
                                        </h3>
                                        <p className={`text-xs truncate ${isCurrentSong ? 'text-gray-700' : 'text-gray-600'}`}>
                                            {song.artist?.name || 'Unknown Artist'}
                                        </p>
                                    </div>
                                    <div className='flex items-center gap-2 ml-2'>
                                        <div 
                                            onClick={(e) => !isChangingSong && handleLike(song.id, e)}
                                            className='text-lg hover:scale-110'
                                        >
                                            {isLiked ? <FaHeart className='text-red-500' /> : <FaRegHeart className='text-gray-500' />}
                                        </div>
                                        
                                        <div className='relative'>
                                            <div 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowPlaylistDropdown(showPlaylistDropdown === song.id ? null : song.id);
                                                }}
                                                className='text-lg hover:scale-110'
                                            >
                                                <FaList className='text-gray-500' />
                                            </div>
                                            
                                            {showPlaylistDropdown === song.id && (
                                                <div className='absolute right-0 bottom-full mb-2 w-48 bg-white rounded-md shadow-lg z-10'>
                                                    <div className='p-2 border-b'>
                                                        <span className='text-xs font-semibold text-gray-700'>Add to playlist</span>
                                                    </div>
                                                    <div className='max-h-40 overflow-y-auto'>
                                                        {Object.keys(playlists)
                                                            .filter(name => name !== 'Favorites')
                                                            .map(playlistName => (
                                                                <div 
                                                                    key={playlistName}
                                                                    onClick={(e) => handleAddToPlaylist(song.id, playlistName, e)}
                                                                    className='px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex justify-between items-center'
                                                                >
                                                                    <span>{playlistName}</span>
                                                                    {playlists[playlistName]?.includes(song.id) && (
                                                                        <span className='text-xs text-green-500'>✓</span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                    </div>
                                                    <div 
                                                        onClick={(e) => handleCreatePlaylist(song.id, e)}
                                                        className='px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer text-blue-500 border-t'
                                                    >
                                                        + Create new playlist
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {isCurrentSong && isPlaying ? (
                                            <FaPause className='text-gray-700' />
                                        ) : (
                                            <FaPlay className='text-gray-700' />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {totalPages > 1 && (
                        <div className='flex justify-center mt-4'>
                            <nav className='flex items-center gap-1'>
                                <button 
                                    onClick={() => !isChangingSong && paginate(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1 || isChangingSong}
                                    className='px-3 py-1 rounded-md text-sm bg-white disabled:opacity-50'
                                >
                                    Prev
                                </button>
                                
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNumber;
                                    if (totalPages <= 5) {
                                        pageNumber = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNumber = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNumber = totalPages - 4 + i;
                                    } else {
                                        pageNumber = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => !isChangingSong && paginate(pageNumber)}
                                            className={`px-3 py-1 rounded-md text-sm ${currentPage === pageNumber ? 'bg-amber-100 text-gray-800 font-medium' : 'bg-white'} ${isChangingSong ? 'opacity-50' : ''}`}
                                            disabled={isChangingSong}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                })}
                                
                                <button 
                                    onClick={() => !isChangingSong && paginate(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages || isChangingSong}
                                    className='px-3 py-1 rounded-md text-sm bg-white disabled:opacity-50'
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Layout - Stacked */}
            <div className='md:hidden flex flex-col'>
                {/* Now Playing Section - Top */}
                <div className='w-full flex flex-col gap-3 justify-center items-center p-4 pt-2'>
                    <h1 className='text-white font-semibold text-lg'>Now Playing</h1>
                    
                    <div className='w-[250px] h-[250px] relative rounded-lg overflow-hidden'>
                        <img 
                            src={currentSong.album?.cover_big || musicImg} 
                            alt={currentSong.title} 
                            className="w-full h-full object-cover"
                        />
                        {isPlaying && (
                            <div className='w-full h-full bg-black flex justify-center items-center opacity-50 absolute top-0'>
                                <img className='w-[50%]' style={pulseAnimation} src={musicImg} alt="music playing" />
                            </div>
                        )}
                    </div>
                    
                    <div className='flex items-center gap-2'>
                        <h1 className='text-white text-2xl font-bold px-4'>{currentSong.title}</h1>
                        <button onClick={(e) => { e.stopPropagation(); toggleLike(currentSong.id); }}>
                            {likedSongs.includes(currentSong.id) ? (
                                <FaHeart className='text-red-500' />
                            ) : (
                                <FaRegHeart className='text-white' />
                            )}
                        </button>
                    </div>
                    
                    <p className='text-md px-4 text-[#F5F0CD]'>
                        {currentSong.artist?.name || 'Unknown Artist'}
                    </p>
                    
                    <div className='w-[80%] max-w-[400px]'>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={duration ? (currentTime / duration) * 100 : 0}
                            onChange={handleProgressChange}
                            className='w-full h-1 rounded-md bg-amber-100 cursor-pointer'
                        />
                        <div className='flex justify-between text-xs text-white mt-1'>
                            <span>{formatTime(currentTime)}</span>
                            <span>
                                {formatTime(fullDuration)}
                                {previewEnded && <span className='text-amber-100 ml-1'>(Preview ended)</span>}
                            </span>
                        </div>
                    </div>
                    
                    <div className='flex flex-col items-center gap-1'>
                        <div className='flex justify-center items-center gap-4 pt-3 text-xl text-white'>
                            <MdSkipPrevious 
                                className='text-2xl hover:text-pink-700 cursor-pointer'
                                onClick={prevSong}
                                disabled={isChangingSong}
                            />
                            <div className={`cursor-pointer w-[50px] h-[50px] bg-amber-100 text-pink-700 hover:bg-white flex justify-center items-center rounded-full ${isChangingSong ? 'opacity-50' : ''}`}>
                                {!isPlaying ? 
                                    <FaPlay onClick={isChangingSong ? null : PlaySong} /> : 
                                    <FaPause onClick={isChangingSong ? null : PauseSong} />
                                }
                            </div>
                            <MdSkipNext 
                                className='text-2xl hover:text-pink-700 cursor-pointer'
                                onClick={nextSong}
                                disabled={isChangingSong}
                            />
                        </div>
                        <div className='text-xs text-amber-100'>
                            {previewEnded ? (
                                <button onClick={() => seekSong(0)} className='hover:underline'>Replay Preview</button>
                            ) : (
                                <span>30-second preview</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Song List Section - Bottom (Always visible on mobile) */}
                <div className='w-full p-4 pb-[60px]'>
                    <div className=''>
                        <h2 className='text-xl font-bold mb-4 text-white'>Song List</h2>
                    
                        <div className='grid grid-cols-1 gap-3'>
                            {currentSongs.map((song, i) => {
                                const isCurrentSong = index === indexOfFirstSong + i;
                                const isLiked = likedSongs.includes(song.id);
                                
                                return (
                                    <div 
                                        key={song.id} 
                                        className={`flex items-center p-3 rounded-lg cursor-pointer ${isCurrentSong ? 'bg-amber-100' : 'bg-white hover:bg-gray-100'} ${isChangingSong && isCurrentSong ? 'opacity-70' : ''}`}
                                        onClick={() => !isChangingSong && playSelectedSong(i)}
                                    >
                                        <img 
                                            src={song.album?.cover_small || musicImg} 
                                            alt={song.title} 
                                            className="w-12 h-12 rounded-md object-cover mr-3"
                                        />
                                        <div className='flex-1 min-w-0'>
                                            <h3 className={`text-sm font-medium truncate ${isCurrentSong ? 'text-gray-800' : 'text-gray-800'}`}>
                                                {song.title}
                                            </h3>
                                            <p className={`text-xs truncate ${isCurrentSong ? 'text-gray-700' : 'text-gray-600'}`}>
                                                {song.artist?.name || 'Unknown Artist'}
                                            </p>
                                        </div>
                                        <div className='flex items-center gap-2 ml-2'>
                                            <div 
                                                onClick={(e) => !isChangingSong && handleLike(song.id, e)}
                                                className='text-lg hover:scale-110'
                                            >
                                                {isLiked ? <FaHeart className='text-red-500' /> : <FaRegHeart className='text-gray-500' />}
                                            </div>
                                            
                                            <div className='relative'>
                                                <div 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowPlaylistDropdown(showPlaylistDropdown === song.id ? null : song.id);
                                                    }}
                                                    className='text-lg hover:scale-110'
                                                >
                                                    <FaList className='text-gray-500' />
                                                </div>
                                                
                                                {showPlaylistDropdown === song.id && (
                                                    <div className='absolute right-0 bottom-full mb-2 w-48 bg-white rounded-md shadow-lg z-10'>
                                                        <div className='p-2 border-b'>
                                                            <span className='text-xs font-semibold text-gray-700'>Add to playlist</span>
                                                        </div>
                                                        <div className='max-h-40 overflow-y-auto'>
                                                            {Object.keys(playlists)
                                                                .filter(name => name !== 'Favorites')
                                                                .map(playlistName => (
                                                                    <div 
                                                                        key={playlistName}
                                                                        onClick={(e) => handleAddToPlaylist(song.id, playlistName, e)}
                                                                        className='px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex justify-between items-center'
                                                                    >
                                                                        <span>{playlistName}</span>
                                                                        {playlists[playlistName]?.includes(song.id) && (
                                                                            <span className='text-xs text-green-500'>✓</span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                        </div>
                                                        <div 
                                                            onClick={(e) => handleCreatePlaylist(song.id, e)}
                                                            className='px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer text-blue-500 border-t'
                                                        >
                                                            + Create new playlist
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {isCurrentSong && isPlaying ? (
                                                <FaPause className='text-gray-700' />
                                            ) : (
                                                <FaPlay className='text-gray-700' />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {totalPages > 1 && (
                            <div className='flex justify-center mt-4'>
                                <nav className='flex items-center gap-1'>
                                    <button 
                                        onClick={() => !isChangingSong && paginate(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1 || isChangingSong}
                                        className='px-3 py-1 rounded-md text-sm bg-white disabled:opacity-50'
                                    >
                                        Prev
                                    </button>
                                    
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNumber;
                                        if (totalPages <= 5) {
                                            pageNumber = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNumber = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNumber = totalPages - 4 + i;
                                        } else {
                                            pageNumber = currentPage - 2 + i;
                                        }
                                        
                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => !isChangingSong && paginate(pageNumber)}
                                                className={`px-3 py-1 rounded-md text-sm ${currentPage === pageNumber ? 'bg-amber-100 text-gray-800 font-medium' : 'bg-white'} ${isChangingSong ? 'opacity-50' : ''}`}
                                                disabled={isChangingSong}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}
                                    
                                    <button 
                                        onClick={() => !isChangingSong && paginate(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages || isChangingSong}
                                        className='px-3 py-1 rounded-md text-sm bg-white disabled:opacity-50'
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

export default Home;