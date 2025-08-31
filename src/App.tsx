import MainChatInterface from './components/MainChatInterface';
import { ThemeProvider } from './contexts/ThemeContext';

const App = () => {
  return (
    <ThemeProvider>
      <MainChatInterface />
    </ThemeProvider>
  );
};

export default App;
