import React, { useState } from 'react';
import NavBar from './NavBar';
import Home from './Home';

const SearchTask = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div>
      <NavBar setSearchTerm={setSearchTerm} />
      <Home searchTerm={searchTerm} />
    </div>
  );
};

export default SearchTask;
