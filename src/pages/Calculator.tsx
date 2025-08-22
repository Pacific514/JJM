
import React from 'react';
import { motion } from 'framer-motion';
import PriceCalculator from '../components/PriceCalculator';

const Calculator: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <PriceCalculator />
      </motion.div>
    </div>
  );
};

export default Calculator;
