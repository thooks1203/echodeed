import { createRoot } from "react-dom/client";
import TestApp from "./App.test";
import "./index.css";

createRoot(document.getElementById("root")!).render(<TestApp />);
