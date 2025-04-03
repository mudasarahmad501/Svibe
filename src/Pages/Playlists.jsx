import React, { useContext, useState, useEffect } from 'react';
import { FaPlay, FaPause, FaHeart, FaRegHeart, FaTrash, FaBars, FaMusic } from 'react-icons/fa';
import { dataContext } from '../context/context';
import musicImg from '../assets/musicanim.webp';

function Playlists() {
    const { 
        songs, 
        playlists, 
        currentPlaylist, 
        setCurrentPlaylist,
        playSelectedSong,
        isPlaying, 
        index,
        likedSongs,
        removeFromPlaylist,
        toggleLike,
        createPlaylist,
        setPlaylists
    } = useContext(dataContext);
    
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [showSidebar, setShowSidebar] = useState(false);

    const validPlaylists = Object.keys(playlists).filter(name => name !== 'Favorites');

    useEffect(() => {
        if (validPlaylists.length > 0 && !validPlaylists.includes(currentPlaylist)) {
            setCurrentPlaylist(validPlaylists[0]);
        }
    }, [playlists]); 

    const handleCreatePlaylist = () => {
        if (newPlaylistName.trim()) {
            createPlaylist(newPlaylistName);
            setNewPlaylistName('');
            setShowSidebar(false);
        }
    };
    
    const handleDeletePlaylist = (playlistName) => {
        if (window.confirm(`Delete playlist "${playlistName}"?`)) {
            setPlaylists(prev => {
                const updated = { ...prev };
                delete updated[playlistName];
                return updated;
            });
        }
    };

    const playSelectedSongFromPlaylist = (songIndex) => {
        const globalIndex = songs.findIndex(s => s.id === playlists[currentPlaylist][songIndex]);
        if (globalIndex !== -1) {
            playSelectedSong(globalIndex);
        }
    };

    return (
        <div className='w-full min-h-screen flex flex-col md:flex-row pt-[70px] md:pt-[100px] bg-[#1B1833]'>
            <button 
                onClick={() => setShowSidebar(!showSidebar)}
                className='md:hidden fixed top-10 right-5 z-20 bg-amber-100 p-3 rounded-md'
            >
                <FaBars className='text-gray-800' />
            </button>
            
            <div className={`${showSidebar ? 'block' : 'hidden'} md:block w-full md:w-1/4 p-4 border-b md:border-r border-gray-700 bg-[#1B1833] z-10`}> 
                <h2 className='text-xl font-bold text-white mb-4'>Your Playlists</h2>
                <div className='mb-4 flex'>
                    <input
                        type="text"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        placeholder="New playlist name"
                        className='flex-1 px-2 py-1 text-sm rounded-l border outline-none bg-gray-700 text-white'
                    />
                    <button
                        onClick={handleCreatePlaylist}
                        className='bg-amber-100 text-gray-800 px-2 py-1 text-sm rounded-r hover:bg-amber-200'
                    >
                        Create
                    </button>
                </div>
                <div className='space-y-1 max-h-[300px] md:max-h-[70vh] overflow-y-auto'>
                    {validPlaylists.length === 0 ? (
                        <p className='text-gray-500 text-sm'>No playlists available</p>
                    ) : (
                        validPlaylists.map(name => (
                            <div
                                key={name}
                                className={`flex justify-between items-center p-2 rounded cursor-pointer ${currentPlaylist === name ? 'bg-amber-100 text-gray-800' : 'text-white hover:bg-gray-700'}`}
                            >
                                <div 
                                    className='flex-1'
                                    onClick={() => {
                                        setCurrentPlaylist(name);
                                        setShowSidebar(false);
                                    }}
                                >
                                    {name} ({playlists[name].length})
                                </div>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeletePlaylist(name);
                                    }}
                                    className='text-red-500 hover:text-red-700'
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            <div className='flex-1 p-4 md:p-8 overflow-y-auto max-h-[70vh] md:max-h-[80vh] flex flex-col items-start justify-start'>
                {validPlaylists.length > 0 ? (
                    <>
                        <h1 className='text-2xl font-bold text-white mb-6'>{currentPlaylist}</h1>
                        {playlists[currentPlaylist]?.length === 0 ? (
                            <p className='text-white'>This playlist is empty</p>
                        ) : (
                            <div className='w-full space-y-3 overflow-y-auto max-h-[60vh] pr-2'>
                                {playlists[currentPlaylist]?.map((songId, songIndex) => {
                                    const song = songs.find(s => s.id === songId);
                                    if (!song) return null;
                                    
                                    const isCurrentSong = index === songs.findIndex(s => s.id === song.id);
                                    const isLiked = likedSongs.includes(song.id);
                                    
                                    return (
                                        <div 
                                            key={song.id} 
                                            className={`flex items-center p-4 rounded-lg cursor-pointer w-full ${isCurrentSong ? 'bg-amber-100' : 'bg-white hover:bg-gray-100'}`}
                                            onClick={() => playSelectedSongFromPlaylist(songIndex)}
                                        >
                                            <img 
                                                src={song.album?.cover_small || musicImg} 
                                                alt={song.title} 
                                                className="w-16 h-16 rounded-md object-cover mr-4"
                                            />
                                            <div className='flex-1 min-w-0'>
                                                <h3 className={`text-lg font-medium truncate ${isCurrentSong ? 'text-gray-800' : 'text-gray-900'}`}>{song.title}</h3>
                                                <p className={`text-sm truncate ${isCurrentSong ? 'text-gray-700' : 'text-gray-600'}`}>{song.artist?.name || 'Unknown Artist'}</p>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <button onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }} className='text-xl hover:scale-110'>
                                                    {isLiked ? <FaHeart className='text-red-500' /> : <FaRegHeart className='text-gray-500' />}
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); removeFromPlaylist(song.id, currentPlaylist); }} className='text-red-500 hover:text-red-700 hover:scale-110'>
                                                    <FaTrash size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                ) : (
                    <p className='text-white text-lg font-semibold'>No playlists available</p>
                )}
            </div>
        </div>
    );
}
export default Playlists;