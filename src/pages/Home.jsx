import Hero from "../components/Hero";
import Reels from "../components/Reels";
import CategoryShowcase from "../components/CategoryShowcase";
import LatestCollection from "../components/LatestCollection";
import BestSeller from "../components/BestSeller";
import OurPolicy from "../components/OurPolicy";
import Newsletter from "../components/Newsletter";

const Home = () => {
  return (
    <div>
      <Hero />
      <CategoryShowcase />
      <Reels />
      <LatestCollection />
      <BestSeller />
      <OurPolicy />
      <Newsletter />
    </div>
  );
};

export default Home;
