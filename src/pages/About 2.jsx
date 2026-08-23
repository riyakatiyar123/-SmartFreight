import Navbar from "../components/Navbar";

import "../styles/About.css";

const About = () => {

  return (
    <div>

      <Navbar />

      <section className="simple-page">

        <p className="page-label">
          ABOUT US
        </p>

        <h1>
          Moving Business
          <br />
          <span>Forward, Together.</span>
        </h1>

        <p className="page-description">
          SmartFreight is a logistics technology platform designed
          to make freight transportation smarter, faster, and more
          transparent.
        </p>


        <div className="about-grid">

          <div className="about-card">
            <h2>Our Mission</h2>
            <p>
              To simplify freight transportation by connecting
              shippers and transporters through technology.
            </p>
          </div>

          <div className="about-card">
            <h2>Our Vision</h2>
            <p>
              To build a smarter and more efficient logistics
              ecosystem where every shipment can be managed
              with confidence.
            </p>
          </div>

          <div className="about-card">
            <h2>Why SmartFreight?</h2>
            <p>
              Real-time tracking, intelligent analytics,
              transparent bidding, and reliable transportation
              management in one platform.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
};

export default About;