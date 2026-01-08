import { HashRouter as Router, Route, Routes } from "react-router-dom";
import Index from './pages/Index';
import Anime from "./pages/Anime";
import Library from "./pages/Library";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/anime" element={<Anime />} />
        <Route path="/library" element={<Library />} />
      </Routes>
    </Router>
  );
};

export default App;