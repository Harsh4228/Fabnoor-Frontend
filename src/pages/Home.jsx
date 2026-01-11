import Hero from "../components/Hero";
import Reels from "../components/Reels";
import CategoryShowcase from "../components/CategoryShowcase";
import LatestCollection from "../components/LatestCollection";
import BestSeller from "../components/BestSeller";
import Ourpolicy from "../components/Ourpolicy";
import Newsletter from "../components/Newsletter";

const Home = () => {
  return (
    <div>
      <Hero />
      <CategoryShowcase />
      <Reels />
      <LatestCollection />
      <BestSeller />
      <Ourpolicy />
      <Newsletter />
    </div>
  );
};

export default Home;
