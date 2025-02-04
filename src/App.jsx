import React, { useState, useRef, useEffect } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { FaLaugh, FaCopy, FaHeart, FaListUl } from 'react-icons/fa';
    import './App.css';

    const App = () => {
      const [joke, setJoke] = useState('');
      const [loading, setLoading] = useState(false);
      const [copied, setCopied] = useState(false);
      const [likedJokes, setLikedJokes] = useState(() => {
        try {
          const storedJokes = localStorage.getItem('likedJokes');
          return storedJokes ? JSON.parse(storedJokes) : [];
        } catch (error) {
          console.error('Error loading liked jokes from localStorage:', error);
          return [];
        }
      });
      const [showLikedJokes, setShowLikedJokes] = useState(false);
      const jokeRef = useRef(null);

      useEffect(() => {
        try {
          localStorage.setItem('likedJokes', JSON.stringify(likedJokes));
        } catch (error) {
          console.error('Error saving liked jokes to localStorage:', error);
        }
      }, [likedJokes]);

      const fetchJoke = async () => {
        setLoading(true);
        setCopied(false);
        try {
          const response = await fetch('https://official-joke-api.appspot.com/random_joke');
          const data = await response.json();
          setJoke(`${data.setup} <br/> ${data.punchline}`);
        } catch (error) {
          setJoke('Failed to fetch a joke. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      const copyJoke = () => {
        if (jokeRef.current) {
          navigator.clipboard.writeText(jokeRef.current.innerText);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      };

      const toggleLikeJoke = () => {
        if (joke) {
          const isJokeLiked = likedJokes.includes(joke);
          if (isJokeLiked) {
            setLikedJokes(likedJokes.filter((j) => j !== joke));
          } else {
            setLikedJokes([...likedJokes, joke]);
          }
        }
      };

      const isJokeLiked = (currentJoke) => likedJokes.includes(currentJoke);

      return (
        <motion.div
          className="app-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div className="header-container">
            <motion.h1
              className="app-title"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <FaLaugh className="title-icon" /> Joke Generator
            </motion.h1>
            <motion.button
              className="liked-jokes-button"
              onClick={() => setShowLikedJokes(!showLikedJokes)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <FaListUl /> Liked Jokes
            </motion.button>
          </motion.div>
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
                <p className="joke-text" ref={jokeRef} dangerouslySetInnerHTML={{ __html: joke }} />
                <div className="joke-actions">
                  <motion.button
                    className="action-button"
                    onClick={copyJoke}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Copy Joke"
                  >
                    <FaCopy />
                    {copied && <span className="copied-text">Copied!</span>}
                  </motion.button>
                  <motion.button
                    className={`action-button ${isJokeLiked(joke) ? 'liked' : ''}`}
                    onClick={toggleLikeJoke}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Like Joke"
                  >
                    <FaHeart />
                  </motion.button>
                </div>
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
          <AnimatePresence>
            {showLikedJokes && (
              <motion.div
                className="liked-jokes-modal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="liked-jokes-title">Liked Jokes</h2>
                {likedJokes.length > 0 ? (
                  <ul className="liked-jokes-list">
                    {likedJokes.map((likedJoke, index) => (
                      <li key={index} className="liked-joke-item">
                        <p dangerouslySetInnerHTML={{ __html: likedJoke }} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No liked jokes yet.</p>
                )}
                <motion.button
                  className="close-modal-button"
                  onClick={() => setShowLikedJokes(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      );
    };

    export default App;
