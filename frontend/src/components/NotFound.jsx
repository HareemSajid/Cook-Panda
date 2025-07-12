import React from "react";
import panda404 from "../assets/404.jpg"; // adjust path if needed

const NotFound = () => {
  return (
    <div style={styles.container}>
      <img src={panda404} alt="404 - Not Found" style={styles.image} />
      <h1 style={styles.title}>Oops! Page Not Found</h1>
      <p style={styles.subtitle}>
        The page you're looking for doesn't exist.
      </p>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    padding: "60px",
    fontFamily: "Arial, sans-serif",
  },
  image: {
    width: "500px",
    height: "300px",
    maxWidth: "90%",
    marginBottom: "30px",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "10px",
    color: "#e81c74",
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "#666",
  },
};

export default NotFound;
