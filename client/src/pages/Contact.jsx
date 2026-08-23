import Navbar from "../components/Navbar";

import "../styles/Contact.css";

const Contact = () => {

  return (
    <div>

      <Navbar />

      <section className="contact-page">

        <div className="contact-info">

          <p className="page-label">
            CONTACT US
          </p>

          <h1>
            Let's Move
            <br />
            <span>Together.</span>
          </h1>

          <p>
            Have a question about SmartFreight?
            We'd love to hear from you.
          </p>

          <div className="contact-details">

            <p>
              📧 support@smartfreight.com
            </p>

            <p>
              📞 +91 98765 43210
            </p>

            <p>
              📍 India
            </p>

          </div>

        </div>


        <form className="contact-form">

          <input
            type="text"
            placeholder="Your Name"
          />

          <input
            type="email"
            placeholder="Your Email"
          />

          <textarea
            placeholder="Your Message"
            rows="6"
          />

          <button type="submit">
            Send Message
          </button>

        </form>

      </section>

    </div>
  );
};

export default Contact;