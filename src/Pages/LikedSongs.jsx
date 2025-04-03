import React, { useContext } from 'react';
import { FaPlay, FaPause, FaHeart, FaRegHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { dataContext } from '../context/context';
import musicImg from '../assets/musicanim.webp';

function LikedSongs() {
    const { 
        songs, 
        likedSongs, 
        playSelectedSong, 
        isPlaying, 
        index,
        toggleLike
    } = useContext(dataContext);
    
    // Filter songs that exist in both songs array and likedSongs array
    const likedSongsList = songs.filter(song => likedSongs.includes(song.id));
    
    return (
        <div className='w-full min-h-screen h-auto pt-[60px]' style={{ background: "#1B1833" }}>
            <div className='p-8'>
                {/* Updated counter to show the actual displayed songs count */}
                <h1 className='text-2xl font-bold text-white mb-6'>Liked Songs ({likedSongsList.length})</h1>
                
                {likedSongsList.length === 0 ? (
                    <p className='text-white'>No liked songs yet</p>
                ) : (
                    <div className='grid grid-cols-1 gap-3'>
                        {likedSongsList.map((song, listIndex) => {
                            const isCurrentSong = index === songs.findIndex(s => s.id === song.id);
                            
                            return (
                                <div 
                                    key={song.id} 
                                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${isCurrentSong ? 'bg-amber-100' : 'bg-white hover:bg-gray-100'}`}
                                    onClick={() => playSelectedSong(songs.findIndex(s => s.id === song.id))}
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
                                    <div className='flex items-center gap-2'>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleLike(song.id);
                                            }}
                                            className='text-lg'
                                        >
                                            {likedSongs.includes(song.id) ? (
                                                <FaHeart className='text-red-500' />
                                            ) : (
                                                <FaRegHeart className='text-gray-500' />
                                            )}
                                        </button>
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
                )}
            </div>
        </div>
    );
}

export default LikedSongs;