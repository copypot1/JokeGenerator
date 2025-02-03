import React, { useState } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import './App.css';

    const App = () => {
      const [joke, setJoke] = useState('');
      const [loading, setLoading] = useState(false);

      const fetchJoke = async () => {
        setLoading(true);
        try {
          const response = await fetch('https://v2.jokeapi.dev/joke/Programming?blacklistFlags=nsfw,racist,sexist,explicit&safe-mode');
          const data = await response.json();
          if (data.type === 'single') {
            setJoke(data.joke);
          } else {
            setJoke(`${data.setup} <br/> ${data.delivery}`);
          }
        } catch (error) {
          setJoke('Failed to fetch a joke. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      return (
        <motion.div
          className="app-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="app-title"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Joke Generator
          </motion.h1>
          <AnimatePresence>
            {joke && (
              <motion.div
                className="joke-container"
                key={joke}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="joke-text" dangerouslySetInnerHTML={{ __html: joke }} />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            className="generate-button"
            onClick={fetchJoke}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {loading ? 'Loading...' : 'Generate Joke'}
          </motion.button>
        </motion.div>
      );
    };

    export default App;
