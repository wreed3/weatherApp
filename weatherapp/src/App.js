import './App.css';
import Card from './components/Card/Card';

function App() {
  return (
    <div className="App">
      <div className='app-container'> 
        <h1 className='title'>5-day Forecast</h1>
      </div>
      <div className='body-container'>
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />

      </div>

    </div>
  );
}

export default App;
