import React from "react";
import { motion } from "framer-motion";

const WelcomeAnimation: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="w-32 h-32 mb-8">
          {/* Nepal Logo */}
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7XgY7la-lL8IjA0mHpN7P7BuUkE8_8o5YBw&s" 
            alt="Nepal Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        
        <motion.h1 
          className="text-5xl font-bold glow-text mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          Music Discovery
        </motion.h1>
        
        <motion.p 
          className="text-white text-xl max-w-md text-center mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          Discover new music from around the world
        </motion.p>
        
        <motion.p 
          className="text-muted-foreground text-sm italic max-w-md text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          नेपालको संगीतको आत्मा पत्ता लगाउनुहोस् – जहाँ परंपरा र नवप्रवर्तनको मिलन हुन्छ, र प्रत्येक गीतले हाम्रो धरोहर र हृदयको कथा बताउँछ।
        </motion.p>
        
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8, duration: 0.5, type: "spring" }}
        >
          <div className="loader w-12 h-12 border-t-4 border-primary rounded-full animate-spin"></div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeAnimation;
