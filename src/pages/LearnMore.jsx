import Navbar from "../components/Navbar";

import "../styles/LearnMore.css";

const LearnMore = () => {

  const features = [
    {
      title: "Real-Time Tracking",
      text: "Track shipments and monitor movement with real-time visibility."
    },
    {
      title: "Smart Analytics",
      text: "Use transportation data to understand costs, performance and trends."
    },
    {
      title: "Smart Bidding",
      text: "Connect shippers and transporters through a transparent bidding system."
    },
    {
      title: "Cost Analyzer",
      text: "Estimate trip costs and make better transportation decisions."
    },
    {
      title: "Transporter Matching",
      text: "Find suitable transporters based on shipment requirements."
    },
    {
      title: "Shipment Management",
      text: "Create, manage and track shipments from one centralized platform."
    }
  ];

  return (
    <div>

      <Navbar />

      <section className="learn-page">

        <p className="page-label">
          OUR SOLUTION
        </p>

        <h1>
          Everything You Need
          <br />
          <span>To Move Smarter.</span>
        </h1>

        <p className="learn-intro">
          SmartFreight combines logistics management,
          intelligent analytics and real-time visibility
          into one powerful platform.
        </p>


        <div className="feature-grid">

          {features.map((feature, index) => (

            <div className="feature-card" key={index}>

              <div className="feature-number">
                0{index + 1}
              </div>

              <h2>
                {feature.title}
              </h2>

              <p>
                {feature.text}
              </p>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
};

export default LearnMore;