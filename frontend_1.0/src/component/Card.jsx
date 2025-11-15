import React from "react";
import { motion } from "framer-motion";

const Card = ({
  children,
  className = "",
  hover = true,
  padding = "md",
  ...props
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-md ${
        hover ? "hover:shadow-lg transition-shadow duration-300" : ""
      } ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
