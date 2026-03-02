import ReactDOM from 'react-dom/client';
import App from './App';
import '@shared/styles/index.css';

// Render main app — LandingScene renders the 3D loading overlay
// which stays visible until the cubicle scene is fully loaded
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

ReactDOM.createRoot(rootElement).render(<App />);
