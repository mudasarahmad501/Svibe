import React from 'react';
import Home from './Pages/Home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Search from './Pages/Search';
import Playlist from './Pages/Playlists';
import Liked from './Pages/LikedSongs';
import Navbar from './components/Navbar';
import NowPlaying from './components/NowPlaying';

function App() {
  // Check if we're running in development or production
  const isProduction = process.env.NODE_ENV === 'production';
  // Set basename only for production if your app is served from /Svibe
  const basename = isProduction ? '/Svibe' : '/';

  return (
    <BrowserRouter basename={basename}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/playlist" element={<Playlist />} />
        <Route path="/liked" element={<Liked />} />
        
        {/* Add a catch-all route for unmatched paths */}
        <Route path="*" element={<Home />} />
      </Routes>
      <NowPlaying />
    </BrowserRouter>
  );
}

export default App;