import { Header, Footer } from "@/components/shared";
import { Home } from "@/components/home";
export default function Page() {
  return (
    <div className="home-shell">
      <Header />
      <Home />
      <Footer />
    </div>
  );
}
