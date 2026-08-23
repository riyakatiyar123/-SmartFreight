import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Track login status
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  // Update login status when the route changes
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, [location.pathname]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);

    navigate("/");
  };

  // Pages where "Join Us" should be shown
  const publicPages = [
    "/",
    "/about",
    "/contact",
    "/learn-more",
  ];

  // Pages where no button should be shown
  const authPages = [
    "/login",
    "/register",
  ];

  const isPublicPage = publicPages.includes(location.pathname);
  const isAuthPage = authPages.includes(location.pathname);

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

      {isAuthPage ? null : isPublicPage ? (
        <Link
          to="/login"
          className="join-nav-btn"
        >
          Join Us
        </Link>
      ) : isLoggedIn ? (
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