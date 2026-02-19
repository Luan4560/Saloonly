import { Toaster } from "sonner";
import AppRoutes from "./routes";

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster position="top-center" />
    </>
  );
}

export default App;
