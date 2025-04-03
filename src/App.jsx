import React from 'react'
import Home from './Pages/Home'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Search from './Pages/Search'
import Playlist from './Pages/Playlists'
import Liked from './Pages/LikedSongs'
import Navbar from './components/Navbar'
import NowPlaying from './components/NowPlaying';



function App() {
 

  return (
   <BrowserRouter>
   <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/search' element={<Search/>}/>
        <Route path='/playlist' element={<Playlist/>}/>
        <Route path='/liked' element={<Liked/>}/>
      </Routes>
      <NowPlaying />  
   </BrowserRouter>
  )
}

export default App
