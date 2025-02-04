import React, { useState, useRef, useEffect } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { FaLaugh, FaCopy, FaHeart, FaListUl, FaStar, FaShareAlt, FaTrash } from 'react-icons/fa';
    import { nanoid } from 'nanoid';
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
      const [jokeRatings, setJokeRatings] = useState(() => {
        try {
          const storedRatings = localStorage.getItem('jokeRatings');
          return storedRatings ? JSON.parse(storedRatings) : {};
        } catch (error) {
          console.error('Error loading joke ratings from localStorage:', error);
          return {};
        }
      });
      const [currentRating, setCurrentRating] = useState(0);
      const [categories, setCategories] = useState([]);
      const [selectedCategory, setSelectedCategory] = useState('Any');
      const jokeRef = useRef(null);

      useEffect(() => {
        try {
          localStorage.setItem('likedJokes', JSON.stringify(likedJokes));
        } catch (error) {
          console.error('Error saving liked jokes to localStorage:', error);
        }
      }, [likedJokes]);

      useEffect(() => {
        try {
          localStorage.setItem('jokeRatings', JSON.stringify(jokeRatings));
        } catch (error) {
          console.error('Error saving joke ratings to localStorage:', error);
        }
      }, [jokeRatings]);

      useEffect(() => {
        const fetchCategories = async () => {
          try {
            const response = await fetch('https://official-joke-api.appspot.com/jokes/categories');
            const data = await response.json();
            setCategories(['Any', ...data]);
          } catch (error) {
            console.error('Error fetching joke categories:', error);
            setCategories(['Any']);
          }
        };
        fetchCategories();
      }, []);

      const fetchJoke = async () => {
        setLoading(true);
        setCopied(false);
        try {
          let url = 'https://official-joke-api.appspot.com/random_joke';
          if (selectedCategory !== 'Any') {
            url = `https://official-joke-api.appspot.com/jokes/${selectedCategory}/random`;
          }
          // Fetch jokes based on ratings
          const sortedJokes = Object.entries(jokeRatings)
            .sort(([, ratingA], [, ratingB]) => ratingB - ratingA)
            .map(([joke]) => joke);
          if (sortedJokes.length > 0 && Math.random() < 0.5) {
            const topJoke = sortedJokes[0];
            setJoke(topJoke);
            setCurrentRating(jokeRatings[topJoke]);
            setLoading(false);
            return;
          }
          const response = await fetch(url);
          const data = await response.json();
          setJoke(`${data.setup} <br/> ${data.punchline}`);
          setCurrentRating(0);
        } catch (error) {
          setJoke('Failed to fetch a joke. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      const copyJoke = () => {
        if (jokeRef.current) {
          const text = jokeRef.current.innerText;
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'absolute';
          textArea.style.left = '-9999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try {
            document.execCommand('copy');
            setCopied(true);
          } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            alert('Fallback: Could not copy the joke, please copy manually!');
          }
          document.body.removeChild(textArea);
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

      const handleRating = (rating) => {
        if (joke) {
          setJokeRatings((prevRatings) => ({
            ...prevRatings,
            [joke]: rating,
          }));
          setCurrentRating(rating);
        }
      };

      const shareJoke = () => {
        if (joke) {
          const jokeId = nanoid();
          const shareableUrl = `${window.location.origin}/joke/${jokeId}`;
          const textArea = document.createElement('textarea');
          textArea.value = shareableUrl;
          textArea.style.position = 'absolute';
          textArea.style.left = '-9999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try {
            document.execCommand('copy');
            alert(`Joke shared! Copy this link: ${shareableUrl}`);
          } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            alert('Fallback: Could not copy the shareable link, please copy manually!');
          }
          document.body.removeChild(textArea);
        }
      };

      const deleteLikedJoke = (jokeToDelete) => {
        setLikedJokes(likedJokes.filter((j) => j !== jokeToDelete));
      };

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
          <div className="category-filter">
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
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
                  <motion.button
                    className="action-button"
                    onClick={shareJoke}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Share Joke"
                  >
                    <FaShareAlt />
                  </motion.button>
                </div>
                <div className="rating-container">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      className={`star-button ${star <= currentRating ? 'filled' : ''}`}
                      onClick={() => handleRating(star)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaStar />
                    </motion.button>
                  ))}
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
                        <div className="liked-joke-actions">
                          {jokeRatings[likedJoke] && (
                            <div className="liked-joke-rating">
                              Rating:
                              {[...Array(jokeRatings[likedJoke])].map((_, i) => (
                                <FaStar key={i} className="filled" />
                              ))}
                            </div>
                          )}
                          <motion.button
                            className="delete-liked-joke"
                            onClick={() => deleteLikedJoke(likedJoke)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FaTrash />
                          </motion.button>
                        </div>
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
