import React from "react";
import weseeLogo from "../assets/wesee-logo.png";
import navyLogo from "../assets/navy-logo.png";

const Logo = ({ type = "wesee", size = "medium", className = "" }) => {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16",
  };

  const logos = {
    wesee: { src: weseeLogo, alt: "WESEE Logo" },
    navy: { src: navyLogo, alt: "Navy Logo" },
  };

  const { src, alt } = logos[type] || logos.wesee;

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`${sizeClasses[size]} object-contain`}
      />
    </div>
  );
};

export default Logo;
