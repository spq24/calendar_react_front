import React from 'react';
import ReactDOM from 'react-dom';
import AppRouter from './components/AppRouter';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';



ReactDOM.render(<AppRouter />, document.getElementById('root'));
registerServiceWorker();
