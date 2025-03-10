//src/components/ConceptBook.tsx

import React from 'react';

interface ConceptBookProps {
  currentLevel: number;
  onClose: () => void;
}

const ConceptBook: React.FC<ConceptBookProps> = ({ currentLevel, onClose }) => {
  const levelsContent: Record<number, JSX.Element> = {
    0: (
      <div style={{ padding: '20px', lineHeight: '1.6' }}>
      <h2 style={{ color: '#566395', marginBottom: '10px' }}>
        Welcome to Quantum Computing
      </h2>
      <p>
        Quantum computing is a revolutionary technology that harnesses the principles of quantum mechanics to perform computations far beyond the capability of classical computers. These principles enable new ways of processing information that are fundamentally different from binary logic.
      </p>
      <p>
        Hover over key terms like <span className="interactive-word" data-term="A quantum bit, capable of superposition and entanglement.">qubit</span>, 
        <span className="interactive-word" data-term="The ability of a qubit to exist in multiple states (0 and 1) simultaneously.">superposition</span>, and 
        <span className="interactive-word" data-term="A quantum phenomenon where two or more qubits are linked, allowing their states to affect one another.">entanglement</span> 
        to learn more!
      </p>
    
      <h3 style={{ color: '#A487AE' }}>Core Principles</h3>
      <h4>Qubits</h4>
      <p>
        Unlike classical bits, which are strictly 0 or 1, <span className="interactive-word" data-term="A quantum bit, capable of superposition and entanglement.">qubits</span> can exist in a combination of both states simultaneously. This property, called <span className="interactive-word" data-term="The ability of a qubit to exist in multiple states (0 and 1) simultaneously.">superposition</span>, provides quantum computers with unparalleled computational power for specific tasks.
      </p>
    
      <h4>Superposition</h4>
      <p>
        Superposition enables a single qubit to represent multiple possibilities at once. For example, while a classical bit can only encode one number (0 or 1), a qubit in superposition can encode a combination of both. This property allows quantum computers to process many potential solutions simultaneously, exponentially increasing computational efficiency for some problems.
      </p>
    
      <h4>Entanglement</h4>
      <p>
        <span className="interactive-word" data-term="A quantum phenomenon where two or more qubits are linked, allowing their states to affect one another.">Entanglement</span> links two or more qubits such that the state of one immediately affects the state of the other, regardless of distance. This phenomenon forms the backbone of quantum communication and allows quantum computers to perform coordinated calculations across multiple qubits.
      </p>
    
      <h4>Measurement</h4>
      <p>
        <span className="interactive-word" data-term="The act of observing a qubit, which collapses it into a definite state of either 0 or 1.">Measurement</span> is the process of observing a qubit, which collapses its superposition into a definite state. This final state provides the result of a quantum computation, but the probabilistic nature of quantum mechanics means results may vary across repeated measurements.
      </p>
    
      <h3 style={{ color: '#A487AE' }}>Applications</h3>
      <h4>Cryptography</h4>
      <p>
        Quantum computers can break classical encryption methods, such as RSA, by efficiently factoring large numbers using algorithms like Shor's Algorithm. At the same time, they enable the creation of quantum-safe encryption methods, ensuring secure communication in the quantum era.
      </p>
    
      <h4>Drug Discovery and Materials Science</h4>
      <p>
        By simulating molecular interactions at the quantum level, quantum computers can accelerate the discovery of new drugs and materials. This is critical for fields like medicine, where understanding complex biological systems can lead to breakthrough treatments.
      </p>
    
      <h4>Optimization</h4>
      <p>
        Many industries face optimization challenges, from supply chain logistics to portfolio management in finance. Quantum computers can evaluate multiple solutions simultaneously, providing faster and more efficient results for complex optimization problems.
      </p>
    
      <h4>Machine Learning</h4>
      <p>
        Quantum computers can enhance machine learning algorithms by speeding up matrix computations, a core part of training models. Additionally, quantum-enhanced optimization may improve pattern recognition and data clustering tasks.
      </p>
    
      <h3 style={{ color: '#A487AE' }}>Key Takeaways</h3>
      <ul>
        <li>Quantum computing utilizes principles like superposition and entanglement to achieve computational advantages.</li>
        <li>Applications span diverse fields, including cryptography, materials science, optimization, and AI.</li>
        <li>Understanding core principles is essential to unlocking the full potential of quantum computing.</li>
      </ul>
    </div>
    ),
    // Additional levels can be added here
  };

  return (
    <div style={modalStyle}>
      <h2>Concept Book: Chapter {currentLevel + 1}</h2>
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'none',
          border: 'none',
          fontSize: '1.5em',
          cursor: 'pointer',
        }}
      >
        ✖
      </button>
      {levelsContent[currentLevel] || <p>No content available for this level.</p>}
    </div>
  );
};

const modalStyle: React.CSSProperties = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  zIndex: 1000,
  width: '85%',
  maxWidth: '1400px',
  height: '93%',
  overflowY: 'scroll',
};

export default ConceptBook;
