import { createRoot } from "react-dom/client";

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <div style={{ fontFamily: "Inter, sans-serif", padding: "2rem" }}>
      <h1>{{projectName}}</h1>
      <p>Welcome to your offline-ready Vite template.</p>
    </div>
  );
}
