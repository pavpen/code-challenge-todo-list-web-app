import React from 'react';
import { TodoComponent } from './TodoComponent';

import './App.css';
import { TodoService } from './TodoService';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>todos</h1>
        <TodoComponent todoService={new TodoService()} />
      </header>
    </div>
  );
}

export default App;
