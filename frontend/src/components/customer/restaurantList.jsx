import React from "react";
import { Link } from "react-router-dom"; // Use react-router to navigate to the restaurant menu page

const RestaurantList = ({ restaurants }) => {
  return (
    <div className="restaurant-list">
      {restaurants.length > 0 ? (
        restaurants.map((restaurant) => (
          <Link to={`/menu/${restaurant.id}`} key={restaurant.id} className="restaurant-card">
            <h3>{restaurant.name}</h3>
            <p>{restaurant.cuisine}</p>
          </Link>
        ))
      ) : (
        <p>No restaurants available.</p>
      )}
    </div>
  );
};

export default RestaurantList;
