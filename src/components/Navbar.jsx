import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {

  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem("token");

  // Logout function
  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="navbar">

      {/* LOGO */}
      <Link to="/" className="logo">

        <span className="logo-symbol">»</span>

        <span>
          SMART<span>FREIGHT</span>
        </span>

      </Link>


      {/* NAVIGATION */}
      <div className="nav-links">

        <Link
          to="/"
          className={location.pathname === "/" ? "active" : ""}
        >
          Home
        </Link>

        <Link
          to="/about"
          className={location.pathname === "/about" ? "active" : ""}
        >
          About Us
        </Link>

        <Link
          to="/contact"
          className={location.pathname === "/contact" ? "active" : ""}
        >
          Contact Us
        </Link>

        <Link
          to="/learn-more"
          className={location.pathname === "/learn-more" ? "active" : ""}
        >
          Learn More
        </Link>

      </div>


      {/* JOIN / LOGOUT BUTTON */}

      {isLoggedIn ? (

        <button
          className="join-nav-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      ) : (

        <Link
          to="/login"
          className="join-nav-btn"
        >
          Join Us
        </Link>

      )}

    </nav>
  );
};

export default Navbar;