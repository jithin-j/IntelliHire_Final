import React from "react";
import { motion } from "framer-motion";
import "./LandingPage.css";
import Resume from "../../images/resume.png"; // Import your images here
import Emotions from "../../images/emotions.png";
import Employee from "../../images/employee.png";
import Logo from "../../images/landing_logo.png"
import Logo2 from "../../images/Logo2.png"
import Logo3 from "../../images/3dbg.png"

import {
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  InstagramOutlined,
} from "@ant-design/icons";
function LandingPage() {
  // const toggleMenu = () => {
  //   setMenuOpen(!menuOpen);
  // };
  return (
    <div className="intellihire">
      <motion.header
        className="intellihire-header"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="intellihire-brand">
          <a href="/" className="intellihire-logo">
            <img src={Logo} alt="IntelliHire" />
          </a>
        </div>
      </motion.header>

      <main className="intellihire-main">
        <div className="cont">
          <motion.section
            className="intellihire-hero"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}

          >
            <div className="hero-background">
              <div className="hero-content">
                <motion.h1 className="header1">
                  Changing the way employees are hired <br />
                </motion.h1>
                <motion.h2 className="header2">
                  <i className="ita">One company at a time</i>
                </motion.h2>
                <div className="landing-buttons">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="intellihire-btn"
                    //scroll down to div having id about smoothly
                    onClick={() =>
                      document
                        .getElementById("about")
                        .scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Know more
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="intellihire-btn intellihire-btn-secondary"
                    //Go to login page on click
                    onClick={() => window.location.href = '/login'}
                  >
                    Get Started
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.section>
        </div>

        <motion.section
          className="intellihire-content"
          id="about"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="content-left">
            <h2 className="intellihire-content-title">What do we do?</h2>
            <p className="intellihire-paragraph">
              IntelliHire is an all in one solution to Hire,
              <br /> Manage and Retain employees. Loaded with <br />
              advanced AI features such as Resume <br />
              Screening, Sentiment Analysis, IntelliHire is <br /> an all in one
              solution for enterprises to
              <br />
              Hire, Manage and Retain employees
            </p>
          </div>
          <div className="content-right">
            <img src={Logo3} alt="IntelliHire" />
          </div>
        </motion.section>

        <motion.section
          className="intellihire-features"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <h2 className="intellihire-features-title">Our Features</h2>
          <div className="intellihire-feature-cards">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="intellihire-feature-card"
            >
              <img src={Resume} alt="Resume Screening" />
              <h3>Resume Screening</h3>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="intellihire-feature-card"
            >
              <img src={Emotions} alt="Sentiment Analysis" />
              <h3>Sentiment Analysis</h3>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="intellihire-feature-card"
            >
              <img src={Employee} alt="Employee Management" />
              <h3>Employee Management</h3>
            </motion.div>
          </div>
        </motion.section>

        <footer className="intellihire-footer">
          <div className="footer-links">
            <motion.a
              href="#home"
              className="footer-link"
              whileHover={{ color: "#aaa", translateY: -2 }}
            >
              Home
            </motion.a>
            <motion.a
              href="#about"
              className="footer-link"
              whileHover={{ color: "#aaa", translateY: -2 }}
            >
              About
            </motion.a>
            <motion.a
              href="#services"
              className="footer-link"
              whileHover={{ color: "#aaa", translateY: -2 }}
            >
              Services
            </motion.a>
            <motion.a
              href="#team"
              className="footer-link"
              whileHover={{ color: "#aaa", translateY: -2 }}
            >
              Team
            </motion.a>
            <motion.a
              href="#contact"
              className="footer-link"
              whileHover={{ color: "#aaa", translateY: -2 }}
            >
              Contact
            </motion.a>
            <motion.a
              href="#blog"
              className="footer-link"
              whileHover={{ color: "#aaa", translateY: -2 }}
            >
              Blog
            </motion.a>
          </div>
          <div className="footer-info">
            <p>&copy; 2024 IntelliHire. All rights reserved.</p>
          </div>
          <div className="footer-social-media">
            <a href="#facebook" className="social-media-link">
              <FacebookOutlined />
            </a>
            <a href="#twitter" className="social-media-link">
              <TwitterOutlined />
            </a>
            <a href="#linkedin" className="social-media-link">
              <LinkedinOutlined />
            </a>
            <a href="#instagram" className="social-media-link">
              <InstagramOutlined />
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default LandingPage;