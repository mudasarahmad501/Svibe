import React from 'react'
import { AiFillHome } from "react-icons/ai";
import { FaSearch } from "react-icons/fa";
import { RiPlayListFill } from "react-icons/ri";
import { FaHeart } from "react-icons/fa";
import { Link } from 'react-router-dom';
function Navbar() {
  return (
    <div className='fixed z-[12000] w-full h-[60px] md:h-[60px] text-lg md:text-xl text-white bottom-0 md:top-0  flex gap-16  justify-around md:justify-center items-center' style={{background:"#1B1833"}}>
      <Link to={"/"}><AiFillHome /></Link> 
      <Link to={"/search"}><FaSearch /></Link>
      <Link to={"/playlist"}><RiPlayListFill /></Link>
      <Link to={"/liked"}><FaHeart /></Link>
    </div>
  )
}

export default Navbar
