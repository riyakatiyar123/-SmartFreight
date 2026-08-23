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

  // Mobile menu state
  const [menuOpen, setMenuOpen] = useState(false);

  // Update login status when route changes
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    setMenuOpen(false);
  }, [location.pathname]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setMenuOpen(false);

    navigate("/");
  };

  // Pages where Join Us should be shown
  const publicPages = [
    "/",
    "/about",
    "/contact",
    "/learn-more",
  ];

  // Pages where no Join Us / Logout button should be shown
  const authPages = [
    "/login",
    "/register",
  ];

  const isPublicPage = publicPages.includes(location.pathname);
  const isAuthPage = authPages.includes(location.pathname);

  // Home page
  const isHomePage = location.pathname === "/";

  return (
    <nav className="navbar">

      {/* ==================================================
          LOGO
      ================================================== */}

      <Link to="/" className="logo">
        <span className="logo-symbol">»</span>

        <span>
          SMART<span>FREIGHT</span>
        </span>
      </Link>


      {/* ==================================================
          DESKTOP NAVIGATION
      ================================================== */}

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


      {/* ==================================================
          DESKTOP JOIN / LOGOUT BUTTON
      ================================================== */}

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


      {/* ==================================================
          MOBILE HOME
          
          Logo + Join Us
      ================================================== */}

      {isHomePage && (
        <div className="mobile-home-actions">

          <Link
            to="/login"
            className="mobile-join-btn"
          >
            Join Us
          </Link>

        </div>
      )}


      {/* ==================================================
          MOBILE INTERNAL PAGES
          
          Logo + Hamburger
          
          Home page does NOT show hamburger.
      ================================================== */}

      {!isHomePage && !isAuthPage && (
        <button
          type="button"
          className={`mobile-menu-btn ${
            menuOpen ? "open" : ""
          }`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      )}


      {/* ==================================================
          MOBILE HOME QUICK LINKS
          
          About Us | Contact Us | Learn More
          
          Home itself is NOT included because
          the user is already on Home.
      ================================================== */}

      {isHomePage && (
        <div className="mobile-home-links">

          <Link to="/about">
            About Us
          </Link>

          <Link to="/contact">
            Contact Us
          </Link>

          <Link to="/learn-more">
            Learn More
          </Link>

        </div>
      )}


      {/* ==================================================
          MOBILE INTERNAL MENU
          
          Home
          About Us
          Contact Us
          Learn More
          Join Us / Logout
      ================================================== */}

      {!isHomePage && !isAuthPage && menuOpen && (
        <div className="mobile-dropdown-menu">

          {/* HOME */}

          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className={
              location.pathname === "/"
                ? "active"
                : ""
            }
          >
            Home
          </Link>


          {/* ABOUT US */}

          <Link
            to="/about"
            onClick={() => setMenuOpen(false)}
            className={
              location.pathname === "/about"
                ? "active"
                : ""
            }
          >
            About Us
          </Link>


          {/* CONTACT US */}

          <Link
            to="/contact"
            onClick={() => setMenuOpen(false)}
            className={
              location.pathname === "/contact"
                ? "active"
                : ""
            }
          >
            Contact Us
          </Link>


          {/* LEARN MORE */}

          <Link
            to="/learn-more"
            onClick={() => setMenuOpen(false)}
            className={
              location.pathname === "/learn-more"
                ? "active"
                : ""
            }
          >
            Learn More
          </Link>


          {/* JOIN US / LOGOUT */}

          {isLoggedIn ? (
            <button
              type="button"
              className="mobile-menu-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="mobile-menu-join"
            >
              Join Us
            </Link>
          )}

        </div>
      )}

    </nav>
  );
};

export default Navbar;