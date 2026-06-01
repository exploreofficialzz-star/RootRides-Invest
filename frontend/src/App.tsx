import { Routes, Route } from "react-router";
import Home from "@/pages/Home";
import AuthPage from "@/pages/AuthPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<AuthPage />} />
    </Routes>
  );
}
