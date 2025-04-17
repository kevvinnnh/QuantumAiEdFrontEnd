// src/components/QuizQuestions.ts
export interface Question {
  question: string;
  options: string[];
  correctAnswer: number; // index
}
export const quizData: Question[] = [
  {
    question: '1) A qubit differs from a classical bit because:',
    options: [
      'It can exist in discrete energy levels, much like an electron in an atom',
      'It operates solely in the state of superposition until measured',
      'It leverages superposition and interference for complex state manipulations',
      'It can store more than one classical bit of information at once',
    ],
    correctAnswer: 1,
  },
  {
    question: '2) Entanglement allows two qubits to:',
    options: [
      'Exchange information faster than the speed of light due to linked states',
      'Maintain correlation in their states even when separated by large distances',
      'Simultaneously process identical information in parallel',
      'Generate deterministic results independent of measurement',
    ],
    correctAnswer: 1,
  },
  {
    question: '3) Why is quantum computing advantageous for specific optimization problems?',
    options: [
      'It uses quantum tunneling to explore all solutions simultaneously',
      'It reduces computational complexity through probabilistic pathways',
      'Qubits perform multiple calculations simultaneously through superposition',
      'Quantum entanglement directly optimizes all variables simultaneously',
    ],
    correctAnswer: 1,
  },
  {
    question: '4) During measurement, the collapse of a qubit’s wavefunction:',
    options: [
      'Destroys its ability to retain quantum information',
      'Results in a deterministic classical output every time',
      'Occurs probabilistically, depending on the state amplitudes',
      'Induces entanglement with all other qubits in the system',
    ],
    correctAnswer: 1,
  },
  {
    question: '5) A critical application of quantum computing in chemical simulations is:',
    options: [
      'Replacing classical energy calculations with faster Fourier transforms',
      'Calculating molecular structures using approximations like Monte Carlo',
      'Simulating quantum states of molecules with near-exact precision',
      'Modeling Newtonian dynamics in complex chemical reactions',
    ],
    correctAnswer: 1,
  },
  {
    question: '6) In cryptography, quantum computers pose a threat to:',
    options: [
      'Symmetric encryption systems such as AES',
      'Asymmetric encryption based on factorization or discrete logarithms',
      'Hash functions like SHA-256',
      'Elliptic-curve cryptography only when combined with Grover’s algorithm',
    ],
    correctAnswer: 1,
  },
  {
    question: '7) Quantum error correction addresses which of the following issues?',
    options: [
      'The inability of quantum gates to operate at room temperature',
      'The accumulation of small errors due to noise and decoherence',
      'The limitation of classical error correction methods for quantum systems',
      'The inefficiency of physical qubits for representing logical qubits',
    ],
    correctAnswer: 1,
  },
  {
    question: '8) If a qubit in a superposition of |0⟩ and |1⟩ is repeatedly measured:',
    options: [
      'Its state evolves probabilistically, altering probabilities with each measurement',
      'It alternates deterministically between |0⟩ and |1⟩ after every measurement',
      'It yields results probabilistically, with no change to its original state after each measurement',
      'It collapses permanently into |0⟩ or |1⟩ after the first measurement',
    ],
    correctAnswer: 1,
  },
  {
    question: '9) Which best describes the phrase "spooky action at a distance"?',
    options: [
      'A non-local correlation between entangled particles, verified experimentally',
      'A theoretical idea debunked by classical physics',
      'A property of superposition states in large quantum systems',
      'A colloquial term for the measurement process in quantum mechanics',
    ],
    correctAnswer: 1,
  },
  {
    question: '10) What is the primary limitation of current quantum computers?',
    options: [
      'Lack of theoretical understanding of quantum algorithms',
      'Hardware instability and high susceptibility to environmental noise',
      'Inability to outperform classical systems in any practical applications',
      'Dependency on unproven quantum hardware technologies like topological qubits',
    ],
    correctAnswer: 1,
  },
];
