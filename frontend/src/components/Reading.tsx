// src/components/Reading.tsx
import React from 'react';

const Reading: React.FC = () => {
  return (
    <div style={styles.readingContainer}>
      <h2>Introduction to Quantum Computing: Principles and Applications</h2>
      <em>💡 Need help? Highlight text to simplify topics!</em>
      <p>
        <strong>Quantum computing</strong> leverages fascinating principles from quantum physics,
        offering unique capabilities that classical computers cannot match. Here's what you need to know:
      </p>
      <h3>Core Principles</h3>
      <ul>
        <li>
          <strong>Superposition</strong>: A qubit can exist in multiple states (0 and 1) simultaneously,
          enabling parallel processing of possibilities.
        </li>
        <li>
          <strong>Entanglement</strong>: Qubits can share a linked state, allowing changes to one qubit to
          instantaneously influence another, no matter the distance.
        </li>
        <li>
          <strong>Measurement</strong>: Observing a qubit collapses its state into a definite value,
          which is essential to extract meaningful results.
        </li>
      </ul>
      <h3>Potential Applications</h3>
      <p>Quantum computers, though still in their infancy, are already being explored in fields like:</p>
      <ul>
        <li>
          <strong>Cryptography</strong>: Breaking certain classical encryption methods and developing quantum-safe
          alternatives.
        </li>
        <li>
          <strong>Chemical Simulations</strong>: Modeling complex molecules to advance drug discovery and materials
          science.
        </li>
        <li>
          <strong>Machine Learning</strong>: Enhancing algorithms with faster optimization and pattern recognition.
        </li>
        <li>
          <strong>Optimization Problems</strong>: Solving logistical and supply chain challenges more efficiently.
        </li>
      </ul>
      <h3>Why Quantum Computing Matters</h3>
      <ul>
        <li>
          Quantum computing defies classical logic by embracing probabilities, unlocking the potential to solve
          certain <strong>complex problems faster</strong> than traditional machines.
        </li>
        <li>
          While early-stage quantum computers aren't ready for general use, they show promise for revolutionizing
          various industries in the near future.
        </li>
      </ul>
      <h3>What's in the Lesson?</h3>
      <p>The following lesson will guide you through the fundamentals of quantum computing. When you are ready, click "Take Quiz" to test your understanding.</p>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  readingContainer: {
    backgroundColor: '#fcfcfc',
    color: '#000',
    padding: '20px',
    borderRadius: '6px',
    margin: '20px 0',
    lineHeight: 1.6,
    maxWidth: '700px',
  },
};

export default Reading;
