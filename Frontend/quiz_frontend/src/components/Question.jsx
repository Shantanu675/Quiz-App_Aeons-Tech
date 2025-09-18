import React from "react";
import { motion } from "framer-motion";

export default function Question({ question, index, onAnswer, selectedOptions }) {
  const handleChange = (optionIdx) => {
    const newSelected = selectedOptions.includes(optionIdx)
      ? selectedOptions.filter((i) => i !== optionIdx)
      : [...selectedOptions, optionIdx];
    onAnswer(index, newSelected);
  };

  return (
    <motion.div
      className="mb-10 p-6 rounded-3xl shadow-2xl border border-gray-200 
                 bg-gradient-to-br from-purple-50 via-white to-blue-50"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Question Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-extrabold flex items-center gap-3 text-transparent bg-clip-text 
                       bg-gradient-to-r from-purple-600 to-blue-600">
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg shadow-md">
            Q{index + 1}
          </span>
          {question.text}
        </h3>
      </div>

      {/* Question Image */}
      {question.image && (
        <div className="flex justify-center my-5">
          <motion.img
            src={question.image}
            alt="Question"
            className="rounded-xl border border-gray-300 max-h-60 object-contain shadow-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Options */}
      <div className="space-y-4">
        {question.options.map((opt, idx) => {
          const isSelected = selectedOptions.includes(idx);
          return (
            <motion.label
              key={idx}
              className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer font-medium text-lg
                transition-all duration-300 ease-in-out
                ${
                  isSelected
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-md scale-105"
                    : "bg-white border-gray-300 hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100"
                }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleChange(idx)}
                className="w-6 h-6 accent-blue-600 cursor-pointer"
              />
              <span>{opt.text}</span>
            </motion.label>
          );
        })}
      </div>
    </motion.div>
  );
}
