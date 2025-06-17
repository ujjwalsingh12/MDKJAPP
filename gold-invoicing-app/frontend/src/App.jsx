import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="container text-center">
      <div className="row justify-content-center my-4">
        <div className="col-6 col-md-3">
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="img-fluid logo" alt="Vite logo" />
          </a>
        </div>
        <div className="col-6 col-md-3">
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="img-fluid logo react" alt="React logo" />
          </a>
        </div>
      </div>
      <h1>Vite + React</h1>
      <div className="card p-3 my-3">
        <button
          className="btn btn-primary"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
        <p className="mt-3">
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
