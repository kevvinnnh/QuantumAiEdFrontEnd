import React, { useState } from 'react';

interface QuizProps {
  concept: string;
  onComplete: (score: number) => void;
  onExit: () => void;  // New prop to handle quiz exit
}

const questionsForConcepts: { [key: string]: { question: string; options: string[]; correctAnswer: number }[] } = {
  'Why Quantum Computing?': [
    { question: 'What makes quantum computing different from classical computing?', options: ['Qubits', 'Bits', 'Bytes', 'Registers'], correctAnswer: 0 },
    { question: 'What are qubits?', options: ['Quantum Bits', 'Bytes', 'Classical Bits', 'Registers'], correctAnswer: 0 },
    { question: 'Which area benefits most from quantum computing?', options: ['Optimization', 'Art', 'Literature', 'Music'], correctAnswer: 0 },
    { question: 'Quantum computers operate based on the principles of which theory?', options: ['Quantum Mechanics', 'Relativity', 'Classical Mechanics', 'String Theory'], correctAnswer: 0 },
    { question: 'What property allows quantum computers to perform many calculations simultaneously?', options: ['Superposition', 'Encryption', 'Concurrency', 'Parallel Processing'], correctAnswer: 0 },
    { question: 'What is entanglement in quantum computing?', options: ['A phenomenon where qubits become linked', 'A programming paradigm', 'A way to store data', 'A cryptographic method'], correctAnswer: 0 },
    { question: 'What is the main challenge in building quantum computers?', options: ['Quantum decoherence', 'Cost', 'Energy consumption', 'Programming language'], correctAnswer: 0 },
    { question: 'How is information stored in quantum computers?', options: ['In qubits that can represent both 0 and 1', 'In classical bits that can be either 0 or 1', 'In registers', 'In bytes'], correctAnswer: 0 },
    { question: 'Quantum computers are expected to outperform classical computers in what domain?', options: ['Complex simulations', 'Word processing', 'Simple arithmetic', 'Graphics rendering'], correctAnswer: 0 },
    { question: 'What is a potential application of quantum computing in everyday life?', options: ['Cryptography', 'Video gaming', 'Social media', 'Web browsing'], correctAnswer: 0 },
  ],

  'Quantum Computing in Cryptography': [
    { question: 'What is Shor’s Algorithm used for?', options: ['Factoring large numbers', 'Encrypting messages', 'Sorting numbers', 'Generating random numbers'], correctAnswer: 0 },
    { question: 'How does quantum computing threaten modern cryptography?', options: ['It can break RSA encryption', 'It can create unbreakable codes', 'It can replace current algorithms', 'It has no effect on cryptography'], correctAnswer: 0 },
    { question: 'Quantum computing can enhance which of the following cryptographic protocols?', options: ['Quantum key distribution', 'AES', 'SHA-256', 'MD5'], correctAnswer: 0 },
    { question: 'What makes quantum key distribution (QKD) secure?', options: ['The principles of quantum mechanics', 'The speed of the system', 'The complexity of encryption', 'The randomness of classical computers'], correctAnswer: 0 },
    { question: 'Which type of cryptography is most vulnerable to quantum attacks?', options: ['Public key cryptography', 'Symmetric key cryptography', 'Hash functions', 'Salting'], correctAnswer: 0 },
    { question: 'Quantum computing could help secure communication using what concept?', options: ['Quantum entanglement', 'Linear programming', 'Network encryption', 'Digital signatures'], correctAnswer: 0 },
    { question: 'Which of the following will still be secure after large-scale quantum computing?', options: ['Quantum-safe cryptography', 'RSA encryption', 'Public key cryptography', 'Classical cryptography'], correctAnswer: 0 },
    { question: 'Which algorithm could be broken by quantum computers due to factoring large numbers?', options: ['RSA', 'AES', 'SHA-256', 'Blowfish'], correctAnswer: 0 },
    { question: 'What is the role of quantum supremacy in cryptography?', options: ['It shows quantum computers can outperform classical computers in specific tasks', 'It ensures better encryption standards', 'It provides secure data exchange', 'It offers more complex cryptographic protocols'], correctAnswer: 0 },
    { question: 'How can quantum computing improve cryptography?', options: ['By creating unbreakable codes', 'By simplifying encryption', 'By slowing down decryption', 'By making encryption unnecessary'], correctAnswer: 0 },
  ],

  'Quantum Computing in Scientific Simulation': [
    { question: 'How does quantum computing help in scientific simulation?', options: ['It solves complex problems faster.', 'It replaces scientists.', 'It writes scientific papers.', 'It simulates the weather.'], correctAnswer: 0 },
    { question: 'Which area of science benefits most from quantum simulation?', options: ['Molecular biology', 'History', 'Economics', 'Linguistics'], correctAnswer: 0 },
    { question: 'Quantum computers can simulate which of the following better than classical computers?', options: ['Quantum systems', 'Macroscopic systems', 'Human behavior', 'Solar systems'], correctAnswer: 0 },
    { question: 'What is one challenge in using quantum computers for simulation?', options: ['Quantum decoherence', 'Limited memory', 'Limited CPU power', 'Internet connectivity'], correctAnswer: 0 },
    { question: 'Which of the following is an advantage of quantum simulation?', options: ['Accurately modeling quantum interactions', 'Replacing classical computers in all simulations', 'Decreasing simulation time for all processes', 'Improving image processing'], correctAnswer: 0 },
    { question: 'Quantum computers are expected to simulate which phenomenon most accurately?', options: ['Chemical reactions', 'Traffic patterns', 'Economics', 'Planetary motion'], correctAnswer: 0 },
    { question: 'Quantum simulations can potentially improve research in what field?', options: ['Drug discovery', 'Film editing', 'Architecture', 'Software engineering'], correctAnswer: 0 },
    { question: 'What is a limitation of classical computers in scientific simulations?', options: ['Inability to efficiently simulate quantum systems', 'Inability to simulate weather systems', 'Inability to process data', 'Inability to run multiple algorithms'], correctAnswer: 0 },
    { question: 'Which scientific field could be transformed by quantum simulations of molecular interactions?', options: ['Biochemistry', 'Journalism', 'Music theory', 'Poetry analysis'], correctAnswer: 0 },
    { question: 'Quantum computers excel in simulations because they:', options: ['Use quantum properties to handle large complex systems.', 'Are cheaper than classical supercomputers.', 'Use less power than classical computers.', 'Can access the internet faster.'], correctAnswer: 0 },
  ],

  'Quantum Computing in Optimization': [
    { question: 'Which optimization problem can be solved with quantum computing?', options: ['Traveling Salesman Problem', 'Cryptography', 'Sorting', 'Data Compression'], correctAnswer: 0 },
    { question: 'What kind of algorithms does quantum computing use for optimization?', options: ['Quantum annealing', 'Linear sorting', 'Greedy algorithms', 'Heuristics'], correctAnswer: 0 },
    { question: 'Quantum computing can help optimize which process in logistics?', options: ['Route planning', 'Communication', 'Payroll management', 'Advertising campaigns'], correctAnswer: 0 },
    { question: 'What makes quantum optimization different from classical optimization?', options: ['It explores multiple solutions at once', 'It uses a single path to the solution', 'It requires more energy', 'It is slower but more precise'], correctAnswer: 0 },
    { question: 'What is the advantage of quantum computing in optimization problems?', options: ['Finding solutions faster', 'Replacing all classical systems', 'Lower cost', 'Smaller size'], correctAnswer: 0 },
    { question: 'Which real-world problem could quantum optimization solve?', options: ['Optimizing global supply chains', 'Improving social media', 'Editing photos', 'Streaming videos faster'], correctAnswer: 0 },
    { question: 'Quantum computers can optimize which kind of problem better than classical computers?', options: ['Combinatorial problems', 'Linear equations', 'Image processing', 'Text processing'], correctAnswer: 0 },
    { question: 'Quantum optimization is likely to improve what field?', options: ['Artificial intelligence', 'Digital music production', 'Graphic design', 'Poetry writing'], correctAnswer: 0 },
    { question: 'Which algorithm is commonly used in quantum optimization?', options: ['Quantum annealing', 'Merge sort', 'Bubble sort', 'Dijkstra’s algorithm'], correctAnswer: 0 },
    { question: 'Quantum computing could revolutionize optimization in which field?', options: ['Machine learning', 'Journalism', 'Painting', 'Video production'], correctAnswer: 0 },
  ],

  'Quantum Computing in Machine Learning': [
    { question: 'How can quantum computing improve machine learning?', options: ['By processing data faster', 'By creating new algorithms', 'By replacing all classical algorithms', 'By simulating brains'], correctAnswer: 0 },
    { question: 'What is the potential benefit of quantum machine learning?', options: ['Speeding up learning processes', 'Decreasing accuracy', 'Lowering energy usage', 'Making computers more human'], correctAnswer: 0 },
    { question: 'Quantum computing helps in which part of machine learning?', options: ['Handling large datasets', 'Writing code', 'Reducing memory usage', 'Improving user interfaces'], correctAnswer: 0 },
    { question: 'Quantum computers are expected to improve machine learning in which domain?', options: ['Pattern recognition', 'Human emotions', 'Literary analysis', 'Art history'], correctAnswer: 0 },
    { question: 'How does quantum computing impact neural networks?', options: ['By increasing their efficiency', 'By making them less reliable', 'By making them slower', 'By making them obsolete'], correctAnswer: 0 },
    { question: 'Quantum computing can enhance machine learning models in which area?', options: ['Training speed', 'Model interpretability', 'Data annotation', 'User interface design'], correctAnswer: 0 },
    { question: 'What makes quantum machine learning more powerful than classical machine learning?', options: ['Its ability to handle complex data structures', 'Its ability to eliminate bias', 'Its ability to interpret emotions', 'Its ability to increase computing costs'], correctAnswer: 0 },
    { question: 'Quantum machine learning could outperform classical machine learning in what kind of tasks?', options: ['Complex pattern analysis', 'Generating music', 'Analyzing simple datasets', 'Improving video editing'], correctAnswer: 0 },
    { question: 'Quantum computing can speed up which machine learning process?', options: ['Training large datasets', 'Improving user interfaces', 'Human interaction', 'Video rendering'], correctAnswer: 0 },
    { question: 'Which machine learning models are expected to benefit the most from quantum computing?', options: ['Neural networks', 'Decision trees', 'Logistic regression', 'K-nearest neighbors'], correctAnswer: 0 },
  ],
};
const Quiz: React.FC<QuizProps> = ({ concept, onComplete, onExit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const questions = questionsForConcepts[concept];

  const handleSubmit = () => {
    if (selectedOption === null) return;

    const isAnswerCorrect = selectedOption === questions[currentQuestionIndex].correctAnswer;
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      setScore(score + 1);
    }

    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedOption(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onComplete(score + (isCorrect ? 1 : 0)); // Add last question score if correct
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
  {/* Exit Button (X) */}
<button
  onClick={onExit}
  style={{
    position: 'absolute',
    top: '10px',
    left: '15px',  // Changed from 'right' to 'left'
    background: 'none',
    border: 'none',
    fontSize: '1.5em',
    cursor: 'pointer',
    color: '#070F14'
  }}
>
  ✖
</button>


      {/* Question Display */}
      <div style={{ fontSize: '1.5em', margin: '20px 0', textAlign: 'center' }}>{questions[currentQuestionIndex].question}</div>

      {/* Answer Options */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '80%', justifyContent: 'center' }}>
        {questions[currentQuestionIndex].options.map((option, index) => (
          <button
            key={index}
            style={{
              margin: '10px',
              padding: '15px',
              backgroundColor: selectedOption === index ? '#566395' : '#A487AE',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2em',
              borderRadius: '10px',
              textAlign: 'center',
            }}
            onClick={() => setSelectedOption(index)}
            disabled={showFeedback} // Disable option change after submission
          >
            {option}
          </button>
        ))}
      </div>

      {/* Submit or Next Buttons */}
      <div style={{ marginTop: '20px' }}>
        {!showFeedback && (
          <button 
            className="button" 
            onClick={handleSubmit} 
            disabled={selectedOption === null}
            style={{
              padding: '10px 20px',  // Adjusted padding to fit text better
              fontSize: '1.1em',
              lineHeight: '1.2em',   // Ensures text doesn't overflow vertically
              borderRadius: '8px',
              backgroundColor: '#566395',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'center',
              width: 'auto',         // Let the button width adjust based on content
              display: 'inline-block', // Ensure inline-block so it sizes properly with text
            }}
          >
            Submit
          </button>
        )}

        {showFeedback && (
          <div>
            <p style={{ fontSize: '1.2em' }}>{isCorrect ? 'Correct!' : 'Incorrect!'}</p>
            <button 
              className="button" 
              onClick={handleNextQuestion}
              style={{
                padding: '10px 20px',  // Similar padding fix
                fontSize: '1.1em',
                lineHeight: '1.2em',
                borderRadius: '8px',
                backgroundColor: '#566395',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'center',
                width: 'auto',
                display: 'inline-block',
              }}
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;