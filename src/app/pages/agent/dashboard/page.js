"use client";

import { useState } from "react"
import ListingPage from '../viewListings/page'

export default function Dashboard() {
  {
    /* This function is for minimizing the header in mobile screens (might remove later)*/
  }
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  {
    /* This function is for switching the html elements of the right column of the page (depending on the option selected*/
  }
  const [selectedOption, setSelectedOption] = useState("option1");
  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  return (
    <body className="bg-gray-100">
      {/* Main Section */}

      <div className="flex pt-20 text-black">
        {/* Left Column: Dashboard Options */}
        <div className="w-1/2 bg-red-500 p-5 h-screen">
          <ul className="space-y-2">
            <li>
              <button
                className={`w-full text-left p-2 rounded hover:bg-gray-200 ${
                  selectedOption === "option1" ? "bg-gray-300" : ""
                }`}
                onClick={() => handleOptionClick("option1")}
              >
                Profile
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left p-2 rounded hover:bg-gray-200 ${
                  selectedOption === "option2" ? "bg-gray-300" : ""
                }`}
                onClick={() => handleOptionClick("option2")}
              >
                Used Car Agents
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left p-2 rounded hover:bg-gray-200 ${
                  selectedOption === "option3" ? "bg-gray-300" : ""
                }`}
                onClick={() => handleOptionClick("option3")}
              >
                My Listings
              </button>
            </li>
          </ul>
        </div>

        {/* Right Column: Content Based on Selected Option */}
        <div className="w-3/4 p-4">
          {selectedOption === "option1" && (
            <div>
              <h2 className="text-2xl font-semibold">Content for Option 1</h2>
              <p>This is the content that shows for Option 1.</p>
            </div>
          )}
          {selectedOption === "option2" && (
            <div>
              <p> placeholder </p>
            </div>
          )}
          {selectedOption === "option3" && (
            <div>
              <ListingPage/>  
            </div>
          )}
        </div>
      </div>

      {/* Switch Section */}
      <div className=""></div>
    </body>
  );
}
