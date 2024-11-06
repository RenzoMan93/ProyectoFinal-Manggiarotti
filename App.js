import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ItemListContainer from './ItemListContaineromponents/';
import ItemDetailContainer from './ItemDetailContaineromponents';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ItemListContainer />} />
        <Route path="/product/:id" element={<ItemDetailContainer />} />
      </Routes>
    </Router>
  );
}

export default App;
