import React, { useContext, useState, useEffect } from 'react';
import { FaPlay, FaPause, FaHeart, FaRegHeart, FaSearch } from 'react-icons/fa';
import { dataContext } from '../context/context';
import musicImg from '../assets/musicanim.webp';
import debounce from 'lodash.debounce';
// import { debounce } from 'lodash';

function Search() {
    const { 
        songs: allSongs,
        playSelectedSong, 
        isPlaying, 
        index,
        toggleLike,
        likedSongs
    } = useContext(dataContext);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);

    // Debounced search function
    const debouncedSearch = debounce(async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        try {
            setIsSearching(true);
            setSearchError(null);
            
            // First check local songs
            const localResults = allSongs.filter(song => 
                song.title.toLowerCase().includes(query.toLowerCase()) ||
                song.artist?.name?.toLowerCase().includes(query.toLowerCase())
            );

            if (localResults.length > 0) {
                setSearchResults(localResults);
                setIsSearching(false);
                return;
            }

            // If no local results, search Deezer API
            const proxyUrl = 'https://corsproxy.io/?';
            const apiUrl = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=20`;
            const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
            
            if (!response.ok) throw new Error('Search failed');
            
            const data = await response.json();
            
            if (data.data) {
                const formattedResults = data.data.map(song => ({
                    ...song,
                    fullDuration: song.duration,
                    previewDuration: 30
                }));
                setSearchResults(formattedResults);
            } else {
                setSearchResults([]);
            }
        } catch (err) {
            console.error('Search error:', err);
            setSearchError(err.message);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, 500);

    useEffect(() => {
        debouncedSearch(searchQuery);
        return () => debouncedSearch.cancel();
    }, [searchQuery]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className='w-full min-h-screen h-auto pt-[60px]' style={{ background: "#1B1833" }}>
            <div className='p-8'>
                <h1 className='text-2xl font-bold text-white mb-6'>Search Songs</h1>
                
                {/* Search input */}
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        placeholder="Search for songs or artists..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>

                {/* Search status */}
                {isSearching && (
                    <p className="text-white mb-4">Searching...</p>
                )}

                {searchError && (
                    <p className="text-red-400 mb-4">Error: {searchError}</p>
                )}

                {/* Search results */}
                {searchQuery && !isSearching && (
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-4">
                            {searchResults.length > 0 
                                ? `Found ${searchResults.length} results` 
                                : 'No results found'}
                        </h2>
                        
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                            {searchResults.map((song) => {
                                // Find the index of this song in the main songs array if it exists
                                const mainIndex = allSongs.findIndex(s => s.id === song.id);
                                const isCurrentSong = index === mainIndex;
                                
                                return (
                                    <div 
                                        key={song.id} 
                                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${isCurrentSong ? 'bg-amber-100' : 'bg-white hover:bg-gray-100'}`}
                                        onClick={() => playSelectedSong(mainIndex !== -1 ? mainIndex : allSongs.length)}
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
                    </div>
                )}

                {/* Empty state */}
                {!searchQuery && !isSearching && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <FaSearch className="text-4xl text-gray-400 mb-4" />
                        <p className="text-white text-lg">Search for songs or artists</p>
                        <p className="text-gray-400 text-sm mt-2">Results will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Search;