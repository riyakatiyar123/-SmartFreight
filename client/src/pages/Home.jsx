import Navbar from "../components/Navbar";
import "../styles/Home.css";

const Home = () => {
    return (
        <div className="home">

            {/* =========================
                NAVBAR
            ========================= */}

            <Navbar />


            {/* =========================
                HERO SECTION
            ========================= */}

            <section className="hero">

                {/* =========================
                    HERO TEXT
                ========================= */}

                <div className="hero-content">

                    <p className="hero-tagline">
                        SMARTER LOGISTICS. STRONGER TOMORROW.
                    </p>

                    <h1>
                        Control Your Fleet
                        <span>Like Never Before.</span>
                    </h1>

                    <p className="hero-description">
                        Real-time tracking, intelligent analytics, and
                        seamless fleet management all in one powerful
                        platform designed to help you move smarter,
                        faster, and more efficiently.
                    </p>

                </div>


                {/* =========================
                    HERO IMAGE
                ========================= */}

                <img
                    src="/truck.png"
                    alt="SmartFreight logistics truck"
                    className="hero-image"
                />

            </section>


            {/* =========================
                IMPACT SECTION
            ========================= */}

            <section className="impact">

                <div className="impact-container">

                    <p className="impact-title">
                        OUR IMPACT
                    </p>


                    <div className="impact-grid">

                        {/* 1 */}
                        <div className="impact-item">
                            <h2>10%</h2>

                            <p>
                                Improved
                                <br />
                                Efficiency
                            </p>
                        </div>


                        {/* 2 */}
                        <div className="impact-item">
                            <h2>35+</h2>

                            <p>
                                Clients
                            </p>
                        </div>


                        {/* 3 */}
                        <div className="impact-item">
                            <h2>150K+</h2>

                            <p>
                                Tons of Freight
                                <br />
                                Transported Yearly
                            </p>
                        </div>


                        {/* 4 */}
                        <div className="impact-item">
                            <h2>10K+</h2>

                            <p>
                                Shipments
                                <br />
                                Managed
                            </p>
                        </div>


                        {/* 5 */}
                        <div className="impact-item">
                            <h2>500+</h2>

                            <p>
                                Transporters
                            </p>
                        </div>


                        {/* 6 */}
                        <div className="impact-item">
                            <h2>99%</h2>

                            <p>
                                On-Time
                                <br />
                                Delivery
                            </p>
                        </div>


                        {/* 7 */}
                        <div className="impact-item">
                            <h2>24/7</h2>

                            <p>
                                Real-Time
                                <br />
                                Tracking
                            </p>
                        </div>

                    </div>

                </div>

            </section>

        </div>
    );
};

export default Home;